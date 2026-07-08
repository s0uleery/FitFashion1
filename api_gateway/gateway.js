const express = require('express');
const { Kafka } = require('kafkajs');
const amqp = require('amqplib');
const EventEmitter = require('events');
const cors = require('cors');
const schema = require('./graphql/index');
require('dotenv').config();
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { sendKafkaRequest } = require('./utils/kafkaRequest');
const webhookRoutes = require('./routes/webhooks');
const app = express();

const responseEmitter = new EventEmitter();
const kafkaBrokers = (process.env.KAFKA_BROKER || 'localhost:9092').split(',');
const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const port = Number(process.env.PORT || 3000);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectRabbitWithRetry(maxAttempts = 20, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const connection = await amqp.connect(rabbitUrl);
            const channel = await connection.createChannel();
            return channel;
        } catch (error) {
            console.error(`❌ Error en RabbitMQ (intento ${attempt}/${maxAttempts}):`, error.message);
            if (attempt === maxAttempts) {
                throw error;
            }
            await sleep(delayMs);
        }
    }

    throw new Error('No fue posible conectar a RabbitMQ');
}

// --- KAFKA ---
const kafka = new Kafka({
    clientId: 'api-gateway',
    brokers: kafkaBrokers,
    retry: { retries: 5 }
});
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'gateway-listener-group' });

let rabbitChannel = null;

async function startGateway() {
    // 1. Iniciar Kafka
    await producer.connect();
    await consumer.subscribe({ topic: 'auth-response', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            try {
                const value = JSON.parse(message.value.toString());
                if (value.correlationId) responseEmitter.emit(value.correlationId, value);
            } catch (err) { console.error("Error Kafka:", err); }
        },
    });

    // 2. Iniciar RabbitMQ
    try {
        rabbitChannel = await connectRabbitWithRetry();
        const replyQueue = 'gateway_replies_v3';
        await rabbitChannel.assertQueue(replyQueue, { durable: true });
        console.log(`🐰 Gateway escuchando en RabbitMQ (${replyQueue})`);
        // Listener de RabbitMQ
        rabbitChannel.consume(replyQueue, (msg) => {
            if (msg) {
                console.log(`[RABBIT] Llegó mensaje. ID: ${msg.properties.correlationId}`);
                if (msg.properties.correlationId) {
                    const content = JSON.parse(msg.content.toString());
                    const data = content.response !== undefined ? content.response : content;
                    responseEmitter.emit(msg.properties.correlationId, data);
                }
            }
        }, { noAck: true });

    } catch (error) {
        console.error("❌ Error en RabbitMQ:", error.message, error);
    }

    app.use(express.json());
    app.use(webhookRoutes(rabbitChannel));

    // 3. Iniciar Apollo
    const server = new ApolloServer({ schema });
    await server.start();

    app.use((req, res, next) => {
        req.producer = producer;
        req.responseEmitter = responseEmitter;
        next();
    });

    app.use(
        '/graphql',
        cors({
            origin: true,
            credentials: true
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => {
                const authHeader = req.headers.authorization || '';
                const rawKey = authHeader.replace('Token ', '').replace('Bearer ', '').trim();
                const djangoToken = rawKey ? `Token ${rawKey}` : null;

                let userContext = {
                    user_id: null,
                    shipping_address: null,
                    role: null
                };

                if (djangoToken) {
                    try {
                        console.log("[GATEWAY-AUTH] Token recibido:", djangoToken.substring(0, 20) + "...");
                        const authResponse = await sendKafkaRequest(
                            producer,
                            responseEmitter,
                            'auth-request',
                            'GET_PROFILE',
                            {},
                            djangoToken
                        );

                        console.log("[GATEWAY-AUTH] Respuesta de GET_PROFILE:", JSON.stringify(authResponse).substring(0, 200));

                        if (authResponse && authResponse.status === 200 && authResponse.user) {
                            userContext.user_id = authResponse.user.id;
                            userContext.role = authResponse.user.role;
                            if (authResponse.user.addresses && authResponse.user.addresses.length > 0) {
                                userContext.shipping_address = authResponse.user.addresses[0];
                            }
                            console.log("[GATEWAY-AUTH] Usuario autenticado:", userContext.user_id);
                        } else {
                            console.warn("[GATEWAY-AUTH] Respuesta inválida o sin usuario:", authResponse);
                        }
                    } catch (error) {
                        console.error("[GATEWAY-AUTH] Error validando token:", error.message, error.stack);
                    }
                } else {
                    console.log("[GATEWAY-AUTH] No hay token en el header");
                }

                return {
                    producer,
                    responseEmitter,
                    token: djangoToken,
                    rabbitChannel,
                    ...userContext
                };
            },
        })
    );

    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
        console.log(`GraphQL listo en http://localhost:${port}/graphql`);
    });
}

startGateway().catch(err => console.error("Error iniciando Gateway:", err));
# API Gateway (`api_gateway`)

El `api_gateway` es el punto de entrada central para todas las peticiones del frontend en la plataforma **FitFashion**. Desarrollado en **Node.js** con **Express** y **Apollo Server**, este componente actúa como un intermediario y orquestador que abstrae la complejidad de la arquitectura de microservicios, proporcionando un único endpoint unificado de **GraphQL** y rutas REST para webhooks.

---

## Características Principales

- **GraphQL Centralizado:** Expone un único esquema de GraphQL reuniendo resolutores (resolvers) para productos, carritos, órdenes y usuarios.
- **Orquestación Multiprotocolo:** Traduce las peticiones GraphQL entrantes en mensajes para los microservicios usando **Kafka** (para integrarse con el microservicio de autenticación en Python) y **RabbitMQ** (para integrarse con los microservicios de productos y carrito en Node.js y Go).
- **Validación de Autenticación Contextual:** Intercepta los tokens o *Bearers* de autenticación en cada petición, consulta mediante Kafka a `ms_auth` en tiempo real y adjunta la información validada del usuario (ID, Rol, Dirección) al contexto de la petición GraphQL.
- **Exposición de Webhooks:** Provee endpoints REST clásicos (ej. Express routes) específicos para recibir notificaciones asíncronas de pasarelas de pago (como Mercado Pago) e inyectarlas a la red interna a través de RabbitMQ.

---

## Requisitos Previos

Para ejecutar el API Gateway de manera local, asegúrate de tener instalado:

- **Node.js** (v18 o superior recomendado)
- **NPM** (Normalmente se instala junto a Node.js)
- **Kafka** (Servidor y broker activo)
- **RabbitMQ** (Servidor activo)

---

## Configuración del Entorno (`.env`)

Antes de iniciar el servicio, crea un archivo `.env` en el directorio raíz de `api_gateway` con la siguiente configuración:

```env
# ==========================================
# CONFIGURACIÓN DEL SERVIDOR
# ==========================================
PORT=3000

# ==========================================
# CONFIGURACIÓN DE BROKERS Y MENSAJERÍA
# ==========================================
KAFKA_BROKER=localhost:9092
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

---

## Instalación de Dependencias

Para instalar las dependencias necesarias como `@apollo/server`, `express`, `kafkajs`, y `amqplib`, abre la terminal en la raíz de `api_gateway` y ejecuta:

```bash
npm install
```

---

## Ejecución del Gateway

Una vez configurado y con las dependencias instaladas, puedes iniciar el servidor ejecutando:

```bash
npm start
```
*(Este comando internamente ejecuta `node gateway.js`)*
---

## Estructura y Funcionamiento

- **El corazón del sistema (`gateway.js`):** Inicializa tanto el productor/consumidor de Kafka como de RabbitMQ. Además levanta el servidor Express y el middleware de Apollo GraphQL.
- **Contexto de Apollo:** Cada petición entrante que contenga un header de `Authorization` gatilla internamente un evento de Kafka `GET_PROFILE` que consulta en vivo a `ms_auth`. El resultado se propaga a los "resolvers" para aplicar lógicas de autorización (por ejemplo, permitir solo a administradores crear productos).
- **Gestión Asíncrona (Eventos RPC):** Al comunicarse con otros microservicios que procesan en colas, el entorno de NodeJS utiliza un sistema de `EventEmitter` combinado con un `correlationId` único por petición (provisto típicamente por un UUID). Esto permite que una petición HTTP se "pause" a la espera de que el broker Kafka o RabbitMQ devuelva el mensaje específico a este servidor.

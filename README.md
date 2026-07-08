# Fit-Fashion - Guía de Inicio Rápido

Bienvenido al proyecto **Fit-Fashion**. Este documento te guiará paso a paso para configurar y levantar todos los microservicios y la infraestructura necesaria en tu entorno local.

## 1. Requisitos Previos Generales

Asegúrate de tener instalado en tu máquina lo siguiente antes de empezar:
- **Docker y Docker Compose** (Para levantar la infraestructura: DBs y Brokers)
- **Node.js (v18+)** y **NPM** (Para el Frontend, API Gateway y ms_products)
- **Python (3.x)** (Para ms_auth)
- **Go (1.25+)** (Para ms_cart)
- Cuentas en servicios de terceros:
  - **Mercado Pago** (Para `ms_cart`)
  - **Cloudinary** (Para `ms_products`)

---

## 2. Levantar la Infraestructura (Bases de Datos y Brokers)

El proyecto incluye un archivo `docker-compose-infra.yml` que levanta todos los servicios de apoyo:
- PostgreSQL (Puerto 5432)
- Redis (Puerto 6379)
- RabbitMQ (Puertos 5672 y 15672)
- Kafka & Zookeeper (Puerto 9092)

Para iniciar la infraestructura, abre una terminal en la raíz del proyecto (`FitFashion`) y ejecuta:
```bash
docker-compose -f docker-compose-infra.yml up -d
```
*(Puedes detenerla más tarde usando `docker-compose -f docker-compose-infra.yml down`)*

---

## 3. Configuración de Variables de Entorno (`.env`)

Cada microservicio necesita un archivo `.env` en su directorio raíz. Toma como referencia los README internos de cada carpeta, pero aquí están las variables mínimas requeridas:

### `api_gateway/.env`
```env
PORT=3000
KAFKA_BROKER=localhost:9092
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### `FrontFitFashion/.env`
```env
VITE_GATEWAY_URL=http://localhost:3000
```

### `ms_auth/.env`
```env
SECRET_KEY=tu_clave_secreta
DEBUG=True
KAFKA_BROKER=localhost:9092
```

### `ms_cart/.env`
```env
SERVER_PORT=8080
FRONTEND_URL=http://localhost:5173 
# (Asumiendo que Vite corre en 5173)
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=password123
DB_NAME=fitfashion_db
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RPC_QUEUE_NAME=cart_rpc_queue
MP_ACCESS_TOKEN=tu_access_token_de_mercado_pago
WEBHOOK_BASE_URL=https://tu-url-ngrok.com
```

### `ms_products/.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=password123
DB_NAME=fitfashion_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=products_queue
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```
*(Nota: Hemos configurado `fitfashion_db` como base de datos en PostgreSQL en el docker-compose).*

---

## 4. Instalación de Dependencias

He procedido a instalar automáticamente las dependencias en los distintos proyectos por ti, sin embargo, en el futuro puedes usar los siguientes comandos en sus respectivas carpetas:

- **api_gateway**: `npm install`
- **FrontFitFashion**: `npm install`
- **ms_products**: `npm install`
- **ms_cart**: `go mod tidy`
- **ms_auth**: 
  ```bash
  python -m venv venv
  # En Windows:
  .\venv\Scripts\activate
  pip install -r requirements.txt
  python manage.py migrate
  ```

---

## 5. Levantar los Microservicios

### OPCIÓN A: Docker Compose (Recomendado - Todo en 1 comando)

La forma más fácil es usar **Docker Compose** para levantar todo el proyecto automáticamente:

```bash
# 1. Configura las variables de entorno
cp docker-compose.env.example .env
# Edita .env con tus credenciales de Cloudinary y Mercado Pago

# 2. Levanta todo de una vez
docker-compose up -d

# 3. Verifica que todo esté corriendo
docker-compose ps

# 4. Accede a los servicios:
#    - Frontend: http://localhost
#    - API Gateway: http://localhost:3000
#    - ms_products: http://localhost:3001
#    - ms_cart: http://localhost:8080
#    - ms_auth: http://localhost:8000
```

Para más detalles, consulta [DOCKER_COMPOSE_GUIDE.md](DOCKER_COMPOSE_GUIDE.md)

---

### OPCIÓN B: Levantar Manualmente (6 terminales separadas)

Si prefieres levantar cada servicio por separado, abre **6 terminales** diferentes:

#### 1. API Gateway
```bash
cd api_gateway
npm start
```

#### 2. Frontend
```bash
cd FrontFitFashion
npm run dev
```

#### 3. ms_productos (Catálogo)
```bash
cd ms_products
npm run start:dev
```

#### 4. ms_cart (Carrito y Órdenes)
```bash
cd ms_cart
go run cmd/main.go
```

#### 5. ms_auth (Servidor HTTP)
```bash
cd ms_auth
.\venv\Scripts\activate
python manage.py runserver
```

#### 6. ms_auth (Fondo - Consumidor Kafka)
```bash
cd ms_auth
.\venv\Scripts\activate
python manage.py run_kafka
```

---

¡Listo! Una vez todos los procesos estén corriendo, tendrás acceso a **FrontFitFashion** (usualmente en `http://localhost:5173`) y el entorno completo conectado a través de **API Gateway** (`http://localhost:3000`).


CREDENCIALES ADMIN:
User: admin
Password: administrador
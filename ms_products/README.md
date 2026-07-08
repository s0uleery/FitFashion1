# Microservicio de Productos (`ms_products`)

`ms_products` es el microservicio encargado de gestionar el catálogo de productos de la paltaforma **FitFashion**. Está construido con **NestJS** y utiliza **PostgreSQL** como base de datos administrada a través de **TypeORM**. Además, cuenta con integración con **Cloudinary** para el alojamiento y gestión de las imágenes de los productos, y se comunica con otros servicios (como el API Gateway) en un entorno asíncrono haciendo uso de **RabbitMQ**.

---

## Características Principales

- **Gestión de Productos:** CRUD de información sobre prendas y artículos de moda.
- **Microservicios (Event-Driven):** Escucha y responde a eventos a través de colas de RabbitMQ (`products_queue`).
- **Gestión de Imágenes:** Sube y administra de forma segura imágenes de productos gracias a la integración directa con Cloudinary.
- **Base de Datos Relacional:** Almacenamiento persistente usando PostgreSQL.

---

## Requisitos Previos

Para ejecutar este microservicio de manera local, asegúrate de tener instalado:

- **Node.js** (v18 o superior recomendado)
- **PostgreSQL** (Servidor activo y una base de datos creada para este proyecto)
- **RabbitMQ** (Servidor activo, usualmente en `localhost:5672`)
- **Cuenta en Cloudinary** (Para obtener las credenciales de la API de imágenes)

---

## Configuración del Entorno (`.env`)

Antes de levantar el microservicio, debes crear un archivo `.env` en la raíz de `ms_products` usando las siguientes variables de entorno. 

Crea un archivo llamado `.env` y añade lo siguiente, reemplazando los valores por los de tu entorno local y tu cuenta de Cloudinary:

```env
# ==========================================
# CONFIGURACIÓN DE LA BASE DE DATOS (PostgreSQL)
# ==========================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_NAME=nombre_de_tu_db_productos

# ==========================================
# CONFIGURACIÓN DE RABBITMQ
# ==========================================
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=products_queue

# ==========================================
# INTEGRACIÓN CON CLOUDINARY (Gestión de Imágenes)
# ==========================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### ¿Cómo obtener las credenciales de Cloudinary?
1. Inicia sesión en tu panel de [Cloudinary](https://cloudinary.com/).
2. Ve al **Dashboard** (Panel de Control Principal).
3. En la sección superior verás tus credenciales: **Cloud Name**, **API Key**, y **API Secret**. 
4. Cópialas y pégalas en tu archivo `.env`.

---

## Instalación de Dependencias

Una vez que tengas tu archivo `.env` configurado, instala las dependencias necesarias ejecutando:

```bash
npm install
```

Las dependencias principales que utiliza este proyecto incluyen:
- `@nestjs/core`, `@nestjs/common`, `@nestjs/microservices`: Core de NestJS.
- `typeorm`, `@nestjs/typeorm`, `pg`: Para la comunicación con PostgreSQL.
- `amqplib`, `amqp-connection-manager`: Para la integración con colas RabbitMQ.
- `cloudinary`: SDK oficial para subir imágenes.
- `class-validator`, `class-transformer`: Para validación de datos (DTOs).

---

## Ejecución del Microservicio

Para levantar el servidor en entorno de desarrollo, utiliza el siguiente comando:

```bash
# Modo desarrollo (con recarga automática o hot-reload)
npm run start:dev
```

## Estructura y Funcionamiento

- **API REST & Eventos RMQ:** Este microservicio está expuesto en el puerto `3002` (para llamadas HTTP directas si se requiriese), pero su función principal es actuar como un **Microservicio de NestJS escuchando en RabbitMQ**. El *API Gateway* envía los mensajes/comandos a la cola `products_queue`, y este microservicio reacciona procesando la información y guardándola en PostgreSQL.
- **Carga de Imágenes:** Cuando se crea o actualiza un producto que incluye un archivo de imagen, este microservicio toma el "buffer" o archivo subido, lo sube automáticamente a **Cloudinary** usando el SDK, y guarda la URL segura resultante (ej. `https://res.cloudinary.com/...`) en la base de datos de PostgreSQL para ser consumida posteriormente por el Frontend.

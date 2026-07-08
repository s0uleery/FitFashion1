# Microservicio de Carrito y Órdenes (`ms_cart`)

`ms_cart` es el microservicio responsable de gestionar los carritos de compra temporales, el procesamiento de órdenes y la integración con pasarelas de pago de la plataforma **FitFashion**. Está construido en **Go** (Golang) y utiliza una arquitectura híbrida de base de datos combinando **Redis** para alta velocidad y **PostgreSQL** para persistencia, todo comunicado de forma asíncrona y mediante RPC usando **RabbitMQ**.

---

## Características Principales

- **Gestión de Carritos Temporales:** Almacenamiento rápido y eficiente en memoria de los ítems del usuario utilizando Redis.
- **Procesamiento de Órdenes:** Creación, validación y almacenamiento seguro de las órdenes de compra consolidadas utilizando PostgreSQL.
- **Microservicios (Event-Driven & RPC):** Expone funciones y escucha eventos utilizando RabbitMQ. Se comunica directamente con `ms_products` vía RPC para validar stocks e información de productos.
- **Integración de Pagos:** Conexión directa con la API de Mercado Pago para la generación de preferencias de pago y validación de transacciones.

---

## Requisitos Previos

Para ejecutar este microservicio de manera local, asegúrate de tener instalado:

- **Go** (v1.25 o superior recomendado)
- **Redis** (Servidor activo en el puerto local 6379, o según configuración)
- **PostgreSQL** (Servidor activo y una base de datos creada para las órdenes)
- **RabbitMQ** (Servidor activo, usualmente en `localhost:5672`)
- **Cuenta de Desarrollador en Mercado Pago** (Para obtener el Access Token de prueba/producción)

---

## Configuración del Entorno (`.env`)

Antes de iniciar el microservicio, debes crear un archivo `.env` en la raíz de `ms_cart`. Utiliza las siguientes variables de entorno ajustadas a tu configuración local:

```env
# ==========================================
# CONFIGURACIÓN DEL SERVIDOR
# ==========================================
SERVER_PORT=8080
FRONTEND_URL=http://localhost:3000

# ==========================================
# CONFIGURACIÓN DE LA BASE DE DATOS (PostgreSQL)
# ==========================================
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_NAME=nombre_de_tu_db_ordenes

# ==========================================
# CONFIGURACIÓN DE REDIS (Carritos)
# ==========================================
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=

# ==========================================
# CONFIGURACIÓN DE RABBITMQ
# ==========================================
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RPC_QUEUE_NAME=cart_rpc_queue

# ==========================================
# INTEGRACIÓN CON MERCADO PAGO
# ==========================================
MP_ACCESS_TOKEN=tu_access_token_de_mercado_pago
WEBHOOK_BASE_URL=https://tu-url-publica-para-webhooks.com
```

### Notas sobre Mercado Pago y Webhooks:
- `MP_ACCESS_TOKEN`: Se obtiene desde el panel de desarrolladores de Mercado Pago ("Tus Integraciones" -> "Credenciales").
- `WEBHOOK_BASE_URL`: Mercado Pago necesita notificar a tu servidor cuando un pago es aprobado. Para desarrollo local, puedes usar herramientas como **Ngrok** para exponer tu puerto local y obtener una URL temporal que debes colocar aquí.

---

## Instalación de Dependencias

Go maneja las dependencias automáticamente a través de los archivos `go.mod` y `go.sum`. Para descargar todas las dependencias necesarias, ejecuta el siguiente comando en la raíz del microservicio:

```bash
go mod tidy
```

Las dependencias principales utilizadas incluyen:
- `gorm.io/gorm`, `gorm.io/driver/postgres`: ORM para manejar la base de datos PostgreSQL.
- `github.com/go-redis/redis/v8`: Cliente oficial para interactuar con Redis.
- `github.com/streadway/amqp`: Cliente AMQP para conectarse y manejar mensajes con RabbitMQ.
- `github.com/joho/godotenv`: Utilidad para cargar variables de entorno desde el archivo `.env`.

---

## Ejecución del Microservicio

Para inicializar y levantar el servicio, utiliza el comando estándar de ejecución de Go apuntando al archivo principal:

```bash
# Ejecutar directamente
go run cmd/main.go
```

Al iniciarse correctamente, el servidor se conectará a las bases de datos y a RabbitMQ, y verás mensajes en la consola indicando que está listo y escuchando peticiones:
> `MS_CART iniciado y escuchando peticiones RPC...`

---

## Estructura y Funcionamiento

- **Almacenamiento Dual:** Mientras que un usuario arma su compra, la información (el "carrito") vive en **Redis** permitiendo lecturas y escrituras ultrarrápidas y que expiran si es necesario. Cuando el usuario decide pagar (Checkout), esa información se consolida, se elimina de Redis y pasa a conformar una "Orden" que se guarda permanentemente en **PostgreSQL**.
- **Comunicación entre Microservicios:** Cuando se agrega un ítem al carrito, `ms_cart` envía una petición RPC (Remote Procedure Call) a través de RabbitMQ hacia `ms_products` para verificar que el producto exista, obtener precios actualizados y revisar el stock real en ese momento exacto.
- **Manejo de Pagos:** Al generar una orden, el servicio conecta con Mercado Pago creando una "Preferencia de Pago". Además, mantiene un *Listener* activo en RabbitMQ esperando notificaciones (eventos asíncronos) sobre actualizaciones en el estado del pago para marcar la orden correspondiente como aprobada o rechazada.

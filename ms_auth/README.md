# Microservicio de Autenticación y Usuarios (`ms_auth`)

`ms_auth` es el microservicio encargado de gestionar el registro, autenticación, perfiles y seguridad de los usuarios de la plataforma **FitFashion**. Está construido en **Python** utilizando el framework web **Django** y **Django REST Framework (DRF)**. Utiliza una base de datos **SQLite** por defecto para el almacenamiento local, e implementa **Kafka** para la comunicación asíncrona mediante un consumidor expuesto a través de comandos de gestión de Django.

---

## Características Principales

- **Gestión de Usuarios:** Registro (Sign Up), inicio de sesión (Login) y administración de perfiles.
- **Seguridad:** Autenticación basada en tokens utilizando la biblioteca genérica de DRF y Djoser.
- **Comunicación Asíncrona:** Escucha peticiones de otros microservicios (como el API Gateway) a través del broker de mensajería **Kafka** suscribiéndose a los tópicos `auth-request` y respondiendo en `auth-response`.
- **Integración CORS:** Configurado para aceptar peticiones origen desde múltiples puertos locales que corresponden a los distintos frontends y pasarelas de la aplicación.

---

## Requisitos Previos

Para ejecutar este microservicio de manera local, asegúrate de tener instalado:

- **Python 3.x**
- **pip** (Gestor de paquetes de Python)
- **Kafka** (Servidor activo y configurado localmente o remoto)

---

## Configuración del Entorno y `.env`

Antes de iniciar cualquier proceso, necesitas declarar las variables de entorno principales. Crea un archivo `.env` en el mismo directorio donde se encuentra `manage.py` y agrega lo siguiente:

```env
# ==========================================
# CONFIGURACIÓN DE DJANGO
# ==========================================
SECRET_KEY=tu_clave_secreta_aqui_no_la_compartas
DEBUG=True

# ==========================================
# CONFIGURACIÓN DE KAFKA
# ==========================================
KAFKA_BROKER=localhost:9092
```

---

## Entorno Virtual (`venv`) e Instalación

Es una buena práctica en Python aislar las dependencias del proyecto utilizando un Entorno Virtual (`venv`). 

1. **Crear el entorno virtual:** Ubícate en la raíz del microservicio donde está el archivo `requirements.txt` y ejecuta en tu terminal:
   ```bash
   python -m venv venv
   ```

2. **Activar el entorno virtual:**
   - **En Windows:**
     ```bash
     .\venv\Scripts\activate
     ```
   - **En macOS y Linux:**
     ```bash
     source venv/bin/activate
     ```
   *(Sabrás que está activado porque verás `(venv)` al inicio de la línea de comandos).*

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Aplicar las migraciones de base de datos:** *(solo la primera vez)*
   ```bash
   python manage.py migrate
   ```

---

## Ejecución del Microservicio (Requiere DOS Terminales)

Dado que este microservicio maneja peticiones HTTP directas y a su vez debe escuchar eventos de Kafka permanentemente, es necesario ejecutar estos dos procesos en paralelo. **Debes abrir dos terminales distintas, y activar el entorno virtual (`venv`) en ambas.**

### Terminal 1: Servidor HTTP (Django)
Esta terminal se encargará de levantar el servidor web principal.
```bash
# 1. Asegúrate de tener el entorno activado
.\venv\Scripts\activate  # (En Windows)

# 2. Levanta el servidor
python manage.py runserver
```

### Terminal 2: Consumidor de Kafka
Esta terminal se encargará de mantener activo el archivo script (`run_kafka.py`) que escucha las peticiones de autenticación enviadas a través de Kafka (por tópicos como `auth-request`).
```bash
# 1. Asegúrate de tener el entorno activado
.\venv\Scripts\activate  # (En Windows)

# 2. Levanta el escuchador de Kafka
python manage.py run_kafka
```

Al iniciarse el proceso de Kafka, empezará a esperar e interceptar eventos como `LOGIN`, `REGISTER`, o `GET_PROFILE` y enviará las respuestas correspondientes de vuelta al broker al tópico `auth-response`.

---

## Estructura y Funcionamiento

- **Framework Web Integrado:** Utiliza `rest_framework` junto a `djoser` para exponer las utilidades de inicio o registro de una manera estándar. 
- **Mecanismo de Kafka (`run_kafka`):** El comando implementa `KafkaConsumer` apuntando al `auth-request`. Dependiendo del flag `type` dentro del JSON del mensaje recibido, dispara servicios de autenticación definidos en la aplicación (`users/kafka_services.py`) y retorna los resultados inmediatamente devolviendo la petición con su `correlationId`.

---

## Creación de Usuarios por Consola

Los usuarios del sistema se almacenan en la base de datos en la raíz de `ms_auth` (el archivo `db.sqlite3`). Debido a que las bases de datos no se suben al repositorio, al inicializar el proyecto la tabla de usuarios se crea vacía.

Para empezar a usar el sistema necesitas administradores y usuarios. **Asegúrate de tener el entorno virtual (`venv`) activado antes de ejecutar estos comandos**.

### Crear un Superusuario (Administrador)
Un superusuario te permite gestionar el panel de Django y administrar otros aspectos. Ejecuta el siguiente comando:
```bash
python manage.py createsuperuser
```
La terminal te pedirá iterativamente un nombre de usuario, correo electrónico y una contraseña validada.

### Crear un Usuario Normal desde la Consola
Pese a que lo ideal es que un usuario normal se registre a través del Frontend, puedes crearlos manualmente desde el intérprete de Python en Django por si necesitas generar muchas cuentas de prueba (Debug):
```bash
python manage.py shell
```
Luego en la terminal interactiva pega y adecúa el siguiente script:
```python
from django.contrib.auth import get_user_model

User = get_user_model()
nuevo_usuario = User.objects.create_user(
    username='usuario_test', 
    email='correo@ejemplo.com', 
    password='TuPassword123'
)
nuevo_usuario.first_name = 'Nombre'
nuevo_usuario.last_name = 'Apellido'
nuevo_usuario.save()

exit()
```

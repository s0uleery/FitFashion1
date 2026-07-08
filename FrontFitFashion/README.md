# Frontend de Usuario y Administrador (`FrontFitFashion`)

`FrontFitFashion` es la interfaz gráfica y cliente principal de la plataforma **FitFashion**. Está desarrollada como una aplicación web de una sola página (SPA) utilizando **React** y empaquetada con **Vite** para ofrecer tiempos de desarrollo rápidos y una construcción optimizada. Este frontend interactúa con todos los microservicios del sistema a través del API Gateway, sirviendo tanto a usuarios finales para la compra de prendas como a administradores y gestores para el manejo del inventario.

---

## Características Principales

- **Interfaz Optimizada:** Desarrollo basado en React 18 asegurando interacciones fluidas y componentes reutilizables.
- **Rutas Protegidas e Interfaz Dual:** Maneja sesiones de usuario y muestra distintas vistas dependiendo del rol (Usuario final, Gestor o Administrador).
- **Integraciones Nativas:** Utiliza `Axios` para peticiones REST clásicas y `@apollo/client` para consumir de manera eficiente la API GraphQL proveída por el Gateway.
- **Gestor de Estado y Contexto:** Implementa un manejo de carritos y sesión mediante Context API (`CartContext`, `UserContext`).

---

## Requisitos Previos

Para ejecutar la aplicación frontend en tu entorno local, necesitas tener instalado:

- **Node.js** (v18 o superior recomendado)
- **NPM** (Normalmente se instala junto a Node.js)
- *Tener el API Gateway levantado localmente para que la aplicación pueda mostrar datos reales.*

---

## Configuración del Entorno (`.env`)

Vite utiliza variables de entorno prefijadas con `VITE_` para exponerlas al código del cliente.

Crea un archivo llamado `.env` en la ruta principal del frontend (`FrontFitFashion`) y agrega la URL base apuntando hacia donde se encuentre corriendo tu API Gateway (usualmente en el puerto `3000` o `8000`).

```env
# ==========================================
# CONFIGURACIÓN DE CONEXIÓN AL BACKEND
# ==========================================
# Cambia el puerto por el que utilice tu API Gateway localmente.
VITE_GATEWAY_URL=http://localhost:3000
```
> **Nota:** Esta única variable es esencial, ya que el API Gateway se encargará de enrutar las peticiones al microservicio de Autenticación, Productos o Carrito según corresponda.

---

## Instalación de Dependencias

Una vez que tengas tu archivo `.env` creado, abre la terminal en la raíz de `FrontFitFashion` e instala todas las dependencias listadas en el `package.json`:

```bash
npm install
```

---

## Ejecución de la Aplicación

Para inicializar el servidor de desarrollo, que incluye "Hot Module Replacement" (recarga instantánea al guardar cambios), ejecuta:

```bash
npm run dev
```

Por defecto, Vite levantará el proyecto (usualmente en la ruta `http://localhost:5173`). La terminal te indicará la URL exacta y el puerto que asignó. 

Otros comandos útiles durante el desarrollo:
```bash
# Revisar errores de sintaxis o problemas en el código
npm run lint

# Empaquetar el proyecto para producción
npm run build

# Previsualizar el proyecto ya empaquetado
npm run preview
```

---

## Integraciones Clave

- **API Gateway (REST & GraphQL):** A diferencia de un backend monolítico, este frontend jamás se comunica directamente con los microservicios de Auth, Productos o Carrito. Toda petición (ej. el inicio de sesión vía Axios o la obtención de productos vía Apollo GraphQL) viaja exclusivamente hacia la URL definida en `VITE_GATEWAY_URL`.
- **Motor de Autenticación:** Las cabeceras de autorización son gestionadas enviando el Token obtenido (guardado en el `localStorage`) en cada iteración del cliente de Apollo (`authLink`) y en las llamadas de Axios.

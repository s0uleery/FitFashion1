# Guía de Auditoría y Refactorización (FitFashion)

¡Bienvenidos al proyecto FitFashion! 
Este repositorio tiene un historial de desarrollo apresurado ("Brownfield"). Tu misión como equipo es identificar, corregir y evolucionar la arquitectura del frontend y nuestro API Gateway.

## Principios de Calidad Esperados

Durante tu auditoría, deberás aplicar los siguientes principios y buenas prácticas de ingeniería de software:

1. **DRY (Don't Repeat Yourself)**: Evita la duplicación de código. Si ves lógica idéntica en funciones o configuraciones distintas, abstrae y reutiliza.
2. **Uso de Variables de Entorno (Env Vars)**: NUNCA debes exponer credenciales (URLs, passwords, claves) directamente en el código ("Hardcoding").
3. **Manejo Correcto de Tipos (Data Types)**: Asegúrate de que las variables reciban los tipos de datos correctos (e.g. no mezclar enteros con strings en lógica de autenticación).
4. **Manejo de Errores Descriptivo**: Los bloques `try/catch` deben proveer mensajes de error que realmente informen al desarrollador o al sistema de monitoreo qué fue lo que falló.
5. **Código Limpio (Clean Code)**: Los archivos no deben contener código muerto (comentado), comentarios obvios o faltas de ortografía en componentes/servicios clave.

## Pistas para la Auditoría

A continuación, algunas "pistas" de problemas que nuestros usuarios y desarrolladores han reportado recientemente:

- ❌ **"El frontend no levanta en mi máquina local..."**: Revisa los archivos principales (`App.jsx`, `Navbar.jsx`) y la configuración de nuestro cliente Graphql. Dicen que alguien actualizó versiones y dejó las importaciones rotas.
- ❌ **"El API Gateway está crasheando"**: Parece que hay un error de sintaxis en la configuración de `gateway.js`.
- ❌ **"Las conexiones fallan en producción"**: Alguien conectó el API Gateway a RabbitMQ y Kafka apuntando a direcciones locales (`localhost` o `192.x.x.x`) en lugar de usar la configuración del entorno.
- ❌ **"El token de usuario no funciona bien"**: En el código del cliente de GraphQL, un developer de pruebas asignó un valor fijo numérico al token, rompiendo la función de añadir los Headers correctamente.
- ❌ **"Hay código duplicado en la interfaz"**: Busca en la barra de navegación y en las rutas principales; hay componentes repetidos o funciones que hacen exactamente lo mismo.

¡Buena suerte, equipo! Su objetivo es que el proyecto levante limpio, sin *warnings* en consola y con una arquitectura digna de pasar a Producción.

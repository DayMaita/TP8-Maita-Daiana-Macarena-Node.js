# Trabajo práctico 08 — Endpoints persistentes de reservas de salas

**Proyecto:** `tp-08-salas-http-mongodb`  
**Base de datos:** MongoDB Atlas Free (M0)  
**Base:** `reservas_salas_u8`  
**Colección:** `reservas`  
**Tecnologías:** Node.js, Express 5, Mongoose, EJS y Postman.

## 1. Origen y objetivo

Este proyecto parte de una copia del TP 07 individual `tp-07-salas-mongodb`. En el TP 07, la aplicación web trabajaba con un arreglo en memoria y la persistencia MongoDB se ensayaba con scripts separados. En esta versión, el sitio HTML y la API JSON utilizan el mismo servicio asíncrono conectado a MongoDB. Ya no se carga una semilla al iniciar ni se insertan documentos al listar.

## 2. Requisitos e instalación

Se recomienda Node.js 20.6 o posterior, npm, una cuenta de MongoDB Atlas y Postman de escritorio.

En la terminal de VS Code, dentro de la carpeta del proyecto:

```bash
npm install
```

Crear el archivo `.env` copiando `.env.example` y reemplazar los marcadores por la URI real de Atlas. La URI debe apuntar a `reservas_salas_u8`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u8?retryWrites=true&w=majority
```

`USUARIO`, `CLAVE` y `HOST` son marcadores, no valores funcionales. Configurar en Atlas un usuario con permisos para la base y permitir la IP propia en Network Access. No subir `.env`, contraseñas ni URI privadas al repositorio. `.gitignore` excluye `.env` y `node_modules`.

## 3. Arranque y cierre

```bash
npm start
```

El script ejecuta `node --env-file=.env src/index.js`. Primero valida la configuración y espera la conexión con MongoDB; recién después abre el puerto HTTP. Si la conexión falla, el servidor no anuncia que está disponible. La conexión se mantiene entre solicitudes. Para cerrar ordenadamente, usar `Ctrl+C` (SIGINT); también se atiende SIGTERM.

El módulo `src/config/base-datos.js` conserva el ajuste DNS de la versión anterior para las conexiones SRV/TXT de Atlas. Se configura una sola vez al cargar el módulo, no por solicitud. Si la red de la institución requiere otro ajuste, documentar el cambio realizado.

## 4. Estructura del proyecto

```text
tp-08-salas-http-mongodb/
├── public/css/estilos.css
├── views/
│   ├── layouts/main.ejs
│   ├── reservas/lista.ejs
│   ├── reservas/nueva.ejs
│   ├── reservas/detalle.ejs
│   ├── inicio.ejs
│   └── no-encontrado.ejs
├── src/
│   ├── config/
│   │   ├── entorno.js
│   │   └── base-datos.js
│   ├── modelos/reserva.js
│   ├── servicios/reservas.js
│   ├── controladores/reservas.js
│   ├── rutas/
│   │   ├── reservas.js
│   │   └── api-reservas.js
│   ├── middleware/
│   │   ├── reservas.js
│   │   └── solicitudes.js
│   ├── utilidades/reservas.js
│   ├── app.js
│   └── index.js
├── scripts/                  # utilidades de diagnóstico del TP 07
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
└── README.md
```

- **Modelo:** define los campos y sus validaciones.
- **Servicio:** realiza operaciones asíncronas con Mongoose y convierte `_id` en `id` textual.
- **Controlador HTML:** renderiza las vistas y espera al servicio.
- **Router HTML:** contiene las rutas `/reservas`.
- **Router API:** contiene los endpoints JSON `/api/reservas`.
- **App:** configura Express, parsers, routers, 404 y middleware de errores.
- **Arranque:** conecta primero, crea una única instancia del servicio y luego escucha.

Los scripts de terminal heredados del TP 07 se conservan como referencia; no se ejecutan automáticamente y no son la fuente de datos de la web.

## 5. Modelo y validaciones

Cada reserva contiene:

| Campo | Regla |
|---|---|
| `estudiante` | Texto obligatorio, sin espacios externos |
| `email` | Texto obligatorio y debe contener `@` |
| `sala` | `Sala Norte`, `Sala Sur` o `Sala Multimedia` |
| `fecha` | Texto obligatorio, sin espacios externos |
| `turno` | `Mañana`, `Tarde` o `Noche` |
| `personas` | Número entero entre 1 y 6 |
| `estado` | Por defecto `pendiente`; opciones `pendiente` o `confirmada` |

En la creación HTTP se copian explícitamente los seis campos admitidos. El cliente no puede asignar `estado` ni `_id`; si los envía como campos extra, se ignoran. No se valida que la fecha sea real o futura, no se detectan solapamientos ni duplicados y no se implementan cambios de estado.

## 6. Contrato de la API

Servidor local por defecto: `http://localhost:3000`.

| Método y URL | Resultado |
|---|---|
| `GET /api/reservas` | `200` y arreglo de reservas |
| `GET /api/reservas/:id` | `200` y recurso; `400` si el ID tiene formato inválido; `404` si no existe |
| `POST /api/reservas` | `201`, recurso guardado y cabecera `Location` |
| `GET /api/reservas?sala=Sala%20Norte` | `200` y coincidencias exactas; puede devolver `[]` |
| Ruta desconocida bajo `/api` | `404` JSON |

No se implementan PUT, PATCH ni DELETE.

### JSON para crear una reserva

En Postman seleccionar **POST**, URL `http://localhost:3000/api/reservas`, luego **Body → raw → JSON**:

```json
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-21",
  "turno": "Mañana",
  "personas": 2
}
```

El resultado esperado de una creación válida es `201 Created`, un cuerpo JSON con `id`, los seis campos y `estado: "pendiente"`, además de una cabecera `Location` similar a `/api/reservas/ID_REAL`. El ID debe copiarse de la respuesta real. No se inventan IDs ni resultados de Atlas en esta documentación.

## 7. Pruebas manuales en Postman

Mantener el servidor activo mientras se realizan las solicitudes. Para cada prueba, registrar método, URL, estado, respuesta y cantidad observada.

1. **Listado inicial:** `GET http://localhost:3000/api/reservas`. Esperado: `200` y un arreglo. Una base nueva puede devolver `[]`.
2. **Crear:** enviar el JSON de ejemplo con `POST`. Esperado: `201`, cuerpo con ID y cabecera `Location`.
3. **Consultar el recurso:** copiar el valor real de `Location` y realizar un `GET` a esa dirección completa. Esperado: `200` y los mismos campos e ID.
4. **ID mal formado:** `GET http://localhost:3000/api/reservas/1`. Esperado: `400` JSON.
5. **ID bien formado inexistente:** `GET http://localhost:3000/api/reservas/000000000000000000000000`. Esperado: `404` si ese documento no existe.
6. **Filtro exacto:** `GET http://localhost:3000/api/reservas?sala=Sala%20Norte`. Debe devolver solo coincidencias exactas. Probar también una sala que no exista: esperado `200` con `[]`.
7. **Parámetro repetido:** `GET http://localhost:3000/api/reservas?sala=Sala%20Norte&sala=Sala%20Sur`. Esperado: `400`.
8. **Entradas inválidas:** duplicar la solicitud POST y probar un caso por vez: estudiante vacío, email sin `@`, sala inválida, turno inválido, fecha vacía, personas `0`, `7`, `2.5`, `"abc"`, `true`, arreglo u objeto. Esperado: `400` y sin aumento de la cantidad.
9. **Cuerpo ausente o JSON mal formado:** enviar POST sin Body y luego JSON incompleto con `Content-Type: application/json`. Esperado: `400` JSON.
10. **Campos extra:** agregar `"estado": "confirmada"` o `_id` a un cuerpo válido. Esperado: `201`, estado `pendiente` y un ID generado por MongoDB.
11. **Persistencia:** guardar el ID creado, detener el servidor, iniciarlo nuevamente y consultar el mismo ID con GET. Debe seguir existiendo sin repetir el POST.
12. **Cantidad estable:** hacer dos GET de listado sin crear nuevas reservas. La cantidad debe mantenerse igual.
13. **Atlas:** abrir Data Explorer y comprobar `reservas_salas_u8` → `reservas`; comparar el `_id` con el ID de la API.

La prueba de reinicio solo se considera realizada cuando se observó en el entorno propio. No completar la tabla con datos inventados ni publicar capturas con secretos.

### Registro de resultados observados

Completar luego de ejecutar las pruebas reales:

| Prueba | Estado observado | Cantidad / ID / evidencia |
|---|---|---|
| GET inicial | Pendiente | Completar |
| POST válido | Pendiente | Completar ID y Location |
| GET por Location | Pendiente | Completar |
| ID `1` | Pendiente | Completar |
| ID válido inexistente | Pendiente | Completar |
| Filtro con coincidencias y sin coincidencias | Pendiente | Completar |
| POST inválidos | Pendiente | Completar cantidad antes/después |
| Reinicio y GET con el mismo ID | Pendiente | Completar |
| Dos listados consecutivos | Pendiente | Completar |
| Documento en Atlas | Pendiente | Completar evidencia |

## 8. Continuidad del sitio HTML

- `GET /`, CSS, layout y página 404 se mantienen.
- `GET /reservas` lee MongoDB.
- `GET /reservas/nueva` muestra el formulario.
- `POST /reservas` valida, espera la escritura y redirige con `302`.
- `GET /reservas/:id` consulta la base y muestra el detalle.
- `GET /estado` obtiene el conteo con `countDocuments()` en MongoDB.

Tanto el sitio como la API utilizan el mismo servicio y la misma colección; no hay arreglo ni semilla activa en el arranque.

## 9. Errores

La API responde JSON ante errores de validación, JSON mal formado, identificadores incorrectos, recursos inexistentes y fallos inesperados. Las respuestas internas no incluyen trazas ni URI de conexión. Las rutas HTML conservan respuestas HTML. El middleware de errores se registra después de las rutas.

## 10. Formato, lint y entrega

```bash
npm run format
npm run check
```

Antes de entregar:
- Verificar que `npm install`, `npm start` y `npm run check` funcionen localmente.
- Completar las tablas con resultados observados y agregar capturas de Postman/Atlas.
- Confirmar que el docente tenga acceso al repositorio individual de GitHub.
- Incluir `package.json`, `package-lock.json`, `.env.example` y README.
- No incluir `.env`, `node_modules`, credenciales ni datos personales reales.

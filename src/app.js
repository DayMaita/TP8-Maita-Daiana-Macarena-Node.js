const path = require("node:path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const { identificarSolicitud, medirDuracion } = require("./middleware/solicitudes");
const { crearRouterReservas } = require("./rutas/reservas");
const { crearRouterApiReservas } = require("./rutas/api-reservas");
const { crearControladorReservas } = require("./controladores/reservas");
const { crearMiddlewareReservas } = require("./middleware/reservas");
const { salasPermitidas, turnosPermitidos } = require("./utilidades/reservas");

function crearApp({ servicio, formatoMorgan }) {
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../views"));

  app.use(morgan(formatoMorgan));
  app.use(identificarSolicitud);
  app.use(medirDuracion);
  app.use(expressLayouts);
  app.use(express.static(path.join(__dirname, "../public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.render("inicio", {
      titulo: "Inicio",
      mensaje: "Sistema de consulta y reserva de salas de estudio."
    });
  });

  app.get("/estado", async (req, res, next) => {
    try {
      res.json({
        servicio: "activo",
        reservas: await servicio.contar(),
        solicitudId: res.locals.solicitudId
      });
    } catch (error) { next(error); }
  });

  app.use("/api/reservas", crearRouterApiReservas(servicio));

  const controlador = crearControladorReservas(servicio, { salasPermitidas, turnosPermitidos });
  const middleware = crearMiddlewareReservas();
  app.use("/reservas", crearRouterReservas(controlador, middleware));

  app.use("/api", (req, res) => res.status(404).json({ error: "Endpoint API no encontrado." }));
  app.use((req, res) => res.status(404).render("no-encontrado", {
    titulo: "Página no encontrada",
    mensaje: "La dirección solicitada no existe."
  }));

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (req.originalUrl.startsWith("/api/")) {
      if (error.type === "entity.parse.failed" || error instanceof SyntaxError) {
        return res.status(400).json({ error: "El JSON enviado no tiene un formato válido." });
      }
      if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ error: "Los datos enviados no son válidos." });
      }
      console.error(`[API] ${error.name || "Error"} durante ${req.method} ${req.originalUrl}`);
      return res.status(500).json({ error: "Ocurrió un error interno." });
    }
    if (error.type === "entity.parse.failed" || error instanceof SyntaxError) {
      return res.status(400).send("La solicitud contiene datos con formato inválido.");
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).send("Los datos ingresados no son válidos.");
    }
    console.error(`[HTML] ${error.name || "Error"} durante ${req.method} ${req.originalUrl}`);
    res.status(500).render("no-encontrado", {
      titulo: "Error interno",
      mensaje: "No se pudo completar la solicitud. Intentá nuevamente."
    });
  });

  return app;
}

module.exports = { crearApp };

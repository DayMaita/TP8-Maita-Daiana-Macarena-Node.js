const express = require("express");

function crearRouterReservas(controlador, middleware) {
  const router = express.Router();
  router.use(middleware.prepararAreaReservas);
  router.get("/", controlador.listar);
  router.get("/nueva", controlador.nueva);
  router.get("/:id", controlador.detalle);
  router.post("/", middleware.validarReserva, controlador.crear);
  return router;
}

module.exports = { crearRouterReservas };

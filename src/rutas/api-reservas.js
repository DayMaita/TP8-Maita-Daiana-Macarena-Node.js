const express = require("express");
const mongoose = require("mongoose");
const { salasPermitidas, turnosPermitidos } = require("../utilidades/reservas");

function crearRouterApiReservas(servicio) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      let filtro = {};
      if (Object.prototype.hasOwnProperty.call(req.query, "sala")) {
        if (typeof req.query.sala !== "string") {
          return res.status(400).json({ error: "El parámetro sala debe aparecer una sola vez y ser texto." });
        }
        filtro = { sala: req.query.sala };
      }
      res.status(200).json(await servicio.listar(filtro));
    } catch (error) { next(error); }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!mongoose.isObjectIdOrHexString(id)) {
        return res.status(400).json({ error: "El identificador no tiene un formato válido." });
      }
      const resultado = await servicio.buscarPorId(id);
      if (!resultado.reserva) return res.status(404).json({ error: "Reserva no encontrada." });
      res.status(200).json(resultado.reserva);
    } catch (error) { next(error); }
  });

  router.post("/", async (req, res, next) => {
    try {
      const cuerpo = req.body;
      if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
        return res.status(400).json({ error: "El cuerpo debe ser un objeto JSON." });
      }

      const camposTexto = ["estudiante", "email", "sala", "fecha", "turno"];
      const datos = {};
      const errores = [];

      for (const campo of camposTexto) {
        if (typeof cuerpo[campo] !== "string" || cuerpo[campo].trim() === "") {
          errores.push(`${campo} es obligatorio y debe ser texto.`);
        } else {
          datos[campo] = cuerpo[campo].trim();
        }
      }

      if (typeof cuerpo.email === "string" && !cuerpo.email.trim().includes("@")) {
        errores.push("email debe contener @.");
      }
      if (typeof cuerpo.sala === "string" && !salasPermitidas.includes(cuerpo.sala.trim())) {
        errores.push("sala no permitida.");
      }
      if (typeof cuerpo.turno === "string" && !turnosPermitidos.includes(cuerpo.turno.trim())) {
        errores.push("turno no permitido.");
      }
      if (typeof cuerpo.personas !== "number" || !Number.isInteger(cuerpo.personas) ||
          cuerpo.personas < 1 || cuerpo.personas > 6) {
        errores.push("personas debe ser un número entero entre 1 y 6.");
      } else {
        datos.personas = cuerpo.personas;
      }

      if (errores.length) return res.status(400).json({ error: "Datos inválidos.", detalles: errores });

      const reserva = await servicio.crear(datos);
      res.location(`/api/reservas/${reserva.id}`).status(201).json(reserva);
    } catch (error) {
      if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).json({ error: "Los datos no cumplen las validaciones del modelo." });
      }
      next(error);
    }
  });

  return router;
}

module.exports = { crearRouterApiReservas };

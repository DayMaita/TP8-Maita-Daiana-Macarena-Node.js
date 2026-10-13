const { salasPermitidas, turnosPermitidos } = require("../utilidades/reservas");

function crearMiddlewareReservas() {
  function prepararAreaReservas(req, res, next) {
    res.locals.seccion = "Reservas de salas";
    next();
  }

  function validarReserva(req, res, next) {
    const cuerpo = req.body;
    if (!cuerpo || typeof cuerpo !== "object" || Array.isArray(cuerpo)) {
      return res.status(400).render("reservas/nueva", {
        titulo: "Nueva reserva",
        error: "Debe completar el formulario con datos válidos.",
        valores: {},
        salasPermitidas,
        turnosPermitidos
      });
    }

    const estudiante = typeof cuerpo.estudiante === "string" ? cuerpo.estudiante.trim() : "";
    const email = typeof cuerpo.email === "string" ? cuerpo.email.trim() : "";
    const sala = typeof cuerpo.sala === "string" ? cuerpo.sala.trim() : "";
    const fecha = typeof cuerpo.fecha === "string" ? cuerpo.fecha.trim() : "";
    const turno = typeof cuerpo.turno === "string" ? cuerpo.turno.trim() : "";
    const personasTexto = typeof cuerpo.personas === "string" ? cuerpo.personas.trim() : "";
    const personas = personasTexto !== "" ? Number(personasTexto) : NaN;
    const errores = [];

    if (!estudiante) errores.push("El estudiante es obligatorio.");
    if (!email || !email.includes("@")) errores.push("El email debe contener @.");
    if (!salasPermitidas.includes(sala)) errores.push("La sala seleccionada no está permitida.");
    if (!fecha) errores.push("La fecha es obligatoria.");
    if (!turnosPermitidos.includes(turno)) errores.push("El turno seleccionado no está permitido.");
    if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
      errores.push("La cantidad de personas debe ser un número entero entre 1 y 6.");
    }

    if (errores.length) {
      return res.status(400).render("reservas/nueva", {
        titulo: "Nueva reserva",
        error: errores.join(" "),
        valores: { estudiante, email, sala, fecha, turno, personas: cuerpo.personas || "" },
        salasPermitidas,
        turnosPermitidos
      });
    }

    req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
    next();
  }

  return { prepararAreaReservas, validarReserva };
}

module.exports = { crearMiddlewareReservas };

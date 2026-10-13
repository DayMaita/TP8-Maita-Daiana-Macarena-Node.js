function crearControladorReservas(servicio, { salasPermitidas, turnosPermitidos }) {
  async function listar(req, res, next) {
    try {
      const reservas = await servicio.listar();
      res.render("reservas/lista", { titulo: "Reservas", reservas });
    } catch (error) { next(error); }
  }

  function nueva(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva", error: null, valores: {}, salasPermitidas, turnosPermitidos
    });
  }

  async function detalle(req, res, next) {
    try {
      const resultado = await servicio.buscarPorId(req.params.id);
      if (resultado.invalido || !resultado.reserva) {
        return res.status(404).render("no-encontrado", {
          titulo: "Reserva no encontrada", mensaje: "La reserva solicitada no existe."
        });
      }
      res.render("reservas/detalle", {
        titulo: `Reserva #${resultado.reserva.id}`, reserva: resultado.reserva
      });
    } catch (error) { next(error); }
  }

  async function crear(req, res, next) {
    try {
      await servicio.crear(req.reservaValidada);
      res.redirect(302, "/reservas");
    } catch (error) {
      if (error.name === "ValidationError" || error.name === "CastError") {
        return res.status(400).render("reservas/nueva", {
          titulo: "Nueva reserva",
          error: "Los datos ingresados no son válidos.",
          valores: req.reservaValidada || {},
          salasPermitidas, turnosPermitidos
        });
      }
      next(error);
    }
  }

  return { listar, nueva, detalle, crear };
}

module.exports = { crearControladorReservas };

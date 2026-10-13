const mongoose = require("mongoose");
const Reserva = require("../modelos/reserva");

function representar(reserva) {
  if (!reserva) return null;
  const objeto = typeof reserva.toObject === "function" ? reserva.toObject() : reserva;
  return {
    id: objeto._id.toString(),
    estudiante: objeto.estudiante,
    email: objeto.email,
    sala: objeto.sala,
    fecha: objeto.fecha,
    turno: objeto.turno,
    personas: objeto.personas,
    estado: objeto.estado || "pendiente"
  };
}

function crearServicioReservas() {
  async function listar(filtro = {}) {
    const documentos = await Reserva.find(filtro).lean();
    return documentos.map(representar);
  }

  async function buscarPorId(id) {
    if (!mongoose.isValidObjectId(id)) return { invalido: true, reserva: null };
    const documento = await Reserva.findById(id).lean();
    return { invalido: false, reserva: representar(documento) };
  }

  async function contar() {
    return Reserva.countDocuments({});
  }

  async function crear(datos) {
    // Copiar únicamente los seis campos permitidos. El cliente no controla id ni estado.
    const reserva = new Reserva({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas
    });
    const guardada = await reserva.save();
    return representar(guardada);
  }

  return { listar, buscarPorId, contar, crear };
}

module.exports = { crearServicioReservas, representar };

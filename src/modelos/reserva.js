const mongoose = require("mongoose");

const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

const reservaSchema = new mongoose.Schema({
  estudiante: {
    type: String,
    required: [true, "El nombre del estudiante es obligatorio."],
    trim: true
  },
  email: {
    type: String,
    required: [true, "El email es obligatorio."],
    trim: true,
    match: [/@/, "El email debe contener @."]
  },
  sala: {
    type: String,
    required: [true, "La sala es obligatoria."],
    enum: salasPermitidas
  },
  fecha: {
    type: String,
    required: [true, "La fecha es obligatoria."],
    trim: true,
    validate: {
      validator: valor => typeof valor === "string" && valor.trim().length > 0,
      message: "La fecha no puede estar vacía."
    }
  },
  turno: {
    type: String,
    required: [true, "El turno es obligatorio."],
    enum: turnosPermitidos
  },
  personas: {
    type: Number,
    required: [true, "La cantidad de personas es obligatoria."],
    min: [1, "Debe haber al menos 1 persona."],
    max: [6, "Se permiten hasta 6 personas."],
    validate: {
      validator: Number.isInteger,
      message: "La cantidad de personas debe ser un número entero."
    }
  },
  estado: {
    type: String,
    enum: ["pendiente", "confirmada"],
    default: "pendiente"
  }
}, { versionKey: false, collection: "reservas" });

module.exports = mongoose.model("Reserva", reservaSchema, "reservas");

const dns = require("node:dns");
const mongoose = require("mongoose");
const { obtenerUriMongo } = require("./entorno");

// Ajuste de resolución DNS para conexiones SRV/TXT de MongoDB Atlas.
// Si la red requiere otros resolutores, seguir la indicación del docente.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function conectarBaseDatos() {
  const uri = obtenerUriMongo();
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    return mongoose.connection;
  } catch (error) {
    const detalle = {
      nombre: error.name || "Error",
      codigo: error.code || error.cause?.code || "no disponible",
      operacion: error.syscall || error.cause?.syscall || "conexión/selección de servidor"
    };
    const diagnostico = new Error(`No se pudo conectar con MongoDB. Nombre: ${detalle.nombre}; código: ${detalle.codigo}; operación: ${detalle.operacion}. Revisá la URI, el acceso de red y el usuario de Atlas.`);
    diagnostico.cause = error;
    throw diagnostico;
  }
}

async function cerrarBaseDatos() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

module.exports = { conectarBaseDatos, cerrarBaseDatos };

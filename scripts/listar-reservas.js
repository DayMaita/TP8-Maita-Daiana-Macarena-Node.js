const Reserva = require("../src/modelos/reserva");
const { conectarBaseDatos, cerrarBaseDatos } = require("../src/config/base-datos");

(async () => {
  let codigoSalida = 0;
  try {
    await conectarBaseDatos();
    const reservas = await Reserva.find({}).lean();
    if (reservas.length === 0) console.log("No hay reservas guardadas en la colección.");
    for (const reserva of reservas) {
      console.log("----------------------------------------");
      console.log(`_id: ${reserva._id.toString()}`);
      console.log(`Estudiante: ${reserva.estudiante}`);
      console.log(`Email: ${reserva.email}`);
      console.log(`Sala: ${reserva.sala}`);
      console.log(`Fecha: ${reserva.fecha}`);
      console.log(`Turno: ${reserva.turno}`);
      console.log(`Personas: ${reserva.personas}`);
    }
    console.log(`Cantidad recuperada: ${reservas.length}`);
  } catch (error) {
    codigoSalida = 1;
    console.error(`No se pudieron listar las reservas. Tipo: ${error.name || "Error"}. ${error.message}`);
  } finally {
    try { await cerrarBaseDatos(); }
    catch (error) { codigoSalida = 1; console.error(`No se pudo cerrar la conexión: ${error.name || "Error"}.`); }
  }
  process.exitCode = codigoSalida;
})();

const Reserva = require("../src/modelos/reserva");
const { conectarBaseDatos, cerrarBaseDatos } = require("../src/config/base-datos");

(async () => {
  let codigoSalida = 0;
  try {
    await conectarBaseDatos();
    const reserva = new Reserva({
      estudiante: "Estudiante de prueba TP08",
      email: "tp08.reservas@example.com",
      sala: "Sala Norte",
      fecha: "2026-10-20",
      turno: "Tarde",
      personas: 3
    });
    await reserva.save();
    console.log("Reserva guardada correctamente en MongoDB.");
    console.log(`_id confirmado: ${reserva._id.toString()}`);
  } catch (error) {
    codigoSalida = 1;
    if (error.name === "ValidationError") {
      console.error("No se guardó la reserva: hay campos para corregir.");
      for (const [campo, problema] of Object.entries(error.errors)) console.error(`- ${campo}: ${problema.message}`);
    } else {
      console.error(`No se pudo crear la reserva. Tipo: ${error.name || "Error"}. ${error.message}`);
    }
  } finally {
    try { await cerrarBaseDatos(); }
    catch (error) { codigoSalida = 1; console.error(`No se pudo cerrar la conexión: ${error.name || "Error"}.`); }
  }
  process.exitCode = codigoSalida;
})();

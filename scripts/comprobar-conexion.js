const { conectarBaseDatos, cerrarBaseDatos } = require("../src/config/base-datos");

(async () => {
  let codigoSalida = 0;
  try {
    await conectarBaseDatos();
    console.log("Conexión con MongoDB establecida correctamente. No se crearon reservas.");
  } catch (error) {
    codigoSalida = 1;
    console.error(error.message);
  } finally {
    try { await cerrarBaseDatos(); }
    catch (error) { codigoSalida = 1; console.error(`No se pudo cerrar la conexión: ${error.name || "Error"}.`); }
  }
  process.exitCode = codigoSalida;
})();

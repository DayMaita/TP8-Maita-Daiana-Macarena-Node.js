const { crearApp } = require("./app");
const { obtenerConfiguracion } = require("./config/entorno");
const { conectarBaseDatos, cerrarBaseDatos } = require("./config/base-datos");
const { crearServicioReservas } = require("./servicios/reservas");

async function iniciar() {
  const configuracion = obtenerConfiguracion();
  await conectarBaseDatos();

  const servicio = crearServicioReservas();
  const app = crearApp({ servicio, formatoMorgan: configuracion.formatoMorgan });
  const servidor = app.listen(configuracion.port, () => {
    console.log(`Servidor iniciado en http://localhost:${configuracion.port}`);
  });

  let cerrando = false;
  async function cerrar(signal) {
    if (cerrando) return;
    cerrando = true;
    console.log(`Señal ${signal} recibida. Cerrando servidor...`);
    servidor.close(async error => {
      try {
        await cerrarBaseDatos();
        if (error) {
          console.error("No se pudo cerrar correctamente el servidor.");
          process.exitCode = 1;
        }
        process.exit();
      } catch (cierreError) {
        console.error(`No se pudo cerrar la conexión (${cierreError.name || "Error"}).`);
        process.exitCode = 1;
        process.exit();
      }
    });
  }
  process.on("SIGINT", () => cerrar("SIGINT"));
  process.on("SIGTERM", () => cerrar("SIGTERM"));
}

iniciar().catch(async error => {
  console.error(`No se pudo iniciar la aplicación: ${error.message}`);
  try { await cerrarBaseDatos(); } catch {}
  process.exitCode = 1;
});

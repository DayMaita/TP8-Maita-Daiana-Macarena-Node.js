function obtenerConfiguracion(env = process.env) {
  const portTexto = env.PORT;
  const port = portTexto === undefined ? 3000 : Number(portTexto);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un número entero entre 1 y 65535.");
  }

  const nodeEnv = env.NODE_ENV || "development";
  const formatoMorgan = nodeEnv === "production" ? "combined" : "dev";
  const mongodbUri = (env.MONGODB_URI || "").trim();

  return { port, nodeEnv, formatoMorgan, mongodbUri };
}

function obtenerUriMongo(env = process.env) {
  const uri = (env.MONGODB_URI || "").trim();
  if (!uri) throw new Error("Configuración inválida: falta la variable MONGODB_URI.");
  if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
    throw new Error("Configuración inválida: MONGODB_URI debe comenzar con mongodb:// o mongodb+srv://.");
  }
  return uri;
}

module.exports = { obtenerConfiguracion, obtenerUriMongo };

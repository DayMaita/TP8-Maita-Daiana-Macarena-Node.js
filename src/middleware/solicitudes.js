let siguienteSolicitud = 1;

function identificarSolicitud(req, res, next) {
  const numero = String(siguienteSolicitud++).padStart(4, "0");
  res.locals.solicitudId = `BIB-${numero}`;
  next();
}

function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();

  res.on("finish", () => {
    const fin = process.hrtime.bigint();
    const duracionMs = Number(fin - inicio) / 1e6;

    console.log(
      `[MEDICION] ID=${res.locals.solicitudId} METODO=${req.method} URL=${req.originalUrl} ESTADO=${res.statusCode} DURACION=${duracionMs.toFixed(2)}ms`
    );
  });

  next();
}

module.exports = {
  identificarSolicitud,
  medirDuracion
};

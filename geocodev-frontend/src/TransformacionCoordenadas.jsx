import React from "react";
import { Link } from "react-router-dom";

export default function TransformacionCoordenadas() {
  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <h1>Transformación de coordenadas</h1>
          <p>
            Convierte coordenadas geográficas (latitud/longitud) a UTM y viceversa.
          </p>
        </section>

        <section className="grid">
          <Link className="card" to="/geoutm">
            <h2>Geográficas → UTM</h2>
            <p>Transforma un punto o un archivo CSV/Excel.</p>
          </Link>
          <Link className="card" to="/utmtogeo">
            <h2>UTM → Geográficas</h2>
            <p>Convierte UTM a latitud/longitud en WGS84.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}

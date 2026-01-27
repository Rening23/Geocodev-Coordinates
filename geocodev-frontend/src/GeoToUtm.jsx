import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function GeoToUtm() {
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [fileLoading, setFileLoading] = useState(false);

  const handleManual = async () => {
    if (!latitud || !longitud) {
      setError("Latitud y longitud son obligatorias.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/geographic_to_utm_view/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitud: parseFloat(latitud),
          longitud: parseFloat(longitud),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async () => {
    if (!file) {
      setFileError("Selecciona un archivo CSV o Excel.");
      return;
    }

    setFileLoading(true);
    setFileError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/batch-geo-a-utm/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Error ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const disposition = response.headers.get("content-disposition");
      let filename = `utm_${file.name}`;
      if (disposition && /filename/i.test(disposition)) {
        const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (match && match[1]) filename = match[1].replace(/['"]/g, "");
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <h1>Geográficas → UTM</h1>
          <p>Convierte latitud/longitud en grados decimales a UTM.</p>
        </section>

        <section className="card">
          <h2>Transformación manual</h2>
          <div className="form-grid">
            <label>
              Latitud
              <input
                type="number"
                step="any"
                value={latitud}
                onChange={(e) => setLatitud(e.target.value)}
                placeholder="Ej. 4.6097"
              />
            </label>
            <label>
              Longitud
              <input
                type="number"
                step="any"
                value={longitud}
                onChange={(e) => setLongitud(e.target.value)}
                placeholder="Ej. -74.0817"
              />
            </label>
          </div>

          <div className="actions">
            <button onClick={handleManual} disabled={loading}>
              {loading ? "Transformando..." : "Transformar"}
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {result && (
            <div className="result">
              <p><strong>Este:</strong> {result.este}</p>
              <p><strong>Norte:</strong> {result.norte}</p>
              <p><strong>Huso:</strong> {result.huso}</p>
              <p><strong>Hemisferio:</strong> {result.hemisferio}</p>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Transformación por archivo</h2>
          <p className="muted">Columnas requeridas: <code>latitud</code>, <code>longitud</code>.</p>

          <input type="file" accept=".csv,.xls,.xlsx" onChange={(e) => setFile(e.target.files[0] || null)} />

          <div className="actions">
            <button onClick={handleFile} disabled={fileLoading}>
              {fileLoading ? "Procesando..." : "Transformar y descargar"}
            </button>
          </div>

          {fileError && <p className="error">{fileError}</p>}
        </section>
      </div>
    </main>
  );
}

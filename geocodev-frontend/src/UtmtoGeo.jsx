import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function UtmtoGeo() {
  const [este, setEste] = useState("");
  const [norte, setNorte] = useState("");
  const [huso, setHuso] = useState("");
  const [hemisferio, setHemisferio] = useState("N");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [fileLoading, setFileLoading] = useState(false);

  const handleManual = async () => {
    if (!este || !norte || !huso) {
      setError("Este, Norte y Huso son obligatorios.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/utm-a-geograficas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          este: parseFloat(este),
          norte: parseFloat(norte),
          huso: parseInt(huso, 10),
          hemisferio,
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
      const response = await fetch(`${API_BASE_URL}/batch-utm-a-geograficas/`, {
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
      let filename = `transformadas_${file.name}`;
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
          <h1>UTM → Geográficas</h1>
          <p>Convierte coordenadas UTM (WGS84) a latitud/longitud.</p>
        </section>

        <section className="card">
          <h2>Transformación manual</h2>
          <div className="form-grid">
            <label>
              Este (m)
              <input
                type="number"
                step="any"
                value={este}
                onChange={(e) => setEste(e.target.value)}
                placeholder="Ej. 500000"
              />
            </label>
            <label>
              Norte (m)
              <input
                type="number"
                step="any"
                value={norte}
                onChange={(e) => setNorte(e.target.value)}
                placeholder="Ej. 4649776"
              />
            </label>
            <label>
              Huso
              <input
                type="number"
                min="1"
                max="60"
                value={huso}
                onChange={(e) => setHuso(e.target.value)}
                placeholder="Ej. 18"
              />
            </label>
            <label>
              Hemisferio
              <select value={hemisferio} onChange={(e) => setHemisferio(e.target.value)}>
                <option value="N">N</option>
                <option value="S">S</option>
              </select>
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
              <p><strong>Latitud:</strong> {result.latitud}</p>
              <p><strong>Longitud:</strong> {result.longitud}</p>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Transformación por archivo</h2>
          <p className="muted">
            Columnas requeridas: <code>este</code>, <code>norte</code>, <code>huso</code>, <code>hemisferio</code>.
          </p>

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

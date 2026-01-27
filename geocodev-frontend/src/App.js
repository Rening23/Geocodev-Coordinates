import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import TransformacionCoordenadas from "./TransformacionCoordenadas";
import GeoToUtm from "./GeoToUtm";
import UtmtoGeo from "./UtmtoGeo";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="topbar">
          <div className="container topbar__inner">
            <Link to="/" className="brand">Geocodev Coordinates</Link>
            <nav className="nav">
              <Link to="/geoutm">Geo → UTM</Link>
              <Link to="/utmtogeo">UTM → Geo</Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<TransformacionCoordenadas />} />
          <Route path="/geoutm" element={<GeoToUtm />} />
          <Route path="/utmtogeo" element={<UtmtoGeo />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

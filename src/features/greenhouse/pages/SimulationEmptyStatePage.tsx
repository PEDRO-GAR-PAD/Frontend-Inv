import { useNavigate } from "react-router-dom";
import "../styles/simulation.css";

export function SimulationEmptyStatePage() {
  const navigate = useNavigate();

  return (
    <section className="management-page" aria-label="Simulacion vacia">
      <div className="management-card simulation-card">
        <h1>No hay invernaderos disponibles</h1>
        <p>No se encontro ningun invernadero elegible para iniciar la simulacion.</p>
        <button className="primary" type="button" onClick={() => navigate("/inicio")}>Volver a inicio</button>
      </div>
    </section>
  );
}

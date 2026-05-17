import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserSession } from "../model/session.store";
import { getSimulationSession } from "../model/simulationSession.store";
import {
  listGreenhousesByUserPaged,
  resolveCurrentUserId,
  type InvernaderoApiRespuesta
} from "../services/greenhouseApi";

const PAGE_SIZE = 5;

function getStatusLabel(estado: InvernaderoApiRespuesta["estado"]): string {
  if (estado === "PRODUCCION") return "Produccion";
  if (estado === "INACTIVO") return "Inactivo";
  return estado;
}

export function HomePage() {
  const navigate = useNavigate();
  const session = getUserSession();
  const activeSimulationSession = getSimulationSession();
  const [greenhouses, setGreenhouses] = useState<InvernaderoApiRespuesta[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadGreenhouses() {
      setIsLoading(true);
      setApiError("");
      try {
        const resolvedUserId =
          session.idUsuario || (session.token && session.correo ? await resolveCurrentUserId(session.correo, session.token) : "");

        if (!resolvedUserId) {
          if (isActive) {
            setGreenhouses([]);
            setTotalItems(0);
            setApiError("Debes iniciar sesion para ver tus invernaderos.");
          }
          return;
        }

        const { items, total } = await listGreenhousesByUserPaged(resolvedUserId, currentPage, PAGE_SIZE);
        if (isActive) {
          setGreenhouses(items);
          setTotalItems(total);

          const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
          if (currentPage >= totalPages) {
            setCurrentPage(totalPages - 1);
          }
        }
      } catch (error) {
        if (isActive) {
          setApiError(error instanceof Error ? error.message : "No se pudieron cargar los invernaderos");
          setTotalItems(0);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadGreenhouses();

    function onWindowFocus() {
      void loadGreenhouses();
    }

    window.addEventListener("focus", onWindowFocus);

    return () => {
      isActive = false;
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [currentPage, session.correo, session.idUsuario, session.token]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage + 1 < totalPages;

  return (
    <section className="management-page" aria-label="Pantalla inicio">
      <div className="management-card">
        <h1>Inicio</h1>
        <p>Selecciona Invernadero o Cosecha desde el menu para gestionar tu operacion.</p>
        

        <section className="home-greenhouses" aria-label="Invernadero">
          <h2>Invernadero</h2>

          {activeSimulationSession ? (
            <p className="field-note">
              Este equipo ya esta mostrando un invernadero. Para visualizar otro, primero sal del invernadero actual.
            </p>
          ) : null}

          {isLoading ? <p>Cargando invernaderos...</p> : null}
          {apiError ? <p className="field-error">{apiError}</p> : null}

          {!isLoading && !apiError && greenhouses.length === 0 ? (
            <p>No hay ningun invernadero creado o registrado</p>
          ) : null}

          {!isLoading && !apiError && greenhouses.length > 0 ? (
            <>
              <ul className="home-greenhouse-list">
                {greenhouses.map((greenhouse) => (
                  <li key={greenhouse.idInvernadero} className="home-greenhouse-item">
                    <div>
                      <h3>{greenhouse.nombre}</h3>
                      <p>{greenhouse.ubicacion || "Sin ubicacion"}</p>
                      <p><strong>Estado:</strong> {getStatusLabel(greenhouse.estado)}</p>
                      <p><strong>Sensores:</strong> {(greenhouse.nombresSensor || []).join(", ") || "Sin sensores"}</p>
                      <p><strong>Actuadores:</strong> {(greenhouse.nombresActuador || []).join(", ") || "Sin actuadores"}</p>
                    </div>
                    <button
                      type="button"
                      className="secondary-action"
                      disabled={Boolean(activeSimulationSession && activeSimulationSession.idInvernadero !== greenhouse.idInvernadero)}
                      title={
                        activeSimulationSession && activeSimulationSession.idInvernadero !== greenhouse.idInvernadero
                          ? "Sal del invernadero actual para visualizar otro"
                          : "Visualizar invernadero"
                      }
                      onClick={() => {
                        const params = new URLSearchParams({
                          greenhouseId: greenhouse.idInvernadero,
                          greenhouseName: greenhouse.nombre,
                          greenhouseLocation: greenhouse.ubicacion || "",
                          greenhouseState: greenhouse.estado,
                          sensorNames: (greenhouse.nombresSensor || []).join(","),
                          actuatorNames: (greenhouse.nombresActuador || []).join(",")
                        });
                        navigate(`/simulacion/inicio?${params.toString()}`);
                      }}
                    >
                      Visualizar
                    </button>
                    
                  </li>
                ))}
              </ul>

              <div className="home-pagination" aria-label="Paginacion de invernaderos">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={!canGoPrev}
                >
                  Anterior
                </button>
                <p>
                  Pagina {totalItems === 0 ? 0 : currentPage + 1} de {totalPages}
                </p>
                <button
                  type="button"
                  className="secondary-action"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!canGoNext}
                >
                  Siguiente
                </button>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </section>
  );
}

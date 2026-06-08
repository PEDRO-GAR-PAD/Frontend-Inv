import { useEffect, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { getSimulationSession, clearSimulationSession } from "../model/simulationSession.store";
import { updateGreenhouse } from "../services/greenhouseApi";
import { finalizePlanting } from "../services/plantingApi";
import { getSimulationDashboard, exitSimulationSession, getRealtimeSimulation, type SimulationDashboardSummary } from "../services/simulationApi";
import { getUserSession } from "../model/session.store";
import { connectWebSocket } from "../services/websocket";
import "../styles/simulation.css";

interface SerieMetricas {
  humidity: number[];
  temperature: number[];
  light: number[];
  co2: number[];
}

interface BackendLecturaSensor {
  idLectura?: number;
  valor?: number;
  fechaHora?: string;
  invernaderoSensor?: {
    idInvSensor?: number;
    sensor?: {
      nombre?: string;
    } | null;
  } | null;
}

const MAX_CO2_POINTS = 12;

function generarPuntos(seed: number, center: number, spread: number): number[] {
  return Array.from({ length: 8 }, (_, index) => {
    const phase = (index + 1) * 0.7 + seed * 0.33;
    const wave = Math.sin(phase) * spread;
    const drift = ((index % 3) - 1) * (spread * 0.18);
    const value = center + wave + drift;
    return Math.max(0, Math.round(value * 10) / 10);
  });
}

function convertirPuntosSvg(values: number[], width: number, height: number, padding: number): string {
  const step = (width - padding * 2) / Math.max(1, values.length - 1);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  return values
    .map((value, index) => {
      const x = padding + index * step;
      const y = padding + ((max - value) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

function convertirRutaCurva(
  values: number[],
  width: number,
  height: number,
  padding: number
): string {
  if (values.length < 2) return "";

  const step = (width - padding * 2) / Math.max(1, values.length - 1);

  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  const points = values.map((value, index) => ({
    x: padding + index * step,
    y: padding + ((max - value) / range) * (height - padding * 2)
  }));

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    const cx = (prev.x + curr.x) / 2;

    d += `
      C ${cx} ${prev.y},
        ${cx} ${curr.y},
        ${curr.x} ${curr.y}
    `;
  }

  return d;
}

function obtenerSerieMetricas(summary: SimulationDashboardSummary | null): SerieMetricas {
  const seed = (summary?.activeActuatorCount ?? 0) * 13 + (summary?.activeClimateEventCount ?? 0) * 7;

  return {
    humidity: generarPuntos(seed + 1, 63, 6),
    temperature: generarPuntos(seed + 2, 24, 3.5),
    light: generarPuntos(seed + 3, 420, 80),
    co2: generarPuntos(seed + 4, 470, 55)
  };
}

function ordenarLecturasPorTiempo(lecturas: BackendLecturaSensor[]): BackendLecturaSensor[] {
  return [...lecturas].sort((a, b) => {
    const fechaA = a.fechaHora ? new Date(a.fechaHora).getTime() : 0;
    const fechaB = b.fechaHora ? new Date(b.fechaHora).getTime() : 0;

    if (fechaA !== fechaB) {
      return fechaA - fechaB;
    }

    return (a.idLectura ?? 0) - (b.idLectura ?? 0);
  });
}

function extraerSerieCO2Historica(lecturas: BackendLecturaSensor[]): number[] {
  return ordenarLecturasPorTiempo(lecturas)
    .filter((lectura) => {
      const nombreSensor = lectura.invernaderoSensor?.sensor?.nombre?.trim().toLowerCase();
      return nombreSensor === "co2" || nombreSensor?.includes("co2") || lectura.invernaderoSensor?.idInvSensor === 3;
    })
    .map((lectura) => Number(lectura.valor ?? 0))
    .filter((valor) => Number.isFinite(valor))
    .slice(-MAX_CO2_POINTS);
}

function construirSerieCo2Anterior(
  anterior: number[],
  historial: number[],
  valorActual: number
): number[] {
  const base = anterior.length > 0 ? anterior : historial;
  const siguiente = base.length > 0 ? [...base] : [];
  const valor = Number.isFinite(valorActual) ? valorActual : siguiente[siguiente.length - 1] ?? 0;

  if (siguiente.length === 0) {
    siguiente.push(valor);
  }

  siguiente.push(valor);

  if (siguiente.length === 1) {
    siguiente.push(valor);
  }

  return siguiente.slice(-MAX_CO2_POINTS);
}

export function SimulationDashboardPage() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState<SimulationDashboardSummary | null>(null);
  const [realtime, setRealtime] = useState<any>(null);
  const [co2Serie, setCo2Serie] = useState<number[]>([]);
  const [mensajeError, setMensajeError] = useState("");
  const [errorFinalizacion, setErrorFinalizacion] = useState("");
  const [finalizando, setFinalizando] = useState(false);

  useEffect(() => {
    async function load() {
      const session = getSimulationSession();

      if (!session) {
        navigate("/simulacion/inicio", { replace: true });
        return;
      }

      try {
        if (session.idSesion.startsWith("local-")) {
          setResumen({
            sessionId: session.idSesion,
            activeActuatorCount: 0,
            activeClimateEventCount: 0,
            greenhouseName: session.greenhouseName ?? "Invernadero en simulacion",
            selectedCropName: session.cropName ?? "Cosecha seleccionada",
            lastUpdatedAt: new Date().toISOString()
          });
        } else {
          const data = await getSimulationDashboard(session.idSesion);
          setResumen(data);
        }

        const realtimeData = await getRealtimeSimulation("1");
        setRealtime(realtimeData);

        setCo2Serie((anterior) =>
          construirSerieCo2Anterior(anterior, [], Number(realtimeData?.co2 ?? 0))
        );
      
        setMensajeError("");
      } catch (loadError) {
        setMensajeError(loadError instanceof Error ? loadError.message : "No se pudo cargar dashboard");
      }
    }

    void load();

    const interval = setInterval(() => {
      void load();
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    // 1. Obtenemos la sesión actual para saber qué invernadero escuchar
    const session = getSimulationSession();
    if (!session) return;

    // 2. Pasamos el ID al socket y atrapamos el dato en setRealtime
    const disconnect = connectWebSocket(session.idInvernadero, (payload) => {
      console.log("Dato recibido vía WebSocket:", payload);
      setRealtime(payload); 
    });

    return disconnect;
  }, []);

  const series = obtenerSerieMetricas(resumen);
  const session = getSimulationSession();
  const assignedSensors = new Set((session?.nombresSensor ?? []).map((name) => name.trim().toLowerCase()));
  const hasAssignedSensors = assignedSensors.size > 0;

  const showHumidity = !hasAssignedSensors || assignedSensors.has("humedad");
  const showTemperature = !hasAssignedSensors || assignedSensors.has("temperatura");
  const showLight = !hasAssignedSensors || assignedSensors.has("luz");
  const showCo2 = !hasAssignedSensors || assignedSensors.has("co2");
  const humidityValue = realtime?.humedad ?? 0;
  const temperatureValue = realtime?.temperatura ?? 0;
  const lightValue = realtime?.luminosidad ?? 0;
  const co2Value = realtime?.co2 ?? 0;

  const humidityPercent = Math.max(0, Math.min(100, humidityValue));
  const temperaturePercent = Math.max(0, Math.min(100, (temperatureValue / 40) * 100));
  const lightPercent = Math.max(0, Math.min(100, (lightValue / 800) * 100));

  const co2Width = 520;
  const co2Height = 130;
  const co2Padding = 8;
  const co2SerieHistorica = co2Serie.length > 0 ? co2Serie : [co2Value, co2Value];
  const puntosCo2 = convertirPuntosSvg(co2SerieHistorica, co2Width, co2Height, co2Padding);
  const rutaCurvaCo2 = convertirRutaCurva(co2SerieHistorica, co2Width, co2Height, co2Padding);
  const tendenciaCo2AlAlza = co2SerieHistorica[co2SerieHistorica.length - 1] >= (co2SerieHistorica[co2SerieHistorica.length - 2] ?? co2SerieHistorica[0]);

  return (
    <section className="management-page" aria-label="Simulacion - Dashboard">
      <div className="management-card simulation-card simulation-dashboard-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1>Simulacion - Dashboard</h1>
          <div>
            <button
              type="button"
              className="secondary-action"
              disabled={finalizando}
              onClick={async () => {
                const session = getSimulationSession();
                const userSession = getUserSession();
                setErrorFinalizacion("");
                if (!session) {
                  setErrorFinalizacion("No hay una simulacion activa para finalizar.");
                  return;
                }
                if (!userSession.idUsuario) {
                  setErrorFinalizacion("No se pudo identificar al usuario de la simulacion.");
                  return;
                }

                try {
                  setFinalizando(true);
                  await updateGreenhouse(session.idInvernadero, {
                    idUsuario: userSession.idUsuario,
                    nombre: resumen?.greenhouseName ?? "Invernadero",
                    ubicacion: "",
                    estado: "INACTIVO"
                  });

                  await finalizePlanting({
                    idUsuario: userSession.idUsuario,
                    idInvernadero: session.idInvernadero
                  });

                  if (!session.idSesion.startsWith("local-")) {
                    await exitSimulationSession(session.idSesion);
                  }

                  clearSimulationSession();
                  navigate("/inicio");
                } catch (finishError) {
                  setErrorFinalizacion(finishError instanceof Error ? finishError.message : "No se pudo finalizar la simulacion. Intenta de nuevo.");
                } finally {
                  setFinalizando(false);
                }
              }}
            >
              Finalizar simulacion
            </button>
          </div>
        </div>

        <div className="simulation-dashboard-meta" aria-label="Resumen de simulacion">
          <p><strong>Invernadero:</strong> {resumen?.greenhouseName ?? session?.greenhouseName ?? "-"}</p>
          <p><strong>Cosecha:</strong> {resumen?.selectedCropName ?? session?.cropName ?? "-"}</p>
          <p><strong>Actuadores activos:</strong> {resumen?.activeActuatorCount ?? 0}</p>
          <p><strong>Eventos activos:</strong> {resumen?.activeClimateEventCount ?? 0}</p>
        </div>

        <div className="dashboard-chart-grid" role="list" aria-label="Graficas de monitoreo ambiental">
          {showHumidity ? <article
            role="listitem"
            className="dashboard-chart-card chart-humidity"
            style={{ background: "linear-gradient(135deg, #ebfff4 0%, #f5fffd 100%)" } as CSSProperties}
          >
            <header className="dashboard-chart-header">
              <h2>Humedad</h2>
            </header>

            <div className="humidity-pie-wrap">
              <div
                className="humidity-pie"
                aria-label="Grafica de pastel de humedad"
                style={{
                  background: `conic-gradient(#1a9f6b 0deg ${humidityPercent * 3.6}deg, #d3e8da ${humidityPercent * 3.6}deg 360deg)`
                } as CSSProperties}
              >
                <div className="humidity-pie-inner">
                  <strong>{humidityPercent.toFixed(0)}%</strong>
                  <span>{humidityValue.toFixed(1)} %HR</span>
                </div>
              </div>
            </div>
          </article> : null}

          {showTemperature ? <article
            role="listitem"
            className="dashboard-chart-card chart-temperature"
            style={{ background: "linear-gradient(135deg, #fff3ec 0%, #fffaf2 100%)" } as CSSProperties}
          >
            <header className="dashboard-chart-header">
              <h2>Temperatura</h2>
            </header>

            <div className="thermometer-wrap" aria-label="Grafica tipo termometro de temperatura">
              <div className="thermometer-stem">
                <span
                  className="thermometer-fill"
                  style={{ height: `${temperaturePercent}%` } as CSSProperties}
                />
              </div>
              <p className="dashboard-chart-value">
                {temperatureValue.toFixed(1)}
                <span>°C</span>
              </p>
            </div>
          </article> : null}

          {showLight ? <article
            role="listitem"
            className="dashboard-chart-card chart-light"
            style={{ background: "linear-gradient(135deg, #fffbe8 0%, #fffef2 100%)" } as CSSProperties}
          >
            <header className="dashboard-chart-header">
              <h2>Luz</h2>
            </header>

            <div className="light-widget" aria-label="Indicador de luz con relleno">
              <div className="light-sun">
                <div className="light-sun-rays" aria-hidden="true" />
                <div className="light-sun-core">
                  <span
                    className="light-sun-fill"
                    style={{ height: `${lightPercent}%` } as CSSProperties}
                  />
                  <span className="light-sun-icon" aria-hidden="true">☀</span>
                </div>
              </div>
              <p className="dashboard-chart-value">
                {Math.round(lightValue)}
                <span>lux</span>
              </p>
            </div>
          </article> : null}

          {showCo2 ? <article
            role="listitem"
            className="dashboard-chart-card chart-co2-long"
            style={{ background: "linear-gradient(135deg, #edf4ff 0%, #f7faff 100%)" } as CSSProperties}
          >
            <header className="dashboard-chart-header">
              <h2>CO2</h2>
              <p className={tendenciaCo2AlAlza ? "trend-up" : "trend-down"}>{tendenciaCo2AlAlza ? "Subiendo" : "Bajando"}</p>
            </header>

            <p className="dashboard-chart-value">
              {Math.round(co2Value)}
              <span>ppm</span>
            </p>

            <p className="dashboard-chart-caption">Historial CO2 en tiempo real</p>

            <svg viewBox={`0 0 ${co2Width} ${co2Height}`} className="dashboard-chart-svg dashboard-chart-svg-long" aria-label="Grafica de CO2">
              <defs>
                <linearGradient id="fill-co2-long" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3867e8" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#3867e8" stopOpacity="0.04" />
                </linearGradient>
              </defs>
              <path
              d={rutaCurvaCo2}
              fill="none"
              stroke="#3867e8"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              />
              {co2SerieHistorica.map((value, index) => {
                const step = (co2Width - co2Padding * 2) / Math.max(1, co2SerieHistorica.length - 1);
                const max = Math.max(...co2SerieHistorica);
                const min = Math.min(...co2SerieHistorica);
                const range = Math.max(1, max - min);
                const cx = co2Padding + index * step;
                const cy = co2Padding + ((max - value) / range) * (co2Height - co2Padding * 2);

                return <circle key={`${index}-${value}`} cx={cx} cy={cy} r="3.5" fill="#3867e8" stroke="#ffffff" strokeWidth="1.5" />;
              })}
            </svg>
          </article> : null}

          {!showHumidity && !showTemperature && !showLight && !showCo2 ? (
            <article role="listitem" className="dashboard-chart-card">
              <header className="dashboard-chart-header">
                <h2>Sin sensores asignados</h2>
              </header>
              <p className="dashboard-chart-value">No hay graficas disponibles para este invernadero.</p>
            </article>
          ) : null}
        </div>
      <div
  style={{
    marginTop: "24px",
    padding: "16px",
    borderRadius: "12px",
    background: "#ffffff",
    border: "1px solid #d7e5d7"
  }}
>
  <h2 style={{ marginBottom: "16px" }}>
    Estado de Actuadores
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "12px"
    }}
  >
    <div className="dashboard-chart-card">
      <h3>🌡️ Ventilador</h3>
      <strong>
        {realtime?.ventilador ? "🟢 ACTIVO" : "🔴 APAGADO"}
      </strong>
    </div>

    <div className="dashboard-chart-card">
      <h3>💧 Riego</h3>
      <strong>
        {realtime?.bomba ? "🟢 ACTIVO" : "🔴 APAGADO"}
      </strong>
    </div>

    <div className="dashboard-chart-card">
      <h3>💡 Luz</h3>
      <strong>
        {realtime?.luz ? "🟢 ACTIVO" : "🔴 APAGADO"}
      </strong>
    </div>

    <div className="dashboard-chart-card">
      <h3>🌫️ Extractor</h3>
      <strong>
        {realtime?.extractor ? "🟢 ACTIVO" : "🔴 APAGADO"}
      </strong>
    </div>

    <div className="dashboard-chart-card">
      <h3>☀️ Malla</h3>
      <strong>
        {realtime?.malla ? "🟢 ACTIVO" : "🔴 APAGADO"}
      </strong>
    </div>
  </div>
</div>
        {errorFinalizacion ? <p className="field-error">{errorFinalizacion}</p> : null}
        {mensajeError ? <p className="field-error">{mensajeError}</p> : null}
      </div>
    </section>
  );
}

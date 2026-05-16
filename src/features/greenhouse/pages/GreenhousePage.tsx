import { FormEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ErroresFormularioInvernadero, FormularioInvernadero, EstadoInvernadero } from "../model/greenhouse.types";
import { validateFormularioInvernadero } from "../model/greenhouse.validation";
import type { ManagementOutletContext } from "../components/ManagementLayout";
import { getUserSession } from "../model/session.store";
import { createGreenhouse } from "../services/greenhouseApi";

const ESTADO_POR_DEFECTO: EstadoInvernadero = "INACTIVO";

const SENSOR_OPCIONES = ["Humedad", "Temperatura", "Luz", "CO2"];
const ACTUADOR_OPCIONES = ["Ventilador", "Riego", "Luz", "Extractores de Aire", "Malla"];

function alternarSeleccion(actuales: string[], valor: string): string[] {
  if (actuales.includes(valor)) {
    return actuales.filter((item) => item !== valor);
  }

  return [...actuales, valor];
}

export function GreenhousePage() {
  const { setHasUnsavedChanges } = useOutletContext<ManagementOutletContext>();
  const session = getUserSession();
  const [form, setForm] = useState<FormularioInvernadero & { sensores: string[]; actuadores: string[] }>({
    nombre: "",
    ubicacion: "",
    estado: ESTADO_POR_DEFECTO,
    sensores: [],
    actuadores: []
  });
  const [errors, setErrors] = useState<ErroresFormularioInvernadero>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const isDirty =
    form.nombre.trim().length > 0 ||
    form.ubicacion.trim().length > 0 ||
    form.sensores.length > 0 ||
    form.actuadores.length > 0;

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateFormularioInvernadero(form);
    setErrors(nextErrors);

    if (nextErrors.nombre || nextErrors.ubicacion || nextErrors.estado) {
      setSuccessMessage("");
      return;
    }

    if (!session.idUsuario) {
      setApiError("Debes iniciar sesion para crear un invernadero.");
      setSuccessMessage("");
      return;
    }

    try {
      setApiError("");
      await createGreenhouse({
        idUsuario: session.idUsuario,
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        estado: form.estado,
        sensores: form.sensores,
        actuadores: form.actuadores
      });

      setSuccessMessage("Invernadero creado correctamente.");
      setForm({ nombre: "", ubicacion: "", estado: ESTADO_POR_DEFECTO, sensores: [], actuadores: [] });
      setHasUnsavedChanges(false);
      setErrors({});
    } catch (error) {
      setSuccessMessage("");
      setApiError(error instanceof Error ? error.message : "No se pudo crear el invernadero");
    }
  }

  return (
    <section className="management-page" aria-label="Pantalla invernadero">
      <form className="management-card form-card" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <h1>Invernadero</h1>

        <label htmlFor="invernadero-nombre">Nombre</label>
        <input
          id="invernadero-nombre"
          value={form.nombre}
          onChange={(event) => {
            setSuccessMessage("");
            setForm((current) => ({ ...current, nombre: event.target.value }));
          }}
          aria-invalid={Boolean(errors.nombre)}
        />
        {errors.nombre ? <p className="field-error">{errors.nombre}</p> : null}

        <label htmlFor="invernadero-ubicacion">Ubicacion</label>
        <input
          id="invernadero-ubicacion"
          value={form.ubicacion}
          onChange={(event) => {
            setSuccessMessage("");
            setForm((current) => ({ ...current, ubicacion: event.target.value }));
          }}
          aria-invalid={Boolean(errors.ubicacion)}
        />
        {errors.ubicacion ? <p className="field-error">{errors.ubicacion}</p> : null}

        <p className="simulation-note">Estado automatico: {form.estado}</p>

        <fieldset className="checklist-block">
          <legend>Sensores disponibles</legend>
          {SENSOR_OPCIONES.map((sensor) => (
            <label key={sensor} className="checkbox-item">
              <input
                type="checkbox"
                checked={form.sensores.includes(sensor)}
                onChange={() => {
                  setSuccessMessage("");
                  setForm((current) => ({
                    ...current,
                    sensores: alternarSeleccion(current.sensores, sensor)
                  }));
                }}
              />
              {sensor}
            </label>
          ))}
        </fieldset>

        <fieldset className="checklist-block">
          <legend>Actuadores disponibles</legend>
          {ACTUADOR_OPCIONES.map((actuador) => (
            <label key={actuador} className="checkbox-item">
              <input
                type="checkbox"
                checked={form.actuadores.includes(actuador)}
                onChange={() => {
                  setSuccessMessage("");
                  setForm((current) => ({
                    ...current,
                    actuadores: alternarSeleccion(current.actuadores, actuador)
                  }));
                }}
              />
              {actuador}
            </label>
          ))}
        </fieldset>

        <button className="primary" type="submit">
          Crear invernadero
        </button>

        {successMessage ? <p className="success-message">{successMessage}</p> : null}
        {apiError ? <p className="field-error">{apiError}</p> : null}
      </form>
    </section>
  );
}

import { FormEvent, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ErroresFormularioCultivo, FormularioCultivo } from "../model/greenhouse.types";
import { validateFormularioCultivo } from "../model/greenhouse.validation";
import type { ManagementOutletContext } from "../components/ManagementLayout";
import { getUserSession } from "../model/session.store";
import { createCrop } from "../services/cropApi";

export function CropPage() {
  const { setHasUnsavedChanges } = useOutletContext<ManagementOutletContext>();
  const session = getUserSession();
  const [form, setForm] = useState<FormularioCultivo>({
    nombre: "",
    temperaturaMinima: "",
    temperaturaMaxima: "",
    humedadMinima: "",
    humedadMaxima: "",
    luzMinima: "",
    luzMaxima: "",
    co2Maxima: ""
  });
  const [errors, setErrors] = useState<ErroresFormularioCultivo>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");

  const isDirty = Object.values(form).some((value) => {
    return typeof value === "string" ? value.trim().length > 0 : false;
  });

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
    const nextErrors = validateFormularioCultivo(form);
    setErrors(nextErrors);

    // CORRECCIÓN 1: Se agregó nextErrors.co2 para que no deje guardar si está vacío
    if (nextErrors.nombre || nextErrors.temperatura || nextErrors.humedad || nextErrors.luz || nextErrors.co2) {
      setSuccessMessage("");
      return;
    }

    if (!session.idUsuario) {
      setApiError("Debes iniciar sesion para guardar un cultivo.");
      setSuccessMessage("");
      return;
    }

    try {
      setApiError("");
      await createCrop({
        idUsuario: session.idUsuario,
        nombre: form.nombre,
        temperaturaMinima: Number(form.temperaturaMinima),
        temperaturaMaxima: Number(form.temperaturaMaxima),
        humedadMinima: Number(form.humedadMinima),
        humedadMaxima: Number(form.humedadMaxima),
        luzMinima: Number(form.luzMinima),
        luzMaxima: Number(form.luzMaxima),
        co2Maxima: Number(form.co2Maxima)
      });

      setSuccessMessage("Cultivo configurado correctamente.");
      setForm({
        nombre: "",
        temperaturaMinima: "",
        temperaturaMaxima: "",
        humedadMinima: "",
        humedadMaxima: "",
        luzMinima: "",
        luzMaxima: "",
        co2Maxima: ""
      });
      setErrors({});
      setHasUnsavedChanges(false);
    } catch (error) {
      setSuccessMessage("");
      setApiError(error instanceof Error ? error.message : "No se pudo guardar la cosecha");
    }
  }

  return (
    <section className="management-page" aria-label="Pantalla cosecha">
      <form className="management-card form-card" onSubmit={(event) => void handleSubmit(event)} noValidate>
        <h1>Cultivo</h1>

        <label htmlFor="cultivo-nombre">Nombre de cultivo</label>
        <input
          id="cultivo-nombre"
          value={form.nombre}
          onChange={(event) => {
            setSuccessMessage("");
            setForm((current) => ({ ...current, nombre: event.target.value }));
          }}
          aria-invalid={Boolean(errors.nombre)}
        />
        {errors.nombre ? <p className="field-error">{errors.nombre}</p> : null}

        <section className="crop-detail" aria-label="Detalle">
          <h2>Detalle</h2>

          <div className="crop-row">
            <div className="crop-field">
              <label htmlFor="humedad-maxima">Humedad maxima:</label>
              <input
                id="humedad-maxima"
                inputMode="decimal"
                value={form.humedadMaxima}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, humedadMaxima: event.target.value }));
                }}
                aria-invalid={Boolean(errors.humedad)}
              />
            </div>
            <div className="crop-field">
              <label htmlFor="humedad-minima">Humedad minima:</label>
              <input
                id="humedad-minima"
                inputMode="decimal"
                value={form.humedadMinima}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, humedadMinima: event.target.value }));
                }}
                aria-invalid={Boolean(errors.humedad)}
              />
            </div>
          </div>

          <div className="crop-row">
            <div className="crop-field">
              <label htmlFor="luz-maxima">Luz maxima:</label>
              <input
                id="luz-maxima"
                inputMode="decimal"
                value={form.luzMaxima}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, luzMaxima: event.target.value }));
                }}
                aria-invalid={Boolean(errors.luz)}
              />
            </div>
            <div className="crop-field">
              <label htmlFor="luz-minima">Luz minima:</label>
              <input
                id="luz-minima"
                inputMode="decimal"
                value={form.luzMinima}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, luzMinima: event.target.value }));
                }}
                aria-invalid={Boolean(errors.luz)}
              />
            </div>
          </div>

          <div className="crop-row">
            <div className="crop-field">
              <label htmlFor="temperatura-maxima">Temperatura maxima:</label>
              <input
                id="temperatura-maxima"
                inputMode="decimal"
                value={form.temperaturaMaxima}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, temperaturaMaxima: event.target.value }));
                }}
                aria-invalid={Boolean(errors.temperatura)}
              />
            </div>
            <div className="crop-field">
              <label htmlFor="temperatura-minima">Temperatura minima:</label>
              <input
                id="temperatura-minima"
                inputMode="decimal"
                value={form.temperaturaMinima}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, temperaturaMinima: event.target.value }));
                }}
                aria-invalid={Boolean(errors.temperatura)}
              />
            </div>
          </div>
          
          {/* CORRECCIÓN 2: El Div se cerró correctamente arriba. Aquí empieza la NUEVA FILA PARA CO2 */}
          <div className="crop-row">
            <div className="crop-field">
              <label htmlFor="co2-maxima">CO2 máximo (ppm):</label>
              <input
                id="co2-maxima"
                inputMode="decimal"
                value={form.co2Maxima}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, co2Maxima: event.target.value }));
                }}
                aria-invalid={Boolean(errors.co2)}
              />
            </div>
          </div>

          {/* MENSAJES DE ERROR (SIN DUPLICAR) */}
          {errors.humedad ? <p className="field-error range-error">{errors.humedad}</p> : null}
          {errors.luz ? <p className="field-error range-error">{errors.luz}</p> : null}
          {errors.temperatura ? <p className="field-error range-error">{errors.temperatura}</p> : null}
          {errors.co2 ? <p className="field-error range-error">{errors.co2}</p> : null}
        </section>

        <button className="primary" type="submit">
          Guardar cultivo
        </button>

        {successMessage ? <p className="success-message">{successMessage}</p> : null}
        {apiError ? <p className="field-error">{apiError}</p> : null}
      </form>
    </section>
  );
}
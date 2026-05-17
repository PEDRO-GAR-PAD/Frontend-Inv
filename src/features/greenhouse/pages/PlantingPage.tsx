import { FormEvent, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ManagementOutletContext } from "../components/ManagementLayout";
import { getUserSession } from "../model/session.store";
import type {
  CargaUtilPlantacionApi,
  ErroresFormularioPlantacion,
  EstadoPlantacion,
  FiltroEstadoPlantacion,
  FormularioPlantacion,
  RespuestaPlantacionApi
} from "../model/planting.types";
import { validateFormularioPlantacion } from "../model/planting.validation";
import { listCropsByUser, type CultivoApiRespuesta } from "../services/cropApi";
import { listGreenhousesByUser, type InvernaderoApiRespuesta } from "../services/greenhouseApi";
import {
  createPlanting,
  deletePlanting,
  listPlantingsByUser,
  updatePlanting
} from "../services/plantingApi";

const FORMULARIO_INICIAL: FormularioPlantacion = {
  idInvernadero: "",
  idCultivo: "",
  fechaPlantado: "",
  fechaFinalizacion: "",
  estado: "ACTIVA"
};

function toDateInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function getStatusLabel(estado: EstadoPlantacion): string {
  if (estado === "ACTIVA") return "Activa";
  if (estado === "FINALIZADA") return "Finalizada";
  return "Inactiva";
}

export function PlantingPage() {
  const { setHasUnsavedChanges } = useOutletContext<ManagementOutletContext>();
  const session = getUserSession();

  const [form, setForm] = useState<FormularioPlantacion>(FORMULARIO_INICIAL);
  const [errors, setErrors] = useState<ErroresFormularioPlantacion>({});
  const [items, setItems] = useState<RespuestaPlantacionApi[]>([]);
  const [greenhouses, setGreenhouses] = useState<InvernaderoApiRespuesta[]>([]);
  const [crops, setCrops] = useState<CultivoApiRespuesta[]>([]);
  const [statusFilter, setStatusFilter] = useState<FiltroEstadoPlantacion>("ACTIVA");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isDirty = useMemo(() => {
    return (
      form.idInvernadero !== FORMULARIO_INICIAL.idInvernadero ||
      form.idCultivo !== FORMULARIO_INICIAL.idCultivo ||
      form.fechaPlantado !== FORMULARIO_INICIAL.fechaPlantado ||
      form.fechaFinalizacion !== FORMULARIO_INICIAL.fechaFinalizacion ||
      form.estado !== FORMULARIO_INICIAL.estado
    );
  }, [form]);

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  useEffect(() => {
    if (!session.idUsuario) return;

    let active = true;
    async function loadDependencies() {
      try {
        const [greenhouseItems, cropItems] = await Promise.all([
          listGreenhousesByUser(session.idUsuario),
          listCropsByUser(session.idUsuario)
        ]);
        if (active) {
          setGreenhouses(greenhouseItems);
          setCrops(cropItems);
        }
      } catch (error) {
        if (active) {
          setApiError(error instanceof Error ? error.message : "No se pudieron cargar las dependencias");
        }
      }
    }

    void loadDependencies();

    return () => {
      active = false;
    };
  }, [session.idUsuario]);

  useEffect(() => {
    if (!session.idUsuario) {
      setItems([]);
      return;
    }

    let active = true;
    async function loadPlantings() {
      setIsLoading(true);
      setApiError("");
      try {
        const data = await listPlantingsByUser(session.idUsuario, statusFilter);
        if (active) {
          setItems(data);
        }
      } catch (error) {
        if (active) {
          setApiError(error instanceof Error ? error.message : "No se pudieron cargar las plantaciones");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadPlantings();

    return () => {
      active = false;
    };
  }, [session.idUsuario, statusFilter]);

  function clearForm() {
    setForm(FORMULARIO_INICIAL);
    setErrors({});
    setEditingId(null);
    setHasUnsavedChanges(false);
  }

  async function refreshList() {
    if (!session.idUsuario) return;
    const data = await listPlantingsByUser(session.idUsuario, statusFilter);
    setItems(data);
  }

  function toPayload(nextForm: FormularioPlantacion): CargaUtilPlantacionApi {
    return {
      idUsuario: session.idUsuario,
      idInvernadero: nextForm.idInvernadero,
      idCultivo: nextForm.idCultivo,
      fechaPlantado: nextForm.fechaPlantado,
      fechaFinalizacion: nextForm.fechaFinalizacion.trim() ? nextForm.fechaFinalizacion : null,
      estado: nextForm.estado
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    const nextErrors = validateFormularioPlantacion(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!session.idUsuario) {
      setApiError("Debes iniciar sesion para administrar plantaciones.");
      return;
    }

    try {
      setApiError("");
      const payload = toPayload(form);
      if (editingId) {
        await updatePlanting(editingId, payload);
        setSuccessMessage("Plantacion actualizada correctamente.");
      } else {
        await createPlanting(payload);
        setSuccessMessage("Plantacion creada correctamente.");
      }
      await refreshList();
      clearForm();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "No se pudo guardar la plantacion");
    }
  }

  function onEdit(item: RespuestaPlantacionApi) {
    setSuccessMessage("");
    setApiError("");
    setEditingId(item.idPlantacion);
    setForm({
      idInvernadero: item.idInvernadero,
      idCultivo: item.idCultivo,
      fechaPlantado: toDateInput(item.fechaPlantado),
      fechaFinalizacion: toDateInput(item.fechaFinalizacion),
      estado: item.estado
    });
  }

  async function onDelete(item: RespuestaPlantacionApi) {
    const confirmed = window.confirm("Deseas marcar esta plantacion como inactiva?");
    if (!confirmed) return;

    try {
      setApiError("");
      setSuccessMessage("");
      await deletePlanting(item.idPlantacion);
      await refreshList();
      setSuccessMessage("Plantacion marcada como inactiva.");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "No se pudo eliminar la plantacion");
    }
  }

  return (
    <section className="management-page" aria-label="Pantalla plantacion">
      <div className="management-card planting-card">
        <h1>Plantacion</h1>

        <form className="form-card" onSubmit={(event) => void handleSubmit(event)} noValidate>
          <div className="planting-grid">
            <div>
              <label htmlFor="plantacion-invernadero">Invernadero</label>
              <select
                id="plantacion-invernadero"
                value={form.idInvernadero}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, idInvernadero: event.target.value }));
                }}
              >
                <option value="">Selecciona invernadero</option>
                {greenhouses.map((invernadero) => (
                  <option key={invernadero.idInvernadero} value={invernadero.idInvernadero}>
                    {invernadero.nombre}
                  </option>
                ))}
              </select>
              {errors.idInvernadero ? <p className="field-error">{errors.idInvernadero}</p> : null}
            </div>

            <div>
              <label htmlFor="plantacion-cultivo">Cultivo</label>
              <select
                id="plantacion-cultivo"
                value={form.idCultivo}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, idCultivo: event.target.value }));
                }}
              >
                <option value="">Selecciona cultivo</option>
                {crops.map((cultivo) => (
                  <option key={cultivo.idCultivo} value={cultivo.idCultivo}>
                    {cultivo.nombre}
                  </option>
                ))}
              </select>
              {errors.idCultivo ? <p className="field-error">{errors.idCultivo}</p> : null}
            </div>

            <div>
              <label htmlFor="plantacion-fecha-plantado">Fecha de plantado</label>
              <input
                id="plantacion-fecha-plantado"
                type="date"
                value={form.fechaPlantado}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, fechaPlantado: event.target.value }));
                }}
              />
              {errors.fechaPlantado ? <p className="field-error">{errors.fechaPlantado}</p> : null}
            </div>

            <div>
              <label htmlFor="plantacion-fecha-finalizacion">Fecha finalizada</label>
              <input
                id="plantacion-fecha-finalizacion"
                type="date"
                value={form.fechaFinalizacion}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, fechaFinalizacion: event.target.value }));
                }}
              />
              {errors.fechaFinalizacion ? <p className="field-error">{errors.fechaFinalizacion}</p> : null}
            </div>

            <div>
              <label htmlFor="planting-status">Estado</label>
              <select
                id="planting-status"
                value={form.estado}
                onChange={(event) => {
                  setSuccessMessage("");
                  setForm((current) => ({ ...current, estado: event.target.value as EstadoPlantacion }));
                }}
              >
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>
          </div>

          <div className="planting-actions">
            <button className="primary" type="submit">
              {editingId ? "Guardar cambios" : "Crear plantacion"}
            </button>
            {editingId ? (
              <button type="button" className="secondary-action" onClick={clearForm}>
                Cancelar
              </button>
            ) : null}
          </div>

          {successMessage ? <p className="success-message">{successMessage}</p> : null}
          {apiError ? <p className="field-error">{apiError}</p> : null}
        </form>

        <section className="planting-list" aria-label="Listado de plantaciones">
          <div className="planting-list-header">
            <h2>Plantaciones</h2>
            <label htmlFor="planting-filter" className="planting-filter-label">
              Filtro estado
            </label>
            <select
              id="planting-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as FiltroEstadoPlantacion)}
            >
              <option value="ACTIVA">Activas</option>
              <option value="INACTIVA">Inactivas</option>
              <option value="FINALIZADA">Finalizadas</option>
              <option value="TODAS">Todas</option>
            </select>
          </div>

          {isLoading ? <p>Cargando plantaciones...</p> : null}
          {!isLoading && items.length === 0 ? <p>No hay plantaciones para este filtro.</p> : null}

          {!isLoading && items.length > 0 ? (
            <table className="planting-table">
              <thead>
                <tr>
                  <th>Invernadero</th>
                  <th>Cultivo</th>
                  <th>Plantado</th>
                  <th>Finalizado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.idPlantacion}>
                    <td>{item.nombreInvernadero}</td>
                    <td>{item.nombreCultivo}</td>
                    <td>{toDateInput(item.fechaPlantado)}</td>
                    <td>{item.fechaFinalizacion ? toDateInput(item.fechaFinalizacion) : "-"}</td>
                    <td>{getStatusLabel(item.estado)}</td>
                    <td className="planting-table-actions">
                      <button type="button" className="secondary-action" onClick={() => onEdit(item)}>
                        Editar
                      </button>
                      <button type="button" className="secondary-action" onClick={() => void onDelete(item)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </section>
      </div>
    </section>
  );
}

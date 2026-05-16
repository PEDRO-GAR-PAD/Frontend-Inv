import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { AuthForm } from "../components/AuthForm";
import { AuthHeader } from "../components/AuthHeader";
import type { CredencialesAcceso } from "../model/auth.types";
import { saveUserSession } from "../../greenhouse/model/session.store";
import { loginUser } from "../services/authApi";

export function LoginPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  async function onSuccess(credentials: CredencialesAcceso) {
    setApiError("");
    try {
      const usuario = await loginUser(credentials);
      saveUserSession({
        idUsuario: usuario.id_usuario || usuario.idUsuario || "",
        correo: usuario.correo || credentials.correo,
        token: usuario.token
      });
      navigate("/inicio");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "No se pudo iniciar sesion");
    }
  }

  return (
    <main className="auth-page" aria-label="Pagina login">
      <AuthCard>
        <AuthHeader title="Iniciar sesion" />
        <AuthForm
          submitLabel="Iniciar Sesion"
          onSuccess={(credentials) => void onSuccess(credentials)}
          bottomText="Crear Usuario"
          onBottomAction={() => navigate("/crear-usuario")}
          bottomAriaLabel="Ir a crear usuario"
        />
        {apiError ? <p className="field-error">{apiError}</p> : null}
      </AuthCard>
    </main>
  );
}

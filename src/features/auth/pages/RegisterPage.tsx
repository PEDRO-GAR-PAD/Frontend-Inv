import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthCard } from "../components/AuthCard";
import { AuthForm } from "../components/AuthForm";
import { AuthHeader } from "../components/AuthHeader";
import type { CredencialesAcceso } from "../model/auth.types";
import { saveUserSession } from "../../greenhouse/model/session.store";
import { registerUser } from "../services/authApi";

export function RegisterPage() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState("");

  async function onSuccess(credentials: CredencialesAcceso) {
    setApiError("");
    try {
      const usuario = await registerUser(credentials);
      saveUserSession({ idUsuario: usuario.id_usuario, correo: usuario.correo });
      navigate("/inicio");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "No se pudo crear el usuario");
    }
  }

  return (
    <main className="auth-page" aria-label="Pagina crear usuario">
      <AuthCard>
        <AuthHeader title="Crear Usuario" />
        <AuthForm
          submitLabel="Crear usuario"
          onSuccess={(credentials) => void onSuccess(credentials)}
          bottomText="Ya tienes cuenta? Iniciar sesion"
          onBottomAction={() => navigate("/login")}
          bottomAriaLabel="Ir a login"
        />
        {apiError ? <p className="field-error">{apiError}</p> : null}
      </AuthCard>
    </main>
  );
}

import { FormEvent, useState } from "react";
import type { CredencialesAcceso, ErroresFormularioAcceso } from "../model/auth.types";
import { validateCorreo, validateContrasena, validateFormularioAcceso } from "../model/auth.validation";

interface AuthFormProps {
  submitLabel: string;
  onSuccess: (credentials: CredencialesAcceso) => void;
  bottomText: string;
  onBottomAction: () => void;
  bottomAriaLabel: string;
}

export function AuthForm({
  submitLabel,
  onSuccess,
  bottomText,
  onBottomAction,
  bottomAriaLabel
}: AuthFormProps) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ErroresFormularioAcceso>({});

  function handleEmailBlur() {
    setErrors((current) => ({ ...current, correo: validateCorreo(correo) }));
  }

  function handlePasswordBlur() {
    setErrors((current) => ({ ...current, contrasena: validateContrasena(contrasena) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateFormularioAcceso(correo, contrasena);
    setErrors(nextErrors);
    if (nextErrors.correo || nextErrors.contrasena) return;

    onSuccess({ correo: correo.trim(), contrasena });
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <label htmlFor="correo">Correo:</label>
      <input
        id="correo"
        name="correo"
        type="email"
        value={correo}
        required
        autoComplete="email"
        onChange={(e) => {
          setCorreo(e.target.value);
          if (errors.correo) {
            setErrors((current) => ({ ...current, correo: undefined }));
          }
        }}
        onBlur={handleEmailBlur}
        aria-invalid={Boolean(errors.correo)}
        aria-describedby={errors.correo ? "correo-error" : undefined}
      />
      {errors.correo ? (
        <p id="correo-error" role="alert" className="field-error">
          {errors.correo}
        </p>
      ) : null}

      <label htmlFor="contrasena">Contrasena:</label>
      <div className="auth-password-row">
        <input
          id="contrasena"
          name="contrasena"
          type={showPassword ? "text" : "password"}
          value={contrasena}
          required
          minLength={8}
          autoComplete="current-password"
          pattern="^(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$"
          title="Minimo 8 caracteres, un numero y un simbolo"
          onChange={(e) => {
            setContrasena(e.target.value);
            if (errors.contrasena) {
              setErrors((current) => ({ ...current, contrasena: undefined }));
            }
          }}
          onBlur={handlePasswordBlur}
          aria-invalid={Boolean(errors.contrasena)}
          aria-describedby={errors.contrasena ? "contrasena-error" : undefined}
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? "Ocultar contrasena" : "Ver contrasena"}
          aria-pressed={showPassword}
        >
          {showPassword ? "Ocultar" : "Ver"}
        </button>
      </div>
      {errors.contrasena ? (
        <p id="contrasena-error" role="alert" className="field-error">
          {errors.contrasena}
        </p>
      ) : null}

      <button type="submit" className="auth-primary-button">
        {submitLabel}
      </button>

      <button
        type="button"
        className="auth-bottom-link"
        onClick={onBottomAction}
        aria-label={bottomAriaLabel}
      >
        {bottomText}
      </button>
    </form>
  );
}

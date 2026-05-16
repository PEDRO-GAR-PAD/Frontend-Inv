interface AuthHeaderProps {
  title: string;
}

export function AuthHeader({ title }: AuthHeaderProps) {
  return (
    <header className="auth-header" aria-label="Encabezado autenticacion">
      <h1>{title}</h1>
    </header>
  );
}

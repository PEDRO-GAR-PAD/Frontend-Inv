interface TopBarProps {
  correo: string;
  onOpenMenu: () => void;
}

export function TopBar({ correo, onOpenMenu }: TopBarProps) {
  return (
    <header className="management-topbar" aria-label="Barra principal de gestion">
      <button
        type="button"
        className="menu-trigger"
        onClick={onOpenMenu}
        aria-label="Abrir menu principal"
      >
        <span className="menu-trigger-lines" aria-hidden="true">
          <span className="menu-line" />
          <span className="menu-line" />
          <span className="menu-line" />
        </span>
      </button>
      <p className="session-email" aria-label="Correo de usuario autenticado">
        {correo}
      </p>
    </header>
  );
}

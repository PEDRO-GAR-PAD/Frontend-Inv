import type { ElementoNavegacion } from "../model/greenhouse.types";

interface MenuDrawerProps {
  open: boolean;
  items: ElementoNavegacion[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onClose: () => void;
  logoutLabel?: string;
}

export function MenuDrawer({
  open,
  items,
  currentPath,
  onNavigate,
  onLogout,
  onClose,
  logoutLabel = "Cerrar sesion"
}: MenuDrawerProps) {
  return (
    <>
      <aside
        className={`menu-drawer ${open ? "is-open" : ""}`}
        aria-label="Menu de navegacion"
        aria-hidden={!open}
      >
        <h2 className="menu-title">Menu</h2>
        <nav className="menu-nav">
          <ul>
            {items.map((item) => (
              <li key={item.path}>
                <button
                  type="button"
                  className={currentPath === item.path ? "active" : undefined}
                  onClick={() => onNavigate(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" className="logout-button" onClick={onLogout}>
          {logoutLabel}
        </button>
      </aside>
      {open ? <button className="drawer-overlay" onClick={onClose} aria-label="Cerrar menu" /> : null}
    </>
  );
}

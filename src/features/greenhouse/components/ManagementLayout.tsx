import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MenuDrawer } from "./MenuDrawer";
import { TopBar } from "./TopBar";
import { clearSessionCorreo, getUserSession } from "../model/session.store";
import type { ElementoNavegacion } from "../model/greenhouse.types";

export interface ManagementOutletContext {
  setHasUnsavedChanges: (value: boolean) => void;
}

interface ManagementLayoutProps {
  navigationItems: ElementoNavegacion[];
}

export function ManagementLayout({ navigationItems }: ManagementLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const session = useMemo(() => getUserSession(), []);

  function goTo(path: string) {
    setIsMenuOpen(false);
    navigate(path);
  }

  function confirmLogout() {
    setIsMenuOpen(false);
    clearSessionCorreo();
    navigate("/login");
  }

  function handleLogout() {
    setIsMenuOpen(false);
    setShowLogoutConfirm(true);
  }

  function handleNavigation(path: string) {
    if (path === location.pathname) {
      setIsMenuOpen(false);
      return;
    }

    if (hasUnsavedChanges) {
      setPendingPath(path);
      setIsMenuOpen(false);
      return;
    }

    goTo(path);
  }

  function discardAndNavigate() {
    if (!pendingPath) return;

    setHasUnsavedChanges(false);
    const nextPath = pendingPath;
    setPendingPath(null);
    goTo(nextPath);
  }

  return (
    <div className="management-shell">
      <TopBar correo={session.correo} onOpenMenu={() => setIsMenuOpen(true)} />
      <MenuDrawer
        open={isMenuOpen}
        items={navigationItems}
        currentPath={location.pathname}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        onClose={() => setIsMenuOpen(false)}
      />

      {pendingPath ? (
        <section className="confirm-modal" role="dialog" aria-modal="true" aria-label="Confirmar salida">
          <div className="confirm-modal-content">
            <h2>Cambios sin guardar</h2>
            <p>Tienes cambios sin guardar. Deseas descartarlos y salir?</p>
            <div className="confirm-actions">
              <button type="button" className="secondary" onClick={() => setPendingPath(null)}>
                Permanecer
              </button>
              <button type="button" className="primary" onClick={discardAndNavigate}>
                Descartar y salir
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {showLogoutConfirm ? (
        <section className="confirm-modal" role="dialog" aria-modal="true" aria-label="Confirmar cierre de sesion">
          <div className="confirm-modal-content">
            <h2>Salida de emergencia</h2>
            <p>Estas seguro de que deseas salir de la cuenta?</p>
            <div className="confirm-actions">
              <button type="button" className="secondary" onClick={() => setShowLogoutConfirm(false)}>
                Cancelar
              </button>
              <button type="button" className="primary" onClick={confirmLogout}>
                Si, salir
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <main className="management-content" aria-label="Contenido de gestion">
        <Outlet context={{ setHasUnsavedChanges } satisfies ManagementOutletContext} />
      </main>
    </div>
  );
}

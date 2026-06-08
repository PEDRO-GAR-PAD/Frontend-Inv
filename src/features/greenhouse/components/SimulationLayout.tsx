import { useMemo, useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MenuDrawer } from "./MenuDrawer";
import { TopBar } from "./TopBar";
import { getUserSession } from "../model/session.store";
import type { ElementoNavegacion } from "../model/greenhouse.types";
import { clearSimulationSession, getSimulationSession } from "../model/simulationSession.store";

const simulationNavigationItems: ElementoNavegacion[] = [
  { label: "Dashboard", path: "/simulacion/dashboard" },
  /*
  { label: "Eventos climaticos", path: "/simulacion/eventos" },
   */
  { label: "Actuadores", path: "/simulacion/actuadores" }
];

export function SimulationLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const session = useMemo(() => getUserSession(), []);

  useEffect(() => {
    // Clear session on unload so closing the tab frees the ability to open others from the same machine
    function handleBeforeUnload() {
      try {
        clearSimulationSession();
      } catch {
        // no-op
      }
    }

    // When the tab/window becomes hidden, start a short timer to auto-clear session if the user is not active
    let inactivityTimer: number | undefined;
    function handleVisibilityChange() {
      const current = getSimulationSession();
      if (!current) return;

      if (document.hidden) {
        // give a brief grace period before expiring (30s)
        inactivityTimer = window.setTimeout(() => {
          clearSimulationSession();
        }, 30 * 1000);
      } else {
        if (inactivityTimer) {
          window.clearTimeout(inactivityTimer);
          inactivityTimer = undefined;
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function goTo(path: string) {
    setIsMenuOpen(false);
    navigate(path);
  }

  function handleExitGreenhouse() {
    clearSimulationSession();
    setIsMenuOpen(false);
    navigate("/inicio");
  }

  return (
    <div className="management-shell">
      <TopBar correo={session.correo} onOpenMenu={() => setIsMenuOpen(true)} />
      <MenuDrawer
        open={isMenuOpen}
        items={simulationNavigationItems}
        currentPath={location.pathname}
        onNavigate={(path) => {
          void goTo(path);
        }}
        onLogout={handleExitGreenhouse}
        onClose={() => setIsMenuOpen(false)}
        logoutLabel="Salir del invernadero"
      />

      <main className="management-content" aria-label="Contenido de simulacion">
        <Outlet />
      </main>
    </div>
  );
}

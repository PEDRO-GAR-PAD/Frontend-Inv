import { Navigate, Route } from "react-router-dom";
import { ManagementLayout } from "../../features/greenhouse/components/ManagementLayout";
import { SimulationLayout } from "../../features/greenhouse/components/SimulationLayout";
import { CropPage } from "../../features/greenhouse/pages/CropPage";
import { GreenhousePage } from "../../features/greenhouse/pages/GreenhousePage";
import { HomePage } from "../../features/greenhouse/pages/HomePage";
import { SimulationActuatorsPage } from "../../features/greenhouse/pages/SimulationActuatorsPage";
import { SimulationClimateEventsPage } from "../../features/greenhouse/pages/SimulationClimateEventsPage";
import { SimulationDashboardPage } from "../../features/greenhouse/pages/SimulationDashboardPage";
import { SimulationEmptyStatePage } from "../../features/greenhouse/pages/SimulationEmptyStatePage";
import { SimulationStartPage } from "../../features/greenhouse/pages/SimulationStartPage";
import type { ElementoNavegacion } from "../../features/greenhouse/model/greenhouse.types";

const managementNavigationItems: ElementoNavegacion[] = [
  { label: "Inicio", path: "/inicio" },
  { label: "Invernadero", path: "/invernadero" },
  { label: "Cosecha", path: "/cosecha" }
];

export function getGreenhouseRoutes() {
  return (
    <>
      <Route path="/gestion" element={<Navigate to="/inicio" replace />} />
      <Route element={<ManagementLayout navigationItems={managementNavigationItems} />}>
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/invernadero" element={<GreenhousePage />} />
        <Route path="/cosecha" element={<CropPage />} />
      </Route>

      <Route path="/simulacion" element={<Navigate to="/inicio" replace />} />
      <Route path="/simulacion/inicio" element={<SimulationStartPage />} />
      <Route path="/simulacion/vacio" element={<SimulationEmptyStatePage />} />
      <Route element={<SimulationLayout />}>
        <Route path="/simulacion/actuadores" element={<SimulationActuatorsPage />} />
        {/*<Route path="/simulacion/eventos" element={<SimulationClimateEventsPage />} />*/}
        <Route path="/simulacion/dashboard" element={<SimulationDashboardPage />} />
      </Route>
    </>
  );
}

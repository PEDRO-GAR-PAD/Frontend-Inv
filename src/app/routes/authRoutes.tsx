import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../../features/auth/pages/LoginPage";
import { RegisterPage } from "../../features/auth/pages/RegisterPage";
import { getGreenhouseRoutes } from "./greenhouseRoutes";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/crear-usuario" element={<RegisterPage />} />
      {getGreenhouseRoutes()}
    </Routes>
  );
}

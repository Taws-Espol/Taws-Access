import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AccessPage } from "@/pages/AccessPage";
import { AuditPage } from "@/pages/AuditPage";
import { CleaningPage } from "@/pages/CleaningPage";
import { IncidentsPage } from "@/pages/IncidentsPage";
import { LoginPage } from "@/pages/LoginPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/acceso" element={<AccessPage />} />
        <Route path="/auditoria" element={<AuditPage />} />
        <Route path="/incidencias" element={<IncidentsPage />} />
        <Route path="/limpieza" element={<CleaningPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

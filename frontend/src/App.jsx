import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Splash from "./pages/Splash";
import RoleSelection from "./pages/RoleSelection";
import DynoApp from "./DynoApp";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/role" element={<RoleSelection />} />
      <Route path="/app" element={<DynoApp />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
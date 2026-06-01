import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScreenA from "./screens/ScreenA";
import ScreenB from "./screens/ScreenB";
import ScreenC from "./screens/ScreenC";
import Stories from "./screens/Stories";
import Admin from "./screens/Admin";
import Solo from "./screens/Solo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/screen-a" element={<ScreenA />} />
        <Route path="/screen-b" element={<ScreenB />} />
        <Route path="/screen-c" element={<ScreenC />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/solo" element={<Solo />} />
        <Route path="*" element={<Navigate to="/screen-a" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
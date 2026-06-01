// ============================================
// App.jsx — 主路由
// ============================================
// 三台平板各自開不同網址：
//   平板 1 → /screen-a
//   平板 2 → /screen-b
//   平板 3 → /screen-c

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ScreenA from "./screens/ScreenA";
import ScreenB from "./screens/ScreenB";
import ScreenC from "./screens/ScreenC";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/screen-a" element={<ScreenA />} />
        <Route path="/screen-b" element={<ScreenB />} />
        <Route path="/screen-c" element={<ScreenC />} />
        {/* 預設進入平板 1 */}
        <Route path="*" element={<Navigate to="/screen-a" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

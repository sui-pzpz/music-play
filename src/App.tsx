import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";

import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToastContainer from "@/components/ToastContainer";

export default function App() {
  return (
    <ErrorBoundary>
      <Router basename="/music-play">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />

          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </ErrorBoundary>
  );
}

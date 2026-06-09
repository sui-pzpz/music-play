import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import PlaylistDetail from "@/pages/PlaylistDetail";
import SongDetail from "@/pages/SongDetail";
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
            <Route path="playlist/:id" element={<PlaylistDetail />} />
            <Route path="song/:platform/:id" element={<SongDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </ErrorBoundary>
  );
}

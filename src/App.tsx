import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
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
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </ErrorBoundary>
  );
}

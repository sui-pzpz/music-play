import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Library from "@/pages/Library";
import ArtistDetail from "@/pages/ArtistDetail";
import AlbumDetail from "@/pages/AlbumDetail";
import Download from "@/pages/Download";
import FM from "@/pages/FM";
import Member from "@/pages/Member";
import LyricsPage from "@/pages/LyricsPage";
import Notifications from "@/pages/Notifications";
import SearchResults from "@/pages/SearchResults";
import Agreement from "@/pages/Agreement";

import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import ToastContainer from "@/components/ToastContainer";

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/agreement" element={<Agreement />} />
          <Route path="/lyrics" element={<LyricsPage />} />
          <Route path="/home" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="library" element={<Library />} />
            <Route path="artist/:id" element={<ArtistDetail />} />
            <Route path="album/:id" element={<AlbumDetail />} />
            <Route path="download" element={<Download />} />
            <Route path="fm" element={<FM />} />
            <Route path="member" element={<Member />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="search" element={<SearchResults />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </ErrorBoundary>
  );
}

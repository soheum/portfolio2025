import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectDetails from './pages/ProjectDetails';
import ContactPage from './pages/ContactPage';
import ProjectsPage from './pages/ProjectsPage';
import Kan from './pages/Kan';
import About2 from './pages/About2';
import SiteLayout from './components/SiteLayout';

function App() {
  const location = useLocation();

  // Disable browser scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Reset scroll to top on route change (with small delay to ensure it runs after route transition)
  useEffect(() => {
    window.scrollTo(0, 0);
    // Force scroll after a frame to override any browser restoration
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
  }, [location.pathname]);

  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/project" element={<ProjectDetails />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/kan" element={<Kan />} />
        <Route path="/about2" element={<About2 />} />
      </Routes>
    </SiteLayout>
  );
}

export default App;

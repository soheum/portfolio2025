import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectDetails from './pages/ProjectDetails';
import Kan from './pages/Kan';
import About2 from './pages/About2';

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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/project" element={<ProjectDetails />} />
      <Route path="/kan" element={<Kan />} />
      <Route path="/about2" element={<About2 />} />
    </Routes>
  );
}

export default App;

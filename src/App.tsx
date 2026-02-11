import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProjectDetails from './pages/ProjectDetails';
import ProjectDetailsBox9 from './pages/ProjectDetailsBox9';
import AboutMe from './pages/AboutMe';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/project" element={<ProjectDetails />} />
      <Route path="/project-box9" element={<ProjectDetailsBox9 />} />
      <Route path="/about" element={<AboutMe />} />
    </Routes>
  );
}

export default App;

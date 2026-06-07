import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box9, { BOX9_PROJECT_URL } from '../components/Box9';
import './HomePage.css';
import './ProjectsPage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Contact', path: '/contact' },
];

type ProjectImage = string | 'box9';

const PROJECTS: {
  index: number;
  title: string;
  subtitle: string;
  path?: string | null;
  externalHref?: string;
  images?: [ProjectImage, ProjectImage, ProjectImage];
}[] = [
  {
    index: 1,
    title: '0 → 1 product development at Scarlet',
    subtitle: 'Simplifying complex regulatory concepts into a usable flow',
    path: '/project',
    images: ['/img/Scarlet/Landing_1.jpg', '/img/Scarlet/Landing_2.jpg', '/img/Scarlet/Landing_3.jpg'],
  },
  {
    index: 2,
    title: 'Digital business building at McKinsey & Company',
    subtitle: 'Launching a financial wellbeing service in Norway',
    externalHref: BOX9_PROJECT_URL,
    images: ['/img/Grid/Box9_8.jpg', 'box9', '/img/Grid/Box9_10_1.jpg'],
  },
  {
    index: 3,
    title: 'Trust and autonomy in self-driving cars',
    subtitle: "Master's thesis in collaboration with Volvo Cars",
    externalHref: 'https://www.umu.se/en/umea-institute-of-design/education/student-work/masters-programme-in-interaction-design/2022/soh-heum-hwang/',
  },
  {
    index: 4,
    title: 'Collaboration with Korean stationery brand, Greetings Folks',
    subtitle: '(Coming soon) Translating analogue sincerity into digital experiences.',
    path: null,
  },
];

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  const handleProjectClick = (path?: string | null, externalHref?: string) => {
    if (path) {
      navigate(path);
      return;
    }
    if (externalHref) {
      window.open(externalHref, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title">
          <span className="home-title__name">My projects</span>
        </h1>

        <ul className="home-bullets">
          {PROJECTS.map(({ index, title, subtitle, path, externalHref, images }) => {
            const isLinked = Boolean(path || externalHref);
            const hasHoverImages = Boolean(images);
            return (
            <li
              key={index}
              className={`home-bullet projects-bullet ${isLinked ? 'projects-bullet--linked' : ''}`}
              onMouseEnter={hasHoverImages ? () => setHoveredProject(index) : undefined}
              onMouseLeave={hasHoverImages ? () => setHoveredProject(null) : undefined}
              onClick={() => handleProjectClick(path, externalHref)}
            >
              <span className="home-bullet__index">[{index}]</span>
              <div className="projects-bullet__content">
                <span className="projects-bullet__title">{title}</span>
                <span className="projects-bullet__subtitle">{subtitle}</span>
              </div>
            </li>
            );
          })}
        </ul>
      </div>

      {hoveredProject !== null && (() => {
        const project = PROJECTS.find((p) => p.index === hoveredProject);
        if (!project?.images) return null;

        return (
          <div className="bullet-image-stack">
            {project.images.map((src, i) => (
              <div
                key={i}
                className="bullet-image-stack__item"
                style={{ zIndex: i + 1 }}
              >
                {src === 'box9' ? (
                  <div className="bullet-image-stack__box9">
                    <Box9 progress={1} preview />
                  </div>
                ) : src && (src.endsWith('.mp4')
                  ? <video src={src} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
              </div>
            ))}
          </div>
        );
      })()}

      <nav className="home-nav">
        {NAV_ITEMS.map(({ label, path }) => (
          <button
            key={path}
            className={`home-nav__item ${location.pathname === path ? 'home-nav__item--active' : ''}`}
            onClick={() => navigate(path)}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProjectsPage;

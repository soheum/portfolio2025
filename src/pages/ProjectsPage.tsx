import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box5 from '../components/Box5';
import Box9, { BOX9_PROJECT_URL } from '../components/Box9';
import GraphCard from '../components/GraphCard';
import './HomePage.css';
import './ProjectsPage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Contact', path: '/contact' },
];

type ProjectImage = string | 'box9' | 'box5' | 'graph';

const INTERACTIVE_SLOTS = new Set<ProjectImage>(['box5', 'graph']);

const PROJECTS: {
  index: number;
  title: string;
  subtitle: string;
  path?: string | null;
  externalHref?: string;
  images?: [ProjectImage, ProjectImage, ProjectImage];
  openOnClick?: boolean;
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
  {
    index: 5,
    title: 'Playground - UI experiments',
    subtitle: 'Personal sketchbook of micro interactions inspired by everyday life',
    path: null,
    openOnClick: true,
    images: ['/img/Grid/Landing_playground.gif', 'box5', 'graph'],
  },
];

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<number | null>(null);

  const shownProjectIndex = hoveredProject ?? activeProject;

  const handleProjectClick = (
    index: number,
    path?: string | null,
    externalHref?: string,
    openOnClick?: boolean,
  ) => {
    if (path) {
      setActiveProject(null);
      navigate(path);
      return;
    }
    if (externalHref) {
      setActiveProject(null);
      window.open(externalHref, '_blank', 'noopener,noreferrer');
      return;
    }
    if (openOnClick) {
      setActiveProject((prev) => (prev === index ? null : index));
    }
  };

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title">
          <span className="home-title__name">My projects</span>
        </h1>

        <ul className="home-bullets">
          {PROJECTS.map(({ index, title, subtitle, path, externalHref, images, openOnClick }) => {
            const isClickable = Boolean(path || externalHref || openOnClick);
            const hasHoverPreview = Boolean(images && !openOnClick);
            const isActive = activeProject === index;
            return (
            <li
              key={index}
              className={`home-bullet projects-bullet${isClickable ? ' projects-bullet--linked' : ''}${isActive ? ' projects-bullet--active' : ''}`}
              onMouseEnter={!openOnClick ? () => {
                setActiveProject(null);
                if (hasHoverPreview) setHoveredProject(index);
              } : undefined}
              onMouseLeave={hasHoverPreview ? () => setHoveredProject(null) : undefined}
              onClick={() => handleProjectClick(index, path, externalHref, openOnClick)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={isClickable ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProjectClick(index, path, externalHref, openOnClick);
                }
              } : undefined}
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

      {shownProjectIndex !== null && (() => {
        const project = PROJECTS.find((p) => p.index === shownProjectIndex);
        if (!project?.images) return null;

        const isInteractive = project.images.some((src) => INTERACTIVE_SLOTS.has(src));
        const isClickOpen = project.index === activeProject;

        return (
          <div
            className={`bullet-image-stack${isInteractive ? ' bullet-image-stack--interactive' : ''}`}
            onMouseEnter={!isClickOpen ? () => setHoveredProject(project.index) : undefined}
            onMouseLeave={!isClickOpen ? () => setHoveredProject(null) : undefined}
          >
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
                ) : src === 'box5' ? (
                  <div className="bullet-image-stack__box5">
                    <Box5 progress={1} isHovered />
                  </div>
                ) : src === 'graph' ? (
                  <div className="bullet-image-stack__graph">
                    <GraphCard />
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

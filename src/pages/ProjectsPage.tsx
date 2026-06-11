import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProjectPreviewStack, { ProjectPreview } from '../components/ProjectPreviewStack';
import { BOX9_PROJECT_URL } from '../components/Box9';
import './HomePage.css';
import './ProjectsPage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Contact', path: '/contact' },
];

const PROJECTS: {
  index: number;
  title: string;
  subtitle: string;
  path?: string | null;
  externalHref?: string;
  preview: ProjectPreview;
}[] = [
  {
    index: 1,
    title: '0 → 1 product development at Scarlet',
    subtitle: 'Simplifying complex regulatory concepts into a usable flow',
    path: '/project',
    preview: { type: 'video', src: '/img/Grid/Landing_scarlet.mp4' },
  },
  {
    index: 2,
    title: 'Digital business building at McKinsey & Company',
    subtitle: 'Launching a financial wellbeing service in Norway',
    externalHref: BOX9_PROJECT_URL,
    preview: { type: 'image', src: '/img/Grid/Landing_Kan.jpg' },
  },
  {
    index: 3,
    title: 'Trust and autonomy in self-driving cars',
    subtitle: "Master's thesis in collaboration with Volvo Cars",
    externalHref: 'https://www.umu.se/en/umea-institute-of-design/education/student-work/masters-programme-in-interaction-design/2022/soh-heum-hwang/',
    preview: { type: 'video', src: '/img/Grid/Landing_Fido.mp4' },
  },
  {
    index: 4,
    title: 'Collaboration with Korean stationery brand, Greetings Folks',
    subtitle: '(Coming soon) Translating analogue sincerity into digital experiences.',
    path: null,
    preview: { type: 'image', src: '/img/Grid/Landing_GF.jpg' },
    // preview: { type: 'envelope' },
  },
  {
    index: 5,
    title: 'Playground - UI experiments',
    subtitle: 'Personal sketchbook of micro interactions inspired by everyday life',
    path: null,
    preview: { type: 'image', src: '/img/Grid/Landing_playground_2.gif' },
  },
];

const PREVIEW_ITEMS = PROJECTS.map(({ index, preview }) => ({ index, preview }));

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const bulletsRef = useRef<HTMLUListElement>(null);
  const previewStackRef = useRef<HTMLDivElement>(null);

  const clearHoverUnlessEnteringPreview = (related: EventTarget | null) => {
    if (related instanceof Node && previewStackRef.current?.contains(related)) return;
    setHoveredProject(null);
  };

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

        <ul
          className="home-bullets"
          ref={bulletsRef}
          onMouseLeave={(e) => clearHoverUnlessEnteringPreview(e.relatedTarget)}
        >
          {PROJECTS.map(({ index, title, subtitle, path, externalHref }) => {
            const isLinked = Boolean(path || externalHref);
            return (
            <li
              key={index}
              className={`home-bullet projects-bullet${isLinked ? ' projects-bullet--linked' : ''}${hoveredProject === index ? ' projects-bullet--active' : ''}`}
              onMouseEnter={() => setHoveredProject(index)}
              onClick={isLinked ? () => handleProjectClick(path, externalHref) : undefined}
              role={isLinked ? 'link' : undefined}
              tabIndex={isLinked ? 0 : undefined}
              onKeyDown={isLinked ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProjectClick(path, externalHref);
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

      <ProjectPreviewStack
        ref={previewStackRef}
        items={PREVIEW_ITEMS}
        hoveredIndex={hoveredProject}
        onHoverEnd={(related) => {
          if (related instanceof Node && bulletsRef.current?.contains(related)) return;
          setHoveredProject(null);
        }}
      />

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

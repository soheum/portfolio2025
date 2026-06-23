import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProjectPreviewStack, { ProjectPreview } from '../components/ProjectPreviewStack';
import TypewriterText from '../components/TypewriterText';
import { BOX9_PROJECT_URL } from '../components/Box9';
import type { ProjectIndexNavState } from '../utils/projectNavState';
import './HomePage.css';
import './ProjectsPage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Playground', path: '/playground' },
  { label: 'Contact', path: '/contact' },
];

const PROJECTS: {
  index: number;
  title: string;
  subtitle: string | React.ReactNode;
  path?: string | null;
  externalHref?: string;
  preview: ProjectPreview;
}[] = [
  {
    index: 1,
    title: '0 → 1 product development at Scarlet',
    subtitle: (
      <>
        From fragmented Git-based workflows to a
        <br />
        scalable, end-to-end regulatory platform
      </>
    ),
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
    title: 'Sincerity in digital communication, shaped by analogue aesthetics',
    subtitle: '(Coming soon) Collaboration with Korean stationery brand, Greetings Folks',
    path: null,
    preview: { type: 'video', src: '/img/Grid/Landing_GF.mp4' },
    // preview: { type: 'envelope' },
  },
  {
    index: 5,
    title: 'Exploring sustainability through play',
    subtitle: 'Cross collaboration with sound design, physical design and UX',
    externalHref: 'https://designawards.core77.com/Interaction/95544/JOUL-exploring-sustainability-through-play',
    preview: { type: 'video', src: '/img/Grid/Landing_joul.mp4' },
  },
];

const PREVIEW_ITEMS = PROJECTS.map(({ index, preview }) => ({ index, preview }));
const LANDING_TITLE = 'My projects';
const REVEAL_PAUSE_MS = 500;

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [typingComplete, setTypingComplete] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const bulletsRef = useRef<HTMLUListElement>(null);
  const previewStackRef = useRef<HTMLDivElement>(null);
  const scarletIndexRef = useRef<HTMLSpanElement>(null);
  const revealDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (revealDelayRef.current) clearTimeout(revealDelayRef.current);
  }, []);

  const clearHoverUnlessEnteringPreview = (related: EventTarget | null) => {
    if (related instanceof Node && previewStackRef.current?.contains(related)) return;
    setHoveredProject(null);
  };

  const handleTypingComplete = useCallback(() => {
    revealDelayRef.current = setTimeout(() => {
      setTypingComplete(true);
      revealDelayRef.current = null;
    }, REVEAL_PAUSE_MS);
  }, []);

  const handleProjectClick = (
    path?: string | null,
    externalHref?: string,
    index?: number,
  ) => {
    if (path) {
      if (path === '/project' && index === 1 && scarletIndexRef.current) {
        const rect = scarletIndexRef.current.getBoundingClientRect();
        const state: ProjectIndexNavState = {
          indexRect: { top: rect.top, left: rect.left },
        };
        navigate(path, { state });
        return;
      }
      navigate(path);
      return;
    }
    if (externalHref) {
      window.open(externalHref, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`home-page home-page--top-aligned${typingComplete ? ' home-page--revealed' : ''}`}>
      <div className="home-content">
        <h1 className="home-title">
          <span className="home-title__name projects-title">
            <span className="projects-title__sizer" aria-hidden="true">{LANDING_TITLE}</span>
            <TypewriterText
              className="projects-title__typewriter"
              text={LANDING_TITLE}
              charDelay={50}
              startDelay={200}
              onComplete={handleTypingComplete}
            />
          </span>
        </h1>

        <ul
          className="home-bullets projects-reveal"
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
              onMouseLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                (e.currentTarget as HTMLLIElement).blur();
              }}
              onClick={isLinked ? () => handleProjectClick(path, externalHref, index) : undefined}
              role={isLinked ? 'link' : undefined}
              tabIndex={isLinked ? 0 : undefined}
              onKeyDown={isLinked ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProjectClick(path, externalHref, index);
                }
              } : undefined}
            >
              <span
                ref={index === 1 ? scarletIndexRef : undefined}
                className="home-bullet__index"
              >[{index}]</span>
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
        className="projects-preview-reveal"
        items={PREVIEW_ITEMS}
        hoveredIndex={hoveredProject}
        onHoverEnd={(related) => {
          if (related instanceof Node && bulletsRef.current?.contains(related)) return;
          setHoveredProject(null);
        }}
      />

      <nav className="home-nav projects-reveal">
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

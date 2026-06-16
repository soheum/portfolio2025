import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

function getHeadingExpandedHeight(heading: HTMLHeadingElement): number {
  const wasCollapsed = heading.classList.contains('content-block__heading--subtitle-collapsed');
  if (wasCollapsed) heading.classList.remove('content-block__heading--subtitle-collapsed');
  const height = heading.offsetHeight;
  if (wasCollapsed) heading.classList.add('content-block__heading--subtitle-collapsed');
  return height;
}


const PHASE_SUBSECTIONS = [
  { id: 'challenge', label: 'Challenge' },
  { id: 'approach', label: 'Approach' },
  { id: 'outcome', label: 'Outcome' },
] as const;

const sections: NavSection[] = [
  { id: 'about', label: 'Overview' },
  { id: 'context', label: 'Background' },
  ...([1, 2, 3, 4] as const).map((n) => ({
    id: `phase-${n}`,
    label: `Phase ${n}`,
    subsections: PHASE_SUBSECTIONS.map(({ id, label }) => ({
      id: `phase-${n}-${id}`,
      label,
    })),
  })),
];

interface ProjectDetailsProps {
  className?: string;
}

type NavSubsection = { id: string; label: string };
type NavSection =
  | { id: string; label: string; subsections?: undefined }
  | { id: string; label: string; subsections: NavSubsection[] };

const COVERAGE_CATEGORIES = [
  { label: 'Post market surveillance', score: 91 },
  { label: 'Device information', score: 48 },
  { label: 'Software', score: 12 },
  { label: 'Clinical', score: 60 },
  { label: 'Risk and usability', score: 97 },
];

function getCoverageColor(score: number): { text: string; fill: string } {
  if (score >= 80) return { text: '#4ade80', fill: 'linear-gradient(to bottom, #00381C 0%, #000000 100%)' };
  if (score >= 40) return { text: '#ca8a04', fill: 'linear-gradient(to bottom, #383014 0%, #000000 100%)' };
  return { text: '#f87171', fill: 'linear-gradient(to bottom, #5C1417 0%, #000000 100%)' };
}

const CoverageCheckerDemo: React.FC = () => {
  const totalScore = Math.round(
    COVERAGE_CATEGORIES.reduce((sum, c) => sum + c.score, 0) / COVERAGE_CATEGORIES.length
  );

  return (
    <div className="coverage-demo">
      <div className="coverage-demo__score">
        <span>Your coverage score is {totalScore}</span>
      </div>
      <div className="coverage-demo__bars">
        {COVERAGE_CATEGORIES.map(({ label, score }) => {
          const { text, fill } = getCoverageColor(score);
          return (
            <div key={label} className="coverage-demo__col">
              <div className="coverage-demo__col-header">
                <span className="coverage-demo__label">{label}</span>
                <span className="coverage-demo__pct" style={{ color: text }}>{score}%</span>
              </div>
              <div className="coverage-demo__bar-track">
                <div
                  className="coverage-demo__bar-fill"
                  style={{ height: `${score}%`, background: fill }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HeroCarousel: React.FC = () => (
  <div className="hero-image-grid hero-carousel">
    <video
      src="/img/Grid/Landing_main.mp4"
      className="hero-carousel__video"
      autoPlay
      muted
      loop
      playsInline
      aria-label="Scarlet platform overview"
    />
  </div>
);


const Phase3ApproachGallery: React.FC = () => (
  <div className="phase3-gallery">
    <img src="/img/Scarlet/phase3_approach.jpg" alt="Phase 3 approach" className="phase3-gallery__base" />
  </div>
);

const ICON_PATHS = {
  excel: { d: 'M18 10.5V37.5M30 10.5V37.5M6 19.5H42M6 28.5H42M6.00002 10.5001L42 10.5V37.5H6L6.00002 10.5001Z', color: '#3DA359' },
  pdf:   { d: 'M30 6H9C8.60218 6 8.22064 6.15804 7.93934 6.43934C7.65804 6.72064 7.5 7.10218 7.5 7.5V40.5C7.5 40.8978 7.65804 41.2794 7.93934 41.5607C8.22064 41.842 8.60218 42 9 42H39C39.3978 42 39.7794 41.842 40.0607 41.5607C40.342 41.2794 40.5 40.8978 40.5 40.5V16.5M30 6L40.5 16.5M30 6V16.5H40.5', color: '#F54D4F' },
  img:   { d: 'M9.41388 42L31.8423 19.5695C31.9942 19.4174 32.1747 19.2967 32.3734 19.2144C32.572 19.132 32.785 19.0896 33 19.0896C33.215 19.0896 33.428 19.132 33.6266 19.2144C33.8253 19.2967 34.0058 19.4174 34.1577 19.5695L42 27.4139M6.00004 6H42V42H6L6.00004 6ZM20.7273 17.4545C20.7273 19.262 19.262 20.7273 17.4546 20.7273C15.6471 20.7273 14.1818 19.262 14.1818 17.4545C14.1818 15.6471 15.6471 14.1818 17.4546 14.1818C19.262 14.1818 20.7273 15.6471 20.7273 17.4545Z', color: '#309CD9' },
  code:  { d: 'M12 16.5L3 24L12 31.5M36 16.5L45 24L36 31.5M30 7.5L18 40.5', color: '#AB8C2B' },
  docx:  { d: 'M30 6H9C8.60218 6 8.22064 6.15804 7.93934 6.43934C7.65804 6.72064 7.5 7.10218 7.5 7.5V40.5C7.5 40.8978 7.65804 41.2794 7.93934 41.5607C8.22064 41.842 8.60218 42 9 42H39C39.3978 42 39.7794 41.842 40.0607 41.5607C40.342 41.2794 40.5 40.8978 40.5 40.5V16.5M30 6L40.5 16.5M30 6V16.5H40.5', color: '#309CD9' },
};

function getPctColor(pct: string): string {
  const val = parseInt(pct);
  if (val < 30) return '#D63B40';
  if (val < 70) return '#8F730D';
  return '#038747';
}

function getIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'xlsx' || ext === 'xslx') return ICON_PATHS.excel;
  if (ext === 'pdf') return ICON_PATHS.pdf;
  if (ext === 'jpg' || ext === 'png') return ICON_PATHS.img;
  if (ext === 'docx' || ext === 'pptx') return ICON_PATHS.docx;
  return ICON_PATHS.code;
}

const EVIDENCE_ITEMS = [
  { filename: 'full_QMS_internal_audit_report.pdf', pct: '67%' },
  { filename: 'CAPA_plan.pdf', pct: '89%' },
  { filename: 'release_screen.jpg', pct: '12%' },
  { filename: 'usability_testing_plan.xslx', pct: '34%' },
  { filename: 'structlog_django.docx', pct: '45%' },
  { filename: 'audit_company_deck.pptx', pct: '23%' },
  { filename: 'clinical_evaluation_report.pdf', pct: '70%' },
  { filename: 'design_risk_review_meeting.docx', pct: '26%' },
  { filename: 'cybersecurity_report.pdf', pct: '19%' },
  { filename: 'device_Specification_form.jpg', pct: '26%' },
  { filename: 'software_configuration_report.html', pct: '44%' },
  { filename: 'vulnerability_report_v2.xlsx', pct: '72%' },
  { filename: 'validation_test_report.pdf', pct: '82%' },
  { filename: 'design_phase2_documentation_v2.pdf', pct: '36%' },
  { filename: 'qualify_manual_v3.jpg', pct: '45%' },
  { filename: 'supplier_evaluation_v4.pdf', pct: '84%' },
  { filename: 'post_market_surveillance_v4.pdf', pct: '56%' },
  { filename: 'analysis_results.json', pct: '64%' },
];

const EvidenceDemo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [rightItems, setRightItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerLeft = container.getBoundingClientRect().left;
    const lineX = containerLeft + container.offsetWidth * 0.5;
    const next = new Set<number>();
    itemRefs.current.forEach((el, idx) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.left >= lineX) next.add(idx);
      }
    });
    setRightItems(next);
  }, []);

  return (
    <div className="evidence-demo" ref={containerRef}>
      <p className="evidence-demo__quote">
        "Where a documented product realization process exists, it shall incorporate the appropriate parts of the risk management process.'
      </p>
      <div className="evidence-demo__badge">Suggested evidence running…</div>
      <div className="evidence-demo__line" />
      <div className="evidence-demo__rows">
        <div className="evidence-demo__fade" />
        {[0, 1, 2].map((row) => (
          <div key={row} className="evidence-demo__row">
            {EVIDENCE_ITEMS.slice(row * 6, row * 6 + 6).map(({ filename, pct }, i) => {
              const idx = row * 6 + i;
              const icon = getIcon(filename);
              return (
                <span
                  key={i}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  className={`evidence-demo__row-item${rightItems.has(idx) ? ' evidence-demo__row-item--right' : ''}`}
                >
                  <svg className="evidence-demo__file-icon" viewBox="-8 -8 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="-7.5" y="-7.5" width="63" height="63" stroke="#7D7D7D" strokeWidth="1" />
                    <path d={icon.d} stroke={icon.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="evidence-demo__filename">{filename}</span>
                  <span className="evidence-demo__pct" style={{ color: getPctColor(pct) }}>{pct}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const PromptCopyDemo: React.FC = () => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="prompt-copy-demo">
      <span className="prompt-copy-demo__text">
        <svg className="prompt-copy-demo__sparkle" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="sparkleGradient" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
              <stop offset="0%" stopColor="rgb(190, 245, 249)">
                <animate attributeName="stopColor" values="rgb(190,245,249);rgb(233,183,247);rgb(188,201,248);rgb(190,245,249)" dur="1.2s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="rgb(188, 201, 248)">
                <animate attributeName="stopColor" values="rgb(188,201,248);rgb(190,245,249);rgb(233,183,247);rgb(188,201,248)" dur="1.2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="rgb(233, 183, 247)">
                <animate attributeName="stopColor" values="rgb(233,183,247);rgb(255,255,255);rgb(190,245,249);rgb(233,183,247)" dur="1.2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          <path d="M8 0 C8 0 8.5 5.5 10.5 8 C8.5 10.5 8 16 8 16 C8 16 7.5 10.5 5.5 8 C7.5 5.5 8 0 8 0Z" fill="url(#sparkleGradient)" />
          <path d="M0 8 C0 8 5.5 8.5 8 10.5 C10.5 8.5 16 8 16 8 C16 8 10.5 7.5 8 5.5 C5.5 7.5 0 8 0 8Z" fill="url(#sparkleGradient)" />
        </svg>
        {copied ? 'Now paste your device description into your LLM' : 'Check your device description with AI'}
      </span>
      <button className="prompt-copy-demo__button" onClick={() => setCopied(true)}>
        Copy prompt
      </button>
    </div>
  );
};

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ className }) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('about');
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const landingRef = useRef<HTMLElement | null>(null);
  const stickyStackRef = useRef<HTMLDivElement | null>(null);
  const challengeHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const approachHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const outcomeHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const outcomeMediaRef = useRef<HTMLDivElement | null>(null);
  const phase2StickyStackRef = useRef<HTMLDivElement | null>(null);
  const phase2ChallengeHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase2ApproachHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase2OutcomeHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase3StickyStackRef = useRef<HTMLDivElement | null>(null);
  const phase3ChallengeHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase3ApproachHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase3OutcomeHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase3OutcomeMediaRef = useRef<HTMLDivElement | null>(null);
  const phase4StickyStackRef = useRef<HTMLDivElement | null>(null);
  const phase4ChallengeHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase4ApproachHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase4OutcomeHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const phase4OutcomeMediaRef = useRef<HTMLDivElement | null>(null);
  const [headingsReleased, setHeadingsReleased] = useState(false);
  const [phase3HeadingsReleased, setPhase3HeadingsReleased] = useState(false);
  const [phase4HeadingsReleased, setPhase4HeadingsReleased] = useState(false);
  const [hasPassedLanding, setHasPassedLanding] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1357') {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPassword('');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // Reveal side nav after the landing section scrolls out of view
  useEffect(() => {
    const landing = landingRef.current;
    if (!landing) return;

    const landingObserver = new IntersectionObserver(
      ([entry]) => {
        setHasPassedLanding(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px 0px -40% 0px' }
    );

    landingObserver.observe(landing);
    return () => landingObserver.disconnect();
  }, []);

  // Measure sticky headings and collapse subtitles once the next title stacks in
  useEffect(() => {
    if (!isUnlocked) return;

    const stack = stickyStackRef.current;
    const challengeHeading = challengeHeadingRef.current;
    const approachHeading = approachHeadingRef.current;
    const outcomeHeading = outcomeHeadingRef.current;
    if (!stack || !challengeHeading || !approachHeading || !outcomeHeading) return;

    const stickyTop = 48;
    let challengeExpandedHeight = 0;
    let approachExpandedHeight = 0;

    const refreshExpandedHeights = () => {
      challengeExpandedHeight = getHeadingExpandedHeight(challengeHeading);
      approachExpandedHeight = getHeadingExpandedHeight(approachHeading);
    };

    const measureStackHeights = () => {
      const stack1Height = `${challengeHeading.offsetHeight}px`;
      const stack2Height = `${approachHeading.offsetHeight}px`;

      if (stack.style.getPropertyValue('--sticky-stack-1-height') !== stack1Height) {
        stack.style.setProperty('--sticky-stack-1-height', stack1Height);
      }
      if (stack.style.getPropertyValue('--sticky-stack-2-height') !== stack2Height) {
        stack.style.setProperty('--sticky-stack-2-height', stack2Height);
      }
    };

    const setSubtitleCollapsed = (heading: HTMLHeadingElement, collapsed: boolean) => {
      const isCollapsed = heading.classList.contains('content-block__heading--subtitle-collapsed');
      if (collapsed === isCollapsed) return;
      heading.classList.toggle('content-block__heading--subtitle-collapsed', collapsed);
    };

    const updateSubtitleCollapse = () => {
      if (headingsReleased) {
        setSubtitleCollapsed(challengeHeading, false);
        setSubtitleCollapsed(approachHeading, false);
        return;
      }

      const approachTop = approachHeading.getBoundingClientRect().top;
      setSubtitleCollapsed(
        challengeHeading,
        approachTop <= stickyTop + challengeExpandedHeight + 2
      );

      const outcomeTop = outcomeHeading.getBoundingClientRect().top;
      setSubtitleCollapsed(
        approachHeading,
        outcomeTop <= stickyTop + challengeExpandedHeight + approachExpandedHeight + 2
      );
    };

    const syncStack = () => {
      updateSubtitleCollapse();
      measureStackHeights();
    };

    let syncRafId = 0;
    const scheduleSync = () => {
      if (syncRafId) return;
      syncRafId = window.requestAnimationFrame(() => {
        syncRafId = 0;
        syncStack();
      });
    };

    let measureRafId = 0;
    const scheduleMeasure = () => {
      if (measureRafId) return;
      measureRafId = window.requestAnimationFrame(() => {
        measureRafId = 0;
        refreshExpandedHeights();
        measureStackHeights();
      });
    };

    refreshExpandedHeights();
    syncStack();
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(challengeHeading);
    resizeObserver.observe(approachHeading);
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('scroll', scheduleSync, { passive: true });

    return () => {
      if (syncRafId) window.cancelAnimationFrame(syncRafId);
      if (measureRafId) window.cancelAnimationFrame(measureRafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('scroll', scheduleSync);
    };
  }, [isUnlocked, headingsReleased]);

  // Phase 2 sticky stack heading heights and subtitle collapse
  useEffect(() => {
    if (!isUnlocked) return;

    const stack = phase2StickyStackRef.current;
    const challengeHeading = phase2ChallengeHeadingRef.current;
    const approachHeading = phase2ApproachHeadingRef.current;
    const outcomeHeading = phase2OutcomeHeadingRef.current;
    if (!stack || !challengeHeading || !approachHeading || !outcomeHeading) return;

    const stickyTop = 48;
    let challengeExpandedHeight = 0;
    let approachExpandedHeight = 0;

    const refreshExpandedHeights = () => {
      challengeExpandedHeight = getHeadingExpandedHeight(challengeHeading);
      approachExpandedHeight = getHeadingExpandedHeight(approachHeading);
    };

    const measureStackHeights = () => {
      const stack1Height = `${challengeHeading.offsetHeight}px`;
      const stack2Height = `${approachHeading.offsetHeight}px`;

      if (stack.style.getPropertyValue('--sticky-stack-1-height') !== stack1Height) {
        stack.style.setProperty('--sticky-stack-1-height', stack1Height);
      }
      if (stack.style.getPropertyValue('--sticky-stack-2-height') !== stack2Height) {
        stack.style.setProperty('--sticky-stack-2-height', stack2Height);
      }
    };

    const setSubtitleCollapsed = (heading: HTMLHeadingElement, collapsed: boolean) => {
      const isCollapsed = heading.classList.contains('content-block__heading--subtitle-collapsed');
      if (collapsed === isCollapsed) return;
      heading.classList.toggle('content-block__heading--subtitle-collapsed', collapsed);
    };

    const updateSubtitleCollapse = () => {
      const approachTop = approachHeading.getBoundingClientRect().top;
      setSubtitleCollapsed(
        challengeHeading,
        approachTop <= stickyTop + challengeExpandedHeight + 2
      );

      const outcomeTop = outcomeHeading.getBoundingClientRect().top;
      setSubtitleCollapsed(
        approachHeading,
        outcomeTop <= stickyTop + challengeExpandedHeight + approachExpandedHeight + 2
      );
    };

    const syncStack = () => {
      updateSubtitleCollapse();
      measureStackHeights();
    };

    let syncRafId = 0;
    const scheduleSync = () => {
      if (syncRafId) return;
      syncRafId = window.requestAnimationFrame(() => {
        syncRafId = 0;
        syncStack();
      });
    };

    let measureRafId = 0;
    const scheduleMeasure = () => {
      if (measureRafId) return;
      measureRafId = window.requestAnimationFrame(() => {
        measureRafId = 0;
        refreshExpandedHeights();
        measureStackHeights();
      });
    };

    refreshExpandedHeights();
    syncStack();
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(challengeHeading);
    resizeObserver.observe(approachHeading);
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('scroll', scheduleSync, { passive: true });

    return () => {
      if (syncRafId) window.cancelAnimationFrame(syncRafId);
      if (measureRafId) window.cancelAnimationFrame(measureRafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('scroll', scheduleSync);
    };
  }, [isUnlocked]);

  // Phase 3 sticky stack heading heights and subtitle collapse
  useEffect(() => {
    if (!isUnlocked) return;

    const stack = phase3StickyStackRef.current;
    const challengeHeading = phase3ChallengeHeadingRef.current;
    const approachHeading = phase3ApproachHeadingRef.current;
    const outcomeHeading = phase3OutcomeHeadingRef.current;
    if (!stack || !challengeHeading || !approachHeading || !outcomeHeading) return;

    const stickyTop = 48;
    let challengeExpandedHeight = 0;
    let approachExpandedHeight = 0;

    const refreshExpandedHeights = () => {
      challengeExpandedHeight = getHeadingExpandedHeight(challengeHeading);
      approachExpandedHeight = getHeadingExpandedHeight(approachHeading);
    };

    const measureStackHeights = () => {
      const stack1Height = `${challengeHeading.offsetHeight}px`;
      const stack2Height = `${approachHeading.offsetHeight}px`;

      if (stack.style.getPropertyValue('--sticky-stack-1-height') !== stack1Height) {
        stack.style.setProperty('--sticky-stack-1-height', stack1Height);
      }
      if (stack.style.getPropertyValue('--sticky-stack-2-height') !== stack2Height) {
        stack.style.setProperty('--sticky-stack-2-height', stack2Height);
      }
    };

    const setSubtitleCollapsed = (heading: HTMLHeadingElement, collapsed: boolean) => {
      const isCollapsed = heading.classList.contains('content-block__heading--subtitle-collapsed');
      if (collapsed === isCollapsed) return;
      heading.classList.toggle('content-block__heading--subtitle-collapsed', collapsed);
    };

    const updateSubtitleCollapse = () => {
      if (phase3HeadingsReleased) {
        setSubtitleCollapsed(challengeHeading, false);
        setSubtitleCollapsed(approachHeading, false);
        return;
      }

      const approachTop = approachHeading.getBoundingClientRect().top;
      setSubtitleCollapsed(
        challengeHeading,
        approachTop <= stickyTop + challengeExpandedHeight + 2
      );

      const outcomeTop = outcomeHeading.getBoundingClientRect().top;
      setSubtitleCollapsed(
        approachHeading,
        outcomeTop <= stickyTop + challengeExpandedHeight + approachExpandedHeight + 2
      );
    };

    const syncStack = () => {
      updateSubtitleCollapse();
      measureStackHeights();
    };

    let syncRafId = 0;
    const scheduleSync = () => {
      if (syncRafId) return;
      syncRafId = window.requestAnimationFrame(() => {
        syncRafId = 0;
        syncStack();
      });
    };

    let measureRafId = 0;
    const scheduleMeasure = () => {
      if (measureRafId) return;
      measureRafId = window.requestAnimationFrame(() => {
        measureRafId = 0;
        refreshExpandedHeights();
        measureStackHeights();
      });
    };

    refreshExpandedHeights();
    syncStack();
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(challengeHeading);
    resizeObserver.observe(approachHeading);
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('scroll', scheduleSync, { passive: true });

    return () => {
      if (syncRafId) window.cancelAnimationFrame(syncRafId);
      if (measureRafId) window.cancelAnimationFrame(measureRafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('scroll', scheduleSync);
    };
  }, [isUnlocked, phase3HeadingsReleased]);

  // Release Phase 3 sticky headings when the Outcome video reaches the heading row
  useEffect(() => {
    if (!isUnlocked) return;

    const media = phase3OutcomeMediaRef.current;
    const challengeHeading = phase3ChallengeHeadingRef.current;
    const approachHeading = phase3ApproachHeadingRef.current;
    if (!media || !challengeHeading || !approachHeading) return;

    const getReleaseLine = () => {
      const stickyTop = 48;
      const releaseLeadPx = 120;
      return (
        stickyTop +
        getHeadingExpandedHeight(challengeHeading) +
        getHeadingExpandedHeight(approachHeading) +
        releaseLeadPx
      );
    };

    const updateHeadingsReleased = () => {
      const releaseLine = getReleaseLine();
      const mediaTop = media.getBoundingClientRect().top;

      setPhase3HeadingsReleased((prev) => {
        if (mediaTop <= releaseLine) return true;
        if (mediaTop > releaseLine + 32) return false;
        return prev;
      });
    };

    updateHeadingsReleased();
    window.addEventListener('scroll', updateHeadingsReleased, { passive: true });
    window.addEventListener('resize', updateHeadingsReleased);

    return () => {
      window.removeEventListener('scroll', updateHeadingsReleased);
      window.removeEventListener('resize', updateHeadingsReleased);
    };
  }, [isUnlocked]);

  // Phase 4 sticky stack heading heights and subtitle collapse
  useEffect(() => {
    if (!isUnlocked) return;

    const stack = phase4StickyStackRef.current;
    const challengeHeading = phase4ChallengeHeadingRef.current;
    const approachHeading = phase4ApproachHeadingRef.current;
    const outcomeHeading = phase4OutcomeHeadingRef.current;
    if (!stack || !challengeHeading || !approachHeading || !outcomeHeading) return;

    const stickyTop = 48;
    let challengeExpandedHeight = 0;
    let approachExpandedHeight = 0;

    const refreshExpandedHeights = () => {
      challengeExpandedHeight = getHeadingExpandedHeight(challengeHeading);
      approachExpandedHeight = getHeadingExpandedHeight(approachHeading);
    };

    const measureStackHeights = () => {
      const stack1Height = `${challengeHeading.offsetHeight}px`;
      const stack2Height = `${approachHeading.offsetHeight}px`;

      if (stack.style.getPropertyValue('--sticky-stack-1-height') !== stack1Height) {
        stack.style.setProperty('--sticky-stack-1-height', stack1Height);
      }
      if (stack.style.getPropertyValue('--sticky-stack-2-height') !== stack2Height) {
        stack.style.setProperty('--sticky-stack-2-height', stack2Height);
      }
    };

    const setSubtitleCollapsed = (heading: HTMLHeadingElement, collapsed: boolean) => {
      const isCollapsed = heading.classList.contains('content-block__heading--subtitle-collapsed');
      if (collapsed === isCollapsed) return;
      heading.classList.toggle('content-block__heading--subtitle-collapsed', collapsed);
    };

    const updateSubtitleCollapse = () => {
      if (phase4HeadingsReleased) {
        setSubtitleCollapsed(challengeHeading, false);
        setSubtitleCollapsed(approachHeading, false);
        return;
      }

      const approachTop = approachHeading.getBoundingClientRect().top;
      setSubtitleCollapsed(
        challengeHeading,
        approachTop <= stickyTop + challengeExpandedHeight + 2
      );

      const outcomeTop = outcomeHeading.getBoundingClientRect().top;
      setSubtitleCollapsed(
        approachHeading,
        outcomeTop <= stickyTop + challengeExpandedHeight + approachExpandedHeight + 2
      );
    };

    const syncStack = () => {
      updateSubtitleCollapse();
      measureStackHeights();
    };

    let syncRafId = 0;
    const scheduleSync = () => {
      if (syncRafId) return;
      syncRafId = window.requestAnimationFrame(() => {
        syncRafId = 0;
        syncStack();
      });
    };

    let measureRafId = 0;
    const scheduleMeasure = () => {
      if (measureRafId) return;
      measureRafId = window.requestAnimationFrame(() => {
        measureRafId = 0;
        refreshExpandedHeights();
        measureStackHeights();
      });
    };

    refreshExpandedHeights();
    syncStack();
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(challengeHeading);
    resizeObserver.observe(approachHeading);
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('scroll', scheduleSync, { passive: true });

    return () => {
      if (syncRafId) window.cancelAnimationFrame(syncRafId);
      if (measureRafId) window.cancelAnimationFrame(measureRafId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('scroll', scheduleSync);
    };
  }, [isUnlocked, phase4HeadingsReleased]);

  // Release Phase 4 sticky headings when the Outcome video reaches the heading row
  useEffect(() => {
    if (!isUnlocked) return;

    const media = phase4OutcomeMediaRef.current;
    const challengeHeading = phase4ChallengeHeadingRef.current;
    const approachHeading = phase4ApproachHeadingRef.current;
    if (!media || !challengeHeading || !approachHeading) return;

    const getReleaseLine = () => {
      const stickyTop = 48;
      const releaseLeadPx = 120;
      return (
        stickyTop +
        getHeadingExpandedHeight(challengeHeading) +
        getHeadingExpandedHeight(approachHeading) +
        releaseLeadPx
      );
    };

    const updateHeadingsReleased = () => {
      const releaseLine = getReleaseLine();
      const mediaTop = media.getBoundingClientRect().top;

      setPhase4HeadingsReleased((prev) => {
        if (mediaTop <= releaseLine) return true;
        if (mediaTop > releaseLine + 32) return false;
        return prev;
      });
    };

    updateHeadingsReleased();
    window.addEventListener('scroll', updateHeadingsReleased, { passive: true });
    window.addEventListener('resize', updateHeadingsReleased);

    return () => {
      window.removeEventListener('scroll', updateHeadingsReleased);
      window.removeEventListener('resize', updateHeadingsReleased);
    };
  }, [isUnlocked]);

  // Release sticky headings when the Outcome image reaches the Outcome heading row
  useEffect(() => {
    if (!isUnlocked) return;

    const stack = stickyStackRef.current;
    const media = outcomeMediaRef.current;
    const challengeHeading = challengeHeadingRef.current;
    const approachHeading = approachHeadingRef.current;
    const outcomeHeading = outcomeHeadingRef.current;
    if (!stack || !media || !challengeHeading || !approachHeading || !outcomeHeading) return;

    const getReleaseLine = () => {
      const stickyTop = 48;
      const releaseLeadPx = 120;
      return (
        stickyTop +
        challengeHeading.offsetHeight +
        approachHeading.offsetHeight +
        releaseLeadPx
      );
    };

    const updateHeadingsReleased = () => {
      const releaseLine = getReleaseLine();
      const mediaTop = media.getBoundingClientRect().top;

      setHeadingsReleased((prev) => {
        if (mediaTop <= releaseLine) return true;
        if (mediaTop > releaseLine + 32) return false;
        return prev;
      });
    };

    updateHeadingsReleased();
    window.addEventListener('scroll', updateHeadingsReleased, { passive: true });
    window.addEventListener('resize', updateHeadingsReleased);

    return () => {
      window.removeEventListener('scroll', updateHeadingsReleased);
      window.removeEventListener('resize', updateHeadingsReleased);
    };
  }, [isUnlocked]);

  // Scroll spy: detect which section is in view
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const intersecting = entries.filter((e) => e.isIntersecting);
      if (intersecting.length === 0) return;

      // Pick the topmost element in the viewport among intersecting entries
      const top = intersecting.reduce((best, e) =>
        e.boundingClientRect.top < best.boundingClientRect.top ? e : best
      );

      const id = top.target.id;
      const phaseSubMatch = id.match(/^(phase-\d+)-(challenge|approach|outcome)$/);
      if (phaseSubMatch) {
        setActiveSubsection(id);
        setActiveSection(phaseSubMatch[1]);
      } else {
        setActiveSection(id);
        setActiveSubsection(null);
      }
    }, options);

    // Observe main sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element && observerRef.current) {
        observerRef.current.observe(element);
      }

      // Observe subsections
      if (section.subsections) {
        section.subsections.forEach((sub) => {
          const subElement = document.getElementById(sub.id);
          if (subElement && observerRef.current) {
            observerRef.current.observe(subElement);
          }
        });
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked]);

  // Auto-scroll navigation to show active item on mobile
  useEffect(() => {
    const activeNavItem = document.querySelector('.nav-item.active');
    if (activeNavItem && window.innerWidth <= 780) {
      activeNavItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeSection]);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={`project-details-page ${hasPassedLanding ? 'project-details-page--past-landing' : ''} ${className ?? ''}`.trim()}
    >
      <section ref={landingRef} className="project-landing" id="project-landing" aria-label="Project introduction">
        {/* <button type="button" className="project-landing-back" onClick={handleBack}>
          Previous
        </button> */}
        <div className="project-landing-hero">
          <HeroCarousel />
        </div>
        <div className="project-landing-inner">
          <div className="project-landing-col project-landing-col--headline">
            <h1 className="project-landing-headline">
              From fragmented Git-based workflows to a scalable, end-to-end regulatory platform
            </h1>
            <a
              href="https://www.scarlet.cc/"
              className="project-landing-link-btn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Scarlet website"
            >
              <img src="/img/ArrowUpRight.svg" alt="" className="project-landing-link-btn__icon" />
            </a>
          </div>
          <div className="project-landing-col project-landing-col--body">
            <p>
              0 → 1 product design and development at Scarlet, Notified Body specialised in software
              and AI medical devices.
            </p>
            <p>
              Founding design work at an early stage startup, defining core user experience and design
              direction with 10+ product team.
            </p>
          </div>
          <div className="project-landing-col project-landing-col--meta">
            <div className="hero-meta-field">
              <p>Company</p>
              <p className="hero-meta-explanation">Scarlet</p>
            </div>
            <div className="hero-meta-field">
              <p>Duration</p>
              <p className="hero-meta-explanation">Mar 25 - present</p>
            </div>
            <div className="hero-meta-field">
              <p>Role</p>
              <p className="hero-meta-explanation">Senior Product Designer</p>
            </div>
            <div className="hero-meta-field">
              <p>Team</p>
              <p className="hero-meta-explanation">1 Design Lead, 1 PM, 8 engineers</p>
            </div>
          </div>
        </div>
      </section>

      {!isUnlocked && (
        <div className="project-details-lock-overlay">
          <form className="project-details-lock-form" onSubmit={handlePasswordSubmit}>
            <p className="project-details-lock-label">Email sohheum@gmail.com for access</p>
            <div className="project-details-lock-row">
              <input
                className={`project-details-lock-input ${passwordError ? 'project-details-lock-input--error' : ''}`}
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
                placeholder="Enter password"
                autoFocus
              />
              <button className="project-details-lock-btn" type="submit">Unlock</button>
            </div>
            {passwordError && <p className="project-details-lock-error">Incorrect password</p>}
          </form>
        </div>
      )}

      {isUnlocked && (
      <div className="project-details-container">
      <div className="project-grid" id="project-grid">
        {/* Cols 1–2: nav · Cols 3–10: content */}
        <nav className={`side-navigation hidden xl:block ${hasPassedLanding ? 'side-navigation--visible' : ''}`}>
          <button className="back-button" onClick={handleBack}>
            Previous
          </button>

          <div className="nav-sections">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  {section.label}
                </button>

                {/* Render sub-navigation if exists */}
                {section.subsections && (
                  <div className="sub-nav">
                    {section.subsections.map((sub) => (
                      <button
                        key={sub.id}
                        className={`sub-nav-item ${activeSubsection === sub.id ? 'active' : ''}`}
                        onClick={() => scrollToSection(sub.id)}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Cols 3–10: Text Content */}
        <div className="text-content">
          <article id="context" className="content-block content-block--headline-split">
            <div className="content-block__media">
              <img
                src="/img/Scarlet/timeline.jpg"
                alt="User growth timeline from 50 users on GitHub to 500 users on Scarlet Web"
                className="timeline-image"
              />
            </div>
            <h2 className="content-block__heading">Scaling from <br/> 50 to 500 uesrs, <br/> from Github to Web</h2>
            <div className="content-block__body content-section">
              <p>Scarlet is a Notified Body specialising in AI medical devices and Software as a Medical Device (SaMD).</p>
              <p>When I joined, certification workflows operated entirely through GitHub, where customers submitted evidence via repositories and assessors reviewed it through issues and version updates. While this enabled a fast setup, GitHub&apos;s complexity created a barrier for non-technical stakeholders.</p>
              <p>We addressed this by designing and launching a dedicated web platform, scaling from 50 users across 10 workspaces to over 500 users across 65, while evolving the product into a multi-stakeholder system for customers, evaluators, and administrators.</p>
            </div>
          </article>

          <div id="phase-1" className="phase-block">
            <div
              ref={stickyStackRef}
              className={`phase-block__sticky-stack${headingsReleased ? ' phase-block__sticky-stack--headings-released' : ''}`}
            >
              <section id="phase-1-challenge" className="content-block__segment">
                <div className="content-block__media">
                  <img src="/img/Scarlet/phase1_challenge.jpg" alt="Phase 1 challenge" className="timeline-image" />
                </div>
                <h2 ref={challengeHeadingRef} className="content-block__heading content-block__heading--stack-1">
                  <span className="content-block__heading-label">Phase 01</span>
                  Challenge
                  <span className="content-block__heading-subtitle">Difficulty in user research</span>
                </h2>
                <div className="content-block__body content-section" style={{ marginTop: '0%' }}>
                  <ul>
                    <li>Early customers (fewer than 20) were actively preparing regulatory submissions, making them difficult to engage in research.</li>
                    <li>Even when sessions were arranged, <span style={{ color: '#ffffff' }}>feedback was often guarded due to the regulatory relationship.</span></li>
                    <li><span style={{ color: '#ffffff' }}>Recruiting external users was challenging</span> given the niche audience of AI and software medical device manufacturers.</li>
                  </ul>
                </div>
              </section>

              <section id="phase-1-approach" className="content-block__segment">
                <h2 ref={approachHeadingRef} className="content-block__heading content-block__heading--stack-2">
                  Approach
                  <span className="content-block__heading-subtitle">New research tools</span>
                </h2>
                
                <div className="content-block__body content-section">
                  <p>Instead of relying on traditional research methods, <span style={{ color: '#ffffff' }}>we embedded tools to collate feedback into existing customer touchpoints.</span> We introduced lightweight tools such as a "Scarlet Calculator," used during sales conversations to simulate certification timelines. This helped communicate the product offering and revealed two key insights:</p>
                  <ul>
                    <li>How customers distributed their time across different stages of the certification process.</li>
                    <li>The gap between perceived readiness and actual submission quality.</li>
                  </ul>
                </div>
                <div className="content-block__media">
                  <figure className="media-figure">
                    <video src="/img/Scarlet/phase1_approach.mp4" className="timeline-image" autoPlay muted loop playsInline aria-label="Phase 1 approach" />
                    <figcaption className="media-caption">Scarlet Calculator Tool used during sales conversations</figcaption>
                  </figure>
                </div>
              </section>

              <section id="phase-1-outcome" className="content-block__segment">
                <h2 ref={outcomeHeadingRef} className="content-block__heading content-block__heading--stack-3">
                  Outcome
                  <span className="content-block__heading-subtitle">MVP launched in 2 weeks</span>
                </h2>
                <div className="content-block__body content-section">
                  <p>We launched an MVP: a simple, low-barrier portal that allowed customers to upload regulatory documents regardless of format, shifting complexity away from the user. The main advantage of this approach was accessibility, as customers could submit files directly.</p>
                  <p>At the same time, the MVP revealed an important learning: <span style={{ color: '#ffffff' }}>the platform needed to do more than collect documents.</span> Customers often believed they were ready to submit, but documentation quality was often incomplete or below the level needed for assessment. This led to more findings, longer certification timelines, and a clear need to better support evidence preparation before submission.</p>
                </div>
                <div ref={outcomeMediaRef} className="content-block__media">
                  <figure className="media-figure">
                    <img src="/img/Scarlet/phase1_outcome.jpg" alt="Phase 1 outcome" className="timeline-image" />
                    <figcaption className="media-caption">MVP version launched in 2 weeks</figcaption>
                  </figure>
                </div>
              </section>
            </div>
          </div>

          <div id="phase-2" className="phase-block">
            <div className="phase-block__challenge-intro">
              <div className="content-block phase-block__pair-media">
                <figure className="phase-block__pair-media-item">
                  <img src="/img/Scarlet/phase2_challenge_1.jpg" alt="21% submission quality" className="timeline-image" />
                  {/* <figcaption className="media-caption">Low quality submissions</figcaption> */}
                </figure>
                <figure className="phase-block__pair-media-item">
                  <img src="/img/Scarlet/phase2_challenge_2.jpg" alt="AI disclaimer tooltip" className="timeline-image" />
                  {/* <figcaption className="media-caption">Strict impartiality rules with AI</figcaption> */}
                </figure>
              </div>
              <div ref={phase2StickyStackRef} className="phase-block__sticky-stack">
                <section id="phase-2-challenge" className="content-block__segment">
                  <h2 ref={phase2ChallengeHeadingRef} className="content-block__heading content-block__heading--stack-1">
                    <span className="content-block__heading-label">Phase 02</span>
                    Challenge
                    <span className="content-block__heading-subtitle">Regulatory constraints in AI usage </span>
                  </h2>
                  <div className="content-block__body content-section">
                    <div className="challenge-image-row">
                      <div>
                        <p><strong>Low quality submissions</strong></p>
                        <p>With over 20 customers now active on the platform, document submission was easy, but customers were submitting low quality documents that impacted the certification timeline.</p>
                      </div>
                    </div>
                    <hr className="challenge-image-divider" aria-hidden="true" />
                    <div className="challenge-image-row">
                      <div>
                        <p><strong>Strict impartiality rules with AI</strong></p>
                        <p>While repetitive documentation tasks were an obvious area where AI could add value and reduce friction for customers, Scarlet had to maintain strict impartiality as a regulatory body. We must avoid offering any implicit or explicit gap analysis before formal assessment, limiting how far AI support could go.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="phase-2-approach" className="content-block__segment">
                  <h2 ref={phase2ApproachHeadingRef} className="content-block__heading content-block__heading--stack-2">
                    Approach
                    <span className="content-block__heading-subtitle">Incremental impact in existing flows</span>
                  </h2>
                  <div className="content-block__body content-section">
                    <p>Rather than building an autonomous agent, we focused on incremental impact grounded in existing workflows.</p>
                    <p>A key insight shaped our direction: customers spent little time on the platform and approached it with caution — returning only when they felt fully ready to submit, afraid of making mistakes. This meant <span style={{ color: '#ffffff' }}>they weren't looking for an AI guide, but for reassurance before committing to a submission.</span></p>
                  </div>
                  <div className="content-block__media">
                    <img src="/img/Scarlet/phase2_approach.jpg" alt="Phase 2 approach" className="timeline-image" />
                  </div>
                </section>

                <section id="phase-2-outcome" className="content-block__segment">
                  <h2 ref={phase2OutcomeHeadingRef} className="content-block__heading content-block__heading--stack-3">
                    Outcome
                    <span className="content-block__heading-subtitle">AI introduced through stages</span>
                  </h2>
                  <div className="content-block__body content-section">
                    <div className="outcome-demo-group">
                      <PromptCopyDemo />
                      <div className="outcome-demo-group__text">
                        <p><strong>Prompt-copy tool</strong></p>
                        <p>We started with a simple tool that allowed users to copy a ready-to-use prompt to the customer's clipboard, which they can paste into their own external LLM alongside their documentation for self-directed feedback.</p>
                      </div>
                    </div>
                    <div className="outcome-demo-group">
                      <CoverageCheckerDemo />
                      <div className="outcome-demo-group__text">
                        <p><strong>Coverage checker</strong></p>
                        <p>This evolved to launching a coverage checker, which shifted the role of AI from evaluating quality to validating completeness by checking whether required content was present against Scarlet's existing knowledge base.</p>
                      </div>
                    </div>
                    <div className="outcome-demo-group">
                      <EvidenceDemo />
                      <div className="outcome-demo-group__text">
                        <p><strong>Suggested evidence tool</strong></p>
                        <p>Developing AI features for customers created the foundation for AI-enabled tools for internal assessors. We then built an assessor-facing suggested evidence tool that automatically scans uploaded documentation and suggests specific passages as potential evidence for each regulatory requirement.</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div id="phase-3" className="phase-block">
            <div
              ref={phase3StickyStackRef}
              className={`phase-block__sticky-stack${phase3HeadingsReleased ? ' phase-block__sticky-stack--headings-released' : ''}`}
            >
              <section id="phase-3-challenge" className="content-block__segment">
                <div className="content-block__media">
                  <img src="/img/Scarlet/phase3_challenge_0.jpg" alt="Phase 3 challenge" className="timeline-image" />
                </div>
                <h2 ref={phase3ChallengeHeadingRef} className="content-block__heading content-block__heading--stack-1">
                    <span className="content-block__heading-label">Phase 03</span>
                    Challenge
                    <span className="content-block__heading-subtitle">Scaling assessor workflows <br/>under complexity</span>
                  </h2>
                  <div className="content-block__body content-section">
                    <p>With over 30 customers on the platform, assessors needed to scale their workload rapidly. This put the assessor experience under pressure in two ways:</p>
                    <div className="challenge-image-row">
                      <div>
                        <p><strong>Complexity</strong></p>
                        <p>Regulatory requirements are filled with exceptions and nuanced edge cases. Translating this into a web interface meant the platform itself had to absorb that complexity — representing it accurately without oversimplifying, while still remaining usable for assessors working under time pressure.</p>
                      </div>
                    </div>
                    <hr className="challenge-image-divider" aria-hidden="true" />
                    <div className="challenge-image-row">
                      <div>
                        <p><strong>Diverse working styles</strong></p>
                        <p>With 20 assessors, each had their own way of working. Building a one-size-fits-all interface wasn&apos;t an option — the UI had to be flexible enough to accommodate different workflows while remaining as efficient as possible.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section id="phase-3-approach" className="content-block__segment">
                  <h2 ref={phase3ApproachHeadingRef} className="content-block__heading content-block__heading--stack-2">
                    Approach
                    <span className="content-block__heading-subtitle">Rapid iteration <br/>with vibe-coded prototypes</span>
                  </h2>
                  <div className="content-block__body content-section">
                    <p>Given the time pressure, we prioritised rapid iteration with tight feedback loops. Vibe-coded prototypes became a key part — rather than working with placeholder content, we were able to load actual regulatory documents directly into prototypes. This meant <span style={{ color: '#ffffff' }}>assessors could give feedback grounded in real work rather than hypothetical prototypes, making each iteration significantly more accurate and actionable.</span></p>
                  </div>
                  <div className="content-block__media">
                    <Phase3ApproachGallery />
                  </div>
                </section>

                <section id="phase-3-outcome" className="content-block__segment">
                  <h2 ref={phase3OutcomeHeadingRef} className="content-block__heading content-block__heading--stack-3">
                    Outcome
                    <span className="content-block__heading-subtitle">Information-dense, <br/>but flexible assessor interface</span>
                  </h2>
                  <div className="content-block__body content-section">
                    <p>We delivered a flexible, information-dense assessor interface designed to minimise friction and maximise control:</p>
                    <ul>
                      <li><strong>Granular section controls:</strong> Assessors could independently control each section on both sides of the platform, with up to five options per section, allowing each person to configure the interface to match their workflow.</li>
                      <li><strong>Maximum information density:</strong> Rather than progressive disclosure, assessors wanted everything visible at once. The interface was designed to surface as much relevant information as possible with the fewest clicks, keeping the right content within quick reach at all times.</li>
                    </ul>
                  </div>
                  <div ref={phase3OutcomeMediaRef} className="content-block__media">
                    <figure className="media-figure">
                      <video src="/img/Scarlet/phase3_outcome.mp4" className="timeline-image" autoPlay muted loop playsInline aria-label="Phase 3 outcome" />
                      <figcaption className="media-caption">Platform for assessors that is information-dense with granular controls</figcaption>
                    </figure>
                  </div>
                </section>
            </div>
          </div>

          <div id="phase-4" className="phase-block">
            <div
              ref={phase4StickyStackRef}
              className={`phase-block__sticky-stack${phase4HeadingsReleased ? ' phase-block__sticky-stack--headings-released' : ''}`}
            >
              <section id="phase-4-challenge" className="content-block__segment">
                <div className="content-block__media">
                  <img src="/img/Scarlet/phase4_challenge.jpg" alt="Phase 4 challenge" className="timeline-image" />
                </div>
                <h2 ref={phase4ChallengeHeadingRef} className="content-block__heading content-block__heading--stack-1">
                  <span className="content-block__heading-label">Phase 04</span>
                  Challenge
                  <span className="content-block__heading-subtitle">Scaling admin workflows <br/>with strict traceability</span>
                </h2>
                <div className="content-block__body content-section">
                  <p>With customer and assessor workflows successfully migrated to the web, administrators were still using GitHub. We received repeated audit findings from IGJ (Inspectie Gezondheidszorg en Jeugd), supervisory authority auditing Scarlet, that using GitHub was becoming unscalable.</p>
                  <p>There were three main challenges:</p>
                  <ul>
                    <li><strong>Regulatory nuance:</strong> Administrative processes have numerous exceptions and edge cases, each requiring a precise level of granularity to be recorded accurately.</li>
                    <li><strong>Audit trail requirements:</strong> Every action and decision had to be fully logged and traceable, placing strict demands on how data was structured.</li>
                    <li><strong>Data model tension:</strong> The system had to be flexible enough for edge cases, scalable as the platform grew, and rigid enough to guarantee a complete audit trail — all at once.</li>
                  </ul>
                </div>
              </section>

              <section id="phase-4-approach" className="content-block__segment">
                <h2 ref={phase4ApproachHeadingRef} className="content-block__heading content-block__heading--stack-2">
                  Approach
                  <span className="content-block__heading-subtitle">Cross-functional collaboration</span>
                </h2>
                <div className="content-block__body content-section">
                  <p>Given the complexity, <span style={{ color: '#ffffff' }}>we prioritised early and continuous collaboration between designers, engineers, product, and the technical operations team.</span> Rather than working in silos, the four came together regularly to align on regulatory needs, engineering constraints, product roadmap, and usability — finding solutions that satisfied all at once.</p>
                </div>
                <div className="content-block__media">
                  <img src="/img/Scarlet/phase4_approach.jpg" alt="Phase 4 approach" className="timeline-image" />
                </div>
              </section>

              <section id="phase-4-outcome" className="content-block__segment">
                <h2 ref={phase4OutcomeHeadingRef} className="content-block__heading content-block__heading--stack-3">
                  Outcome
                  <span className="content-block__heading-subtitle">Competence management system <br/>in the web</span>
                </h2>
                <div className="content-block__body content-section">
                  <p>The result was <span style={{ color: '#ffffff' }}>a competence management system that brought complex regulatory administration fully into the web</span> — making processes that once lived in GitHub or offline systems accessible, traceable, and auditable in one place.</p>
                  <p>When IGJ conducted their audit, the response was notable: no other notified body had managed to centralise their regulatory processes in a web platform to this extent. What started as a response to audit findings became a genuine differentiator for Scarlet.</p>
                </div>
                <div ref={phase4OutcomeMediaRef} className="content-block__media">
                  <figure className="media-figure">
                    <video src="/img/Scarlet/phase4_outcome.mp4" className="timeline-image" autoPlay muted loop playsInline aria-label="Phase 4 outcome" />
                    <figcaption className="media-caption">Competence management system in the web</figcaption>
                  </figure>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};

export default ProjectDetails;

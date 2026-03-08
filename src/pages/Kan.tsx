import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

const ROTATING_IMAGES = ['01-1.jpg', '01-2.jpg', '01-3.jpg', '01-4.jpg'];
const ROTATING_IMAGES_2 = ['02-4.jpg', '02-5.jpg', '02-6.jpg'];
const ROTATING_IMAGES_3 = ['03-1.jpg', '03-2.jpg', '03-3.jpg'];

const Kan: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('about');
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null);
  const [rotatingImageIndex, setRotatingImageIndex] = useState(0);
  const [rotatingImageIndex2, setRotatingImageIndex2] = useState(0);
  const [rotatingImageIndex3, setRotatingImageIndex3] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const challengeVideoRef = useRef<HTMLVideoElement | null>(null);
  const challenge1VideoRef = useRef<HTMLVideoElement | null>(null);
  const challenge4VideoRef = useRef<HTMLVideoElement | null>(null);
  const coverVideoRef = useRef<HTMLVideoElement | null>(null);

  const handleBack = () => {
    navigate('/');
  };

  const sections = [
    { id: 'about', label: 'Overview' },
    { id: 'context', label: 'Background' },
    {
      id: 'outcome',
      label: 'Outcome',
      subsections: [
        { id: 'outcome-customer-portal', label: 'Step 1' },
        { id: 'outcome-assessor-workspace', label: 'Step 2' },
        { id: 'outcome-admin-workspace', label: 'Step 3' }
      ]
    },
    { id: 'pain-points', label: 'Challenge' },
    { id: 'key-design', label: 'Design approach' },
    { id: 'design-process', label: 'Process' }
  ];

  // Scroll spy: detect which section is in view
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;

          // Check if it's a subsection
          if (id.startsWith('outcome-') || id.startsWith('pain-') || id.startsWith('key-')) {
            setActiveSubsection(id);
            // Also set the parent section active
            if (id.startsWith('outcome-')) setActiveSection('outcome');
            else if (id.startsWith('pain-')) setActiveSection('pain-points');
            else if (id.startsWith('key-')) setActiveSection('key-design');
          } else {
            // Main section
            setActiveSection(id);
            setActiveSubsection(null);
          }
        }
      });
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
  }, []);

  // Preload rotating images so they're in cache when we switch (reduces flash)
  useEffect(() => {
    const base = '/img/Scarlet/';
    [...ROTATING_IMAGES, ...ROTATING_IMAGES_2, ...ROTATING_IMAGES_3].forEach((filename) => {
      const img = new Image();
      img.src = base + filename;
    });
  }, []);

  // Auto-scroll navigation to show active item on mobile
  useEffect(() => {
    const activeNavItem = document.querySelector('.nav-item.active');
    if (activeNavItem && window.innerWidth <= 900) {
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
    <div className="project-details-container project-details--box9">
      <div className="project-grid">
        {/* Column 1: Side Navigation */}
        <nav className="side-navigation">
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

        {/* Columns 2-8: Text Content */}
        <div className="text-content">
          {/* About Section - Full viewport hero */}
          <section id="about" className="about-hero">
            <div className="hero-header">
              {/* <p className="subtitle_dates">2025 February - ongoing / in London / Series A startup</p> */}
              <img src="/logo/mck_logo.png" alt="McKinsey & Company" className="hero-logo" />
              <div className="subtitle-container">
              <p className="subtitle">Transforming debt support into </p>
                <p className="subtitle subtitle-highlight">
                  {Array.from('a financial health platform').map((char, index) => (
                    <span
                      key={index}
                      className="subtitle-highlight-char"
                      style={{ ['--char-index' as string]: index } as React.CSSProperties}
                    >
                      {char}
                    </span>
                  ))}
                </p>
              </div>
              <p style={{ width: '45%', color: '#ffffff' }}>
              During my time at McKinsey & Design, I expanded an early MVP focused on debt repayment support into a scalable financial health platform, shaping design direction and identifying business opportunities alongside business consultants 
              </p>

              {/* <p className="subtitle_dates">2025 February - ongoing / in London / Series A startup</p> */}
            </div>

            <div
              className="section-image image-full about-mobile-image"
              onMouseEnter={() => coverVideoRef.current?.play()}
              onMouseLeave={() => {
                const v = coverVideoRef.current;
                if (v) {
                  v.pause();
                  v.currentTime = 0;
                }
              }}
            >
              <div className="video-hover-zoom">
                <img
                  src="/img/Kan/Cover.jpg"
                  alt="Kan project overview"
                  className="about-hero-image"
                />
              </div>
            </div>
          </section>

          <div className="section-with-image">
            <section id="context" className="content-section">
              <h2>Background</h2>
              <p>
              Kan is a Norwegian employee benefit service focused on improving financial health for individuals under financial stress, in a country with one of the highest household debt rates in Europe.  </p>
              <p>I joined after the launch of its repayment-focused MVP, as the product expanded into a broader financial wellbeing platform for all employees.
              </p>
            </section>
            <div className="section-image image-full">
            </div>
          </div>

          <div className="section-with-image">
            <section id="outcome" className="content-section">
              <h2>Outcome</h2>
              <p>
              I refined Kan’s core financial insights experience, expanding it from a static debt overview into a more actionable, personalized financial health product.
              
                The implementation was done in 3 steps:
              </p>
              <ul className="outcome-list">
                <div id="outcome-customer-portal">
                  <li>
                    <strong>Step 1 — Strengthening financial awareness:</strong> Redesigned the Debt Overview experience to give users a clearer understanding of their financial situation, introducing monthly spend goals and progress tracking to provide actionable awareness.
                  </li>

                  <div className="outcome-carousel">
                    <div className="outcome-carousel__main section-image image-large about-mobile-image">
                      <img
                        src={`/img/Scarlet/${ROTATING_IMAGES[rotatingImageIndex]}`}
                        alt="Scarlet project overview - Pre-submission stage"
                        className="about-hero-image"
                      />
                    </div>
                    <div className="outcome-carousel__thumbnails">
                      {ROTATING_IMAGES.map((filename, i) => (
                        <button
                          key={filename}
                          type="button"
                          className={`outcome-carousel__thumb ${i === rotatingImageIndex ? 'outcome-carousel__thumb--active' : ''}`}
                          onClick={() => setRotatingImageIndex(i)}
                          aria-label={`View image ${i + 1} of ${ROTATING_IMAGES.length}`}
                          aria-pressed={i === rotatingImageIndex}
                        >
                          <img src={`/img/Scarlet/${filename}`} alt="" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div id="outcome-assessor-workspace">
                  <li>
                    <strong>Step 2 — Improving data accuracy:</strong> Enhanced spending categorisation through Tink integration, an open banking provider, improving transaction accuracy and transparency</li>
                  <div className="outcome-carousel">
                    <div className="outcome-carousel__main section-image image-large about-mobile-image">
                      <img
                        src={`/img/Scarlet/${ROTATING_IMAGES_2[rotatingImageIndex2]}`}
                        alt="Scarlet project overview - Assessor workspace"
                        className="about-hero-image"
                      />
                    </div>
                    <div className="outcome-carousel__thumbnails">
                      {ROTATING_IMAGES_2.map((filename, i) => (
                        <button
                          key={filename}
                          type="button"
                          className={`outcome-carousel__thumb ${i === rotatingImageIndex2 ? 'outcome-carousel__thumb--active' : ''}`}
                          onClick={() => setRotatingImageIndex2(i)}
                          aria-label={`View image ${i + 1} of ${ROTATING_IMAGES_2.length}`}
                          aria-pressed={i === rotatingImageIndex2}
                        >
                          <img src={`/img/Scarlet/${filename}`} alt="" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div id="outcome-admin-workspace">
                  <li>
                    <strong>Step 3 — Enabling proactive financial planning:</strong> Introduced advanced budgeting support through an SIFO-based calculator, a Norwegian standard for estimating essential living costs, alongside contextual nudges and clearer guidance.
                  </li>
                  <div className="outcome-carousel">
                    <div className="outcome-carousel__main section-image image-large about-mobile-image">
                      <img
                        src={`/img/Scarlet/${ROTATING_IMAGES_3[rotatingImageIndex3]}`}
                        alt="Scarlet project overview - Admin workspace"
                        className="about-hero-image"
                      />
                    </div>
                    <div className="outcome-carousel__thumbnails">
                      {ROTATING_IMAGES_3.map((filename, i) => (
                        <button
                          key={filename}
                          type="button"
                          className={`outcome-carousel__thumb ${i === rotatingImageIndex3 ? 'outcome-carousel__thumb--active' : ''}`}
                          onClick={() => setRotatingImageIndex3(i)}
                          aria-label={`View image ${i + 1} of ${ROTATING_IMAGES_3.length}`}
                          aria-pressed={i === rotatingImageIndex3}
                        >
                          <img src={`/img/Scarlet/${filename}`} alt="" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ul>
            </section>
          </div>

          <div className="section-with-image">
            <section id="pain-points" className="content-section">
              <h2>Challenge</h2>
              <div className="pain-points-grid">
                <div id="pain-stigma-engagement" className="pain-point-card">
                  <div
                    className="grid-image image-full about-mobile-image"
                    onMouseEnter={() => challenge1VideoRef.current?.play()}
                    onMouseLeave={() => {
                      const v = challenge1VideoRef.current;
                      if (v) {
                        v.pause();
                        v.currentTime = 0;
                      }
                    }}
                  >
                    <div className="video-hover-zoom">
                      <video
                        ref={challenge1VideoRef}
                        src="/img/Scarlet/Challenge_1.mp4"
                        className="about-hero-image"
                        preload="auto"
                        muted
                        loop
                        playsInline
                        aria-label="Kan project - Stigma and low engagement"
                      />
                    </div>
                  </div>
                  <h3 className="pain-point-title">Stigma and low engagement around debt positioning</h3>
                  <p className="pain-point-description">
                    Although Kan was offered as a free employee benefit, <strong>its focus on debt repayment created negative connotations.</strong> Many users avoided the service altogether, resulting in low adoption and engagement.
                  </p>
                </div>

                <div id="pain-disposable-income" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/PP_2.jpg" alt="Kan project - Lack of clarity around disposable income" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Lack of clarity around disposable income</h3>
                  <p className="pain-point-description">
                    Both users with and without debt struggled to understand how much they could safely spend. The absence of <strong>a clear "guilt-free" spending view</strong> created ongoing financial stress and uncertainty.
                  </p>
                </div>

                <div id="pain-low-trust" className="pain-point-card">
                  <div
                    className="grid-image image-full about-mobile-image"
                    onMouseEnter={() => challengeVideoRef.current?.play()}
                    onMouseLeave={() => {
                      const v = challengeVideoRef.current;
                      if (v) {
                        v.pause();
                        v.currentTime = 0;
                      }
                    }}
                  >
                    <div className="video-hover-zoom">
                      <video
                        ref={challengeVideoRef}
                        src="/img/Scarlet/Challenge_3.mp4"
                        className="about-hero-image"
                        preload="auto"
                        muted
                        loop
                        playsInline
                        aria-label="Kan project - Low trust in financial insight tools"
                      />
                    </div>
                  </div>
                  <h3 className="pain-point-title">Low trust in financial insight tools</h3>
                  <p className="pain-point-description">
                    Existing financial services offered spending insights, but <strong>inaccurate categorisation and unclear logic reduced user trust.</strong> As a result, many users disengaged from insight-based features altogether.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="section-with-image">
            <section id="key-design" className="content-section">
              <h2>Design approach</h2>
              <div className="key-design-grid">
                <div id="key-actionable-insights" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/DD_1.jpg" alt="Kan project - Actionable, personalised financial insights" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Actionable, personalised financial insights</h3>
                  <p className="pain-point-description">
                    Designed insight cards that highlight the most important signals for each user—<strong>such as savings progress and disposable income</strong>—personalised through individual spend goals and category targets.
                  </p>
                </div>
                <div id="key-trusted-integrations" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/DD_2.jpg" alt="Kan project - Accurate guidance through trusted integrations" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Accurate guidance through trusted integrations</h3>
                  <p className="pain-point-description">
                    Integrated services like <strong>Tink (open banking) and the SIFO calculator (baseline living cost benchmark)</strong> to improve transaction categorisation and enable realistic budgeting support.
                  </p>
                </div>
                <div id="key-high-craft-design" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/DD_3.jpg" alt="Kan project - High-craft design for data-heavy experiences" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">High-craft design for data-heavy experiences</h3>
                  <p className="pain-point-description">
                    Focused on <strong>intuitive spend visualisations, consistent component systems, and clear hierarchy</strong> across insights and categories to make complex financial data easy to interpret.
                  </p>
                </div>

                <div id="key-user-control" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/DD_4.jpg" alt="Kan project - User control and transparency in spending data" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">User control and transparency in spending data</h3>
                  <p className="pain-point-description">
                    Enabled <strong>recategorisation and clearer breakdowns</strong> so users could understand and trust how their financial activity was represented.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="section-with-image">
            <section id="design-process" className="content-section">
              <h2>Process</h2>
              <div className="design-process-grid">
                <div className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/P_1.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Rapid iteration through design PRs</h3>
                  <p className="pain-point-description">
                    Designers contributed directly through GitHub pull requests, delivering small, high-impact improvements. <strong>Led by the design team, this cultural shift</strong> proved the value of vibe coding through incremental wins and fostered a more collaborative product-building culture.
                  </p>
                </div>
                <div className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <video src="/img/Scarlet/P_2.mp4" autoPlay muted loop playsInline className="about-hero-image" aria-label="Scarlet project - design craft and interactions" />
                  </div>
                  <h3 className="pain-point-title">Elevating digital craft with AI-assisted execution</h3>
                  <p className="pain-point-description">
                    To ensure a high-quality, premium experience, we implemented <strong>interaction details</strong>—such as banner interactions, and well-designed error states—through vibe coding and direct design PRs.
                  </p>
                </div>
                <div className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/P_3.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Grounding concrete decisions in real customer feedback</h3>
                  <p className="pain-point-description">
                    Since we had limited opportunities for proper user research, <strong>we partnered closely with Account Managers</strong> to gather concrete insights from ongoing customer interactions, keeping design decisions tied to real customer needs.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kan;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

const ROTATING_IMAGES = ['01-1.jpg', '01-2.jpg', '01-3.jpg', '01-4.jpg'];
const ROTATING_IMAGES_2 = ['02-4.jpg', '02-5.jpg', '02-6.jpg'];
const ROTATING_IMAGES_3 = ['03-1.jpg', '03-2.jpg', '03-3.jpg'];

const ProjectDetails: React.FC = () => {
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
        { id: 'outcome-customer-portal', label: 'Customer portal' },
        { id: 'outcome-assessor-workspace', label: 'Assessor workspace' },
        { id: 'outcome-admin-workspace', label: 'Admin workspace' }
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
    <div className="project-details-container">
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
              <h1>Scarlet</h1>
              <p className="subtitle">While working as a product designer at Scarlet, Europe's only notified body specialised in software medical devivce certification, 
                I owned the <strong>0→1 design of customer, assessor and admin workflows,</strong> replacing GitHub submissions with a fully productized certification experience</p>
              {/* <p className="subtitle_dates">
                2025 February - present, in London, UK
              </p> */}
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
                <video
                  ref={coverVideoRef}
                  src="/img/Scarlet/Cover.mp4"
                  className="about-hero-image"
                  preload="auto"
                  muted
                  loop
                  playsInline
                  aria-label="Scarlet project overview"
                />
              </div>
            </div>
          </section>

          <div className="section-with-image">
            <section id="context" className="content-section">
              <h2>Background</h2>
              <p>
              I joined Scarlet shortly after it completed a three-year accreditation process to become a notified body. <br/>At the time, <strong>certification workflows relied entirely on GitHub,</strong> with customers submitting regulatory evidence through repositories and assessors reviewing documents in branches. 
              </p>
            </section>
            <div className="section-image image-full">
            </div>
          </div>

          <div className="section-with-image">
            <section id="outcome" className="content-section">
              <h2>Outcome</h2>
              <p>
              We designed and delivered three platforms that support Scarlet's end-to-end certification workflow:
              </p>
              <ul className="outcome-list">
                <div id="outcome-customer-portal">
                  <li>
                    <strong>Customer portal</strong> a{'\u00A0'}<strong>submission space</strong>{'\u00A0'}where medical device manufacturers can submit their regulatory evidence, track their progress, and respond to findings across multiple rounds
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
                    <strong>Assessor workspace</strong> an <strong>internal tool used by Scarlet assessors</strong> to review customer's documentation, evaluate evidence against regulatory requirements, and raise findings
                  </li>
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
                    <strong>Admin workspace</strong> an operational interface that <strong>keeps a record of all certification activities</strong> to ensure Scarlet remains authorised as a notified body 
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
                <div id="pain-limited-visibility" className="pain-point-card">
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
                        aria-label="Scarlet project - Limited visibility into customer's documents"
                      />
                    </div>
                  </div>
                  <h3 className="pain-point-title">Limited visibility into customer's documents</h3>
                  <p className="pain-point-description">
                  Customers hesitated to upload evidence until it felt “perfect,” limiting our visibility into submission structures and making it <strong>harder to design for different documentation models</strong>
                  </p>
                </div>
                
                <div id="pain-user-research" className="pain-point-card">
                <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/PP_2.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Difficulty in user research</h3>
                  <p className="pain-point-description">
                    Our users - software and AI medical device manufacturers - are a <strong>highly niche group, and the regulatory dynamic</strong> between Scarlet often reduced openness in feedback. This made traditional user research very challenging.
                  </p>
                </div>
                
                <div id="pain-regulatory-evaluation" className="pain-point-card">
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
                        aria-label="Scarlet project - Regulatory evaluation at scale"
                      />
                    </div>
                  </div>
                  <h3 className="pain-point-title">Complex regulatory evaluation at scale</h3>
                  <p className="pain-point-description">
                    Assessors navigate <strong>100+ customer-specific core and supporting requirements,</strong> creating a workflow that is both highly structured and deeply complex.
                  </p>
                </div>
                
                <div id="pain-admin-workflows" className="pain-point-card">
                  <div
                    className="grid-image image-full about-mobile-image"
                    onMouseEnter={() => challenge4VideoRef.current?.play()}
                    onMouseLeave={() => {
                      const v = challenge4VideoRef.current;
                      if (v) {
                        v.pause();
                        v.currentTime = 0;
                      }
                    }}
                  >
                    <div className="video-hover-zoom">
                      <video
                        ref={challenge4VideoRef}
                        src="/img/Scarlet/Challenge_4.mp4"
                        className="about-hero-image"
                        preload="auto"
                        muted
                        loop
                        playsInline
                        aria-label="Scarlet project - Deprioritised admin workflows"
                      />
                    </div>
                  </div>
                  <h3 className="pain-point-title">Deprioritised admin workflows</h3>
                  <p className="pain-point-description">
                    Administrators need <strong>a thorough audit trail as Scarlet scaled into new regions and hardware,</strong> but these were often deprioritized behind customer and assessor-facing product work.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="section-with-image">
            <section id="key-design" className="content-section">
              <h2>Design approach</h2>
              <div className="key-design-grid">
                <div id="key-submission-playground" className="pain-point-card">
                <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/DD_1.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                </div>
                  <h3 className="pain-point-title">Clear distinction between submission and exploration</h3>
                  <p className="pain-point-description">
                    Kept the submission flow broad and flexible with accepting any evidence type, which was clearly separated from a "playground" space with <strong>an AI coverage checker.</strong> This checked customers' submission readiness based on requirements, and gave us a better understanding of their documentation model
                  </p>
                </div>
                <div id="key-customer-feedback" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                      <img src="/img/Scarlet/DD_2.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Customer feedback through real touchpoints</h3>
                  <p className="pain-point-description">
                    Collated feedback through natural customer interactions, <strong>vibe coding prototypes like the Scarlet Calculator</strong> that were used during sales calls to uncover customer needs and pain points. This tool allowed prospects to estimate certification timelines based on submission readiness.
                  </p>
                </div>
                <div id="key-atomic-evaluation" className="pain-point-card">
                <div className="grid-image image-full about-mobile-image">
                      <img src="/img/Scarlet/DD_3.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Atomic, scalable regulatory evaluation with contextual agent support</h3>
                  <p className="pain-point-description">
                  Structured assessment into requirement-level actions, enabling review of core and supporting requirements individually or in bulk, while layering in <strong>assessor agents</strong> that provide guidance tailored to each evaluator’s context.
                  </p>
                </div>
               
                <div id="key-vibe-prototypes" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                      <img src="/img/Scarlet/DD_4.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">Vibe-coded prototypes for admin workflows</h3>
                  <p className="pain-point-description">
                    With limited engineering bandwidth available for non-customer-facing work, we <strong>vibe-coded lightweight prototypes</strong> (e.g., an automated PDF certificate generator) to deliver small, high-impact wins and reduce manual admin effort.
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

export default ProjectDetails;

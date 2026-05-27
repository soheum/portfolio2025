import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectDetails.css';

const ROTATING_IMAGES = ['01-1.jpg', '01-2.jpg', '01-3.jpg', '01-4.jpg'];
const ROTATING_IMAGES_2 = ['02-4.jpg', '02-5.jpg', '02-6.jpg'];
const ROTATING_IMAGES_3 = ['03-1.jpg', '03-2.jpg', '03-3.jpg'];

interface ProjectDetailsProps {
  className?: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ className }) => {
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
      id: 'pain-points',
      label: 'Challenge',
      subsections: [
        { id: 'pain-limited-visibility', label: '1. Constraints in conducting user research' },
        { id: 'pain-user-research', label: '2. Designing AI tools under regulatory constraints' },
        { id: 'pain-regulatory-evaluation', label: '3. Scaling compliance with growing regulatory scope' },
        { id: 'pain-admin-workflows', label: '4. Complex regulatory evaluation at scale' }
      ]
    },
    {
      id: 'design-process',
      label: 'Process',
      subsections: [
        { id: 'process-customer-feedback', label: '1. Collated customer feedback through natural touch points' },
        { id: 'process-incremental-ai', label: '2. Incremental AI grounded in existing workflows' },
        { id: 'process-sme-collaboration', label: '3. Early collaboration with subject matter experts' },
        { id: 'process-flexible-interaction', label: '4. Flexible interaction for dense regulatory information' }
      ]
    },
    { 
      id: 'outcome', 
      label: 'Outcome',
      subsections: [
        { id: 'outcome-customer-portal', label: 'Customer portal' },
        { id: 'outcome-assessor-workspace', label: 'Assessor workspace' },
        { id: 'outcome-admin-workspace', label: 'Admin workspace' }
      ]
    },
    { id: 'key-design', label: 'Design process' }
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
          if (id.startsWith('outcome-') || id.startsWith('pain-') || id.startsWith('key-') || id.startsWith('process-')) {
            setActiveSubsection(id);
            // Also set the parent section active
            if (id.startsWith('outcome-')) setActiveSection('outcome');
            else if (id.startsWith('pain-')) setActiveSection('pain-points');
            else if (id.startsWith('key-')) setActiveSection('key-design');
            else if (id.startsWith('process-')) setActiveSection('design-process');
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
    <div className={`project-details-container ${className ?? ''}`.trim()}>
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
              <img src="/logo/scarlet_logo.svg" alt="Scarlet" className="hero-logo" />
              <div className="subtitle-container">
                <p className="subtitle">Redefining medical regulation through</p>
                <p className="subtitle subtitle-highlight">
                  {Array.from('a digital-first, AI-assisted platform').map((char, index) => (
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
              <p style={{ color: '#ffffff' }}>
              0 → 1 product design and development, challenging how regulation can be a driver of innovation. Founding design work at an early stage startup, defining core user experience and design direction with 10+ product team.
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
              I joined Scarlet shortly after it completed a three-year accreditation process to become a notified body. At the time, <strong>certification workflows relied entirely on GitHub,</strong> with customers submitting regulatory evidence through repositories and assessors reviewing documents in branches. 
              This setup made it clear that a dedicated, user-friendly web platform was needed.
              </p>
            </section>
            <div className="section-image image-full">
            </div>
          </div>

          <div className="section-with-image">
            <section id="pain-points" className="content-section">
              <h2>Challenge</h2>
              <p>
                While the limitations of the GitHub setup were clear, transitioning to a web-based platform introduced a new set of challenges.
              </p>
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
                  <h3 className="pain-point-title">1. Constraints in conducting user research</h3>
                  <p className="pain-point-description">
                    Access to reliable user insights was limited in the early stages. Our initial customers (fewer than 20) were all busy preparing submissions, and even when we arranged research sessions, customers were not giving candid feedback because of the regulatory dynamic. It was also difficult to recruit external users since our customer base is very niche: software and AI medical device manufacturers.
                  </p>
                </div>
                
                <div id="pain-user-research" className="pain-point-card">
                <div className="grid-image image-full about-mobile-image">
                    <img src="/img/Scarlet/PP_2.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">2. Designing AI tools under regulatory constraints</h3>
                  <p className="pain-point-description">
                    We identified strong opportunities for AI in customer workflows with repetitive documentation. However, as a notified body, we had to operate within strict boundaries to maintain impartiality. We had to ensure that no implicit or explicit gap analysis was provided before the official review of customer documentation.
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
                  <h3 className="pain-point-title">3. Scaling compliance with growing regulatory scope</h3>
                  <p className="pain-point-description">
                    As Scarlet expanded into new regions and device types, such as hardware, we needed to maintain a comprehensive audit trail of all activities while ensuring the system remained scalable and manageable.
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
                  <h3 className="pain-point-title">4. Complex regulatory evaluation at scale</h3>
                  <p className="pain-point-description">
                    Assessors had to navigate 100+ customer-specific requirements per case, each carrying dense regulatory context. This made assessments cognitively demanding, with evaluation workflows that were difficult to navigate.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="section-with-image">
            <section id="design-process" className="content-section">
              <h2>Process</h2>
              <div className="design-process-grid">
                <div id="process-customer-feedback" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                      <img src="/img/Scarlet/P_1.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">1. Collated customer feedback through natural touch points</h3>
                  <p className="pain-point-description">
                    Instead of relying on traditional interviews, we embedded feedback into real customer interactions by creating lightweight artifacts. For example, we built a "Scarlet Calculator" used in sales conversations to visualise certification timelines, helping prospects understand the offering while surfacing their pain points. Although not yet customers, these users provided valuable insights into real submission workflows without requiring formal research sessions.
                  </p>
                </div>
                <div id="process-incremental-ai" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                    <video src="/img/Scarlet/P_2.mp4" autoPlay muted loop playsInline className="about-hero-image" aria-label="Scarlet project - design craft and interactions" />
                  </div>
                  <h3 className="pain-point-title">2. Incremental AI grounded in existing workflows</h3>
                  <p className="pain-point-description">
                    We introduced AI through small, incremental features rather than building complex solutions upfront. We focused on augmenting, not replacing, customers' existing behaviour. We started with a simple prompt-copy feature, allowing users to reuse structured prompts in their own LLM tools. This informed the development of a coverage checker, which shifted the focus from evaluating quality to validating completeness by checking whether required content was present based on our existing knowledge base. This approach allowed us to deliver practical value while staying within strict regulatory constraints.
                  </p>
                </div>
                <div id="process-sme-collaboration" className="pain-point-card">
                  <div className="grid-image image-full about-mobile-image">
                      <img src="/img/Scarlet/P_3.jpg" alt="Scarlet project overview - Pre-submission stage" className="about-hero-image" />
                  </div>
                  <h3 className="pain-point-title">3. Early collaboration with subject matter experts</h3>
                  <p className="pain-point-description">
                    We worked closely with compliance and engineering from the beginning, expanding design into a cross-functional role that aligned stakeholder needs. As engineers shaped new data models, we designed interfaces directly on top of these structures, building lightweight prototypes to explore solutions within clear regulatory and technical boundaries.
                  </p>
                </div>
                <div id="process-flexible-interaction" className="pain-point-card pain-point-card--text-only">
                  <h3 className="pain-point-title">4. Flexible interaction for dense regulatory information</h3>
                  <p className="pain-point-description">
                    Designed adaptable layouts and bulk actions to manage high information density, allowing assessors to navigate and act on requirements efficiently. Through rapid vibe-coded iterations, with less than 2 weeks turnaround time, we refined interaction details to support different workflows.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="section-with-image">
            <section id="outcome" className="content-section">
              <h2>Outcome</h2>
              <p>
              We designed and delivered three platforms that support Scarlet's end-to-end certification workflow:
              <br/>
              <span className="outcome-note">
                *This end-to-end experience is still actively evolving as we iterate it day by day.
              </span>
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
            <section id="key-design" className="content-section">
              <h2>Design process</h2>
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
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;

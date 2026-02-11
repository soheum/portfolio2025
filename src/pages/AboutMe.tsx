import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectDetails.css';
import './AboutMe.css';

type AboutSectionId = 'more-about-me' | 'speaking' | 'outside-of-design';

const AboutMe: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<AboutSectionId>('more-about-me');
  const [showSection2, setShowSection2] = useState(false);
  const [showSection3, setShowSection3] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const scrollCountRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll container to top on mount
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    // Trigger load animation
    setIsLoaded(true);
  }, []);

  // Wheel listener: reveal/hide sections progressively on scroll up/down
  useEffect(() => {
    let lastWheelTime = 0;
    const container = containerRef.current;
    
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      
      // Debounce: only process if 1200ms has passed since last wheel event
      if (now - lastWheelTime < 1200) return;
      lastWheelTime = now;

      const isScrollingDown = e.deltaY > 0;

      if (isScrollingDown) {
        // Scrolling down: reveal next section
        if (scrollCountRef.current === 0) {
          scrollCountRef.current = 1;
          setShowSection2(true);
          setActiveSection('speaking');
        } else if (scrollCountRef.current === 1) {
          scrollCountRef.current = 2;
          setShowSection3(true);
          setActiveSection('outside-of-design');
        }
      } else {
        // Scrolling up: hide current section
        if (scrollCountRef.current === 2) {
          scrollCountRef.current = 1;
          setShowSection3(false);
          setActiveSection('speaking');
        } else if (scrollCountRef.current === 1) {
          scrollCountRef.current = 0;
          setShowSection2(false);
          setActiveSection('more-about-me');
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div ref={containerRef} className="about-me project-details-container">
      <div className="project-grid">
        <nav className={`side-navigation ${isLoaded ? 'side-navigation--loaded' : ''}`}>
          <button type="button" className="back-button" onClick={() => navigate('/')}>
            Previous
          </button>
          <div className="nav-sections">
            <button type="button" className={`nav-item ${activeSection === 'more-about-me' ? 'active' : ''}`}>
              More about me
            </button>
            <button type="button" className={`nav-item ${activeSection === 'speaking' ? 'active' : ''}`}>
              Speaking
            </button>
            <button type="button" className={`nav-item ${activeSection === 'outside-of-design' ? 'active' : ''}`}>
              Outside of design
            </button>
          </div>
        </nav>

        <div className="text-content">
          <div className={`about-me-content ${isLoaded ? 'about-me-content--loaded' : ''}`}>
            <p className="about-me__text">
              I'm drawn to domains where <span className="about-me__text-muted">sharing personal data enables more meaningful experiences</span> in people's lives. 
            </p>
            <p className="about-me__text">
              These complex, data-heavy environments require complex systems to be <span className="">translated into clear, impactful user experiences</span>. 
            </p>
            <p className="about-me__text">
              My work centers on designing and evolving digital products in these spaces, with a particular strength in <span className="">aligning user needs with clear business strategy</span>.
            </p>
            {!showSection2 && isLoaded && (
              <p className="about-me__scroll-hint">Scroll down</p>
            )}
            <p className={`about-me__text ${!showSection2 ? 'about-me__text--hidden' : ''}`}>
              I'm passionate about sharing the hands-on experiences I've gained throughout my career. I was fortunate to present this work to a global audience at conferences such as{' '}
              <a 
                href="https://uxhealthcare.co/rotterdam-2026-speakers/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="about-me__link about-me__link--glow"
              >
                {Array.from('UX Healthcare 2026').map((char, index) => (
                  <span
                    key={index}
                    className="about-me__link-char"
                    style={{ ['--char-index' as string]: index } as React.CSSProperties}
                  >
                    {char}
                  </span>
                ))}
              </a>.
            </p> 
            <p className={`about-me__text ${!showSection2 ? 'about-me__text--hidden' : ''}`}>
              This year, I aim to continue expanding my influence as a designer by contributing insights and learnings to the broader design community.
            </p>
            {showSection2 && !showSection3 && (
              <p className="about-me__scroll-hint">Scroll down</p>
            )}
            <p className={`about-me__text ${!showSection3 ? 'about-me__text--hidden' : ''}`}>
              Outside of design, you can find me in front of a pottery wheel, crafting outside of digital screens in North London.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;

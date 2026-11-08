import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TypewriterText from '../components/TypewriterText';
import './HomePage.css';
import './ProjectsPage.css';
import './ContactPage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Playground', path: '/playground' },
  { label: 'Contact', path: '/contact' },
];

const LANDING_TITLE = 'Say hello!';
const REVEAL_PAUSE_MS = 500;

const ContactSwapTitle: React.FC<{
  title: string;
  hoverTitle?: string;
  active: boolean;
}> = ({ title, hoverTitle, active }) => {
  if (!hoverTitle) {
    return <span className="projects-bullet__title">{title}</span>;
  }

  const titleChars = Array.from(title);
  const hoverChars = Array.from(hoverTitle);

  return (
    <span
      className={`contact-swap-title projects-bullet__title${active ? ' contact-swap-title--active' : ''}`}
      aria-label={active ? hoverTitle : title}
    >
      <span className="contact-swap-title__sizer" aria-hidden="true">
        {hoverTitle.length >= title.length ? hoverTitle : title}
      </span>
      <span className="contact-swap-title__layer contact-swap-title__layer--default" aria-hidden="true">
        {titleChars.map((char, i) => (
          <span
            key={`default-${i}`}
            className="contact-swap-title__char"
            style={{
              ['--char-index' as string]: i,
              ['--char-count' as string]: titleChars.length,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
      <span className="contact-swap-title__layer contact-swap-title__layer--hover" aria-hidden="true">
        {hoverChars.map((char, i) => (
          <span
            key={`hover-${i}`}
            className="contact-swap-title__char"
            style={{
              ['--char-index' as string]: i,
              ['--char-count' as string]: hoverChars.length,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </span>
  );
};

const CONTACT_LINKS: {
  index: number;
  title: string;
  href: string;
  hoverTitle?: string;
}[] = [
  {
    index: 1,
    title: 'Email',
    href: 'mailto:sohheum@gmail.com',
    hoverTitle: 'sohheum@gmail.com',
  },
  {
    index: 2,
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/in/so-heum-hwang/',
    hoverTitle: 'https://www.linkedin.com/in/so-heum-hwang/',
  },
  { index: 3, title: 'CV', href: '/files/CV.pdf', hoverTitle: 'Download PDF' },
  { index: 4, title: 'Are.na', href: 'https://www.are.na/soheum-hwang', hoverTitle: 'Browse my collection' },
];

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [typingComplete, setTypingComplete] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<number | null>(null);
  const [checkedLinks, setCheckedLinks] = useState<Set<number>>(() => new Set());
  const revealDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (revealDelayRef.current) clearTimeout(revealDelayRef.current);
  }, []);

  const handleTypingComplete = useCallback(() => {
    revealDelayRef.current = setTimeout(() => {
      setTypingComplete(true);
      revealDelayRef.current = null;
    }, REVEAL_PAUSE_MS);
  }, []);

  const handleContactClick = (index: number, href: string) => {
    setCheckedLinks((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });

    if (href.startsWith('mailto:')) {
      window.location.href = href;
      return;
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const toggleChecked = (index: number) => {
    setCheckedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
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
          onMouseLeave={() => setHoveredLink(null)}
        >
          {CONTACT_LINKS.map(({ index, title, href, hoverTitle }) => {
            const isChecked = checkedLinks.has(index);
            const isHovered = hoveredLink === index;
            return (
              <li
                key={index}
                className={`home-bullet projects-bullet projects-bullet--linked contact-bullet${isHovered ? ' projects-bullet--active' : ''}${isChecked ? ' contact-bullet--checked' : ''}`}
                onMouseEnter={() => setHoveredLink(index)}
                onMouseLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  setHoveredLink(null);
                  (e.currentTarget as HTMLLIElement).blur();
                }}
              >
                <button
                  type="button"
                  className={`contact-checkbox${isChecked ? ' contact-checkbox--checked' : ''}`}
                  aria-checked={isChecked}
                  aria-label={`${isChecked ? 'Uncheck' : 'Check'} ${title}`}
                  role="checkbox"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChecked(index);
                  }}
                />
                <div
                  className="projects-bullet__content contact-bullet__link"
                  onClick={() => handleContactClick(index, href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleContactClick(index, href);
                    }
                  }}
                  role="link"
                  tabIndex={0}
                >
                  <ContactSwapTitle title={title} hoverTitle={hoverTitle} active={isHovered} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

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

export default ContactPage;

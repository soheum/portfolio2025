import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TypedText from './TypedText';
import './SiteFooter.css';

const DEFAULT_GRADIENT_RADIUS = '420px';
const DEFAULT_GRADIENT_DEPTH = '70%';
const DEFAULT_GRADIENT_INNER = '#191919';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const mixHexGray = (amount: number) => {
  const channel = Math.round(clamp(amount, 0, 1) * 25);
  const hex = channel.toString(16).padStart(2, '0');
  return `#${hex}${hex}${hex}`;
};

export type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const FOOTER_SOCIAL_LINKS: FooterLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/so-heum-hwang/', external: true },
  { label: 'Instagram', href: 'https://www.instagram.com/iso_heum/', external: true },
  { label: 'Threads', href: 'https://www.threads.com/@sohmnm', external: true },
  { label: 'CV', href: '/files/CV_0609.pdf', external: true },
];

export const FOOTER_NAV_LINKS: FooterLink[] = [
  { label: 'Book a chat', href: 'https://calendar.app.google/7x5XsooUtPywBzpA9' },
  { label: 'Email', href: 'mailto:sohheum@gmail.com' },
];

const FooterLinkItem: React.FC<{ link: FooterLink }> = ({ link }) => {
  const className = 'site-footer__link';

  if (link.external || link.href.startsWith('http') || link.href.startsWith('mailto:')) {
    return (
      <a
        className={className}
        href={link.href}
        {...(link.external || link.href.startsWith('http')
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link className={className} to={link.href}>
      {link.label}
    </Link>
  );
};

const SiteFooter: React.FC = () => {
  const footerRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const [showPronunciation, setShowPronunciation] = useState(false);

  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShowPronunciation(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );

    observer.observe(headline);
    return () => observer.disconnect();
  }, []);

  const updateGradientFromCursor = (clientX: number) => {
    const footer = footerRef.current;
    if (!footer) return;

    const rect = footer.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const focus = 1 - Math.abs(x - 50) / 50;

    const radius = 280 + focus * 280;
    const depth = 52 + focus * 30;
    const inner = mixHexGray(0.35 + focus * 0.65);

    footer.style.setProperty('--gradient-radius', `${radius}px`);
    footer.style.setProperty('--gradient-depth', `${depth}%`);
    footer.style.setProperty('--gradient-inner', inner);
  };

  const resetGradient = () => {
    const footer = footerRef.current;
    if (!footer) return;

    footer.style.setProperty('--gradient-radius', DEFAULT_GRADIENT_RADIUS);
    footer.style.setProperty('--gradient-depth', DEFAULT_GRADIENT_DEPTH);
    footer.style.setProperty('--gradient-inner', DEFAULT_GRADIENT_INNER);
  };

  return (
  <footer
    ref={footerRef}
    className="site-footer"
    aria-label="Site footer"
    onMouseMove={(e) => updateGradientFromCursor(e.clientX)}
    onMouseLeave={resetGradient}
  >
    <div className="project-landing-inner">
      <div className="project-landing-col project-landing-col--headline">
        <div ref={headlineRef} className="site-footer__headline">
          <span className="site-footer__name">Soheum Hwang</span>
          {showPronunciation && (
            <span className="site-footer__pronunciation">
              <TypedText text="/so? hmmm.../" charDelay={35} pauseAfterIndex={3} pauseDuration={1000} />
            </span>
          )}
        </div>
      </div>

      <div className="project-landing-col project-landing-col--body">
        <ul className="site-footer__list">
          {FOOTER_SOCIAL_LINKS.map((link) => (
            <li key={link.label}>
              <FooterLinkItem link={link} />
            </li>
          ))}
        </ul>
      </div>

      <div className="project-landing-col project-landing-col--meta">
        <ul className="site-footer__list">
          {FOOTER_NAV_LINKS.map((link) => (
            <li key={link.label}>
              <FooterLinkItem link={link} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  </footer>
  );
};

export default SiteFooter;

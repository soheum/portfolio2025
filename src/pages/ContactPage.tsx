import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SkyTimeline from '../components/SkyTimeline';
import { fetchLondonSunTimes, formatLondonTime } from '../utils/londonSky';
import './HomePage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Playground', path: '/playground' },
  { label: 'Contact', path: '/contact' },
];

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [now, setNow] = useState(() => new Date());
  const [sunrise, setSunrise] = useState<Date | null>(null);
  const [sunset, setSunset] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();

    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadSunTimes = async () => {
      try {
        const times = await fetchLondonSunTimes();
        if (!cancelled) {
          setSunrise(times.sunrise);
          setSunset(times.sunset);
        }
      } catch {
        if (!cancelled) {
          setSunrise(null);
          setSunset(null);
        }
      }
    };

    loadSunTimes();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title__name">It is {formatLondonTime(now)} here in London.</h1>
        <p className="home-bullet" style={{ margin: 0 }}>
          If you want to chat more, send me an email at{' '}
          <a href="mailto:sohheum@gmail.com" style={{ color: '#ffffff', textDecoration: 'none' }}>
            sohheum@gmail.com
          </a>
        </p>
        <p className="home-bullet" style={{ margin: 0 }}>
          or connect with me on{' '}
        <a href="https://www.linkedin.com/in/so-heum-hwang/" style={{ color: '#ffffff', textDecoration: 'none' }}>
          LinkedIn
        </a>
        </p>
      </div>

      <SkyTimeline now={now} sunrise={sunrise} sunset={sunset} />

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

export default ContactPage;

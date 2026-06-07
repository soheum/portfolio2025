import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomePage.css';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Contact', path: '/contact' },
];

function formatLondonTime(date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .toLowerCase();
}

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [londonTime, setLondonTime] = useState(() => formatLondonTime());

  useEffect(() => {
    const update = () => setLondonTime(formatLondonTime());
    update();

    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title__name">It is {londonTime} here in London.</h1>
        <p className="home-bullet" style={{ margin: 5 }}>
          If you want to chat more, send me an email at:{' '}
          <a href="mailto:sohheum@gmail.com" style={{ color: '#a3a3a3', textDecoration: 'none' }}>
            sohheum@gmail.com
          </a>
        </p>
          or connect with me on {' '}
          <a href="https://www.linkedin.com/in/so-heum-hwang/" style={{ color: '#a3a3a3', textDecoration: 'none' }}>
            LinkedIn:
          </a>
      </div>

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

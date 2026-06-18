import React from 'react';
import { useLocation } from 'react-router-dom';
import SiteFooter from './SiteFooter';

const LANDING_PATHS = new Set(['/', '/projects', '/playground', '/contact']);

interface SiteLayoutProps {
  children: React.ReactNode;
}

const SiteLayout: React.FC<SiteLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const showFooter = !LANDING_PATHS.has(pathname);

  return (
    <>
      {children}
      {showFooter && <SiteFooter />}
    </>
  );
};

export default SiteLayout;

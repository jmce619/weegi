// pages/_app.tsx
import type { AppProps } from 'next/app';
// components/Maintenance.tsx
import React from 'react';

const Maintenance: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f2f2f2' }}>
      <h1>We'll be back soon!</h1>
      <p>Our site is currently undergoing scheduled maintenance. Thank you for your patience.</p>
    </div>
  );
};



function MyApp({ Component, pageProps }: AppProps) {
  // Check an environment variable (make sure it's available at build time)
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  if (maintenanceMode) {
    return <Maintenance />;
  }

  return <Component {...pageProps} />;
}

export default MyApp;
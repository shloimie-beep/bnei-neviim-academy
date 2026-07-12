import React from 'react';
import { oneTimeLandingAssets } from '../oneTimeLandingAssets';
import { oneTimeLandingContent } from '../oneTimeLandingContent';

export function LandingHeader({ onSignup }: { onSignup: () => void }) {
  return (
    <header className="site-header">
      <a href="/one-time" aria-label="One Time Mishnayos home">
        <img src={oneTimeLandingAssets.brandLogo.src} alt={oneTimeLandingAssets.brandLogo.alt} />
      </a>
      <nav aria-label="One Time page sections">
        {oneTimeLandingContent.navigation.map((item) => (
          <a key={item.href} href={item.href}>{item.label}</a>
        ))}
      </nav>
      <a href="/rabbi-member">Member Login</a>
      <button type="button" onClick={onSignup}>Sign Up Now</button>
    </header>
  );
}

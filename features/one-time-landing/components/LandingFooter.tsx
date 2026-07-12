import React from 'react';
import { oneTimeLandingAssets } from '../oneTimeLandingAssets';
import { oneTimeLandingContent } from '../oneTimeLandingContent';

export function LandingFooter() {
  return (
    <footer>
      <img src={oneTimeLandingAssets.brandLogo.src} alt={oneTimeLandingAssets.brandLogo.alt} />
      <p>{oneTimeLandingContent.footer.copy}</p>
      <nav aria-label="Footer">
        {oneTimeLandingContent.footer.links.map((link) => (
          <a key={link.href} href={link.href}>{link.label}</a>
        ))}
      </nav>
    </footer>
  );
}

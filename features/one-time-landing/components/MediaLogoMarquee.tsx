import React from 'react';
import { oneTimeLandingAssets } from '../oneTimeLandingAssets';

export function MediaLogoMarquee() {
  const logos = oneTimeLandingAssets.pressLogos;
  return (
    <div className="press-band" aria-label="As seen across the Jewish world">
      {[...logos, ...logos].map((logo, index) => (
        <span className="press-logo" key={`${logo.src}-${index}`} aria-hidden={index >= logos.length}>
          <img src={logo.src} alt={index >= logos.length ? '' : logo.alt} />
        </span>
      ))}
    </div>
  );
}

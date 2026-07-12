import React from 'react';
import { oneTimeLandingContent } from '../oneTimeLandingContent';

export function HeroSection({ onSignup }: { onSignup: () => void }) {
  const { hero } = oneTimeLandingContent;
  return (
    <section className="hero" aria-labelledby="heroTitle">
      <p className="eyebrow">{hero.eyebrow}</p>
      <h1 id="heroTitle">{hero.headline}</h1>
      <p>{hero.copy}</p>
      <button type="button" onClick={onSignup}>Sign Up Now</button>
      <div aria-label="One Time Mishnayos highlights">
        {hero.proof.map(([title, copy]) => (
          <article key={title}>
            <strong>{title}</strong>
            <span>{copy}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

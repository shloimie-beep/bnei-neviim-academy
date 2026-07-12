import React from 'react';
import { oneTimeLandingContent } from '../oneTimeLandingContent';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" aria-labelledby="howTitle">
      <h2 id="howTitle">Simple enough to start. Strong enough to keep going.</h2>
      {oneTimeLandingContent.steps.map(([title, copy]) => (
        <article key={title}>
          <h3>{title}</h3>
          <p>{copy}</p>
        </article>
      ))}
    </section>
  );
}

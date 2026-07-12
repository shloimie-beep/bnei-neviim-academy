import React from 'react';
import { oneTimeLandingContent } from '../oneTimeLandingContent';

export function BenefitsGrid() {
  return (
    <section id="receive" aria-labelledby="receiveTitle">
      <h2 id="receiveTitle">A complete learning experience for home or school.</h2>
      {oneTimeLandingContent.benefits.map(([title, copy]) => (
        <article key={title}>
          <h3>{title}</h3>
          <p>{copy}</p>
        </article>
      ))}
    </section>
  );
}

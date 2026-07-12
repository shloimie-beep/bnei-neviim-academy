import React from 'react';
import { oneTimeLandingContent } from '../oneTimeLandingContent';

export function OutcomesSection() {
  return (
    <section id="gain" aria-labelledby="gainTitle">
      <h2 id="gainTitle">Not just another class. A new relationship with learning.</h2>
      {oneTimeLandingContent.outcomes.map((item) => (
        <article key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.copy}</p>
        </article>
      ))}
    </section>
  );
}

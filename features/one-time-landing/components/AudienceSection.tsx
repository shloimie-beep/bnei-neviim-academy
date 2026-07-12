import React from 'react';
import { oneTimeLandingContent } from '../oneTimeLandingContent';

export function AudienceSection({ onSignup }: { onSignup: () => void }) {
  return (
    <section id="who" aria-labelledby="whoTitle">
      <h2 id="whoTitle">For parents and schools who want boys to love learning.</h2>
      <button type="button" onClick={onSignup}>Sign Up Now</button>
      {oneTimeLandingContent.audiences.map(([title, copy]) => (
        <article key={title}>
          <h3>{title}</h3>
          <p>{copy}</p>
        </article>
      ))}
    </section>
  );
}

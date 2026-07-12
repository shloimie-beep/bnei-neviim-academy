import React from 'react';
import { oneTimeLandingAssets } from '../oneTimeLandingAssets';
import { oneTimeLandingContent } from '../oneTimeLandingContent';

export function RabbiProfileSection() {
  const { rabbi } = oneTimeLandingContent;
  return (
    <section id="rabbi" aria-labelledby="rabbiTitle">
      <p className="eyebrow">{rabbi.eyebrow}</p>
      <h2 id="rabbiTitle">{rabbi.headline}</h2>
      <p>{rabbi.lead}</p>
      {rabbi.body.map((copy) => <p key={copy}>{copy}</p>)}
      <img src={oneTimeLandingAssets.rabbiPortrait.src} alt={oneTimeLandingAssets.rabbiPortrait.alt} />
    </section>
  );
}

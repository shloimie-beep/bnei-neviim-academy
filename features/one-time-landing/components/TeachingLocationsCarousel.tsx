import React from 'react';
import { oneTimeLandingAssets } from '../oneTimeLandingAssets';

export function TeachingLocationsCarousel() {
  return (
    <section id="teaching" aria-labelledby="teachingTitle">
      <h2 id="teachingTitle">A class that feels alive before the first Mishnah begins.</h2>
      <div data-carousel>
        {oneTimeLandingAssets.teachingSlides.map((slide) => (
          <figure key={slide.slug}>
            <div role="img" aria-label={`Replacement-ready visual slot for ${slide.title}`} />
            <figcaption>
              <span>Verified photo slot</span>
              <strong>{slide.title}</strong>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

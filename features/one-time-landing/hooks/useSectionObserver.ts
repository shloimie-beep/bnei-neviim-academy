import { useEffect, useState } from 'react';

export function useSectionObserver(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] || '');

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-35% 0px -55% 0px' });

    sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node))
      .forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeSection;
}

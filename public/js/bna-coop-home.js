(() => {
  "use strict";
  const brand = document.querySelector(".brand");
  if (brand instanceof HTMLAnchorElement && document.documentElement.lang === "he") brand.href = "/he";
  const menu = document.querySelector(".nav-disclosure");
  if (!(menu instanceof HTMLDetailsElement)) return;
  const viewport = window.matchMedia("(max-width: 780px)");
  const adjust = () => { menu.open = !viewport.matches; };
  viewport.addEventListener("change", adjust);
  adjust();
})();

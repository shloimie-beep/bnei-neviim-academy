'use strict';

(() => {
  const locale = document.documentElement.lang === 'he' ? 'he' : 'en';
  const form = document.querySelector('[data-library-filters]');
  if (form) {
    const search = form.elements.q, topic = form.elements.topic;
    const cards = [...document.querySelectorAll('[data-article-card]')];
    const count = document.querySelector('[data-result-count]');
    const empty = document.querySelector('[data-empty-articles]');
    function apply(writeUrl = false) {
      const needle = search.value.trim().toLocaleLowerCase();
      let found = 0;
      cards.forEach(card => {
        card.hidden = Boolean(topic.value && card.dataset.topic !== topic.value || needle && !card.dataset.search.includes(needle));
        if (!card.hidden) found++;
      });
      count.textContent = found + (locale === 'he' ? ' מאמרים' : ' articles');
      empty.hidden = found > 0;
      if (writeUrl) {
        const url = new URL(location.href);
        for (const [key, value] of [['q', search.value.trim()], ['topic', topic.value]]) value ? url.searchParams.set(key, value) : url.searchParams.delete(key);
        if (url.href !== location.href) history.pushState(null, '', url.pathname + url.search + url.hash);
      }
    }
    let searchTimer;
    search.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => apply(true), 220); });
    topic.addEventListener('change', () => { clearTimeout(searchTimer); apply(true); });
    form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(searchTimer); apply(true); });
    document.querySelectorAll('[data-clear-filters]').forEach(link => link.addEventListener('click', event => {
      event.preventDefault(); clearTimeout(searchTimer); search.value = ''; topic.value = ''; apply(true); search.focus();
    }));
    addEventListener('popstate', () => { clearTimeout(searchTimer); const params = new URL(location.href).searchParams; search.value = (params.get('q') || '').slice(0, 160); topic.value = params.get('topic') || ''; apply(); });
    apply();
  }

  async function copyUrl(row) {
    const status = row.querySelector('[data-share-status]'), fallback = row.querySelector('.copy-fallback');
    status.textContent = '';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(row.dataset.canonical);
      fallback.hidden = true;
      status.textContent = status.dataset.copied;
    } catch {
      fallback.hidden = false;
      status.textContent = status.dataset.fallback;
      const input = fallback.querySelector('input'); input.focus(); input.select();
    }
  }
  document.querySelectorAll('[data-article-share]').forEach(row => {
    row.querySelector('[data-copy-link]').addEventListener('click', () => copyUrl(row));
    row.querySelector('[data-native-share]').addEventListener('click', async () => {
      if (!navigator.share) return copyUrl(row);
      try {
        await navigator.share({ title: row.dataset.title, url: row.dataset.canonical });
        row.querySelector('[data-share-status]').textContent = '';
      } catch (error) {
        if (error?.name !== 'AbortError') await copyUrl(row);
      }
    });
  });

  function openQuestion() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (target?.matches('details.faq-item')) { target.open = true; target.scrollIntoView({ block: 'start' }); }
  }
  openQuestion(); addEventListener('hashchange', openQuestion);
  document.querySelectorAll('.mobile-menu').forEach(menu => {
    menu.addEventListener('keydown', event => { if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); } });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  });
})();

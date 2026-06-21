(function () {
  const STYLE_ID = 'one-time-single-tenant-style';
  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body.one-time-single-tenant [data-student-topbar-accountability],
      body.one-time-single-tenant [data-parent-accountability-onboarding],
      body.one-time-single-tenant .student-helper-button[onclick*="'bot'"],
      body.one-time-single-tenant .student-helper-button[onclick*="bot"],
      body.one-time-single-tenant [data-section-id="bot"],
      body.one-time-single-tenant [data-module-key="student_bot"],
      body.one-time-single-tenant [data-module-key="accountability"],
      body.one-time-single-tenant [data-bna-accountability],
      body.one-time-single-tenant [data-bna-student-bot] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  function applyConfig(config) {
    if (!config || config.app_instance !== 'onetime') return;
    document.body.classList.add('one-time-single-tenant');
    document.documentElement.dataset.appInstance = 'onetime';
    document.documentElement.dataset.defaultWorkspaceKey = config.workspace_key || 'rabbi_sheller_provider';
    document.documentElement.dataset.defaultProjectKey = config.project_key || 'one_time_mishnah_class';
    if (config.student_bot_enabled === false || config.bna_accountability_enabled === false) installStyle();
    window.__ONE_TIME_SINGLE_TENANT__ = config;
  }
  async function load() {
    try {
      const response = await fetch('/api/one-time/instance-config', { credentials: 'same-origin' });
      if (!response.ok) return;
      applyConfig(await response.json());
    } catch {
      // Static pages remain usable if the readiness endpoint is unavailable.
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true });
  } else {
    load();
  }
})();

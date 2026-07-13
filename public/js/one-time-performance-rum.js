(function () {
  'use strict';

  var path = window.location.pathname || '/';
  var search = window.location.search || '';
  var host = window.location.hostname || '';
  var isOneTimeRoute = host.indexOf('onetimeonetime.com') >= 0 ||
    path.indexOf('/one-time') === 0 ||
    path.indexOf('/provider') === 0 && /(?:admin_provider|review)=one-time/i.test(search) ||
    path.indexOf('/operations') === 0 && /workspace=rabbi_sheller_provider/i.test(search);

  if (!isOneTimeRoute || !window.performance || !window.JSON) return;

  var lcp = 0;
  var cls = 0;
  var longTaskTotal = 0;
  var startedAt = performance.now();
  var lastRouteStartedAt = startedAt;
  var sentKeys = Object.create(null);
  var transitionCount = 0;

  function observe(type, handler) {
    if (!('PerformanceObserver' in window)) return;
    try {
      var observer = new PerformanceObserver(function (list) {
        list.getEntries().forEach(handler);
      });
      observer.observe({ type: type, buffered: true });
    } catch (error) {
      // Browser support varies; missing RUM sub-metrics should not break the page.
    }
  }

  observe('largest-contentful-paint', function (entry) {
    lcp = Math.max(lcp, entry.startTime || 0);
  });
  observe('layout-shift', function (entry) {
    if (!entry.hadRecentInput) cls += entry.value || 0;
  });
  observe('longtask', function (entry) {
    longTaskTotal += entry.duration || 0;
  });

  function routeId() {
    var currentPath = window.location.pathname || '/';
    var currentSearch = window.location.search || '';
    if (currentPath.indexOf('/one-time') === 0) return 'public-landing';
    if (/view=contacts|section=crm_contacts/i.test(currentSearch)) return 'crm-workspace';
    if (/view=communications/i.test(currentSearch)) return 'communications';
    if (/view=tasks/i.test(currentSearch)) return 'tasks';
    if (currentPath.indexOf('/provider') === 0) return 'provider-shell';
    if (currentPath.indexOf('/operations') === 0) return 'operations';
    return 'other';
  }

  function safeRoutePath() {
    var allowedParams = {
      workspace: true,
      project: true,
      project_key: true,
      view: true,
      section: true,
      admin_provider: true,
      review: true,
      inbox: true
    };
    var params = new URLSearchParams();
    var currentPath = window.location.pathname || '/';
    var currentSearch = new URLSearchParams(window.location.search || '');
    currentSearch.forEach(function (value, key) {
      if (!allowedParams[key]) return;
      var clean = String(value || '').replace(/[^\w:-]/g, '').slice(0, 80);
      if (clean) params.set(key, clean);
    });
    currentPath = currentPath
      .replace(/\/api\/bna\/crm\/contacts\/[^/?#]+/gi, '/api/bna/crm/contacts/[redacted-contact]')
      .replace(/\/operations\/agents\/runs\/[^/?#]+/gi, '/operations/agents/runs/[redacted-run]')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
      .replace(/\b\d{8,}\b/g, '[redacted-number]');
    var query = params.toString();
    return (currentPath || '/') + (query ? '?' + query : '');
  }

  function connectionType() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection && connection.effectiveType ? String(connection.effectiveType) : '';
  }

  function isColdStart() {
    try {
      return !sessionStorage.getItem('one_time_rum_seen');
    } catch (error) {
      return true;
    }
  }

  function payload(metricName) {
    var navigation = performance.getEntriesByType('navigation')[0] || {};
    var paints = performance.getEntriesByType('paint').reduce(function (memo, entry) {
      memo[entry.name] = entry.startTime;
      return memo;
    }, {});
    var resources = performance.getEntriesByType('resource') || [];
    var transferBytes = resources.reduce(function (total, entry) {
      return total + (entry.transferSize || entry.encodedBodySize || 0);
    }, 0);
    var now = performance.now();
    return {
      metric_name: metricName || 'route_load',
      metric_value_ms: Math.round(metricName === 'route_transition' ? now - lastRouteStartedAt : ((navigation.loadEventEnd || now) || 0)),
      nav_ms: Math.round((navigation.loadEventEnd || now) || 0),
      route_transition_ms: Math.round(metricName === 'route_transition' ? now - lastRouteStartedAt : now - startedAt),
      fcp_ms: Math.round(paints['first-contentful-paint'] || 0),
      lcp_ms: Math.round(lcp || 0),
      cls: Math.round(cls * 1000) / 1000,
      long_task_total_ms: Math.round(longTaskTotal || 0),
      resource_count: resources.length,
      transfer_kb: Math.round(transferBytes / 102.4) / 10,
      route_id: routeId(),
      route_path: safeRoutePath(),
      viewport: {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0
      },
      visibility_state: document.visibilityState || '',
      connection_type: connectionType(),
      cold_start: isColdStart(),
      no_pii_contract: true
    };
  }

  function send(metricName) {
    metricName = metricName || 'route_load';
    var key = metricName + '|' + safeRoutePath();
    if (sentKeys[key]) return;
    sentKeys[key] = true;
    try {
      sessionStorage.setItem('one_time_rum_seen', '1');
    } catch (error) {}
    var body = JSON.stringify(payload(metricName));
    if (navigator.sendBeacon) {
      var blob = new Blob([body], { type: 'application/json' });
      if (navigator.sendBeacon('/api/performance/rum', blob)) return;
    }
    fetch('/api/performance/rum', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body,
      keepalive: true,
      credentials: 'same-origin'
    }).catch(function () {});
  }

  function scheduleRouteTransition() {
    transitionCount += 1;
    if (transitionCount > 4) return;
    lastRouteStartedAt = performance.now();
    window.setTimeout(function () {
      send('route_transition');
    }, 800);
  }

  ['pushState', 'replaceState'].forEach(function (method) {
    var original = history[method];
    if (typeof original !== 'function') return;
    history[method] = function () {
      var result = original.apply(this, arguments);
      scheduleRouteTransition();
      return result;
    };
  });
  window.addEventListener('popstate', scheduleRouteTransition);

  window.addEventListener('pagehide', function () {
    send('route_load');
  }, { once: true });
  window.addEventListener('load', function () {
    setTimeout(function () {
      send('route_load');
    }, 2500);
  }, { once: true });
})();

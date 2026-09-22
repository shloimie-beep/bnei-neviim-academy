import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://bneineviimacademy.org';

const PAGE_ROUTES = [
  '/',
  '/parent',
  '/parent.html',
  '/parent/login',
  '/student',
  '/student.html',
  '/student/login',
  '/signup',
  '/signup.html',
  '/signup-he',
  '/providers',
  '/provider',
  '/provider/login',
  '/service-providers',
  '/providers/join',
  '/become-service-provider',
  '/rabbi-member',
];

const PUBLIC_REDIRECT_ROUTES = [
  {
    path: '/member',
    expectedStatuses: [302],
    expectedLocationPattern: /\/rabbi-member/,
  },
  {
    path: '/member-portal',
    expectedStatuses: [302],
    expectedLocationPattern: /\/rabbi-member/,
  },
  {
    path: '/one-time/member-login',
    expectedStatuses: [302],
    expectedLocationPattern: /\/rabbi-member/,
  },
];

const PROTECTED_ROUTES = [
  {
    path: '/operations',
    expectedStatuses: [302, 401],
    expectedLocationPattern: /\/operations-login\.html/,
  },
  {
    path: '/api/parent-portal',
    expectedStatuses: [401],
    expectedCacheControlPattern: /no-store/i,
  },
  {
    path: '/api/parent-portal/session',
    expectedStatuses: [400],
    expectedCacheControlPattern: /no-store/i,
  },
  {
    path: '/api/parent/me',
    expectedStatuses: [401],
    expectedCacheControlPattern: /no-store/i,
  },
  {
    path: '/api/student-portal',
    expectedStatuses: [401],
    expectedCacheControlPattern: /no-store/i,
  },
  {
    path: '/api/student-portal/session',
    expectedStatuses: [401],
    expectedCacheControlPattern: /no-store/i,
  },
  {
    path: '/api/provider-portal/session',
    expectedStatuses: [401],
    expectedCacheControlPattern: /no-store/i,
  },
  {
    path: '/api/member-portal',
    expectedStatuses: [400],
    expectedCacheControlPattern: /no-store/i,
  },
  {
    path: '/api/rabbi/member/session',
    expectedStatuses: [400, 401],
    expectedCacheControlPattern: /no-store/i,
  },
];

const FORBIDDEN_RESPONSE_SNIPPETS = [
  'Huda Weber',
  'Hillel Baraka',
  'Menachem Mendel Dratler',
  'Eitan Chaim Golombo',
  'Amitai Kosofsky',
  'ahuvadratler@gmail.com',
  'torahGoalFallbackStudents',
  'studentName Torah goal progress',
  "each boy's cumulative progress",
  'parent_email":"',
  'student_email":"',
  'student_access_code":"',
  'access_code":"',
];

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.BNA_SMOKE_BASE_URL || process.env.BNA_LIVE_BASE_URL || DEFAULT_BASE_URL,
    reportDir: path.join('ops', 'live-smokes'),
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--base-url' || arg === '--base') {
      options.baseUrl = argv[index + 1] || options.baseUrl;
      index += 1;
    } else if (arg === '--report-dir') {
      options.reportDir = argv[index + 1] || options.reportDir;
      index += 1;
    } else if (arg === '--no-report') {
      options.reportDir = '';
    }
  }
  options.baseUrl = String(options.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '');
  return options;
}

function resultLine(item) {
  return `- ${item.status} ${item.label}${item.detail ? ` (${item.detail})` : ''}`;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function fetchRoute(baseUrl, route) {
  const url = `${baseUrl}${route.path || route}`;
  const response = await fetch(url, {
    redirect: 'manual',
    headers: {
      accept: route.path?.startsWith('/api/') || String(route).startsWith('/api/')
        ? 'application/json'
        : 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
      'cache-control': 'no-cache',
    },
  });
  const text = await response.text();
  return {
    route: route.path || route,
    response,
    text,
    location: response.headers.get('location') || '',
  };
}

function assertNoForbiddenContent(route, text) {
  const hits = FORBIDDEN_RESPONSE_SNIPPETS.filter((snippet) => text.includes(snippet));
  assert(!hits.length, `${route} exposed forbidden private snippet(s): ${hits.join(', ')}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const checks = [];
  let result = 'passed';

  function pass(label, detail = '') {
    checks.push({ status: 'PASS', label, detail });
    console.log(`PASS ${label}${detail ? ` - ${detail}` : ''}`);
  }

  function fail(label, detail = '') {
    checks.push({ status: 'FAIL', label, detail });
    console.error(`FAIL ${label}${detail ? ` - ${detail}` : ''}`);
  }

  try {
    for (const route of PAGE_ROUTES) {
      const { response, text } = await fetchRoute(options.baseUrl, route);
      assert(response.status === 200, `${route} expected 200, got ${response.status}`);
      assertNoForbiddenContent(route, text);
      pass(`public route ${route} returns anonymous shell`, String(response.status));
    }

    for (const route of PUBLIC_REDIRECT_ROUTES) {
      const { response, text, location } = await fetchRoute(options.baseUrl, route);
      assert(
        route.expectedStatuses.includes(response.status),
        `${route.path} expected ${route.expectedStatuses.join('/')} got ${response.status}`
      );
      assert(
        route.expectedLocationPattern.test(location),
        `${route.path} redirected to unexpected location ${location}`
      );
      assertNoForbiddenContent(route.path, text);
      pass(`public alias ${route.path} redirects to canonical member home`, `${response.status} -> ${location}`);
    }

    for (const route of PROTECTED_ROUTES) {
      const { response, text, location } = await fetchRoute(options.baseUrl, route);
      assert(
        route.expectedStatuses.includes(response.status),
        `${route.path} expected ${route.expectedStatuses.join('/')} got ${response.status}`
      );
      if (route.expectedLocationPattern && location) {
        assert(
          route.expectedLocationPattern.test(location),
          `${route.path} redirected to unexpected location ${location}`
        );
      }
      if (route.expectedCacheControlPattern) {
        const cacheControl = response.headers.get('cache-control') || '';
        assert(
          route.expectedCacheControlPattern.test(cacheControl),
          `${route.path} missing expected Cache-Control header: ${cacheControl || '(empty)'}`
        );
      }
      assertNoForbiddenContent(route.path, text);
      pass(`protected route ${route.path} rejects anonymous access`, `${response.status}${location ? ` -> ${location}` : ''}`);
    }
  } catch (error) {
    result = 'failed';
    fail('public/private route privacy smoke', error.message);
    process.exitCode = 1;
  } finally {
    if (options.reportDir) {
      fs.mkdirSync(options.reportDir, { recursive: true });
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(options.reportDir, `${stamp}-public-route-privacy-smoke.md`);
      const lines = [
        `# Public Route Privacy Smoke - ${new Date().toISOString()}`,
        '',
        `App: ${options.baseUrl}`,
        `Result: ${result}`,
        '',
        '## Routes',
        ...PAGE_ROUTES.map((route) => `- ${route}`),
        ...PUBLIC_REDIRECT_ROUTES.map((route) => `- ${route.path}`),
        ...PROTECTED_ROUTES.map((route) => `- ${route.path}`),
        '',
        '## Checks',
        ...checks.map(resultLine),
        '',
      ];
      fs.writeFileSync(reportPath, lines.join('\n'));
      console.log(`Report: ${reportPath}`);
    }
  }
}

main();

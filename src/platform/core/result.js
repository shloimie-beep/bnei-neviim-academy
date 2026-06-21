function ok(data = {}, meta = {}) {
  return {
    ok: true,
    data,
    error: null,
    meta,
  };
}

function fail(code, message, details = {}, status = 400) {
  return {
    ok: false,
    data: null,
    error: {
      code: String(code || 'error'),
      message: String(message || 'Request failed'),
      details,
      status,
    },
    meta: {},
  };
}

function fromPermission(permission, fallbackCode = 'permission_denied') {
  if (permission?.allowed) return ok(permission);
  return fail(
    permission?.code || fallbackCode,
    permission?.reason || 'Permission denied',
    permission || {},
    permission?.status || 403
  );
}

function unwrap(result) {
  if (result?.ok) return result.data;
  const error = new Error(result?.error?.message || 'Request failed');
  error.code = result?.error?.code || 'error';
  error.status = result?.error?.status || 500;
  error.details = result?.error?.details || {};
  throw error;
}

module.exports = {
  fail,
  fromPermission,
  ok,
  unwrap,
};

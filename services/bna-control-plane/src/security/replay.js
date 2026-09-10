class ReplayStore {
  constructor({ ttlMs = 24 * 60 * 60 * 1000 } = {}) {
    this.ttlMs = ttlMs;
    this.nonces = new Map();
  }

  _key(keyId, nonce) {
    return `${keyId}:${nonce}`;
  }

  sweep(now = Date.now()) {
    for (const [key, expiresAt] of this.nonces.entries()) {
      if (expiresAt <= now) this.nonces.delete(key);
    }
  }

  assertFresh({ keyId, nonce, now = Date.now() } = {}) {
    if (!keyId || !nonce) throw Object.assign(new Error('keyId and nonce are required'), { code: 'replay_input_missing' });
    this.sweep(now);
    const key = this._key(keyId, nonce);
    if (this.nonces.has(key)) throw Object.assign(new Error('nonce replay detected'), { code: 'nonce_replay' });
    this.nonces.set(key, now + this.ttlMs);
    return { accepted: true, expiresAt: now + this.ttlMs };
  }
}

module.exports = {
  ReplayStore,
};

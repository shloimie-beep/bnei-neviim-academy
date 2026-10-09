class FakeTelegramTransport {
  constructor({ enabled = false } = {}) {
    this.enabled = enabled;
    this.sent = [];
  }

  async send(renderedAlert) {
    if (!this.enabled) return { sent: false, skipped: true, reason: 'telegram_delivery_disabled' };
    this.sent.push(renderedAlert);
    return { sent: true, skipped: false, message_id: `fake_${this.sent.length}` };
  }
}

module.exports = {
  FakeTelegramTransport,
};

(function () {
  const PACKAGE_URL = '/documents/bnei_neviim_registration_documents_bilingual_codex.md';
  const PACKAGE_VERSION = '2026-2027-v1';
  const CONTEXT_KEY = 'bnaSignupDocumentContext';
  const SIGNATURE_KEY = 'bnaSignupDocumentSignatures';
  const AGREEMENT_TYPE = 'parent_handbook';

  const COPY = {
    en: {
      lang: 'en',
      dir: 'ltr',
      eyebrow: 'Required Document',
      title: 'Parent Handbook',
      intro: 'Read the Parent Handbook as a normal webpage. The signature section appears after the full document.',
      back: 'Back to registration',
      loading: 'Loading Parent Handbook...',
      loadError: 'The Parent Handbook could not be loaded. Please return to registration and try again.',
      signatureTitle: 'Electronic signature',
      signatureNote: 'Clicking the signature button records your Parent Handbook signature for the signup form.',
      checkText: 'I have read and agree to the Parent Handbook.',
      sign: 'Sign Parent Handbook',
      missingSigner: 'Return to registration and enter Parent 1 name and email before signing.',
      signed: 'Signed. You can return to the registration form.',
    },
    he: {
      lang: 'he',
      dir: 'rtl',
      eyebrow: '\u05de\u05e1\u05de\u05da \u05d7\u05d5\u05d1\u05d4',
      title: '\u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05d5\u05e8\u05d9\u05dd',
      intro: '\u05e7\u05e8\u05d0\u05d5 \u05d0\u05ea \u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05d4\u05d5\u05e8\u05d9\u05dd \u05db\u05e2\u05de\u05d5\u05d3 \u05d0\u05ea\u05e8 \u05e8\u05d2\u05d9\u05dc. \u05d0\u05d6\u05d5\u05e8 \u05d4\u05d7\u05ea\u05d9\u05de\u05d4 \u05de\u05d5\u05e4\u05d9\u05e2 \u05d0\u05d7\u05e8\u05d9 \u05db\u05dc \u05d4\u05de\u05e1\u05de\u05da.',
      back: '\u05d7\u05d6\u05e8\u05d4 \u05dc\u05d4\u05e8\u05e9\u05de\u05d4',
      loading: '\u05d8\u05d5\u05e2\u05df \u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05d5\u05e8\u05d9\u05dd...',
      loadError: '\u05dc\u05d0 \u05e0\u05d9\u05ea\u05df \u05d4\u05d9\u05d4 \u05dc\u05d8\u05e2\u05d5\u05df \u05d0\u05ea \u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05d4\u05d5\u05e8\u05d9\u05dd. \u05d7\u05d6\u05e8\u05d5 \u05dc\u05d4\u05e8\u05e9\u05de\u05d4 \u05d5\u05e0\u05e1\u05d5 \u05e9\u05d5\u05d1.',
      signatureTitle: '\u05d7\u05ea\u05d9\u05de\u05d4 \u05d0\u05dc\u05e7\u05d8\u05e8\u05d5\u05e0\u05d9\u05ea',
      signatureNote: '\u05dc\u05d7\u05d9\u05e6\u05d4 \u05e2\u05dc \u05db\u05e4\u05ea\u05d5\u05e8 \u05d4\u05d7\u05ea\u05d9\u05de\u05d4 \u05e9\u05d5\u05de\u05e8\u05ea \u05d7\u05ea\u05d9\u05de\u05d4 \u05dc\u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05d4\u05d5\u05e8\u05d9\u05dd \u05d1\u05d8\u05d5\u05e4\u05e1 \u05d4\u05d4\u05e8\u05e9\u05de\u05d4.',
      checkText: '\u05e7\u05e8\u05d0\u05ea\u05d9 \u05d5\u05d0\u05e0\u05d9 \u05de\u05e1\u05db\u05d9\u05dd/\u05d4 \u05dc\u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05d4\u05d5\u05e8\u05d9\u05dd.',
      sign: '\u05d7\u05ea\u05d9\u05de\u05d4 \u05e2\u05dc \u05de\u05d3\u05e8\u05d9\u05da \u05d4\u05d4\u05d5\u05e8\u05d9\u05dd',
      missingSigner: '\u05d7\u05d6\u05e8\u05d5 \u05dc\u05d4\u05e8\u05e9\u05de\u05d4 \u05d5\u05d4\u05d6\u05d9\u05e0\u05d5 \u05e9\u05dd \u05d5\u05d0\u05d9\u05de\u05d9\u05d9\u05dc \u05e9\u05dc \u05d4\u05d5\u05e8\u05d4 1 \u05dc\u05e4\u05e0\u05d9 \u05d4\u05d7\u05ea\u05d9\u05de\u05d4.',
      signed: '\u05e0\u05d7\u05ea\u05dd. \u05e0\u05d9\u05ea\u05df \u05dc\u05d7\u05d6\u05d5\u05e8 \u05dc\u05d8\u05d5\u05e4\u05e1 \u05d4\u05d4\u05e8\u05e9\u05de\u05d4.',
    },
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function inlineMarkdown(value) {
    return escapeHtml(value).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  function markdownToHtml(markdown) {
    const lines = String(markdown || '').split(/\r?\n/);
    const html = [];
    let paragraph = [];
    let listOpen = false;

    const closeParagraph = () => {
      if (!paragraph.length) return;
      html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    };
    const closeList = () => {
      if (!listOpen) return;
      html.push('</ul>');
      listOpen = false;
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        closeParagraph();
        closeList();
        continue;
      }
      if (/^####\s+/.test(line)) {
        closeParagraph();
        closeList();
        html.push(`<h5>${inlineMarkdown(line.replace(/^####\s+/, ''))}</h5>`);
        continue;
      }
      if (/^###\s+/.test(line)) {
        closeParagraph();
        closeList();
        html.push(`<h4>${inlineMarkdown(line.replace(/^###\s+/, ''))}</h4>`);
        continue;
      }
      if (/^##\s+/.test(line)) {
        closeParagraph();
        closeList();
        html.push(`<h3>${inlineMarkdown(line.replace(/^##\s+/, ''))}</h3>`);
        continue;
      }
      if (/^-\s+/.test(line)) {
        closeParagraph();
        if (!listOpen) {
          html.push('<ul>');
          listOpen = true;
        }
        html.push(`<li>${inlineMarkdown(line.replace(/^-\s+/, ''))}</li>`);
        continue;
      }
      paragraph.push(line);
    }
    closeParagraph();
    closeList();
    return html.join('\n');
  }

  function languageBlock(markdown, language) {
    const split = String(markdown || '').split(/^#\s+(?:HEBREW VERSION|\u05d2\u05e8\u05e1\u05d4 \u05e2\u05d1\u05e8\u05d9\u05ea)\s*$/m);
    return language === 'he' ? (split[1] || markdown) : (split[0] || markdown);
  }

  function extractParentHandbook(markdown, language) {
    const block = languageBlock(markdown, language);
    const startLabel = language === 'he' ? '\u05de\u05e1\u05de\u05da 1:' : 'Document 1:';
    const endLabel = language === 'he' ? '\u05de\u05e1\u05de\u05da 2:' : 'Document 2:';
    const startRegex = new RegExp(`^## ${startLabel}`, 'm');
    const endRegex = new RegExp(`^## ${endLabel}`, 'm');
    const startMatch = block.match(startRegex);
    if (!startMatch || typeof startMatch.index !== 'number') return '';
    const start = startMatch.index;
    const rest = block.slice(start + startMatch[0].length);
    const endMatch = rest.match(endRegex);
    if (!endMatch || typeof endMatch.index !== 'number') return block.slice(start).trim();
    return block.slice(start, start + startMatch[0].length + endMatch.index).trim();
  }

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  }

  function signerScope(language, signer) {
    return `${language}:${String(signer.name || '').trim()}:${String(signer.email || '').trim()}`;
  }

  function writeSignature(language, signer, signature) {
    const scope = signerScope(language, signer);
    const existing = readJson(SIGNATURE_KEY);
    const signatures = existing && existing.scope === scope && existing.signatures
      ? existing.signatures
      : {};
    signatures[AGREEMENT_TYPE] = signature;
    localStorage.setItem(SIGNATURE_KEY, JSON.stringify({
      scope,
      signatures,
      updatedAt: new Date().toISOString(),
    }));
  }

  function getContext() {
    const params = new URLSearchParams(window.location.search);
    const context = readJson(CONTEXT_KEY) || {};
    const language = (params.get('lang') || context.language || 'en').toLowerCase().startsWith('he') ? 'he' : 'en';
    return {
      language,
      signer: context.signer || {},
      returnUrl: params.get('return') || context.returnUrl || (language === 'he' ? '/signup-he.html' : '/signup.html'),
    };
  }

  async function init() {
    const context = getContext();
    const copy = COPY[context.language] || COPY.en;
    const signer = {
      name: String(context.signer.name || '').trim(),
      email: String(context.signer.email || '').trim(),
    };

    document.documentElement.lang = copy.lang;
    document.documentElement.dir = copy.dir;
    document.getElementById('eyebrow').textContent = copy.eyebrow;
    document.getElementById('pageTitle').textContent = copy.title;
    document.getElementById('pageIntro').textContent = copy.intro;
    document.getElementById('backLink').textContent = copy.back;
    document.getElementById('backLink').href = context.returnUrl;
    document.getElementById('signatureTitle').textContent = copy.signatureTitle;
    document.getElementById('signatureNote').textContent = copy.signatureNote;
    document.getElementById('signatureCheckText').textContent = copy.checkText;
    document.getElementById('signButton').textContent = copy.sign;

    const content = document.getElementById('documentContent');
    content.textContent = copy.loading;
    try {
      const response = await fetch(PACKAGE_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      const section = extractParentHandbook(markdown, context.language);
      content.innerHTML = markdownToHtml(section || copy.loadError);
      content.dir = copy.dir;
    } catch (error) {
      content.innerHTML = `<p>${escapeHtml(copy.loadError)}</p>`;
    }

    const check = document.getElementById('signatureCheck');
    const button = document.getElementById('signButton');
    const status = document.getElementById('signatureStatus');
    const updateButton = () => {
      const hasSigner = Boolean(signer.name && signer.email);
      button.disabled = !hasSigner || !check.checked;
      status.textContent = hasSigner ? '' : copy.missingSigner;
      status.className = hasSigner ? 'status' : 'status error';
    };
    check.addEventListener('change', updateButton);
    updateButton();

    button.addEventListener('click', () => {
      const signature = {
        agreement_type: AGREEMENT_TYPE,
        agreement_title: copy.title,
        agreement_version: PACKAGE_VERSION,
        signer_name: signer.name,
        signer_email: signer.email,
        client_signed_at: new Date().toISOString(),
        language_viewed: context.language,
        accepted: true,
      };
      writeSignature(context.language, signer, signature);
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          source: 'bna-signup-document-signature',
          signature,
        }, window.location.origin);
      }
      status.textContent = copy.signed;
      status.className = 'status';
      button.disabled = true;
    });
  }

  init();
})();

(function () {
  const core = window.BnaRegistrationDocuments;
  if (!core) return;

  const PAGE_COPY = {
    en: {
      lang: 'en',
      dir: 'ltr',
      brandSubtitle: 'Registration document',
      eyebrow: 'Required Document',
      intro: 'Read this document as a normal page. The signature section appears after the full document.',
      back: 'Back to registration',
      otherLanguage: 'עברית',
      languageLabel: 'English',
      version: 'Version',
      loading: 'Loading document...',
      loadError: 'This document could not be loaded. Please return to registration and try again.',
      signatureTitle: 'Electronic signature',
      signatureNote: 'Clicking the signature button records your signature for the signup form.',
      checkPrefix: 'I have read and agree to',
      signPrefix: 'Sign',
      missingSigner: 'Return to registration and enter Parent 1 name and email before signing.',
      signed: 'Signed. Returning to the registration form...',
      defaultTitle: 'Registration Document'
    },
    he: {
      lang: 'he',
      dir: 'rtl',
      brandSubtitle: '\u05de\u05e1\u05de\u05da \u05d4\u05e8\u05e9\u05de\u05d4',
      eyebrow: '\u05de\u05e1\u05de\u05da \u05d7\u05d5\u05d1\u05d4',
      intro: '\u05e7\u05e8\u05d0\u05d5 \u05d0\u05ea \u05d4\u05de\u05e1\u05de\u05da \u05db\u05e2\u05de\u05d5\u05d3 \u05de\u05dc\u05d0. \u05d0\u05d6\u05d5\u05e8 \u05d4\u05d7\u05ea\u05d9\u05de\u05d4 \u05de\u05d5\u05e4\u05d9\u05e2 \u05d0\u05d7\u05e8\u05d9 \u05db\u05dc \u05d4\u05de\u05e1\u05de\u05da.',
      back: '\u05d7\u05d6\u05e8\u05d4 \u05dc\u05d4\u05e8\u05e9\u05de\u05d4',
      otherLanguage: 'English',
      languageLabel: '\u05e2\u05d1\u05e8\u05d9\u05ea',
      version: '\u05d2\u05e8\u05e1\u05d4',
      loading: '\u05d8\u05d5\u05e2\u05df \u05de\u05e1\u05de\u05da...',
      loadError: '\u05dc\u05d0 \u05e0\u05d9\u05ea\u05df \u05d4\u05d9\u05d4 \u05dc\u05d8\u05e2\u05d5\u05df \u05d0\u05ea \u05d4\u05de\u05e1\u05de\u05da. \u05d7\u05d6\u05e8\u05d5 \u05dc\u05d4\u05e8\u05e9\u05de\u05d4 \u05d5\u05e0\u05e1\u05d5 \u05e9\u05d5\u05d1.',
      signatureTitle: '\u05d7\u05ea\u05d9\u05de\u05d4 \u05d0\u05dc\u05e7\u05d8\u05e8\u05d5\u05e0\u05d9\u05ea',
      signatureNote: '\u05dc\u05d7\u05d9\u05e6\u05d4 \u05e2\u05dc \u05db\u05e4\u05ea\u05d5\u05e8 \u05d4\u05d7\u05ea\u05d9\u05de\u05d4 \u05e9\u05d5\u05de\u05e8\u05ea \u05d7\u05ea\u05d9\u05de\u05d4 \u05dc\u05d8\u05d5\u05e4\u05e1 \u05d4\u05d4\u05e8\u05e9\u05de\u05d4.',
      checkPrefix: '\u05e7\u05e8\u05d0\u05ea\u05d9 \u05d5\u05d0\u05e0\u05d9 \u05de\u05e1\u05db\u05d9\u05dd/\u05d4 \u05dc',
      signPrefix: '\u05d7\u05ea\u05d9\u05de\u05d4 \u05e2\u05dc',
      missingSigner: '\u05d7\u05d6\u05e8\u05d5 \u05dc\u05d4\u05e8\u05e9\u05de\u05d4 \u05d5\u05d4\u05d6\u05d9\u05e0\u05d5 \u05e9\u05dd \u05d5\u05d0\u05d9\u05de\u05d9\u05d9\u05dc \u05e9\u05dc \u05d4\u05d5\u05e8\u05d4 1 \u05dc\u05e4\u05e0\u05d9 \u05d4\u05d7\u05ea\u05d9\u05de\u05d4.',
      signed: '\u05e0\u05d7\u05ea\u05dd. \u05d7\u05d5\u05d6\u05e8 \u05dc\u05d8\u05d5\u05e4\u05e1 \u05d4\u05d4\u05e8\u05e9\u05de\u05d4...',
      defaultTitle: '\u05de\u05e1\u05de\u05da \u05d4\u05e8\u05e9\u05de\u05d4'
    }
  };

  function getEl(id) {
    return document.getElementById(id);
  }

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function signerScope(language, signer) {
    return `${language}:${String(signer.name || '').trim()}:${String(signer.email || '').trim()}`;
  }

  function selectedContext() {
    const params = new URLSearchParams(window.location.search);
    const stored = readJson(core.contextStorageKey) || {};
    const language = String(params.get('lang') || stored.language || 'en').toLowerCase().startsWith('he') ? 'he' : 'en';
    const docType = String(params.get('document') || params.get('doc') || 'parent_handbook').trim();
    return {
      language,
      docType,
      signer: stored.signer || {},
      returnUrl: params.get('return') || stored.returnUrl || (language === 'he' ? '/signup-he.html' : '/signup.html')
    };
  }

  function writeSignature(language, signer, signature) {
    const scope = signerScope(language, signer);
    const existing = readJson(core.signatureStorageKey);
    const signatures = existing && existing.scope === scope && existing.signatures
      ? existing.signatures
      : {};
    signatures[signature.agreement_type] = signature;
    writeJson(core.signatureStorageKey, {
      scope,
      signatures,
      updatedAt: new Date().toISOString()
    });
  }

  function notifyAndReturn(signature, returnUrl) {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({
        source: 'bna-signup-document-signature',
        signature
      }, window.location.origin);
      setTimeout(() => {
        try {
          window.opener.focus();
        } catch {
          // Focus can be blocked by the browser; closing still returns the user to the form tab.
        }
        window.close();
      }, 700);
      return;
    }
    setTimeout(() => {
      window.location.href = returnUrl;
    }, 700);
  }

  function setLanguageUrl(language) {
    const params = new URLSearchParams(window.location.search);
    params.set('lang', language);
    window.location.search = params.toString();
  }

  async function init() {
    const context = selectedContext();
    const copy = PAGE_COPY[context.language] || PAGE_COPY.en;
    const doc = core.documents.find((item) => item.type === context.docType) || core.documents[0];
    const title = doc.title[context.language] || doc.title.en || copy.defaultTitle;
    const description = doc.description[context.language] || doc.description.en || copy.intro;
    const signer = {
      name: String(context.signer.name || '').trim(),
      email: String(context.signer.email || '').trim()
    };

    document.documentElement.lang = copy.lang;
    document.documentElement.dir = copy.dir;
    document.title = `${title} | Bnei Neviim Academy`;
    getEl('brandSubtitle').textContent = copy.brandSubtitle;
    getEl('eyebrow').textContent = copy.eyebrow;
    getEl('pageTitle').textContent = title;
    getEl('pageIntro').textContent = description || copy.intro;
    getEl('backLink').textContent = copy.back;
    getEl('backLink').href = context.returnUrl;
    getEl('languageToggle').textContent = copy.otherLanguage;
    getEl('languageToggle').addEventListener('click', () => setLanguageUrl(context.language === 'he' ? 'en' : 'he'));
    getEl('versionChip').textContent = `${copy.version}: ${doc.version || core.packageVersion}`;
    getEl('languageChip').textContent = copy.languageLabel;
    getEl('signatureTitle').textContent = copy.signatureTitle;
    getEl('signatureNote').textContent = copy.signatureNote;
    getEl('signatureCheckText').textContent = `${copy.checkPrefix} ${title}.`;
    getEl('signButton').textContent = `${copy.signPrefix} ${title}`;

    const content = getEl('documentContent');
    content.dir = copy.dir;
    content.textContent = copy.loading;
    try {
      const markdown = await core.documentMarkdown(doc.type, context.language);
      content.innerHTML = core.markdownToHtml(markdown || copy.loadError);
    } catch {
      content.innerHTML = `<p>${core.escapeHtml(copy.loadError)}</p>`;
    }

    const check = getEl('signatureCheck');
    const button = getEl('signButton');
    const status = getEl('signatureStatus');
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
        agreement_type: doc.type,
        agreement_title: title,
        agreement_version: doc.version || core.packageVersion,
        signer_name: signer.name,
        signer_email: signer.email,
        client_signed_at: new Date().toISOString(),
        language_viewed: context.language,
        accepted: true
      };
      writeSignature(context.language, signer, signature);
      status.textContent = copy.signed;
      status.className = 'status';
      button.disabled = true;
      notifyAndReturn(signature, context.returnUrl);
    });
  }

  init();
})();

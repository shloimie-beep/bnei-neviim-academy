(function () {
  const PACKAGE_URL = '/documents/bnei_neviim_registration_documents_bilingual_codex.md';
  const PACKAGE_VERSION = '2026-2027-v1';
  const TUITION_VERSION = '2026-06-07-v1';

  const TUITION_TEXT = {
    en: `Bnei Neviim Academy is a private Torah learning and mentoring program. It is not a Ministry of Education-recognized school. Parents are responsible for arranging any legal homeschooling registration or other educational status required for their child.

The standard tuition rate is ILS 1,000 per month, or ILS 12,000 for a full tuition year.

The tuition year runs from July 1 through June 30. Tuition is billed according to the civil calendar and is due at the beginning of each civil month. The program schedule itself follows the Jewish calendar.

There is no separate signup fee. A place in the program is reserved only once the first tuition payment has been made and the required registration forms have been signed.

For students who join after the beginning of a month, tuition may be prorated based on the student's start date, calculated according to the number of calendar days in that month.

For students who paid at the end of May 2026, that payment will be applied to June 2026 tuition. The next regular tuition payment is due July 1, 2026.

Once a month has begun, the full tuition for that month is due and non-refundable. This applies even if the child attends for only part of the month, only one week, or only a few days.

If a parent wishes to withdraw a child from the program, 30 days' notice is required. Tuition remains due during the 30-day notice period. If the notice period continues into a new month, tuition for that month is also due.

Scheduled breaks, Jewish holidays, Chol HaMoed, fast days, summer breaks, and other calendar adjustments do not reduce the monthly tuition amount. Tuition reserves the child's place in the program and supports the continuity of the program as a whole.

Payment may be made by cash, bank transfer, credit card, or another method approved by the program director.`,
    he: `Bnei Neviim Academy היא תכנית פרטית ללימוד תורה וליווי אישי. היא אינה בית ספר המוכר על ידי משרד החינוך. ההורים אחראים להסדיר כל רישום לחינוך ביתי או כל מעמד חינוכי אחר הנדרש על פי דין עבור ילדם.

שכר הלימוד הרגיל הוא 1,000 ש"ח לחודש, או 12,000 ש"ח לשנת לימוד מלאה.

שנת שכר הלימוד נמשכת מ-1 ביולי עד 30 ביוני. שכר הלימוד מחויב לפי הלוח האזרחי והוא לתשלום בתחילת כל חודש אזרחי. סדר התכנית עצמה פועל לפי הלוח היהודי.

אין תשלום הרשמה נפרד. מקום בתכנית נשמר רק לאחר שהתשלום הראשון של שכר הלימוד שולם והטפסים הנדרשים נחתמו.

לתלמידים המצטרפים לאחר תחילת חודש, שכר הלימוד עשוי להיות מחושב באופן יחסי לפי תאריך תחילת ההשתתפות, בהתאם למספר הימים הקלנדריים באותו חודש.

לתלמידים ששילמו בסוף מאי 2026, התשלום יחול על שכר הלימוד של יוני 2026. התשלום הרגיל הבא לתשלום הוא ב-1 ביולי 2026.

לאחר שהחודש התחיל, שכר הלימוד המלא עבור אותו חודש חל ואינו ניתן להחזר. הדבר נכון גם אם הילד השתתף רק בחלק מהחודש, שבוע אחד, או מספר ימים.

אם הורה מבקש להוציא את הילד מהתכנית, נדרשת הודעה מוקדמת של 30 יום. שכר הלימוד ממשיך לחול במהלך תקופת ההודעה. אם תקופת ההודעה נמשכת לתוך חודש חדש, שכר הלימוד עבור אותו חודש חל גם כן.

חופשות מתוכננות, חגים, חול המועד, תעניות, חופשות קיץ ושינויים בלוח השנה אינם מפחיתים את שכר הלימוד החודשי. שכר הלימוד שומר את מקומו של הילד בתכנית ותומך ברציפות התכנית כולה.

ניתן לשלם במזומן, העברה בנקאית, כרטיס אשראי, או דרך אחרת שאושרה על ידי מנהל התכנית.`
  };

  const COPY = {
    en: {
      heading: 'Required Registration Documents',
      intro: 'Open each document, read it in the full-screen viewer, scroll to the bottom, and sign. Each signature is recorded separately.',
      open: 'Open and Sign',
      signed: 'Signed',
      unsigned: 'Not signed yet',
      signerMissing: 'Enter Parent 1 name and email before signing.',
      scrollNeeded: 'Scroll to the bottom of this document to enable signing.',
      ready: 'Ready to sign.',
      signPrefix: 'I have read and agree to',
      signatureNotice: 'Clicking this button is my electronic signature.',
      close: 'Close',
      loading: 'Loading document...',
      loadError: 'This document could not be loaded. Please contact Bnei Neviim Academy before signing.',
      submitMissing: 'Please open and sign all four required registration documents before submitting.',
      signerChanged: 'Parent 1 name or email changed after signing. Please review and sign the required documents again.',
      viewer: 'Document viewer'
    },
    he: {
      heading: 'מסמכי הרשמה נדרשים',
      intro: 'פתחו כל מסמך, קראו אותו במסך מלא, גללו עד הסוף וחתמו. כל חתימה נשמרת בנפרד.',
      open: 'פתיחה וחתימה',
      signed: 'נחתם',
      unsigned: 'עדיין לא נחתם',
      signerMissing: 'יש להזין שם ואימייל של הורה 1 לפני החתימה.',
      scrollNeeded: 'יש לגלול עד סוף המסמך כדי לאפשר חתימה.',
      ready: 'אפשר לחתום עכשיו.',
      signPrefix: 'קראתי ואני מסכים/ה ל',
      signatureNotice: 'לחיצה על כפתור זה מהווה את החתימה האלקטרונית שלי.',
      close: 'סגירה',
      loading: 'טוען מסמך...',
      loadError: 'לא ניתן היה לטעון את המסמך. אנא צרו קשר עם Bnei Neviim Academy לפני החתימה.',
      submitMissing: 'יש לפתוח ולחתום על כל ארבעת מסמכי ההרשמה לפני השליחה.',
      signerChanged: 'שם או אימייל של הורה 1 השתנו לאחר החתימה. יש לעבור שוב על המסמכים ולחתום מחדש.',
      viewer: 'חלון קריאת מסמך'
    }
  };

  const DOCUMENTS = [
    {
      type: 'tuition_agreement',
      packageIndex: null,
      version: TUITION_VERSION,
      title: { en: 'Tuition Agreement', he: 'הסכם שכר לימוד' },
      description: {
        en: 'Monthly tuition, payment timing, refund policy, and withdrawal notice.',
        he: 'שכר לימוד חודשי, זמני תשלום, מדיניות החזרים והודעת פרישה.'
      }
    },
    {
      type: 'parent_handbook',
      packageIndex: 1,
      version: PACKAGE_VERSION,
      title: { en: 'Parent Handbook', he: 'מדריך הורים' },
      description: {
        en: 'Program philosophy, parent partnership, structure, safety, and no-smartphone policy.',
        he: 'גישה חינוכית, שותפות הורים, מבנה התכנית, בטיחות ומדיניות ללא סמארטפונים.'
      }
    },
    {
      type: 'student_code_of_conduct',
      packageIndex: 2,
      version: PACKAGE_VERSION,
      title: { en: 'Student Handbook / Code of Conduct', he: 'מדריך תלמידים / קוד התנהגות' },
      description: {
        en: 'Parent confirms these expectations were reviewed, or will be reviewed, with the child.',
        he: 'ההורה מאשר שהציפיות האלו נלמדו, או יילמדו, עם הילד.'
      }
    },
    {
      type: 'safety_acknowledgment_waiver',
      packageIndex: 3,
      version: PACKAGE_VERSION,
      title: { en: 'Safety Acknowledgment and Liability Waiver', he: 'אישור בטיחות, הצהרה וויתור' },
      description: {
        en: 'Safety responsibilities, activity, medical/emergency permissions, damage responsibility, and liability waiver.',
        he: 'אחריות בטיחותית, פעילות, אישורי חירום ורפואה, אחריות לנזק וויתור אחריות.'
      }
    }
  ];

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

  function packageLanguageBlock(markdown, language) {
    const split = String(markdown || '').split(/^#\s+(?:HEBREW VERSION|גרסה עברית)\s*$/m);
    return language === 'he' ? (split[1] || markdown) : (split[0] || markdown);
  }

  function extractPackageSection(markdown, language, index) {
    const block = packageLanguageBlock(markdown, language);
    const label = language === 'he' ? `מסמך ${index}:` : `Document ${index}:`;
    const nextLabel = language === 'he' ? `מסמך ${index + 1}:` : `Document ${index + 1}:`;
    const startRegex = new RegExp(`^## ${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
    const nextRegex = new RegExp(`^## ${nextLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
    const startMatch = block.match(startRegex);
    if (!startMatch || typeof startMatch.index !== 'number') return '';
    const start = startMatch.index;
    const rest = block.slice(start + startMatch[0].length);
    const endMatch = rest.match(nextRegex);
    if (!endMatch || typeof endMatch.index !== 'number') return block.slice(start).trim();
    return block.slice(start, start + startMatch[0].length + endMatch.index).trim();
  }

  function createSignupDocumentFlow(options = {}) {
    const language = String(options.language || 'en').toLowerCase().startsWith('he') ? 'he' : 'en';
    const copy = COPY[language];
    const signatures = {};
    const documentText = {};
    let packageText = '';
    let activeDocument = null;
    let reachedBottom = false;

    const getEl = (id) => document.getElementById(id);
    const signer = () => ({
      name: getEl('parent1_name')?.value.trim() || '',
      email: getEl('parent1_email')?.value.trim() || ''
    });

    async function loadPackage() {
      if (packageText) return packageText;
      const response = await fetch(PACKAGE_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      packageText = await response.text();
      return packageText;
    }

    async function documentMarkdown(doc) {
      if (documentText[doc.type]) return documentText[doc.type];
      if (!doc.packageIndex) {
        documentText[doc.type] = TUITION_TEXT[language] || TUITION_TEXT.en;
        return documentText[doc.type];
      }
      const markdown = await loadPackage();
      const section = extractPackageSection(markdown, language, doc.packageIndex);
      documentText[doc.type] = section || copy.loadError;
      return documentText[doc.type];
    }

    function updateCards() {
      const container = getEl('documentSignatureList');
      if (!container) return;
      container.innerHTML = DOCUMENTS.map((doc, index) => {
        const signature = signatures[doc.type];
        const status = signature
          ? `${copy.signed}: ${escapeHtml(signature.signer_name)}`
          : copy.unsigned;
        return `
          <article class="document-card ${signature ? 'is-signed' : ''}">
            <div class="document-card-number">${index + 1}</div>
            <div class="document-card-main">
              <h4>${escapeHtml(doc.title[language] || doc.title.en)}</h4>
              <p>${escapeHtml(doc.description[language] || doc.description.en)}</p>
              <div class="signature-status ${signature ? 'is-signed' : ''}">${status}</div>
            </div>
            <button type="button" class="agreement-open-btn document-open-btn" data-document-type="${doc.type}">
              ${signature ? copy.signed : copy.open}
            </button>
          </article>
        `;
      }).join('');
      container.querySelectorAll('[data-document-type]').forEach((button) => {
        button.addEventListener('click', () => openDocument(button.dataset.documentType));
      });
    }

    function documentReachedBottom() {
      const body = getEl('documentModalBody');
      if (!body) return false;
      return body.scrollHeight <= body.clientHeight + 8 || body.scrollTop + body.clientHeight >= body.scrollHeight - 16;
    }

    function updateModalSignState() {
      const signButton = getEl('documentModalSignBtn');
      const progress = getEl('documentModalProgress');
      if (!signButton || !progress || !activeDocument) return;
      const currentSigner = signer();
      const canSign = Boolean(currentSigner.name && currentSigner.email && reachedBottom);
      signButton.disabled = !canSign;
      if (!currentSigner.name || !currentSigner.email) {
        progress.textContent = copy.signerMissing;
      } else if (!reachedBottom) {
        progress.textContent = copy.scrollNeeded;
      } else {
        progress.textContent = copy.ready;
      }
    }

    async function openDocument(type) {
      const doc = DOCUMENTS.find((item) => item.type === type) || DOCUMENTS[0];
      activeDocument = doc;
      reachedBottom = false;
      const modal = getEl('documentModal');
      const title = getEl('documentModalTitle');
      const subtitle = getEl('documentModalSubtitle');
      const body = getEl('documentModalBody');
      const signButton = getEl('documentModalSignBtn');
      if (!modal || !title || !subtitle || !body || !signButton) return;

      title.textContent = doc.title[language] || doc.title.en;
      subtitle.textContent = doc.description[language] || doc.description.en;
      body.dir = language === 'he' ? 'rtl' : 'ltr';
      body.innerHTML = `<p>${escapeHtml(copy.loading)}</p>`;
      signButton.textContent = `${copy.signPrefix} ${doc.title[language] || doc.title.en}. ${copy.signatureNotice}`;
      modal.classList.add('show');
      document.body.classList.add('document-modal-open');
      body.scrollTop = 0;
      updateModalSignState();

      try {
        const markdown = await documentMarkdown(doc);
        body.innerHTML = markdownToHtml(markdown);
      } catch (error) {
        body.innerHTML = `<p>${escapeHtml(copy.loadError)}</p>`;
      }
      body.scrollTop = 0;
      setTimeout(() => {
        reachedBottom = documentReachedBottom();
        updateModalSignState();
      }, 0);
    }

    function closeDocument() {
      getEl('documentModal')?.classList.remove('show');
      document.body.classList.remove('document-modal-open');
      activeDocument = null;
      reachedBottom = false;
    }

    function signActiveDocument() {
      if (!activeDocument) return;
      const currentSigner = signer();
      if (!currentSigner.name || !currentSigner.email || !reachedBottom) {
        updateModalSignState();
        return;
      }
      signatures[activeDocument.type] = {
        agreement_type: activeDocument.type,
        agreement_title: activeDocument.title[language] || activeDocument.title.en,
        agreement_version: activeDocument.version,
        signer_name: currentSigner.name,
        signer_email: currentSigner.email,
        client_signed_at: new Date().toISOString(),
        language_viewed: language,
        accepted: true
      };
      updateCards();
      closeDocument();
    }

    function resetSignatures() {
      Object.keys(signatures).forEach((key) => delete signatures[key]);
      updateCards();
    }

    function validateBeforeSubmit() {
      const missing = DOCUMENTS.filter((doc) => !signatures[doc.type]);
      if (missing.length) {
        openDocument(missing[0].type);
        return { ok: false, message: copy.submitMissing };
      }
      const currentSigner = signer();
      const mismatch = DOCUMENTS.some((doc) => {
        const signature = signatures[doc.type];
        return signature && (signature.signer_name !== currentSigner.name || signature.signer_email !== currentSigner.email);
      });
      if (mismatch) {
        resetSignatures();
        openDocument(DOCUMENTS[0].type);
        return { ok: false, message: copy.signerChanged };
      }
      return { ok: true };
    }

    function payload() {
      const list = DOCUMENTS.map((doc) => signatures[doc.type]).filter(Boolean);
      const tuition = signatures.tuition_agreement;
      const safety = signatures.safety_acknowledgment_waiver;
      const packageSignature = safety || signatures.parent_handbook || signatures.student_code_of_conduct;
      return {
        agreement_signatures: list,
        waiver_accepted: Boolean(safety),
        waiver_version: safety?.agreement_version || PACKAGE_VERSION,
        tuition_agreement_accepted: Boolean(tuition),
        tuition_agreement_version: tuition?.agreement_version || TUITION_VERSION,
        tuition_agreement_signer_name: tuition?.signer_name || '',
        tuition_agreement_signer_email: tuition?.signer_email || '',
        tuition_agreement_client_signed_at: tuition?.client_signed_at || '',
        registration_package_accepted: list.length === DOCUMENTS.length,
        registration_package_version: packageSignature?.agreement_version || PACKAGE_VERSION,
        registration_package_signer_name: packageSignature?.signer_name || '',
        registration_package_signer_email: packageSignature?.signer_email || '',
        registration_package_client_signed_at: packageSignature?.client_signed_at || ''
      };
    }

    function init() {
      const heading = getEl('documentSignatureHeading');
      const intro = getEl('documentSignatureIntro');
      if (heading) heading.textContent = copy.heading;
      if (intro) intro.textContent = copy.intro;
      const modal = getEl('documentModal');
      const closeButton = getEl('documentModalCloseBtn');
      const signButton = getEl('documentModalSignBtn');
      const body = getEl('documentModalBody');
      modal?.setAttribute('aria-label', copy.viewer);
      if (closeButton) closeButton.textContent = copy.close;
      closeButton?.addEventListener('click', closeDocument);
      signButton?.addEventListener('click', signActiveDocument);
      body?.addEventListener('scroll', () => {
        if (documentReachedBottom()) reachedBottom = true;
        updateModalSignState();
      });
      modal?.addEventListener('click', (event) => {
        if (event.target.id === 'documentModal') closeDocument();
      });
      getEl('parent1_name')?.addEventListener('input', resetSignatures);
      getEl('parent1_email')?.addEventListener('input', resetSignatures);
      updateCards();
    }

    return {
      init,
      validateBeforeSubmit,
      payload,
      resetSignatures,
      openDocument
    };
  }

  window.createSignupDocumentFlow = createSignupDocumentFlow;
})();

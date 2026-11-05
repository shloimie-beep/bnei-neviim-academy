(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const labels = { pod: 'Learning pod', academy: 'Academy 2027–28', both: 'Both' };
  const key = 'bna-interest-owner-filters-v1'; let state = { program: 'all', area: '', followUp: 'all' };
  try { const saved = JSON.parse(sessionStorage.getItem(key) || 'null'); if (saved && ['all', 'pod', 'academy', 'both'].includes(saved.program)) state = { ...state, ...saved }; } catch {}
  function matches(lead) {
    const metadata = lead.metadata || {}, program = metadata.program_interest;
    const programMatch = state.program === 'all' || program === state.program || state.program !== 'both' && program === 'both';
    const area = (metadata.area || '') + ' ' + (metadata.preferred_area || '');
    const followUp = state.followUp === 'all' || state.followUp === 'due' && lead.next_follow_up_date && new Date(lead.next_follow_up_date) <= new Date() || state.followUp === lead.status;
    return programMatch && (!state.area || area.toLowerCase().includes(state.area.toLowerCase().trim())) && Boolean(followUp);
  }
  function renderFilters(leads) {
    return `<section class="bna-interest-filters" aria-label="BNA inquiry filters"><div class="bna-interest-filter-grid"><label>Program<select data-bna-interest-filter="program" onchange="setBnaInterestFilter('program',this.value)">${[['all', 'All programs'], ...Object.entries(labels)].map(([value, label]) => `<option value="${value}" ${state.program === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label>Area or preferred area<input data-bna-interest-filter="area" value="${escape(state.area)}" onchange="setBnaInterestFilter('area',this.value)" placeholder="Search any area"></label><label>Follow-up<select data-bna-interest-filter="followUp" onchange="setBnaInterestFilter('followUp',this.value)">${[['all', 'All follow-up states'], ['new', 'New inquiry'], ['follow_up', 'Follow-up'], ['due', 'Follow-up due'], ['not_now', 'Not now']].map(([value, label]) => `<option value="${value}" ${state.followUp === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label></div><div class="bna-interest-tools"><span>${leads.filter(matches).length} matching inquiries</span><button class="task-action" onclick="clearBnaInterestFilters()">Clear filters</button><button class="task-action" onclick="BNAInterestOwner.openArchive()">Legacy archive</button><button class="task-action" onclick="BNAInterestOwner.previewEmail()">Receipt email</button></div></section>`;
  }
  function renderEvidence(lead) {
    const m = lead.metadata || {}; if (!m.interest_launch) return '';
    return `<section class="bna-interest-evidence" aria-label="Saved inquiry"><dl><div><dt>Program</dt><dd>${escape(labels[m.program_interest] || m.program_interest)}</dd></div><div><dt>Family area</dt><dd>${escape(m.area)}</dd></div><div><dt>Preferred program area</dt><dd>${escape(m.preferred_area || 'Not specified')}</dd></div><div><dt>Receipt email</dt><dd>${escape((lead.interest_ack_state || 'draft').replaceAll('_', ' '))}</dd></div><div><dt>Inquiry reference</dt><dd>${escape(m.latest_inquiry_reference)}</dd></div></dl><button class="task-action" onclick="BNAInterestOwner.openHistory(${Number(lead.id)})">Inquiry details and history</button></section>`;
  }
  function dialog(title) {
    document.querySelector('#bna-interest-dialog')?.remove();
    const node = document.createElement('dialog'); node.id = 'bna-interest-dialog'; node.className = 'bna-interest-dialog'; node.setAttribute('aria-label', title);
    node.innerHTML = `<div class="bna-interest-dialog-header"><h2>${escape(title)}</h2><button type="button" class="task-action" data-close>Close</button></div><div data-content role="status">Loading…</div>`;
    node.querySelector('[data-close]').onclick = () => node.close(); node.addEventListener('close', () => node.remove()); document.body.append(node); node.showModal(); return node;
  }
  async function request(url, options = {}) {
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}) }, ...options });
    if (!response.ok) throw Error('Could not load or update this BNA record. Please retry.'); return response.json();
  }
  async function openHistory(id) {
    const node = dialog('Inquiry details and history'), content = node.querySelector('[data-content]');
    try { const result = await request('/api/bna/interest-inquiries/' + id + '?workspace=bna&project_key=bna');
      content.innerHTML = `<h3>${escape(result.lead.parent_name)}</h3>${result.inquiries.map(inquiry => `<article><h4>${escape(labels[inquiry.fields.program])}</h4><p>${escape(inquiry.fields.email)}${inquiry.fields.phone ? ' · ' + escape(inquiry.fields.phone) : ''}</p><p>${escape(inquiry.fields.area)}${inquiry.fields.preferredArea ? ' / ' + escape(inquiry.fields.preferredArea) : ''}</p><p>Child age(s): ${inquiry.fields.childAges.map(escape).join(', ')}</p><p>${escape(inquiry.fields.learningArrangement)} ${escape(inquiry.fields.torahExperience)}</p><p>${escape(inquiry.fields.question)}</p><p>Contact permission received · ${escape(inquiry.fields.permission.version)}</p><p>Receipt email: ${escape((inquiry.email_state || 'draft').replaceAll('_', ' '))}</p><p class="bna-interest-reference">${escape(inquiry.id)} · ${escape(new Date(inquiry.created_at).toLocaleString())}</p></article>`).join('')}`;
    } catch (error) { content.textContent = error.message; }
  }
  async function previewEmail() {
    const node = dialog('Receipt email'), content = node.querySelector('[data-content]');
    try { const result = await request('/api/bna/interest-email/preview?workspace=bna&project_key=bna'); content.innerHTML = `<p>${escape(result.sender)}<br>Reply-to: ${escape(result.replyTo)}</p><p>${result.release?.active ? 'Active for new inquiries' : 'Saved draft — sending inactive'}</p>${result.drafts.map(draft => `<article lang="${draft.language}" dir="${draft.language === 'he' ? 'rtl' : 'ltr'}"><h3>${escape(draft.subject)}</h3><pre>${escape(draft.text)}</pre></article>`).join('')}`; } catch (error) { content.textContent = error.message; }
  }
  async function openArchive(table = 'bna_parent_leads', offset = 0) {
    const node = dialog('Legacy BNA archive'), content = node.querySelector('[data-content]');
    try { const result = await request('/api/bna/interest-archive?workspace=bna&project_key=bna&table=' + encodeURIComponent(table) + '&offset=' + offset);
      const run = result.runs.find(item => item.state === 'applied'), counts = run?.inventory?.counts || {};
      content.innerHTML = `<p>Original records and linked history are retained. Restoring a record returns it to its previous visibility.</p><p>${run ? 'Archive cutoff: ' + escape(new Date(run.cutoff).toLocaleString()) : 'No legacy archive has been applied.'}</p><label>Record type<select data-archive-table>${Object.entries(counts).filter(([, count]) => count > 0).map(([name, count]) => `<option value="${escape(name)}" ${name === table ? 'selected' : ''}>${escape(name.replace(/^bna_/, '').replaceAll('_', ' '))} (${count})</option>`).join('')}</select></label><div>${result.items.map(item => `<article><strong>${escape(item.snapshot.parent_name || item.snapshot.student_name || item.snapshot.name || item.snapshot.full_name || item.snapshot.title || item.entity_table.replace(/^bna_/, '').replaceAll('_', ' '))}</strong><p>${escape(item.snapshot.parent_email || item.snapshot.primary_email || item.snapshot.email || '')}</p><p>${escape(item.snapshot.subject || '')}</p><p>${escape(item.snapshot.notes || '').slice(0, 800)}</p><p>Record ${escape(item.entity_id)} · ${escape(item.snapshot.created_at || '')}</p><button class="task-action" data-restore-id="${escape(item.entity_id)}">Restore record</button></article>`).join('')}</div>${result.nextOffset !== null ? '<button class="task-action" data-next>Next page</button>' : ''}`;
      content.querySelector('[data-archive-table]')?.addEventListener('change', event => openArchive(event.target.value));
      content.querySelector('[data-next]')?.addEventListener('click', () => openArchive(table, result.nextOffset));
      content.querySelectorAll('[data-restore-id]').forEach(button => { button.onclick = async () => { button.disabled = true; try { await request('/api/bna/interest-archive/restore?workspace=bna&project_key=bna', { method: 'POST', body: JSON.stringify({ table, id: button.dataset.restoreId }) }); button.textContent = 'Restored'; } catch (error) { button.textContent = error.message; button.disabled = false; } }; });
    } catch (error) { content.textContent = error.message; }
  }
  window.BNAInterestOwner = { matches, renderFilters, renderEvidence, openHistory, openArchive, previewEmail,
    setFilter(kind, value) { if (['program', 'area', 'followUp'].includes(kind)) state[kind] = String(value).slice(0, 180); try { sessionStorage.setItem(key, JSON.stringify(state)); } catch {} },
    clear() { state = { program: 'all', area: '', followUp: 'all' }; try { sessionStorage.removeItem(key); } catch {} },
  };
})();

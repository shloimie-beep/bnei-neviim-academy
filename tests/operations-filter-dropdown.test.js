const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const operationsHtml = fs.readFileSync('public/operations.html', 'utf8');

test('Operations variable filters use in-page dropdowns instead of native selects', () => {
  assert.doesNotMatch(operationsHtml, /<select\s+class="filter-select"/);
  assert.match(operationsHtml, /function renderFilterSelect/);
  assert.match(operationsHtml, /class="filter-dropdown"/);
  assert.match(operationsHtml, /aria-haspopup="listbox"/);
  assert.match(operationsHtml, /function toggleFilterDropdown/);
});

test('Interested Parents renders as a lead pipeline with secondary phones visible', () => {
  assert.match(operationsHtml, /function renderLeadPipeline/);
  assert.match(operationsHtml, /class="lead-pipeline-board"/);
  assert.match(operationsHtml, /function leadOtherPhones/);
  assert.match(operationsHtml, /Other Phones/);
});

test('Interested Parents has a manual lead capture action wired to contact history', () => {
  assert.match(operationsHtml, /onclick="addInterestedParentLead\(event\)">Add interested parent/);
  assert.match(operationsHtml, /async function addInterestedParentLead/);
  assert.match(operationsHtml, /api\.createParentLead\(\{/);
  assert.match(operationsHtml, /created_from: 'operations_interested_parent_pipeline'/);
  assert.match(operationsHtml, /api\.createContactCommunication\(\{/);
  assert.match(operationsHtml, /Initial lead note for/);
});

test('Operations filter dropdown menus are fixed-position overlays', () => {
  assert.match(operationsHtml, /\.filter-dropdown-menu\s*{[\s\S]*position:\s*fixed/);
  assert.match(operationsHtml, /\.filter-dropdown-menu\s*{[\s\S]*z-index:\s*5000/);
  assert.match(operationsHtml, /function positionFilterDropdown/);
  assert.match(operationsHtml, /getBoundingClientRect\(\)/);
  assert.match(operationsHtml, /window\.addEventListener\('scroll', positionOpenFilterDropdowns, true\)/);
  assert.match(operationsHtml, /event\.key === 'Escape'/);
});

test('Students selected student control uses polished in-page dropdown', () => {
  assert.doesNotMatch(operationsHtml, /<select onchange="selectStudentAndOpen/);
  assert.match(operationsHtml, /function renderStudentPicker/);
  assert.match(operationsHtml, /student-select-dropdown/);
  assert.match(operationsHtml, /student-select-menu/);
  assert.match(operationsHtml, /selectStudentAndOpen\(\$\{Number\(student\.id\)\}/);
});

test('Person detail views use custom side section menus', () => {
  assert.match(operationsHtml, /function renderPersonSectionMenu/);
  assert.match(operationsHtml, /person-section-dropdown/);
  assert.match(operationsHtml, /person-section-button/);
  assert.match(operationsHtml, /STUDENT_DETAIL_SECTIONS/);
  assert.match(operationsHtml, /CONTACT_DETAIL_SECTIONS/);
  assert.match(operationsHtml, /LEAD_DETAIL_SECTIONS/);
  assert.match(operationsHtml, /PEOPLE_DETAIL_SECTIONS/);
  assert.match(operationsHtml, /function renderStudentDetailSidebar/);
  assert.match(operationsHtml, /function setContactDetailSection/);
  assert.doesNotMatch(operationsHtml, /<select[^>]+person-section/);
});

test('Operations exposes goal sharing toggles and question source enrichment', () => {
  assert.match(operationsHtml, /goal-share-student-/);
  assert.match(operationsHtml, /goal-share-parent-/);
  assert.match(operationsHtml, /student_visible/);
  assert.match(operationsHtml, /parent_visible/);
  assert.match(operationsHtml, /function enrichQuestionSources/);
  assert.match(operationsHtml, /function enrichRecentQuestionSources/);
  assert.match(operationsHtml, /\/accountability\/' \+ id \+ '\/sefaria-sources/);
  assert.match(operationsHtml, /\/accountability\/enrich-question-sources/);
});

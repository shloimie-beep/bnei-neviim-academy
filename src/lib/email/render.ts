/**
 * Render the DailySummary React Email template to `{ html, text }`.
 *
 * HTML uses @react-email/render against the JSX template. The plain-text
 * fallback is hand-walked from props — it doesn't need to be pretty, it just
 * needs to make Gmail/Outlook spam filters happier. Ahuva will read the HTML.
 */

import { render } from '@react-email/render';
import * as React from 'react';

import {
  DailySummary,
  type DailySummaryProps,
} from './templates/DailySummary';

export type RenderedEmail = {
  html: string;
  text: string;
};

function statusGlyph(completed: boolean): string {
  return completed ? '[v]' : '[x]';
}

function buildText(props: DailySummaryProps): string {
  const lines: string[] = [];
  lines.push(`Family Accountability — ${props.date}`);
  lines.push('');

  if (props.kids.length === 0) {
    lines.push('Quiet day — no goals tracked today.');
    lines.push('');
  } else {
    for (const kid of props.kids) {
      const completed = kid.goals.filter((g) => g.completed).length;
      const total = kid.goals.length;
      lines.push(
        `${kid.name} — ${completed} of ${total} goals — ${kid.streak} day streak`,
      );

      if (kid.goals.length === 0) {
        lines.push('  No goals set for this meeting.');
      } else {
        for (const goal of kid.goals) {
          lines.push(`  ${statusGlyph(goal.completed)} ${goal.title}`);
          if (goal.proofNote) {
            lines.push(`     note: ${goal.proofNote}`);
          }
          if (goal.proofPhotoUrl) {
            lines.push(`     photo: ${goal.proofPhotoUrl}`);
          }
          if (goal.completed && goal.approved === null) {
            lines.push('     (pending parent approval)');
          }
        }
      }
      lines.push('');
    }
  }

  lines.push(`Parent dashboard: ${props.parentDashboardUrl}`);
  return lines.join('\n');
}

/**
 * Render the daily summary to both HTML and plain text.
 *
 * `@react-email/render` returns a Promise in v1.x — we await it. The text
 * fallback is generated locally so we don't need a second render pass.
 */
export async function renderDailySummary(
  props: DailySummaryProps,
): Promise<RenderedEmail> {
  const html = await render(React.createElement(DailySummary, props));
  const text = buildText(props);
  return { html, text };
}

/**
 * Daily summary email template.
 *
 * Pure server-side React. No `'use client'`, no Tailwind, no class names —
 * email clients strip class names, so EVERYTHING is inline styles.
 *
 * Palette (DESIGN.md):
 *   bg      #FAF6EE
 *   ink     #1A1A1A
 *   accent  #6B2D2D (burgundy)
 *   gold    #C8A052 (completed)
 *   rose    #B45B5B (missed / rejected)
 *
 * Fonts: serif stack for headings, sans-serif stack for body — no Google
 * Fonts in email (most clients won't load them and the fallback is what
 * actually renders).
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export type DailySummaryGoal = {
  title: string;
  completed: boolean;
  proofNote?: string;
  proofPhotoUrl?: string;
  /** null = pending parent approval, true = approved, false = rejected. */
  approved?: boolean | null;
};

export type DailySummaryKid = {
  name: string;
  streak: number;
  goals: DailySummaryGoal[];
};

export type DailySummaryProps = {
  /** Pre-formatted, e.g. "Tuesday, May 12". */
  date: string;
  kids: DailySummaryKid[];
  parentDashboardUrl: string;
};

// ---------- inline style constants ----------
const COLOR = {
  bg: '#FAF6EE',
  surface: '#FFFFFF',
  ink: '#1A1A1A',
  inkSoft: '#5B5B5B',
  line: '#E8E1D1',
  accent: '#6B2D2D',
  gold: '#C8A052',
  rose: '#B45B5B',
} as const;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = 'Arial, Helvetica, sans-serif';

const bodyStyle: React.CSSProperties = {
  backgroundColor: COLOR.bg,
  color: COLOR.ink,
  margin: 0,
  padding: '32px 0',
  fontFamily: SANS,
};

const containerStyle: React.CSSProperties = {
  backgroundColor: COLOR.surface,
  border: `1px solid ${COLOR.line}`,
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '32px',
};

const headerLabelStyle: React.CSSProperties = {
  color: COLOR.inkSoft,
  fontFamily: SANS,
  fontSize: '12px',
  letterSpacing: '0.08em',
  margin: 0,
  textTransform: 'uppercase',
};

const headerDateStyle: React.CSSProperties = {
  color: COLOR.ink,
  fontFamily: SERIF,
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: 1.2,
  margin: '8px 0 0 0',
};

const kidSectionStyle: React.CSSProperties = {
  marginTop: '24px',
};

const kidNameStyle: React.CSSProperties = {
  color: COLOR.accent,
  fontFamily: SERIF,
  fontSize: '22px',
  fontWeight: 600,
  lineHeight: 1.2,
  margin: 0,
};

const kidMetaStyle: React.CSSProperties = {
  color: COLOR.inkSoft,
  fontFamily: SANS,
  fontSize: '14px',
  margin: '4px 0 12px 0',
};

const goalRowStyle: React.CSSProperties = {
  borderTop: `1px solid ${COLOR.line}`,
  padding: '10px 0',
};

const goalTitleStyle: React.CSSProperties = {
  color: COLOR.ink,
  fontFamily: SANS,
  fontSize: '16px',
  lineHeight: 1.4,
  margin: 0,
};

const proofNoteStyle: React.CSSProperties = {
  color: COLOR.inkSoft,
  fontFamily: SANS,
  fontSize: '14px',
  lineHeight: 1.4,
  margin: '4px 0 0 0',
};

const pendingStyle: React.CSSProperties = {
  color: COLOR.inkSoft,
  fontFamily: SANS,
  fontSize: '13px',
  fontStyle: 'italic',
  lineHeight: 1.4,
  margin: '4px 0 0 0',
};

const proofLinkStyle: React.CSSProperties = {
  color: COLOR.accent,
  fontFamily: SANS,
  fontSize: '13px',
  textDecoration: 'underline',
};

const quietDayStyle: React.CSSProperties = {
  color: COLOR.inkSoft,
  fontFamily: SERIF,
  fontSize: '18px',
  fontStyle: 'italic',
  lineHeight: 1.4,
  margin: '24px 0',
  textAlign: 'center',
};

const footerStyle: React.CSSProperties = {
  color: COLOR.inkSoft,
  fontFamily: SANS,
  fontSize: '13px',
  lineHeight: 1.5,
  margin: '24px 0 0 0',
  textAlign: 'center',
};

const footerLinkStyle: React.CSSProperties = {
  color: COLOR.accent,
  textDecoration: 'underline',
};

const hrStyle: React.CSSProperties = {
  borderColor: COLOR.line,
  borderStyle: 'solid',
  borderWidth: '1px 0 0 0',
  margin: '24px 0 0 0',
};

// Status glyph: gold check, rose cross, plain ASCII (no emoji per DESIGN.md).
function StatusGlyph({ completed }: { completed: boolean }) {
  return (
    <span
      style={{
        color: completed ? COLOR.gold : COLOR.rose,
        display: 'inline-block',
        fontFamily: SANS,
        fontSize: '18px',
        fontWeight: 700,
        marginRight: '8px',
        width: '20px',
      }}
    >
      {completed ? '✓' : '✗'}
    </span>
  );
}

function GoalLine({ goal }: { goal: DailySummaryGoal }) {
  const isPending = goal.completed && goal.approved === null;

  return (
    <div style={goalRowStyle}>
      <Text style={goalTitleStyle}>
        <StatusGlyph completed={goal.completed} />
        {goal.title}
      </Text>
      {goal.proofNote ? (
        <Text style={proofNoteStyle}>{goal.proofNote}</Text>
      ) : null}
      {goal.proofPhotoUrl ? (
        <Text style={proofNoteStyle}>
          <Link href={goal.proofPhotoUrl} style={proofLinkStyle}>
            View proof photo
          </Link>
        </Text>
      ) : null}
      {isPending ? (
        <Text style={pendingStyle}>pending parent approval</Text>
      ) : null}
    </div>
  );
}

function KidBlock({ kid }: { kid: DailySummaryKid }) {
  const completed = kid.goals.filter((g) => g.completed).length;
  const total = kid.goals.length;

  return (
    <Section style={kidSectionStyle}>
      <Text style={kidNameStyle}>{kid.name}</Text>
      <Text style={kidMetaStyle}>
        {completed} of {total} goals today &middot; {kid.streak} day streak
      </Text>
      {kid.goals.length === 0 ? (
        <Text style={proofNoteStyle}>No goals set for this meeting.</Text>
      ) : (
        kid.goals.map((goal, i) => (
          <GoalLine key={`${kid.name}-goal-${i}`} goal={goal} />
        ))
      )}
    </Section>
  );
}

export function DailySummary({
  date,
  kids,
  parentDashboardUrl,
}: DailySummaryProps) {
  return (
    <Html>
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section>
            <Text style={headerLabelStyle}>Family Accountability</Text>
            <Heading style={headerDateStyle} as="h1">
              {date}
            </Heading>
          </Section>

          {kids.length === 0 ? (
            <Text style={quietDayStyle}>Quiet day — no goals tracked today.</Text>
          ) : (
            kids.map((kid) => <KidBlock key={kid.name} kid={kid} />)
          )}

          <Hr style={hrStyle} />

          <Text style={footerStyle}>
            <Link href={parentDashboardUrl} style={footerLinkStyle}>
              Open the parent dashboard
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DailySummary;

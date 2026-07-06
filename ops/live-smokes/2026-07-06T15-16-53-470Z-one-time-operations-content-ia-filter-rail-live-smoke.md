# One Time Operations Content IA Filter Rail Live Smoke - 2026-07-06T15:17:03.239Z

App: https://bneineviimacademy.org
Route: `/operations?workspace=rabbi_sheller_provider&view=content&section=meetings&nav=modules`
Railway deployment: `be251afc-471c-414b-93b6-757de8db82db`
Result: passed

## Checks
- PASS operations login session - source=railway
- PASS content route stays in Rabbi workspace - rabbi_sheller_provider
- PASS content route opens requested section - meetings
- PASS top rail is labeled as sections, not filters/views - sections
- PASS top rail aria label uses section language - Classes & Content sections
- PASS content top rail has only compact One Time sections - one_time_library, meetings, research, bundles
- PASS Library appears as the first content section
- PASS Meeting Drops content section appears
- PASS Source Prep content section appears
- PASS Bundles content section appears
- PASS generic production tabs are absent from One Time content rail
- PASS sidebar exposes Classes & Content
- PASS sidebar still exposes Studio
- PASS sidebar content subnav includes Library
- PASS sidebar content subnav includes Meeting Drops
- PASS sidebar content subnav includes Source Prep
- PASS sidebar subnav omits repetitive generic content categories
- PASS Rabbi sidebar hides unrelated support/admin categories
- PASS extra module toolbar is not rendered above content rail
- PASS meeting drop workflow content still renders
- PASS provider Program Content section opens
- PASS provider Program top rail includes compact Content section
- PASS Program Content bridge links to all four content sections
- PASS mobile content rail track scrolls horizontally - auto
- PASS mobile content rail keeps buttons on one sliding row - nowrap
- PASS mobile hides rail meta row to save vertical space
- PASS mobile page has no body-level horizontal overflow - 390/390
- PASS mobile rail keeps same four compact content sections - one_time_library, meetings, research, bundles
- PASS no browser console/page errors during exact live smoke

## Guardrails
- Authenticated browser readback only.
- No external sends, payment/access/DNS/provider-account mutation, Drive write, or production data mutation was performed.
- No screenshots or private page data were committed.

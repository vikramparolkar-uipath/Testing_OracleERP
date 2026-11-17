# Test Manager Custom Fields — Recommendation (Oracle Fusion ERP demo)

Source: https://docs.uipath.com/test-manager/automation-cloud/latest/user-guide/managing-custom-fields
Key constraints: only **Label** fields can be filtered and grouped (Text / Rich Text can't). Names are capped at 20 characters. Fields are defined per project by Administrators and apply to Requirements, Test Cases and Test Sets. Label values can be added or removed but not renamed.

## Recommended custom fields

1. **ERP Module** (Label; Requirements, Test Cases, Test Sets)
   - Values: Payables, Procurement SSP, Receivables, General Ledger, Sales CX, Platform
   - Use: group everything by pillar

2. **Business Process** (Label; Requirements, Test Cases, Test Sets)
   - Values: Procure-to-Pay, Order-to-Cash, Record-to-Report, Lead-to-Order, Platform Access
   - Use: end-to-end process view for business audiences

3. **Oracle Release** (Label; Requirements, Test Cases). Default: Baseline
   - Values: Baseline, 26C, 26D
   - Use: "what's new in this release" view

4. **Release Feature** (Label; Requirements, Test Cases). Default: None
   - Values: 26D Saved Views, 26D Account Search, 26C Notes Indicator, 26C Cart Nav Bar, None
   - Use: jump straight to one feature during a demo

5. **Demo Track** (Label; Test Cases, Test Sets)
   - Values: Core E2E, Whats New, Controls Negative, Automation Showcase
   - Use: one saved view per demo storyline

6. **Automation Status** (Label; Test Cases). Default: Manual
   - Values: Automated, Candidate, Manual, Blocked
   - Use: show automation coverage and progress

7. **UI Technology** (Label; Test Cases)
   - Values: ADF Classic, Redwood
   - Use: shows UiPath handling both Oracle page styles

8. **Env Constraint** (Label; Requirements, Test Cases). Default: None
   - Values: None, Access Gap, Config Gap, Known Defect, Shared Data
   - Use: separates real failures from environment problems

9. **Req Confidence** (Label; Requirements)
   - Values: Observed, Oracle Doc, Assumed
   - Use: flags requirements that still need business sign-off

Optional (reference only, not filterable):
- **Oracle Doc Link** (Text; Requirements): the release-note URL
- **Success Criteria** (Rich Text; Requirements; Test Cloud projects only): the SC table from requirements-traceability.md

Tip: use Test Manager's built-in **object labels** (tags, which also work on executions) for one-off flags such as `demo-ready` or `showcase`.

## Values for each test case

- **TC-01 Login & navigation:** Platform | Platform Access | Baseline | None | Core E2E | Automated (shared login step) | ADF Classic | Shared Data
- **TC-02 Create & validate AP invoice:** Payables | Procure-to-Pay | Baseline | None | Core E2E (+tag showcase) | Automated | ADF Classic | None
- **TC-03 Search invoice & verify status:** Payables | Procure-to-Pay | Baseline | None | Core E2E (+tag showcase) | Automated | ADF Classic | None
- **TC-04 Tax mismatch (negative):** Payables | Procure-to-Pay | Baseline | None | Controls Negative | Manual | ADF Classic | None
- **TC-05 Catalog search & add to cart:** Procurement SSP | Procure-to-Pay | 26C | 26C Cart Nav Bar | Core E2E (+tag showcase) | Automated | Redwood | Shared Data
- **TC-06 Saved views (26D):** Procurement SSP | Procure-to-Pay | 26D | 26D Saved Views | Whats New (+tag showcase) | Automated | Redwood | None
- **TC-07 Notes & attachments indicator (26C):** Procurement SSP | Procure-to-Pay | 26C | 26C Notes Indicator | Whats New | Candidate | Redwood | None
- **TC-08 Charge account search (26D):** Procurement SSP | Record-to-Report | 26D | 26D Account Search | Whats New | Manual | Redwood | Known Defect
- **TC-09 Create opportunity:** Sales CX | Lead-to-Order | Baseline | None | Core E2E (+tag showcase) | Automated | ADF Classic | None
- **TC-10 AR transaction read-only:** Receivables | Order-to-Cash | Baseline | None | Core E2E | Manual | ADF Classic | Config Gap

(Order: ERP Module | Business Process | Oracle Release | Release Feature | Demo Track | Automation Status | UI Technology | Env Constraint)

## Demo views this enables

1. **What's new in 26C/26D:** filter Oracle Release ≠ Baseline, group by Release Feature. Shows TC-05 to TC-08 with their requirements.
2. **Automation showcase:** filter Automation Status = Automated, group by UI Technology. Shows ADF vs Redwood side by side.
3. **End-to-end by process:** group by Business Process (Procure-to-Pay, Order-to-Cash, Lead-to-Order).
4. **Single-feature drill-down:** filter Release Feature = 26D Saved Views. Shows BR-06, TC-06 and its executions.
5. **Environment health:** filter Env Constraint ≠ None. Explains anything blocked or failing.
6. **Requirements needing sign-off:** filter Req Confidence = Assumed.

## Tips
- Keep it to about 6 core Label fields for live demos; more than that clutters the filters.
- Set defaults (Oracle Release = Baseline, Env Constraint = None, Automation Status = Manual) so you only edit the exceptions.
- Decide values up front, because Label values can't be renamed later.
- When ready: `uip tm customfield` (definitions and values) and `uip tm objectlabel` (tags) can create these and fill them in.

# Oracle Procure-to-Pay suite: automation spec

**Source:** `docs/test-documentation` (12 scenarios: PDF + `.md` per test)
**Data:** Data Fabric entities in [data-fabric-schema.md](data-fabric-schema.md)
**Browser:** Edge InPrivate (set at run time by `Set Runtime Browser` in the Login workflow, `in_Browser` = `Edge` by default; InPrivate keeps 1Password autofill out of the sign-in form and gives every test a fresh session)
**Persona:** Catherine PayablesManager (`catherine.payablesmanager`) unless noted; STR-005 also signs in as the approver.

## How a test runs

Every test is independent and follows the same shape:

1. **Given**: `Common/NewRunContext` (RunId, pod host from the `Oracle Fusion ERP URL` asset, timestamp) → `DataFabric/DF_GetApDataProfile` (business unit, supplier, accounts, tax rate) → `Login to Oracle ERP` (`in_Username`, `in_Browser`) → `AP/AP_OpenInvoicesWorkArea`.
2. **When**: UI components below. Consumers first **claim** a record from Data Fabric (`DF_ClaimApInvoice` / `DF_ClaimPoSchedule`); if none is free they **provision** it with the same components a producer uses.
3. **Then**: `Verify Expression` checks taken from each document's check table, then the Data Fabric record is registered or updated and the claim released.

Invoice numbers are `P2P-<TC>-<yyMMddHHmmss>`. Header amounts are `line × (1 + TaxRatePercent/100)` so the invoice validates without an amount-variance hold (US1 adds 9.5% tax).

## Reusable components

| Workflow | Does |
|---|---|
| `Workflows/Login to Oracle ERP.xaml` | Set Runtime Browser, open the pod URL from the asset, sign in with `in_Username` (falls back to the credential asset's user) and the asset password |
| `Workflows/Common/NewRunContext.xaml` | RunId, pod host, timestamp |
| `Workflows/AP/AP_OpenInvoicesWorkArea.xaml` | Home → Payables → Invoices |
| `Workflows/AP/AP_OpenTask.xaml` | Tasks panel → Create Invoice or Manage Invoices |
| `Workflows/AP/AP_EnterInvoiceHeader.xaml` | Identifying PO or BU + supplier, type, number, amount, description; reads site and date |
| `Workflows/AP/AP_EnterInvoiceLine.xaml` | Row `in_LineIndex`: amount, description, distribution combination, optional project/task/expenditure type/org (resolves the Search and Select dialog) |
| `Workflows/AP/AP_SaveInvoice.xaml` | Save (optionally Save and Close), Oracle error/warning dialog handling, waits for the number in the title, reads status |
| `Workflows/AP/AP_ValidateInvoice.xaml` | Invoice Actions → Validate, polls status, reads Items/Tax/Total/Due |
| `Workflows/AP/AP_FindInvoice.xaml` | Manage Invoices search; parses type, validation status, approval status and holds from the result row; optionally opens the invoice |
| `Workflows/AP/AP_ValidateInvoiceDetails.xaml` | Invoice Details → Actions → Validate; reads status and holds |
| `Workflows/AP/AP_CloseManageInvoices.xaml` | Done → back to the work area |
| `Workflows/AP/AP_InitiateApproval.xaml` | Invoice Details (or Create/Edit) → Actions → Approval → Initiate |
| `Workflows/AP/AP_ApproveNotification.xaml` | Approver: bell → notification for `in_InvoiceNumber` → Approve (waits for the notification to arrive) |
| `Workflows/AP/AP_MatchPoLines.xaml` | Lines → Match Invoice Lines → Go, search the PO, tick the first schedule, accept warnings, OK; reads line 1 PO |
| `Workflows/Common/CloseOracleBrowser.xaml` | Closes the InPrivate window so another persona can sign in |
| `Workflows/DataFabric/*` | Get profile, register/claim/update invoices, claim/update PO schedules |

All UI targets are in the Object Repository: screens **Oracle Fusion Home** (Edge, any pod) and **Oracle Fusion Payables (Edge)** (one screen for every Payables page, matched on browser + Oracle host). Line-level targets are parametrized by `{{lineIndex}}`; Manage Invoices result link by `{{invoiceNumber}}`; the Search and Select row by `{{lovValue}}`.

## Tests

| Test case | Profile | Reads from Data Fabric | Writes to Data Fabric | Status |
|---|---|---|---|---|
| UNIT-PTP-080-010-010-001 Enter Invoice Manually | US1-NoApproval | profile | Standard, NotValidated | **Passing** |
| UNIT-PTP-080-010-030-001 Enter Prepaid Invoice | US1-NoApproval | profile | Prepayment, Validated | **Passing** |
| UNIT-PTP-080-010-130-001 Enter Pre-Paid Advance Invoice | US1-NoApproval | profile | Prepayment, Validated | **Passing** |
| UNIT-PTP-080-010-060-001 Invoice Lines and Projects | US1-Projects | profile | Standard, NotValidated, project coded | **Passing** |
| UNIT-PTP-080-010-160-001 Enter Invoice and Credit Memo | US1-NoApproval | profile | Standard + CreditMemo, NotValidated | **Passing** |
| UNIT-PTP-080-010-080-001 Validate Invoice | US1-NoApproval | claims NotValidated (else creates) | → Validated | **Passing** (both claim and create paths) |
| STR-PTP-080-010-006 Manual Invoices Auto-Approval | US1-NoApproval | claims NotValidated (else creates) | → Validated, approval Not required | **Passing** |
| UNIT-PTP-080-010-040-001 Match Invoice with PO and Receipt | ProgressUS-3Way | claims ThreeWay PO schedule | invoice Validated; PO unit billed | **Blocked by data**: no received, unbilled schedule for Lee Supplies in Progress US (receipt lookup is empty); stops with "PO pool exhausted" |
| UNIT-PTP-080-010-050-001 Match Invoice with PO 2-Way | ProgressUS-3Way | claims TwoWay PO schedule | invoice Validated; one unit billed | **Passing** (17 Nov) |
| UNIT-PTP-080-010-150-001 Match Invoice to PO 2-Way | ProgressUS-3Way | claims TwoWay PO schedule; header saved first | invoice Validated; one unit billed | **Passing** (17 Nov) |
| UNIT-PTP-080-010-090-001 Review Invoices | HealthcareUS-Approval | claims Validated + Initiated (rechecked in Oracle; else creates + initiates) | read-only | **Passing** (17 Nov) |
| STR-PTP-080-010-005 Manual Invoices Approval Workflow | HealthcareUS-Approval | profile | Validated, approval Approved (Anastasia Ortega) | **Passing** (17 Nov) |

## Known behaviour

- **Input method.** Clicks and typing use the Chromium API (`DebuggerApi`), not hardware events, so the robot does not need window focus and the person at the PC can keep working. Typing relies on Empty field (single line) to clear: a Ctrl+A inside an ADF table selects every row and Oracle drops the typed value. The Invoice Type select still uses hardware events.
- **Healthcare US lines.** A new Healthcare invoice opens with five blank lines; blanks are dropped on save. The account must be typed in full (`110-84120-64210-00-00000-000-000-00000`, eight segments including Product). The test document shows it cut short (`...-0`), which leaves Product blank and opens the account selector on save.
- **Approval.** Initiate is reliable from Invoice Details (`*:ap1:r7:*:cm3`). The approver (Anastasia Ortega, `anastasia.ortega`) approves from the notification bell; the Approve button is matched on the invoice number.
- **Personas.** InPrivate windows share one session, so switching persona closes the browser first.

- Fusion keeps Lines collapsed for several seconds after Expand; the line component waits up to 45 s for the row.
- Ambiguous lookups (for example "Consulting US") open a Search and Select dialog; the line component picks the exact value.
- Prepayments: the distribution defaults from the supplier site, so no distribution is typed.
- A scratch invoice from target capture (100.00, project coded, Needs revalidation) exists on pod `dabpqy` from target capture. It is not in Data Fabric, so no test uses it.

## Status 16 Nov 2026 (end of day)

- 7 of 12 pass live end to end on pod dabpqy (runs take 4-7 minutes each).
- PO match: all Match Invoice Lines targets are captured (PO search, first-row Match checkbox, schedule details, row warning OK, dialog OK, line PO number). Pool: `701343-1-1` (Lee Supplies, Progress US, 4 Ea x 201.00, 2-way, no receipt) seeded Available. No received, unbilled schedule found yet for 3-way (040). Tests 040/050/150 still to be generated.
- Approval: Invoice Details > Actions > Approval menu item captured; Initiate submenu, Holds and Approvals content and the approver notification still to capture. Blocked on line entry in Healthcare US Business Unit (budgetary control): typed lines do not persist and the invoice saves without lines. The STR-005 document's GL account `110-84120-64210-00-00000-000-000-0` is not a valid combination on this pod.
- Five scratch invoices from target capture remain on the pod (not in Data Fabric); one Healthcare invoice among them has no lines.

## Status 17 Nov 2026 (early morning)

- All 12 tests are built and registered. 11 have passed live on pod dabpqy: 010, 030, 130, 060, 160, 080 and STR-006 on 16 Nov; 090, STR-005, 050 and 150 on 17 Nov. 040 is blocked by data (no received, unbilled PO).
- Changes on 17 Nov: Chromium API input for clicks and typing (no window focus needed); lookup and account fields use Simulate then a Chromium Tab (Chromium keystrokes dropped segments of dotted US1 accounts); tolerant Oracle dialog handling; Tasks panel opened only when the task link does not respond; partial-quantity PO matching (1 unit per run, PO 701343 has 4); new components for approval, approver notification, PO match and closing the browser.
- Regression on the final components (17 Nov, after the PC restart): all 11 buildable tests pass. 030, 130 and 080 passed in the morning regression; 010, STR-006, 060, 160, 090, STR-005, 050 and 150 passed after the last line-step change. The Login workflow still types with hardware events, so keep the PC unlocked and avoid system pop-ups during sign-in.
- Account fields: Chromium typing is slowed (0.15 s between keys, `DelayBetweenKeys` is in seconds) so segments auto-advance; if the account selector still opens, the line step fills each segment from the account string and clicks OK.
- Run order: any order works; run one test at a time on a machine (shared InPrivate session). Suggested: 010, 030, 130, 060, 160, 080, STR-006, STR-005, 090, 050, 150, 040. PO 701343 has 2 units left for 050/150.
- Data fixes: HealthcareUS-Approval DistributionCombination is the full 8-segment account; 160 now enters a tax-inclusive header (old 160 invoices are marked OnHold); PO pool record 701343-1-1 tracks remaining units.

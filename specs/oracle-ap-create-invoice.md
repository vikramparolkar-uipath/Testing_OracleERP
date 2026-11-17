# OFA:87 — TC-02 Create a standard AP invoice and validate it

**Status:** Specification updated — implementation intentionally not started

**Test Manager project:** `OFA` (`Oracle`)

**Test Manager case:** `OFA:87` — `TC-02 — Create a standard AP invoice and validate it`

**Application:** Oracle Fusion Cloud ERP — Accounts Payables

**Project:** `Testing_OracleERP`

**Source:** Test Manager manual steps for `OFA:87`, retrieved from the `OFA` project.

## 1. Objective and scope

Create a standard supplier invoice in Oracle Fusion Payables, save it, validate it, verify the calculated tax and total, and save and close it back to the Invoice Workbench.

The workflow may create and validate the invoice represented by this test. It must not approve, account, pay, cancel, delete, or place the invoice on hold. It must not create any additional invoice or business record beyond the one required by these steps.

### In scope

1. Open the Payables Invoice Workbench.
2. Start **Create Invoice**.
3. Enter the business unit and supplier and verify the derived supplier/site/legal-entity values.
4. Enter the unique invoice number, header amount, and description.
5. Expand Lines, enter the line amount, and verify the distribution set.
6. Save the invoice and verify the initial **Not validated** state.
7. Use **Invoice Actions > Validate**.
8. Verify tax, total calculation, and final **Validated** status.
9. Use **Save and Close** and verify return to the Invoice Workbench without errors.

### Out of scope

- Approving or accounting the invoice.
- Paying, cancelling, deleting, or putting the invoice on hold.
- Creating a second invoice for setup or cleanup.
- Using REST/API calls, JavaScript clicks, coordinates, or non-UiPath browser automation.
- Login and credential handling inside the invoice workflow. The test case invokes the existing `Workflows/Login to Oracle ERP.xaml` through **Invoke Workflow File**; that workflow remains unchanged and owns sign-in and credentials. No separate login or credential activities are added to the invoice workflow.

## 2. Manual steps and expected results

| # | Manual action | Expected result from Test Manager |
|---:|---|---|
| 1 | Navigate to **Home > Payables > Invoices**. | Invoice Workbench opens with **Scanned**, **Recent**, **Holds**, **Approval**, and **Prepaid** infotiles. |
| 2 | In the **Tasks** panel, select **Create Invoice**. | Create Invoice page opens; **Terms Date = today**. |
| 3 | Enter **US1 Business Unit** and press `Tab`. | **Date = today**; **Payment Terms = Immediate**. |
| 4 | Enter supplier **ABC Consulting** and press `Tab`. | **Supplier Number = 1288**, **Site = ABC US1**, and **Legal Entity = US1 Legal Entity** are filled in. |
| 5 | Enter an invoice number, **Amount = 1362.50**, and a description. | Values are accepted; amount displays as **1,362.50**. |
| 6 | Expand **Lines** and set line 1 **Amount = 1250.00**. | **Distribution Set = Contractor Expense**. |
| 7 | Click **Save**. | Title is `Create Invoice: <number>`; status is **Not validated**; Business Unit is read-only. |
| 8 | Select **Invoice Actions > Validate**. | **Tax = 112.50**; totals are correct; status is **Validated**. |
| 9 | Click **Save and Close**. | Returns to Invoice Workbench without errors. |

## 3. Workflow arguments

The arguments below separate business/test data from expected values used for verification. Defaults are taken from the Test Manager steps, the stated OFA:87 test data, and the decisions recorded in this specification.

### 3.1 Business and invoice data

| Direction | Argument | Type | Default | Purpose |
|---|---|---|---|---|
| In | `in_BusinessUnit` | `String` | `US1 Business Unit` | Business Unit entered in the invoice header. |
| In | `in_SupplierName` | `String` | `ABC Consulting` | Supplier entered in the supplier field; press Tab and let Oracle resolve it. |
| In | `in_InvoiceNumberPattern` | `String` | `UIP-AP-<ddMMyy>-<HHmmss>` | Pattern used to generate the unique invoice number. The generated value is returned as `out_InvoiceNumber`. |
| In | `in_InvoiceDescription` | `String` | `This is a UiPath Test` | Description entered with the invoice number and header amount. |
| In | `in_InvoiceType` | `String` | `Standard` | Invoice type to set explicitly on the invoice form. |
| In | `in_HeaderAmount` | `Decimal` | `1362.50` | Invoice header amount. |
| In | `in_LineAmount` | `Decimal` | `1250.00` | Amount for line 1. |
| In | `in_Currency` | `String` | `USD` | Currency to set explicitly on the invoice form. |
| In | `in_ExpectedPaymentTerms` | `String` | `Immediate` | Expected payment terms after the Business Unit is entered. |
| In | `in_ExpectedDistributionSet` | `String` | `Contractor Expense` | Expected distribution set for line 1. |

### 3.2 Date and derived-value expectations

| Direction | Argument | Type | Default | Purpose |
|---|---|---|---|---|
| In | `in_ExpectedTermsDate` | `DateTime` | `Today` | Expected Terms Date when Create Invoice opens. Date comparison must use the agreed Oracle/user timezone and displayed date format. |
| In | `in_ExpectedInvoiceDate` | `DateTime` | `Today` | Expected Invoice Date after the Business Unit is entered, using the robot machine's local date. |
| In | `in_ExpectedSupplierNumber` | `String` | `1288` | Expected derived supplier number after supplier entry and refresh. |
| In | `in_ExpectedSupplierSite` | `String` | `ABC US1` | Expected derived supplier site. |
| In | `in_ExpectedLegalEntity` | `String` | `US1 Legal Entity` | Expected derived legal entity. |
| In | `in_ExpectedInitialStatus` | `String` | `Not validated` | Expected status immediately after Save. |
| In | `in_ExpectedFinalStatus` | `String` | `Validated` | Expected status after Invoice Actions > Validate. |
| In | `in_ExpectedTaxAmount` | `Decimal` | `112.50` | Expected tax after validation. |
| In | `in_ExpectedTotalAmount` | `Decimal` | `1362.50` | Expected final total. This equals the header amount in the supplied data and must be confirmed against the exact total field displayed by the live page. |
| In | `in_AmountTolerance` | `Decimal` | `0.01` | Maximum absolute difference permitted when comparing displayed currency values. |

### 3.3 Execution and authentication

The invoice workflow adds no login or credential activities and has no `in_SkipLogin` argument. The test case invokes the existing `Workflows/Login to Oracle ERP.xaml` through **Invoke Workflow File** when an authenticated session must be established; that workflow is reused unchanged and remains the only owner of Oracle credentials and sign-in behavior.

During live development, the already signed-in Chrome session may be used for target capture and verification. The invoice workflow may navigate from another Oracle Fusion page to Home before opening Payables, but it must not inspect credentials, type a password, or create an alternative login implementation.

## 4. Outputs

| Direction | Output | Type | Meaning |
|---|---|---|---|
| Out | `out_Passed` | `Boolean` | `True` only if all required navigation, entry, save, validation, calculation, status, and Save-and-Close assertions pass. |
| Out | `out_Message` | `String` | Safe human-readable result, including the first failed step and expected/observed non-sensitive values. Must not contain credentials, cookies, session tokens, or password content. |
| Out | `out_InvoiceNumber` | `String` | The generated invoice number actually entered and saved. |
| Out | `out_FinalInvoiceStatus` | `String` | Status observed after validation, expected to be `Validated`. |
| Out | `out_TaxAmount` | `Decimal` | Tax amount observed after validation, expected to be `112.50`. |
| Out | `out_TotalAmount` | `Decimal` | Total amount observed after validation, expected to be `1362.50`. |

If a failure occurs before a value exists, the corresponding output should remain empty or its type default, and `out_Message` should identify the safe failure point.

## 5. Assertions

Every check below contributes to `out_Passed`. On failure, the workflow should record the first failed step and a safe diagnostic message, then stop or follow the agreed exception policy. It must not compensate by deleting or cancelling the invoice.

### Step 1 — Invoice Workbench

- Verify the page is the Oracle Payables Invoice Workbench after navigating from Home > Payables > Invoices.
- Verify the **Scanned**, **Recent**, **Holds**, **Approval**, and **Prepaid** infotiles are visible.
- Verify the page is ready before selecting Create Invoice; stale Home content, a loading overlay, or an error page is a failure.

### Step 2 — Create Invoice

- Verify the Create Invoice page is visible.
- Verify Terms Date is today, using `in_ExpectedTermsDate` and the agreed date interpretation.
- Verify the Create Invoice form has reached an interactive state before typing.

### Step 3 — Business Unit

- Enter `in_BusinessUnit` into the Business Unit field.
- Verify the selected/accepted Business Unit equals `US1 Business Unit`.
- After Tab and the partial page refresh, verify the invoice Date equals `in_ExpectedInvoiceDate` (today).
- Verify Payment Terms equals `in_ExpectedPaymentTerms` (`Immediate`).
- Verify the post-Tab refresh has completed before continuing; do not read values while the Processing glass pane is visible.

### Step 4 — Supplier

- Enter `in_SupplierName` (`ABC Consulting`) and press `Tab`; Oracle resolves the value without a separate LOV-result selection.
- After Tab and the partial page refresh, verify Supplier Number equals `in_ExpectedSupplierNumber` (`1288`).
- Verify Site equals `in_ExpectedSupplierSite` (`ABC US1`).
- Verify Legal Entity equals `in_ExpectedLegalEntity` (`US1 Legal Entity`).
- Verify the values are populated in the correct invoice header fields and are not stale values from a prior form.

### Step 5 — Header invoice data

- Generate one unique invoice number from `in_InvoiceNumberPattern` and store it as `out_InvoiceNumber`.
- Enter the generated number into the Invoice Number field.
- Enter `in_HeaderAmount` (`1362.50`) and verify the displayed amount is numerically 1362.50, regardless of comma formatting.
- Enter the confirmed `in_InvoiceDescription`.
- Verify values are accepted and no validation error or warning blocks progress.
- Set Invoice Type explicitly to `in_InvoiceType` (`Standard`) and Currency explicitly to `in_Currency` (`USD`), then verify both displayed values.

### Step 6 — Invoice line

- Verify the Lines region is initially collapsed or, if the application restores it open, handle both states without clicking twice.
- Expand Lines and verify the region is visible.
- Enter `in_LineAmount` (`1250.00`) for line 1.
- Verify line 1 amount is numerically 1250.00.
- Verify Distribution Set equals `in_ExpectedDistributionSet` (`Contractor Expense`).
- Leave item, quantity, line description, tax classification, and other line fields at their Oracle defaults; do not add another line, hold, attachment, or distribution.

### Step 7 — Initial Save

- Click Save only after required header and line assertions pass.
- Verify the page title contains `Create Invoice: ` followed by `out_InvoiceNumber`.
- Verify status equals `in_ExpectedInitialStatus` (`Not validated`).
- Verify Business Unit is read-only after Save.
- Handle any warning or confirmation dialog according to the confirmed dialog behavior; do not automatically accept an unrecognized warning.

### Step 8 — Validate

- Open the Invoice Actions menu and verify the Validate action is available.
- Select Validate and wait for the Processing glass pane to disappear and the invoice status to settle.
- Verify final status equals `in_ExpectedFinalStatus` (`Validated`); assign it to `out_FinalInvoiceStatus`.
- Read and return tax as `out_TaxAmount`; assert it equals `in_ExpectedTaxAmount` (`112.50`).
- Read and return the displayed total as `out_TotalAmount`; assert it equals `in_ExpectedTotalAmount` (`1362.50`).
- Assert the implied calculation: `in_LineAmount + in_ExpectedTaxAmount = in_HeaderAmount`, therefore `1250.00 + 112.50 = 1362.50`.
- Assert the observed total also equals line amount plus observed tax: `out_TotalAmount = in_LineAmount + out_TaxAmount`.
- Verify totals are not displaying an error, warning, or unresolved calculation state.

### Step 9 — Save and Close

- Click Save and Close.
- Wait for the form to close and the Invoice Workbench to return.
- Verify the Invoice Workbench is visible and no error notification, validation error, or blocking dialog remains.
- Do not click the invoice, payment, approval, cancel, delete, or accounting actions after returning.

### Overall pass condition

`out_Passed = True` only when all required assertions in Steps 1–9 pass and the final UI is the Invoice Workbench without errors. A successful Save with a failed validation or failed final status is a failed test, not a partial pass.

## 6. Selector strategy, synchronization, and risky points

All targets must be captured/configured with UiPath modern UI Automation and the installed browser extension. Use stable semantic attributes such as `aria-label`, `aria-role`, `title`, `name`, associated label text, and exact visible text scoped to the active region. Never hand-author selectors, coordinates, JavaScript clicks, or generated ADF IDs.

### Dynamic ADF IDs — explicit risk flag

Flag **every Oracle ADF target whose selector contains dynamic ID segments**, including IDs of the form `pt1:_FOr1:...`, `pt1:_FOr1:1:...`, `MAnt2:...`, session-specific numeric suffixes, and any other generated numeric naming container. These values may change after login, refresh, page redraw, browser session changes, or partial page submit. They must not be the primary selector identity. If a captured selector contains such an ID, repair the target in place to use a stable semantic attribute or associated label, or recapture it with UiPath Indicate. Do not create duplicate Object Repository targets.

### Target inventory and risk points

| Page/state | Target(s) | Stable-target preference | Risk and required wait |
|---|---|---|---|
| Signed-in browser | Existing Oracle Fusion Chrome tab / application card | Browser title, Oracle URL host/path, and live tab/window identity | Wrong tab or an IDCS tab causes false results. The test case establishes authentication through the unchanged login workflow before invoking this workflow. |
| Home navigation | Home > Payables > Invoices, Payables group, Invoices link/tile | Accessible name, title, stable link text, or captured semantic attribute | Home may restore a prior group. Wait for Payables content and Invoice Workbench readiness after each navigation. |
| Invoice Workbench | Scanned, Recent, Holds, Approval, Prepaid infotiles | Exact visible/accessible tile text scoped to the Invoice Workbench | ADF redraw or Processing glass pane may leave stale content. Wait for all required infotiles to be visible and interactive. |
| Tasks panel | Create Invoice | Exact accessible name/title/text within Tasks panel | The task may be unavailable until the page finishes loading. Wait for the task panel and click target. |
| Create Invoice | Page title/header and Terms Date | Stable page heading and associated label | Partial page render can show the form before fields are interactive. Wait for the form readiness target. |
| Header | Business Unit field and its LOV | Associated label, `aria-label`, `name`, or stable input semantics; capture the LOV result target | Business Unit may be an autocomplete/LOV rather than free text. A Tab can trigger partial page refresh. Wait for Processing glass pane to disappear before asserting Date and Payment Terms. |
| Header | Supplier field and its LOV | Associated label, `aria-label`, `name`, stable input semantics, and exact selected result | Supplier LOV may require selecting a suggestion rather than only typing. Tab triggers another refresh. Wait for derived Supplier Number, Site, and Legal Entity to settle. |
| Header | Date, Terms Date, Payment Terms | Associated labels and semantic field attributes | Date formatting/localization and automatic defaults may load asynchronously. Read after refresh; do not use a fixed Delay. |
| Header | Invoice Number, Amount, Description | `aria-label`, `name`, associated labels, or captured semantic input targets | Invoice number must be unique. Amount may render with commas/currency symbols; compare parsed numeric values. Description is `This is a UiPath Test`. |
| Header | Invoice Type and Currency | Associated labels and semantic value controls | Set `Standard` and `USD` explicitly, then verify the displayed values. |
| Lines | Expand/collapse Lines region | Accessible section/header/button name and expanded state | Lines may initially be collapsed or restored open. Avoid double-clicking. Wait until line fields exist after expansion. |
| Lines | Line 1 Amount | Associated row/column label and semantic input | Grid redraw may recreate the input. Wait for the specific line 1 field and Processing glass pane disappearance. |
| Lines | Distribution Set | Associated field/column label and exact value | Verify that `Contractor Expense` auto-populates. Do not select or change it through an LOV; fail safely if it is absent or different. |
| Save | Save button | Stable accessible name/title `Save` scoped to the invoice form | Save can trigger validation, a glass pane, warning, or confirmation. Wait for the saved title/status/read-only Business Unit. |
| Saved form | Title, status, read-only Business Unit | Stable heading/text and field state | Status can change after a server round trip. Wait for `Not validated` and the read-only state. |
| Actions | Invoice Actions menu and Validate item | Accessible menu/button name and exact menu item text | Menu may be rendered only after Save; wait for menu availability. Do not select approval, accounting, payment, cancel, delete, or hold actions. |
| Validation | Tax and total fields, final status | Associated labels, semantic text, and numeric parsing | Validate can take time. Wait for Processing glass pane to disappear and status to settle before reading values. |
| Close | Save and Close | Exact accessible button name/title | May trigger warning or confirmation. Wait for Invoice Workbench return and verify no error dialog remains. |
| Any screen | Warning, error, confirmation, or modal dialog | Dialog role/title and stable button names | Never blindly accept an unknown dialog. Known expected dialogs and their safe response must be confirmed before implementation. |

### Synchronization policy

- Use element readiness, page/section state, title/URL checks, and the Processing glass pane disappearing.
- Treat every Business Unit Tab, Supplier Tab, Save, Validate, and Save and Close as an asynchronous boundary.
- Do not use fixed `Delay` activities as the primary synchronization mechanism.
- Do not read or click through the Processing glass pane.
- If a wait times out, return a safe failure message identifying the step and page state; do not retry actions that could create duplicate invoices unless idempotency and retry ownership are explicitly designed.

## 7. Exception and side-effect policy

- Business/data-rule failures, such as an invalid supplier or rejected invoice, should fail the test with the observed safe message and should not be retried blindly.
- Transient UI/system failures may use a bounded retry only after the page is returned to a known state. A retry must not repeat Save or Validate in a way that could create duplicate records or duplicate processing.
- Catch blocks must preserve the original exception context when rethrowing or reporting it.
- Never log credentials, password fields, cookies, session tokens, full dynamic URLs, or sensitive browser data.
- Do not add cleanup that cancels or deletes the created invoice; those actions are out of scope.

## 8. Planned deliverables after approval

No build is part of this specification step. After approval, the intended local project deliverables are:

- A reusable workflow under `Workflows/` for creating and validating one AP invoice.
- A Given/When/Then test case under `Tests/` that maps the test data, invokes the reusable workflow, invokes `Workflows/Login to Oracle ERP.xaml` unchanged when authentication is needed, and asserts `out_Passed`.
- A local project registration for the new test case in `project.json`, following the project's existing test-case registration pattern. No link or mutation of Test Manager case `OFA:87` is included.
- Modern UiPath UI Automation targets captured with the browser extension, using stable attributes and Object Repository conventions; no generated ADF IDs or duplicate targets.
- Per-file validation, project-level build verification, and a controlled runtime verification using the already signed-in Chrome session.

The `in_SkipLogin` argument is intentionally not included. The reusable login workflow is not rebuilt, edited, or duplicated, and the new invoice workflow contains no credential handling.

## 9. Resolved implementation decisions and live verification items

The following decisions are fixed for implementation:

1. Invoice description: `This is a UiPath Test`.
2. Invoice Type and Currency: set explicitly to `Standard` and `USD`, then verify the displayed values.
3. Line details: enter only line 1 amount `1250.00`; leave item, quantity, line description, tax classification, and other line fields at Oracle defaults.
4. Distribution Set: do not select it through an LOV. Verify that `Contractor Expense` auto-populates; if it does not, fail with a safe diagnostic rather than changing the test scope.
5. Dates: use the robot machine's local date for both Terms Date and Invoice Date/Date, subject to the live field label confirmed during capture.
6. Currency comparisons: use an absolute tolerance of `0.01`.
7. Business Unit and Supplier: type the configured value and press `Tab`; allow Oracle to resolve the value without a separate LOV-result selection.
8. Dialogs: no warning or confirmation dialogs are currently expected. The implementation must not auto-accept an unrecognized warning, duplicate-invoice message, validation message, or confirmation dialog.
9. Browser/session: use the already signed-in Chrome session during development and runtime verification. The workflow may navigate from another Oracle Fusion page to Home before opening Payables.
10. Test Manager: `OFA:87` is the source specification only. The new local test case is not linked to or used to update Test Manager.

Live target capture must still verify the exact semantic attributes for each Oracle control. If a target cannot be captured with stable `aria-label`, `title`, `name`, associated label text, or scoped visible text, stop and ask rather than inventing a selector. Dynamic ADF IDs, Processing glass-pane state, partial refresh timing, Lines expansion state, Invoice Actions menu rendering, and any unexpected dialogs remain runtime verification points.
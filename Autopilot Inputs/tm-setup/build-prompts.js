// Generates one UiPath coding-agent prompt per Oracle test case into ../automation-prompts/.
// Usage: node build-prompts.js
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'automation-prompts');
const ORG = 'https://eqjz.ds-fa.oraclepdemos.com/fscmUI/faces/FuseWelcome?fndThemeName=Vision_Default';

const DEFAULT_LOGIN_RULE = '* Attach to my already signed-in Edge tab. Never automate login or store credentials.';

const intro = (spec, app, loginRule = DEFAULT_LOGIN_RULE) => `Turn the test case below into a UI automation (built with UiPath via the uipcli) for ${app}. Don't build anything yet.
First, write specs/${spec}.md from my steps. In it, infer and list:

* Workflow arguments: every value that should be a parameter, with a type and a default taken from my steps (record names, business units, suppliers, amounts, quantities, etc.).
* Outputs: a pass/fail Boolean, a message, and any IDs, numbers or totals I'd want back.
* Assertions: each "expected result" in my steps, written as a check the workflow makes. If I give a calculation (e.g. line + tax = total), assert it.
* Selectors and risky points: lookups (LOVs), dialogs, loading spinners, popups, anything likely to need a wait.
* What you're unsure about. Ask me these as questions instead of guessing.

Then reply with your implementation plan (workflow structure and how we'll verify it) and wait for me.
Rules for the build, when I approve it:

* UI Automation modern activities with the UiPath browser extension.
${loginRule}
* Selectors use stable attributes (id suffix, aria-label, name, title), never position. Use element waits, not fixed Delays.
* Don't take irreversible actions beyond what my steps say. For example, don't submit, approve, pay, post, cancel or delete records unless a step explicitly says so.
* Put the workflow in Workflows/, call it from a test case in Tests/ that runs it and asserts the Boolean result.

Oracle Fusion notes from exploratory testing (use these, but verify them):

* Classic (ADF) pages: element ids look like pt1:_FOr1:1:_FONSr2:0:...:<field>::content. The numeric segments change between sessions, so match on the END of the id (e.g. id ends with "ap1:r2:0:i2::content") or on aria-label / label text. ADF pages can scroll horizontally without warning, so never click by coordinates.
* Redwood pages (Oracle JET, URLs under /fscmUI/redwood/...) expose stable ids and aria-labels. First load can take 15-20 s.
* Wait on the browser title or a specific element after every navigation; typical ADF transitions take 3-6 s.
* A yellow "Sandbox Mode: Edit / Refresh Needed" banner is always shown. Ignore it.
* LOV / combo fields: type the full value and press Tab; a partial value may open a "Search and Select" dialog.
* The Home page reopens on the last group tab used, so always click the needed group tab (Sales, Procurement, Payables, Receivables) first.
* Full object repository, picklists and findings: exploration-notes.md (in the Oracle demo folder).

-----------------------------------

`;

const CASES = [
  require('./tc01-case')(ORG),
  { key: 'TC-02', spec: 'oracle-tc02-create-validate-ap-invoice', app: 'Oracle Fusion Cloud Payables (ERP)', body: `TEST CASE: TC-02: Create a standard AP invoice and validate it (Payables)
Objective: Check that a manually entered supplier invoice picks up supplier defaults, calculates tax and reaches Validated.

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. Supplier ABC Consulting exists in US1 Business Unit.

Test data:

* Business Unit: US1 Business Unit
* Supplier: ABC Consulting (expect Supplier Number 1288, Site ABC US1, Legal Entity US1 Legal Entity)
* Invoice Number: "UIP-AP-" + today's date (ddMMyy) + "-" + time (HHmmss) (must be unique per supplier)
* Header Amount: 1,362.50 USD (= line 1,250.00 + 9% tax 112.50)
* Type: Standard
* Description: "UiPath demo - consulting services"
* Line 1: Type Item, Amount 1,250.00 (Distribution Set defaults to Contractor Expense)

Steps and expected results:

1. Go to Home > Payables > Invoices. Expected: the Invoice Workbench opens with the Scanned, Recent, Holds, Approval and Prepaid infotiles.
2. Open the Tasks panel (icon strip on the right edge) and select Create Invoice. Expected: the Create Invoice page opens and Terms Date = today.
3. Enter the Business Unit and press Tab. Expected: Date = today and Payment Terms = Immediate.
4. Enter the Supplier and press Tab. Expected: Supplier Number 1288, Supplier Site ABC US1 and Legal Entity US1 Legal Entity fill in automatically.
5. Enter the Invoice Number, Amount 1362.50 and Description. Expected: the amount shows as 1,362.50.
6. Expand Lines and set line 1 Amount to 1250.00. Expected: Distribution Set = Contractor Expense.
7. Select Save. Expected: the page title becomes "Create Invoice: <invoice number>", the status shows Not validated, and Business Unit becomes read-only.
8. Select Invoice Actions > Validate (use the menu, not Ctrl+Alt+V). Expected: Tax = 112.50, the Totals panel shows a green check, and the status shows Validated.
9. Select Save and Close. Expected: the Invoice Workbench opens with no error.

Overall pass condition: all expected results above are met; return the invoice number for TC-03. Out of scope: approval workflow, payment, Post to Ledger, cancelling or deleting the invoice.
` },

  { key: 'TC-03', spec: 'oracle-tc03-search-invoice-status', app: 'Oracle Fusion Cloud Payables (ERP)', body: `TEST CASE: TC-03: Search the invoice in Manage Invoices and verify its statuses (Payables)
Objective: Check that the invoice created in TC-02 can be found and shows the right status and amounts.

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. TC-02 passed; its invoice number is passed in as an argument.

Test data:

* Invoice Number: from TC-02 (default for a standalone run: UIP-AP-151026-01)
* Expected: Supplier ABC Consulting, Site ABC US1, Invoice Amount 1,362.50 USD, Type Standard, Validation Status Validated, Approval Status Required, Holds 0, Unpaid Amount 1,226.25 USD (10% withheld)

Steps and expected results:

1. Go to Home > Payables > Invoices, open the Tasks panel and select Manage Invoices. Expected: the Search: Invoice region shows with Saved Search = All Invoices.
2. Select Search with no criteria. Expected: the error "At least one is required" appears.
3. Enter the Invoice Number (field id ends with "q1:value10::content") and select Search. Expected: exactly 1 row is returned.
4. Read the row. Expected: all values match the expected test data above, and Unpaid Amount = Invoice Amount x 0.9.

Overall pass condition: all expected results above are met. Out of scope: Validate, Approval, Post and Export actions on the result row.
` },

  { key: 'TC-04', spec: 'oracle-tc04-invoice-tax-mismatch', app: 'Oracle Fusion Cloud Payables (ERP)', body: `TEST CASE: TC-04: Validation flags a header/line mismatch caused by tax (Payables, negative)
Objective: Check that validation catches a header amount that leaves out the calculated tax, and passes once it is corrected.

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. Supplier ABC Consulting exists in US1 Business Unit.

Test data:

* Business Unit: US1 Business Unit; Supplier: ABC Consulting
* Invoice Number: "UIP-AP-NEG-" + today's date (ddMMyy) + "-" + time (HHmmss)
* Initial Header Amount: 1,250.00 USD; Line 1: Item 1,250.00
* Corrected Header Amount: 1,362.50 USD (= 1,250.00 + 9% tax 112.50)

Steps and expected results:

1. Create the invoice as in TC-02 but with Header Amount 1250.00 and line 1 = 1250.00, then select Save. Expected: it saves with status Not validated.
2. Select Invoice Actions > Validate. Expected: Tax = 112.50, the Totals panel shows a warning icon, and the status shows Needs revalidation.
3. Change the Header Amount to 1362.50 and Validate again. Expected: the Totals panel shows a green check and the status shows Validated.
4. Select Save and Close. Expected: the Invoice Workbench opens with no error.

Overall pass condition: all expected results above are met, including that the mismatched invoice is NOT Validated after step 2. Out of scope: approval, payment, posting, cancelling or deleting the invoice.
` },

  { key: 'TC-05', spec: 'oracle-tc05-catalog-add-to-cart', app: 'Oracle Fusion Cloud Self Service Procurement (Redwood)', body: `TEST CASE: TC-05: Search the catalog and add an item to the cart (Self Service Procurement)
Objective: Check that a catalog item can be found and added to the cart, and that the cart count and subtotal update.

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. Note the cart badge count before the run (N).

Test data:

* Search keyword: laptop
* Item: Laptop Carrycase Black, Hewlett Packard, sold by Midtown Computer Supplies, supplier item LAP-BBAG, $25.00 Ea
* Expected search result count: 3

Steps and expected results:

1. Go to Home > Procurement > Purchase Requisitions (New). Launch from the tile; a direct URL opens a "Shopping Error" page. Expected: Self Service Procurement opens with subtitle "Supremo US Business Unit | Denver HQ" and the bottom navigation bar shows the cart badge = N.
2. In "Search for items or services" (input placeholder), type laptop and press Enter. Expected: 3 items, including Laptop Carrycase Black at $25.00.
3. Select Add to Cart on Laptop Carrycase Black. Expected: the cart badge becomes N+1 (allow up to 15 s; a spinner shows on the card).
4. Select the cart icon in the bottom navigation bar. Expected: the Cart page lists Laptop Carrycase Black, Sold By Midtown Computer Supplies, $25.00 Ea, and the Subtotal went up by $25.00.
5. Teardown: delete only the Laptop Carrycase Black line added in step 3 (trash icon on that line). Expected: the cart badge is back to N.

Overall pass condition: all expected results above are met. Out of scope: Submit (it starts approval in a shared demo), editing other cart lines, deleting any line other than the one this test added.
` },

  { key: 'TC-06', spec: 'oracle-tc06-saved-views', app: 'Oracle Fusion Cloud Self Service Procurement (Redwood) - 26D feature', body: `TEST CASE: TC-06: Save and reuse a requisition search ("Saved views", Oracle 26D)
Objective: Check that a keyword search on My Requisitions can be saved as a named view and reapplied.
Release note: https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f47414.htm

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. Requisition 381637 (Jabra Talk 45 Bluetooth Headset, Ordered) exists.

Test data:

* Keyword: Jabra
* View name: "UIP Jabra " + today's date (yyyy-MM-dd) + " " + time (HHmmss)
* Expected result: 1 requisition, 381637

Steps and expected results:

1. Go to Home > Procurement > Purchase Requisitions (New), then select My Requisitions in the bottom navigation bar. Expected: the "Entered By Natalie Sales Rep" filter chip, a Requisitions/Lines toggle and a Saved views button (aria-label "Saved views") are shown.
2. Type Jabra in "Search for requisitions" and press Enter. Expected: 1 item, 381637 Jabra Talk 45 Bluetooth Headset, status Ordered.
3. Select Saved views, enter the view name and select Save. Expected: the popup closes and a bookmark chip for the view appears at the start of the filter row.
4. Remove the Jabra keyword chip. Expected: the list shows all of Natalie's requisitions again (more than 1).
5. Select Saved views > Saved views link and select the new view. Expected: the keyword is reapplied and the list again shows exactly 1 item, 381637.
6. Open the view's ... menu. Expected: Set as Default and Delete are offered. Do NOT select Set as Default.
7. Teardown: select Delete on the view this test created. Expected: the view is no longer listed.

Overall pass condition: all expected results above are met. Out of scope: Set as Default, opening requisition details, deleting any view not created by this run.
` },

  { key: 'TC-07', spec: 'oracle-tc07-notes-attachments-indicator', app: 'Oracle Fusion Cloud Self Service Procurement (Redwood) - 26C feature', body: `TEST CASE: TC-07: Notes & Attachments indicator on a requisition line (Oracle 26C)
Objective: Check that adding a Note to Supplier on a requisition line shows the Notes and Attachments indicator on that line only, and that the indicator opens the note.
Release note: https://docs.oracle.com/en/cloud/saas/readiness/scm/26c/ssproc26c/26C-ssproc-wn-f49452.htm

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. The cart (draft requisition 381638) contains a line "Laptop Carrycase Black" (run TC-05 steps 1-3 first if needed).

Test data:

* Line: Laptop Carrycase Black
* Note to Supplier: "UIP test - please deliver to reception desk, Bldg 2. " + today's date (yyyy-MM-dd)

Steps and expected results:

1. Go to Home > Procurement > Purchase Requisitions (New) and open the Cart from the bottom navigation bar. Select the edit (pencil) icon on the Laptop Carrycase Black line. Expected: "Requisition Line Details" opens for that line.
2. Under Notes, enter the Note to Supplier and select Save and Close. Expected: the Cart opens again. A transient toast "Error response during RestAction" may appear; ignore it (token refresh) and verify the data instead.
3. Open My Requisitions and switch to the Lines view. Expected: a button with aria-label "Notes and Attachments" appears on the Laptop Carrycase Black line, and on no other line of that requisition that has no notes.
4. Select the indicator. Expected: a drawer titled "Laptop Carrycase Black / Requisition 381638" opens with tabs Line Details and Notes and Attachments, and shows the exact note text.

Overall pass condition: all expected results above are met. Out of scope: file or URL attachments, Submit, editing other lines.
` },

  { key: 'TC-08', spec: 'oracle-tc08-charge-account-search', app: 'Oracle Fusion Cloud Self Service Procurement (Redwood) - 26D feature', body: `TEST CASE: TC-08: Change a requisition charge account with "Search for combination" (Oracle 26D)
Objective: Check that a requisition line's charge account can be found by segment search and saved.
Release note: https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f49910.htm

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. Draft requisition 381638 has a line (e.g. Laptop Carrycase Black).

Test data:

* Line: Laptop Carrycase Black
* Starting account: 120.10.63580.120.000.000
* Target account: 120.10.64210.120.000.000
* Segments: Company 120 | Line of Business 10 | Account | Cost Center 120 | Product 000 | Intercompany 000

Steps and expected results:

1. Open the Cart, select the edit icon on the line, then open Delivery and Billing Details. Expected: Billing > Distribution 1 shows the current charge account.
2. Open the Distribution 1 ... menu and select Edit. Expected: a drawer opens with charge account options "Select favorite charge account" and "Enter charge account number".
3. Select "Enter charge account number", then Charge To ... > Search for combination. Expected: a dialog shows six segment chips filled from the current account.
4. Remove the Account chip. Expected: a list of valid combinations including 120.10.64210.120.000.000.
5. Select 120.10.64210.120.000.000, then Apply, then Update. Expected: the toast "Distribution 1 updated" appears and Distribution 1 shows 120.10.64210.120.000.000.
6. Select Save and Close. Expected: the Cart opens and Charge To no longer shows the old single account.
7. Known-issue check: open Search for combination again with all six chips set to an existing combination. Expected: the combination is listed. Current behavior (15-Oct-2026): "No matches found" plus a "Create ..." link. Record the result in the output message; do NOT click Create.

Overall pass condition: steps 1-6 pass. Step 7 is reported (known defect) but does not fail the test. Out of scope: creating account combinations, Split, Submit.
` },

  { key: 'TC-09', spec: 'oracle-tc09-create-opportunity', app: 'Oracle Fusion Cloud Sales (CX)', body: `TEST CASE: TC-09: Create a sales opportunity (Sales)
Objective: Check that a sales rep can create an opportunity and that the defaults are applied.

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. Account "Sykes Gym" exists.

Test data:

* Opportunity name: "UIP Demo - Sykes Gym Equipment Refresh " + today's date (yyyy-MM-dd) + " " + time (HHmmss)
* Account: Sykes Gym
* Expected defaults: Win Probability 10, Close Date = today + 30 days (dd/mm/yy), Sales Stage "01 - Qualified", Currency EGP

Steps and expected results:

1. Go to Home, select the Sales group tab, then Quick Action Create Opportunity. Expected: the Create Opportunity form opens (URL under /crmUI/) with Win Probability 10, Close Date = today + 30, Sales Stage 01 - Qualified and Currency EGP.
2. Enter the Name and select Sykes Gym from the Account dropdown. Expected: the Account shows Sykes Gym.
3. Select Save and Continue. Expected: "Edit Opportunity: <name> : Summary" opens with Owner Natalie Sales Rep, Status Open, Sales Channel Direct, Price List Corporate, Include in Forecast "When matches forecast criteria" and Amount 0.00.
4. Select Save and Close. Expected: the Home page opens with no error.
5. Go to Sales > Opportunities and search for the name. Expected: exactly 1 opportunity is listed, with Status Open.

Overall pass condition: all expected results above are met; return the opportunity name. Out of scope: products, quotes, changing the stage, closing or deleting the opportunity.
` },

  { key: 'TC-10', spec: 'oracle-tc10-ar-transaction-readonly', app: 'Oracle Fusion Cloud Receivables (ERP)', body: `TEST CASE: TC-10: Receivables Billing - open a transaction read-only and verify its details (Receivables)
Objective: Check that the Billing work area loads and that a transaction's header and totals are correct.

Org URL: ${ORG}

Preconditions: Signed in as natalie.salesrep. Transaction 36765 exists (Incomplete, so it opens in Edit mode).

Test data:

* Transaction Number: 36765
* Expected: Business Unit Supremo US Business Unit, Source Manual, Status Incomplete, Currency USD, Bill-to Fit N Fine Equipment / SAN JOSE, Payment Terms 30 Net, Transaction Date 08/06/26, Due Date 08/07/26, Lines 375,480.00, Tax 32,854.50, Total 408,334.50

Steps and expected results:

1. Go to Home > Receivables > Billing. Expected: the Billing work area opens with the business unit filter "All business units" and the Incomplete, Transaction Approval, Adjustment Approval, Adjustment Research and Import Exceptions infotiles.
2. Select transaction 36765 in the list. Expected: "Edit Transaction: Invoice 36765" opens.
3. Read the header and totals. Expected: every value matches the expected test data. Assert Total = Lines + Tax, and Due Date = Transaction Date + 30 days.
4. Leave WITHOUT saving: go to Home. If a "Your changes aren't saved" prompt appears, choose Yes to leave. Expected: no change is saved to the transaction.

Overall pass condition: all expected results above are met. Out of scope: Save, Complete, Delete or any edit to the transaction, and Create Transaction (currently blocked in this environment by a server error).
` },
];

fs.mkdirSync(OUT, { recursive: true });
for (const c of CASES) {
  const file = path.join(OUT, `${c.key}-automation-prompt.txt`);
  fs.writeFileSync(file, intro(c.spec, c.app, c.loginRule) + c.body.trimEnd() + '\n');
  console.log(`wrote ${path.relative(path.join(__dirname, '..'), file)}`);
}

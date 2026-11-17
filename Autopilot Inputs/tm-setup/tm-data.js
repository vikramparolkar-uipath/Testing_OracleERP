// Test Manager content for the Oracle Fusion ERP E2E demo (project OFA).
// Source: ../test-cases.md, ../requirements-traceability.md, ../test-manager-custom-fields.md

const TAG = 'Oracle Fusion ERP';

const FIELDS = [
  { name: 'Oracle Application', scope: ['Requirement', 'TestCase', 'TestSet'],
    description: 'Oracle Cloud application the item belongs to',
    hints: 'Fusion ERP, Fusion HCM, Fusion SCM, Fusion CX, Fusion EPM, Other' },
  { name: 'Module', scope: ['Requirement', 'TestCase', 'TestSet'],
    description: 'Functional module within the Oracle application',
    hints: 'Payables, Procurement SSP, Receivables, General Ledger, Sales, Platform' },
  { name: 'Business Process', scope: ['Requirement', 'TestCase', 'TestSet'],
    description: 'End-to-end business process',
    hints: 'Procure-to-Pay, Order-to-Cash, Record-to-Report, Lead-to-Order, Platform Access' },
  { name: 'Oracle Release', scope: ['Requirement', 'TestCase'],
    description: 'Oracle quarterly update that introduced the behaviour (Baseline = pre-existing)',
    hints: 'Baseline, 26C, 26D' },
  { name: 'Release Feature', scope: ['Requirement', 'TestCase'],
    description: 'Specific release-note feature covered',
    hints: '26D Saved Views, 26D Account Search, 26C Notes Indicator, 26C Cart Nav Bar, None' },
  { name: 'Demo Track', scope: ['TestCase', 'TestSet'],
    description: 'Demo storyline this test belongs to',
    hints: 'Core E2E, Whats New, Controls Negative, Automation Showcase' },
  { name: 'Automation Status', scope: ['TestCase'],
    description: 'Automation state of the test case',
    hints: 'Automated, Candidate, Manual, Blocked' },
  { name: 'UI Technology', scope: ['TestCase'],
    description: 'Oracle UI technology exercised',
    hints: 'ADF Classic, Redwood' },
  { name: 'Env Constraint', scope: ['Requirement', 'TestCase'],
    description: 'Known environment limitation affecting the item',
    hints: 'None, Access Gap, Config Gap, Known Defect, Shared Data' },
  { name: 'Req Confidence', scope: ['Requirement'],
    description: 'Basis of the reverse-engineered requirement',
    hints: 'Observed, Oracle Doc, Assumed' },
];

const ENV = 'Env: https://eqjz.ds-fa.oraclepdemos.com (user natalie.salesrep)';

const REQS = [
  { key: 'BR-01', name: 'BR-01 — Secure sign-in and role-based navigation',
    desc: `User story: As an ERP user, I want to sign in once and reach Payables, Procurement and Sales from the Home page, so that I can start work without hunting for URLs.

Functional requirements:
- FR-01.1 Unauthenticated access redirects to the Oracle IDCS Sign In page.
- FR-01.2 Sign-in accepts Username and Password, submitted with Next.
- FR-01.3 Home shows a personalised greeting.
- FR-01.4 Home presents group tabs (Sales, Procurement, Payables, Receivables, …), each with Quick Actions and App tiles.
- FR-01.5 Global header offers Navigator, Search, Home, Favourites and Notifications.
- FR-01.6 Only role-permitted work areas are displayed.

Acceptance criteria:
- AC-01.1 Opening the URL unauthenticated shows IDCS Sign In (Username, Password, Next).
- AC-01.2 Valid credentials load Home with the user's display name.
- AC-01.3 Payables tab shows Payables Dashboard, Invoices, Payments.
- AC-01.4 Procurement shows Purchase Requisitions (New); Sales shows Create Opportunity.

Success criteria: 100% sign-in success; Home interactive ≤ 15 s; 0 unexpected errors.`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Platform', 'Business Process': 'Platform Access', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Env Constraint': 'Shared Data', 'Req Confidence': 'Observed' } },

  { key: 'BR-02', name: 'BR-02 — Manual supplier invoice entry with defaults, tax and validation',
    desc: `User story: As an AP specialist, I want to key in a supplier invoice with supplier/terms defaults and automatic tax, so that it is validated and ready for approval.

Functional requirements:
- FR-02.1 Create Invoice available from the Invoices work area Tasks panel.
- FR-02.2 Header captures BU*, Supplier*, Site*, Legal Entity*, Number*, Currency/Amount*, Type*, Date*, Payment Terms*, Terms Date*.
- FR-02.4 Lines (Item/Freight/Miscellaneous) with amount and distribution.
- FR-02.5 Save stores a Not validated draft and locks the BU.
- FR-02.6 Invoice Actions > Validate calculates tax and sets validation status.

Business rules:
- BRL-02.1 BU US1 defaults Date/Terms Date = today, Payment Terms = Immediate.
- BRL-02.2 Supplier ABC Consulting defaults Supplier # 1288, Site ABC US1, Legal Entity US1 Legal Entity.
- BRL-02.3 Invoice number unique per supplier.
- BRL-02.4 Exclusive tax at 9% for US1/ABC Consulting.
- BRL-02.6 10% withholding reduces Unpaid Amount.

Acceptance criteria:
- AC-02.1/02.2 Defaults populate after BU and Supplier entry.
- AC-02.3 Save shows title "Create Invoice: <number>" and status Not validated.
- AC-02.4 Validate gives Tax 112.50 on 1,250.00, Totals OK, status Validated.

Success criteria: 100% default match; tax exact; final status Validated; 0 holds; ≤ 90 s automated.`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Payables', 'Business Process': 'Procure-to-Pay', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Env Constraint': 'None', 'Req Confidence': 'Observed' } },

  { key: 'BR-03', name: 'BR-03 — Invoice inquiry and status visibility',
    desc: `User story: As an AP specialist, I want to search invoices by number and see their status at a glance, so that I can answer supplier queries and track payment readiness.

Functional requirements:
- FR-03.1 Manage Invoices offers saved searches (All Invoices, Disbursement, Document Sequence, General, Holds and Statuses, Prepayment, Purchase Order).
- FR-03.2 Criteria: BU, Invoice Number, Amount, Date, Supplier or Party, Supplier Number, Site, Taxpayer ID, Invoice Group.
- FR-03.3 Results show Validation Status, Approval Status, Holds, Unpaid Amount, etc.
- FR-03.4 Export to Excel and bulk Validate / Approval / Post.

Business rules:
- BRL-03.1 At least one of Invoice Number, Invoice Date, Supplier or Party, Supplier Number, Invoice Group is required ("At least one is required").
- BRL-03.2 Validated, unapproved invoices show Approval Status = Required.

Acceptance criteria:
- AC-03.1 Empty search raises "At least one is required".
- AC-03.2 Searching the TC-02 invoice number returns exactly 1 row.
- AC-03.3 Row shows ABC Consulting / ABC US1 / 1,362.50 USD / Standard / Validated / Required / 0 holds / Unpaid 1,226.25.

Success criteria: exactly 1 result; 8/8 fields match; search ≤ 10 s.`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Payables', 'Business Process': 'Procure-to-Pay', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Env Constraint': 'None', 'Req Confidence': 'Observed' } },

  { key: 'BR-04', name: 'BR-04 — Prevent validation of invoices whose header ≠ lines + tax',
    desc: `User story: As an AP manager, I want the system to stop invoices whose header total disagrees with lines plus tax from being validated, so that suppliers are not under- or over-paid.

Functional requirements:
- FR-04.1 Validation compares header amount with line total plus calculated tax.
- FR-04.2 Mismatch shows a warning in Totals and status Needs revalidation.
- FR-04.3 After correcting the header, revalidation gives Validated.

Business rules:
- BRL-04.1 (Assumed) An invoice in Needs revalidation must not progress to approval/payment.

Acceptance criteria:
- AC-04.1 Header 1,250.00 with line 1,250.00 → tax 112.50, warning, Needs revalidation.
- AC-04.2 Header changed to 1,362.50 and revalidated → Validated.

Success criteria: 0 mismatched invoices reach Validated; 100% corrected invoices validate after one revalidation.`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Payables', 'Business Process': 'Procure-to-Pay', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Env Constraint': 'None', 'Req Confidence': 'Assumed' } },

  { key: 'BR-05', name: 'BR-05 — Catalog shopping with a persistent cart',
    desc: `User story: As an employee, I want to search the company catalog like an online store and add items to a cart I can open from anywhere, so that I can request goods quickly.

Functional requirements:
- FR-05.1 Self Service Procurement (Redwood) opens from Purchase Requisitions (New) showing requester BU and location (Supremo US Business Unit | Denver HQ).
- FR-05.2 Keyword search returns items with description, manufacturer, supplier, supplier item, price, UOM.
- FR-05.4 Add to Cart adds the item to the user's draft requisition.
- FR-05.5 (26C) Bottom navigation bar with Shop, My Requisitions and Cart item-count badge on every SSP page.
- FR-05.6 Cart shows requisition number, lines and summary (Subtotal, Tax, Approval Amount, Deliver-to, Charge To).

Business rules:
- BRL-05.1 Foreign-currency items are converted (900.00 SAR → $240.39).
- BRL-05.3 Launch from the tile; deep links are not supported.

Acceptance criteria:
- AC-05.2 Searching "laptop" returns 3 items incl. Laptop Carrycase Black $25.00.
- AC-05.3 Add to Cart raises the cart badge from N to N+1.
- AC-05.4 The Cart lists the item and Subtotal rises by $25.00.

Success criteria: badge +1 exactly; update ≤ 15 s; nav bar on 4/4 SSP pages.
Release ref: https://docs.oracle.com/en/cloud/saas/readiness/scm/26c/ssproc26c/26C-ssproc-wn-f43313.htm`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Procurement SSP', 'Business Process': 'Procure-to-Pay', 'Oracle Release': '26C', 'Release Feature': '26C Cart Nav Bar', 'Env Constraint': 'Shared Data', 'Req Confidence': 'Observed' } },

  { key: 'BR-06', name: 'BR-06 — Save and reuse requisition searches (26D Saved Views)',
    desc: `User story: As a requester, I want to save my requisition search and filters under a name and reapply them in one click, so that I don't rebuild filters every time.

Functional requirements:
- FR-06.1 My Requisitions smart search with keyword and removable filter chips (default "Entered By <user>").
- FR-06.2 Saved views control (aria-label "Saved views") saves the current criteria under a required Name.
- FR-06.3 Saved views drawer lists views; selecting one reapplies its criteria.
- FR-06.4 Each view can be Set as Default or Deleted.
- FR-06.6 Views apply to both Requisitions and Lines layouts.

Business rules: view name is mandatory; views are personal and persist across sessions.

Acceptance criteria:
- AC-06.1 Searching "Jabra" returns 1 requisition (381637).
- AC-06.2 Saving the view adds a view chip to the filter row.
- AC-06.3 Reapplying the view from the drawer returns the same 1 result.
- AC-06.4 View menu offers Set as Default and Delete.

Success criteria: feature present; reapplied result count matches 100%; create/list/delete 3/3.
Release ref: https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f47414.htm`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Procurement SSP', 'Business Process': 'Procure-to-Pay', 'Oracle Release': '26D', 'Release Feature': '26D Saved Views', 'Env Constraint': 'None', 'Req Confidence': 'Oracle Doc' } },

  { key: 'BR-07', name: 'BR-07 — Notes & attachments indicator on requisition lines (26C)',
    desc: `User story: As a requester, I want to see at a glance which requisition lines carry notes or attachments, so that I know where extra instructions exist.

Functional requirements:
- FR-07.1 Line details offer Note to Supplier and Attachments (Category, file, URL).
- FR-07.2 Attachment Category values: Miscellaneous, To Approver, To Buyer, To Receiver, Internal to Requisition (default), To Supplier.
- FR-07.3 My Requisitions > Lines shows an indicator (aria-label "Notes and Attachments") on lines with notes/attachments.
- FR-07.5 Clicking the indicator opens a drawer (Line Details | Notes and Attachments) showing the note.

Business rule: the indicator appears only on lines that have notes or attachments.

Acceptance criteria:
- AC-07.2 After adding a Note to Supplier, the indicator shows on that line only.
- AC-07.3 The drawer shows the exact note text.

Success criteria: 100% indicator on noted lines; 0 false positives; exact text match.
Release ref: https://docs.oracle.com/en/cloud/saas/readiness/scm/26c/ssproc26c/26C-ssproc-wn-f49452.htm`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Procurement SSP', 'Business Process': 'Procure-to-Pay', 'Oracle Release': '26C', 'Release Feature': '26C Notes Indicator', 'Env Constraint': 'None', 'Req Confidence': 'Oracle Doc' } },

  { key: 'BR-08', name: 'BR-08 — Charge account search by segment (26D)',
    desc: `User story: As a requester, I want to find the right charge account by searching individual segments, so that I charge purchases correctly without memorising account strings.

Functional requirements:
- FR-08.3 Distribution drawer: Select favorite charge account (nickname, e.g. Main) or Enter charge account number.
- FR-08.4 Charge To menu offers Combination Details and Search for combination.
- FR-08.5 Search for combination shows removable chips per segment: Company, Line of Business, Account, Cost Center, Product, Intercompany.
- FR-08.6 Matching valid combinations are listed; select + Apply.
- FR-08.8 Update saves with the toast "Distribution 1 updated".

Business rules:
- BRL-08.1 Chart of accounts = 6 segments (e.g. 120.10.63580.120.000.000).
- BRL-08.2 (Assumed) Exact search on an existing combination must return it.

Acceptance criteria:
- AC-08.3 Removing the Account chip lists …63170/…64210/…52150/…63580/…52120.
- AC-08.4 Selecting 120.10.64210.120.000.000 → Apply → Update saves the new account.
- AC-08.5 Exact-match search returns the existing combination. KNOWN DEFECT: currently "No matches found" + Create link.

Success criteria: feature present; saved account exact; exact-match search 100% (currently failing); 0 combinations created.
Release ref: https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f49910.htm`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Procurement SSP', 'Business Process': 'Record-to-Report', 'Oracle Release': '26D', 'Release Feature': '26D Account Search', 'Env Constraint': 'Known Defect', 'Req Confidence': 'Oracle Doc' } },

  { key: 'BR-09', name: 'BR-09 — Sales opportunity capture',
    desc: `User story: As a sales rep, I want to log a new opportunity against a customer account in a few fields, so that it appears in my pipeline and forecast immediately.

Functional requirements:
- FR-09.1 Create Opportunity is a Sales Home Quick Action.
- FR-09.2 Quick create captures Name*, Account, Primary Contact, Win Probability, Close Date*, Sales Stage; shows Currency.
- FR-09.4 Save and Continue opens Edit Opportunity (Summary) with Contacts, Assessments, Team, Activities, Notes, Leads, Quotes and Orders, etc.
- FR-09.6 Save and Close returns to the originating page.

Business rules:
- BRL-09.1 Win Probability 10%, Sales Stage 01 - Qualified.
- BRL-09.2 Close Date = today + 30 days.
- BRL-09.3 Owner = creating user.
- BRL-09.4 Status Open, Sales Channel Direct, Price List Corporate, Include in Forecast "When matches forecast criteria".
- BRL-09.6 (To confirm) Currency defaults to EGP for a US rep.

Acceptance criteria:
- AC-09.1 Form opens with the defaults above.
- AC-09.2 Save and Continue opens Edit Opportunity, Owner Natalie Sales Rep, Status Open.
- AC-09.5 The opportunity is retrievable by name in Opportunities.

Success criteria: 8/8 defaults match; exactly 1 match on search; ≤ 60 s automated.`,
    cf: { 'Oracle Application': 'Fusion CX', Module: 'Sales', 'Business Process': 'Lead-to-Order', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Env Constraint': 'None', 'Req Confidence': 'Observed' } },

  { key: 'BR-10', name: 'BR-10 — Receivables transaction review',
    desc: `User story: As an AR specialist, I want to open a customer invoice from Billing and see its header, customer and totals, so that I can answer queries and spot incomplete transactions.

Functional requirements:
- FR-10.1 Billing opens with BU filter (All business units) and infotiles: Incomplete, Transaction Approval, Adjustment Approval, Adjustment Research, Import Exceptions.
- FR-10.2 List shows Transaction Number, Source, Class, Customer, Entered Amount, Date.
- FR-10.3 Clicking a number opens details (Incomplete opens in Edit mode).
- FR-10.4 Details show BU, Source, Type, Status, dates, Currency, Totals, Bill-to/Ship-to, Payment Terms, Due Date, lines.

Business rules:
- BRL-10.1 Due Date = Transaction Date + payment terms (30 Net).
- BRL-10.2 Total = Lines + Tax + Freight + Charges.
- BRL-10.3 Leaving with unsaved changes prompts for confirmation.

Acceptance criteria:
- AC-10.2 Transaction 36765 shows Supremo US BU, Manual, Incomplete, USD, Fit N Fine Equipment / SAN JOSE, 30 Net, 408,334.50.
- AC-10.3 Total and Due Date arithmetic is consistent.

Success criteria: 7/7 header fields match; 2/2 arithmetic checks; 0 records changed.
Note: AR Create Transaction is blocked in this environment (sysParamEO is null).`,
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Receivables', 'Business Process': 'Order-to-Cash', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Env Constraint': 'Config Gap', 'Req Confidence': 'Observed' } },
];

const s = (description, expectedResult, clipboardData) =>
  Object.assign({ description }, expectedResult ? { expectedResult } : {}, clipboardData ? { clipboardData } : {});

const TCS = [
  { key: 'TC-01', reqs: ['BR-01'], name: 'TC-01 — Login and navigate to ERP work areas',
    desc: `Objective: verify the user can sign in and reach the ERP work areas from Home.\n${ENV}\nTest data: none.`,
    steps: [
      s('Open the environment URL', 'Redirects to the Oracle Cloud Sign In (IDCS) page'),
      s('Enter Username and Password, click Next', 'Home page loads with "Good afternoon/morning, Natalie Sales Rep"', 'natalie.salesrep'),
      s('Check the global header', 'Sandbox Mode banner visible; Navigator, Home, Favourites and Notifications icons present'),
      s('Click the Payables group tab', 'Tiles Payables Dashboard, Invoices, Payments are shown'),
      s('Click Procurement, then Sales', 'Procurement shows Purchase Requisitions (New); Sales Quick Actions include Create Opportunity'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Platform', 'Business Process': 'Platform Access', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Demo Track': 'Core E2E', 'Automation Status': 'Automated', 'UI Technology': 'ADF Classic', 'Env Constraint': 'Shared Data' } },

  { key: 'TC-02', reqs: ['BR-02'], showcase: true, name: 'TC-02 — Create a standard AP invoice and validate it',
    desc: `Objective: create a supplier invoice manually, run validation and confirm it reaches Validated.\n${ENV}\nPreconditions: TC-01; supplier ABC Consulting exists in US1 Business Unit.\nTest data: BU US1 Business Unit; Supplier ABC Consulting; Invoice # UIP-AP-<ddMMyy>-<HHmmss>; Header 1362.50 USD; Type Standard; Line 1 Item 1250.00.`,
    steps: [
      s('Home > Payables > Invoices', 'Invoice Workbench with Scanned, Recent, Holds, Approval, Prepaid infotiles'),
      s('Tasks panel > Create Invoice', 'Create Invoice page; Terms Date = today'),
      s('Enter Business Unit and Tab', 'Date = today; Payment Terms = Immediate', 'US1 Business Unit'),
      s('Enter Supplier and Tab', 'Supplier Number 1288, Site ABC US1, Legal Entity US1 Legal Entity are filled in', 'ABC Consulting'),
      s('Enter Invoice Number, Amount 1362.50 and Description', 'Values accepted; amount shows 1,362.50', 'UIP-AP-<ddMMyy>-<HHmmss>'),
      s('Expand Lines; set line 1 Amount = 1250.00', 'Distribution Set = Contractor Expense', '1250.00'),
      s('Click Save', 'Title "Create Invoice: <number>"; status Not validated; BU read-only'),
      s('Invoice Actions > Validate', 'Tax = 112.50; Totals OK; status Validated'),
      s('Click Save and Close', 'Returns to the Invoice Workbench without errors'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Payables', 'Business Process': 'Procure-to-Pay', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Demo Track': 'Core E2E', 'Automation Status': 'Automated', 'UI Technology': 'ADF Classic', 'Env Constraint': 'None' } },

  { key: 'TC-03', reqs: ['BR-03'], showcase: true, name: 'TC-03 — Search the invoice in Manage Invoices and verify statuses',
    desc: `Objective: confirm the TC-02 invoice can be found and shows the correct status and amounts.\n${ENV}\nPreconditions: TC-02 passed (reuse its invoice number).`,
    steps: [
      s('Invoices > Tasks > Manage Invoices', 'Search region shown; Saved Search = All Invoices'),
      s('Click Search with no criteria', 'Error "At least one is required"'),
      s('Enter the Invoice Number from TC-02 and click Search', 'Exactly 1 row returned'),
      s('Verify the row values', 'ABC Consulting; ABC US1; 1,362.50 USD; Standard; Validated; Approval Required; Holds 0; Unpaid 1,226.25 USD'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Payables', 'Business Process': 'Procure-to-Pay', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Demo Track': 'Core E2E', 'Automation Status': 'Automated', 'UI Technology': 'ADF Classic', 'Env Constraint': 'None' } },

  { key: 'TC-04', reqs: ['BR-04', 'BR-02'], name: 'TC-04 — Validation flags a header/line mismatch caused by tax (negative)',
    desc: `Objective: confirm validation catches a header amount that excludes calculated tax.\n${ENV}\nTest data: Invoice # UIP-AP-NEG-<timestamp>; header 1250.00; line 1250.00.`,
    steps: [
      s('Create an invoice as in TC-02 with Header Amount 1250.00 and line 1250.00; Save', 'Saved; status Not validated'),
      s('Invoice Actions > Validate', 'Tax 112.50 calculated; Totals shows warning; status Needs revalidation'),
      s('Change Header Amount to 1362.50 and Validate again', 'Totals OK; status Validated'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Payables', 'Business Process': 'Procure-to-Pay', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Demo Track': 'Controls Negative', 'Automation Status': 'Manual', 'UI Technology': 'ADF Classic', 'Env Constraint': 'None' } },

  { key: 'TC-05', reqs: ['BR-05'], showcase: true, name: 'TC-05 — Search the catalog and add an item to the cart (SSP)',
    desc: `Objective: confirm Redwood requisition shopping works and the cart count increments.\n${ENV}\nPreconditions: TC-01; note the starting cart badge count N. Do not Submit (shared demo).`,
    steps: [
      s('Home > Procurement > Purchase Requisitions (New) (do not deep-link)', 'SSP home; subtitle Supremo US Business Unit | Denver HQ; cart badge = N'),
      s('Search "laptop" and press Enter', '3 items incl. Laptop Carrycase Black $25.00', 'laptop'),
      s('Click Add to Cart on Laptop Carrycase Black', 'Cart badge = N+1 within 15 s'),
      s('Click the Cart icon in the bottom navigation bar', 'Cart lists Laptop Carrycase Black (Midtown Computer Supplies, $25.00); Subtotal +$25.00'),
      s('Teardown: delete the cart line', 'Badge returns to N'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Procurement SSP', 'Business Process': 'Procure-to-Pay', 'Oracle Release': '26C', 'Release Feature': '26C Cart Nav Bar', 'Demo Track': 'Core E2E', 'Automation Status': 'Automated', 'UI Technology': 'Redwood', 'Env Constraint': 'Shared Data' } },

  { key: 'TC-06', reqs: ['BR-06'], showcase: true, name: 'TC-06 — Save and reuse a requisition search (26D Saved Views)',
    desc: `Objective: confirm a keyword/filter search can be saved as a named view and reapplied.\n${ENV}\nRelease: 26D Self Service Procurement - Save and reuse requisition searches.`,
    steps: [
      s('SSP > My Requisitions (bottom nav)', 'Entered By chip; Requisitions/Lines toggle; Saved views button'),
      s('Search "Jabra" and press Enter', '1 item: 381637 Jabra Talk 45 Bluetooth Headset (Ordered)', 'Jabra'),
      s('Saved views > Name = UIP Jabra <timestamp> > Save', 'Popup closes; view chip appears in filter row', 'UIP Jabra <timestamp>'),
      s('Remove the Jabra chip', 'List returns to all requisitions'),
      s('Saved views > Saved views link > select the view', 'Criteria reapplied; 1 item (381637)'),
      s('Open the view menu', 'Set as Default and Delete offered'),
      s('Teardown: Delete the view', 'View removed from the list'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Procurement SSP', 'Business Process': 'Procure-to-Pay', 'Oracle Release': '26D', 'Release Feature': '26D Saved Views', 'Demo Track': 'Whats New', 'Automation Status': 'Automated', 'UI Technology': 'Redwood', 'Env Constraint': 'None' } },

  { key: 'TC-07', reqs: ['BR-07'], name: 'TC-07 — Notes & Attachments indicator on a requisition line (26C)',
    desc: `Objective: confirm the Notes and Attachments indicator appears only on lines with notes and opens a drawer.\n${ENV}\nRelease: 26C SSP - Identify attachments and notes on My Requisitions.`,
    steps: [
      s('Cart > edit a line (e.g. Laptop Carrycase Black)', 'Requisition Line Details page opens'),
      s('Notes > Note to Supplier: enter text; Save and Close', 'Back on Cart (transient RestAction toast may appear and is ignored)', 'UIP test - please deliver to reception desk, Bldg 2.'),
      s('My Requisitions > Lines view', 'Notes and Attachments icon shown on that line only'),
      s('Click the icon', 'Drawer with Line Details | Notes and Attachments tabs shows the exact note text'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Procurement SSP', 'Business Process': 'Procure-to-Pay', 'Oracle Release': '26C', 'Release Feature': '26C Notes Indicator', 'Demo Track': 'Whats New', 'Automation Status': 'Candidate', 'UI Technology': 'Redwood', 'Env Constraint': 'None' } },

  { key: 'TC-08', reqs: ['BR-08'], name: 'TC-08 — Change a requisition charge account via Search for combination (26D)',
    desc: `Objective: confirm segment-based charge account search and update on a draft requisition line.\n${ENV}\nRelease: 26D SSP/Purchasing - Search and add charge account combinations.\nKnown defect: exact-match search on an existing combination returns "No matches found". Do NOT click Create.`,
    steps: [
      s('Edit a draft requisition line > Delivery and Billing Details', 'Distribution 1 = 120.10.63580.120.000.000'),
      s('Distribution menu > Edit', 'Drawer with Select favorite charge account (Main) / Enter charge account number'),
      s('Select Enter charge account number > Charge To menu > Search for combination', 'Dialog with chips Company 120 | LOB 10 | Account 63580 | Cost Center 120 | Product 000 | Intercompany 000'),
      s('Remove the Account chip', 'Lists …63170, …64210, …52150, …63580, …52120 combinations'),
      s('Select 120.10.64210.120.000.000 > Apply > Update', 'Toast "Distribution 1 updated"; Distribution 1 shows the new account', '120.10.64210.120.000.000'),
      s('Known issue check: search with all 6 chips set to an existing combination', 'Expected: combination listed. Actual (15-Oct-2026): "No matches found" + Create link'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Procurement SSP', 'Business Process': 'Record-to-Report', 'Oracle Release': '26D', 'Release Feature': '26D Account Search', 'Demo Track': 'Whats New', 'Automation Status': 'Manual', 'UI Technology': 'Redwood', 'Env Constraint': 'Known Defect' } },

  { key: 'TC-09', reqs: ['BR-09'], showcase: true, name: 'TC-09 — Create a sales opportunity',
    desc: `Objective: confirm a sales rep can create an opportunity and defaults are applied.\n${ENV}\nTest data: Name UIP Demo - Sykes Gym Equipment Refresh <timestamp>; Account Sykes Gym.`,
    steps: [
      s('Home > Sales tab > Quick Action Create Opportunity', 'Form opens: Win Probability 10, Close Date today+30, Sales Stage 01 - Qualified, Currency EGP'),
      s('Enter Name; Account dropdown > Sykes Gym', 'Account set', 'UIP Demo - Sykes Gym Equipment Refresh <timestamp>'),
      s('Click Save and Continue', 'Edit Opportunity: <name> : Summary; Owner Natalie Sales Rep; Status Open; Sales Channel Direct; Price List Corporate'),
      s('Click Save and Close', 'Returns to Home without errors'),
      s('Sales > Opportunities: search by name', 'Opportunity listed with Status Open'),
    ],
    cf: { 'Oracle Application': 'Fusion CX', Module: 'Sales', 'Business Process': 'Lead-to-Order', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Demo Track': 'Core E2E', 'Automation Status': 'Automated', 'UI Technology': 'ADF Classic', 'Env Constraint': 'None' } },

  { key: 'TC-10', reqs: ['BR-10'], name: 'TC-10 — Receivables Billing: view a transaction read-only',
    desc: `Objective: confirm the AR Billing work area loads and transaction details are readable.\n${ENV}\nNote: Create Transaction is blocked (sysParamEO is null); convert to a create test once fixed.`,
    steps: [
      s('Home > Receivables > Billing', 'Billing workbench; BU filter All business units; five infotiles'),
      s('Click transaction 36765', 'Edit Transaction: Invoice 36765', '36765'),
      s('Verify the header', 'Supremo US Business Unit; Manual; Incomplete; USD; Fit N Fine Equipment / SAN JOSE; 30 Net; Total 408,334.50'),
      s('Leave via Home without saving', 'No changes saved'),
    ],
    cf: { 'Oracle Application': 'Fusion ERP', Module: 'Receivables', 'Business Process': 'Order-to-Cash', 'Oracle Release': 'Baseline', 'Release Feature': 'None', 'Demo Track': 'Core E2E', 'Automation Status': 'Manual', 'UI Technology': 'ADF Classic', 'Env Constraint': 'Config Gap' } },
];

module.exports = { TAG, FIELDS, REQS, TCS };

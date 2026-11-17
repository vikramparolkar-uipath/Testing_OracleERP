# Oracle Fusion ERP E2E Demo — Reverse-Engineered Requirements & Success Criteria

| | |
|---|---|
| **Companion docs** | [test-cases.md](test-cases.md) (TC-01 … TC-10), [exploration-notes.md](exploration-notes.md) (object repository, picklists, findings) |
| **Environment** | `eqjz.ds-fa.oraclepdemos.com` (Oracle Fusion Cloud, Vision demo, Sandbox Mode active) |
| **Persona** | Natalie Sales Rep (`natalie.salesrep`). This user has Sales Rep, Self-Service Requester, Payables and Receivables inquiry/entry access in this demo. |
| **Derived on** | 2026-10-15 |
| **Method** | Requirements were **reverse-engineered** from (a) behaviour observed in the live environment during exploratory testing and (b) the Oracle 26C/26D readiness documents. They describe what the configured system *is expected to do*. They are not customer-signed business requirements. Treat them as a **baseline to confirm** with the business owner. |

## 1. Conventions

| Prefix | Meaning |
|---|---|
| **BR-nn** | Business requirement: the business outcome / why |
| **FR-nn.m** | Functional requirement: what the system must do (traceable to a BR) |
| **BRL-nn.m** | Business rule: a constraint, validation or default the system enforces |
| **AC-nn.m** | Acceptance criterion in Given / When / Then form (testable) |
| **SC-nn.m** | Success criterion: the measurable pass threshold used to sign off the test run |
| **NFR-nn** | Non-functional requirement (performance, security, usability, reliability) |
| **REL-xxx** | Oracle release-note feature reference |

**Priority:** **M** = Must (demo/E2E fails without it), **S** = Should, **C** = Could.
**Source tag** on each requirement: **[OBS]** = observed in the environment, **[DOC]** = Oracle release-note documentation, **[ASM]** = assumption / inferred business intent (to be confirmed).

---

## 2. Business requirements overview

| BR | Business requirement | Business process | Priority | Test case(s) |
|---|---|---|---|---|
| BR-01 | Authorised users must sign in securely once and reach every work area their role allows, from a single home page. | Platform / Access | M | TC-01 |
| BR-02 | Accounts Payable must be able to record a supplier invoice manually, with defaults, tax calculation and validation applied, so it is ready for approval and payment. | Procure-to-Pay (Invoice entry) | M | TC-02, TC-04 |
| BR-03 | AP users must be able to find any invoice quickly and see its validation, approval, hold and payment status. | Procure-to-Pay (Invoice inquiry) | M | TC-03 |
| BR-04 | The system must stop an invoice whose header total disagrees with its lines plus tax from being treated as validated. | Procure-to-Pay (Controls) | M | TC-04 |
| BR-05 | Employees must be able to buy approved catalog items through a consumer-style shopping experience with a persistent cart. | Procure-to-Pay (Requisitioning) | M | TC-05 |
| BR-06 | Requesters must be able to save frequently used requisition searches and reuse them, to cut repeated filtering. | Procure-to-Pay (Requisition tracking) | S | TC-06 |
| BR-07 | Requesters must be able to see, without opening each requisition, which requisition lines carry notes or attachments. | Procure-to-Pay (Requisition tracking) | S | TC-07 |
| BR-08 | Requesters must be able to charge requisition lines to a valid GL account combination by searching segments, without having to know the full account string. | Procure-to-Pay / Record-to-Report (Accounting) | S | TC-08 |
| BR-09 | Sales reps must be able to capture a new sales opportunity against a customer account so the pipeline and forecast stay accurate. | Lead-to-Order (CX Sales) | M | TC-09 |
| BR-10 | Receivables users must be able to review customer transactions and their financial details from the Billing work area. | Order-to-Cash (Billing inquiry) | S | TC-10 |

---

## 3. Detailed requirements by test case

### TC-01 — Login and navigate to ERP work areas → **BR-01**

**User story:** *As an ERP user, I want to sign in once and reach Payables, Procurement and Sales from the Home page, so that I can start my work without hunting for URLs.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-01.1 | The application URL redirects unauthenticated users to the Oracle Identity Cloud Service (IDCS) **Sign In** page. | OBS | M |
| FR-01.2 | Sign-in takes a Username and Password, submitted with **Next**. | OBS | M |
| FR-01.3 | After sign-in the Home page shows a personalised greeting ("Good afternoon, Natalie Sales Rep"). | OBS | S |
| FR-01.4 | The Home page has a horizontal strip of **group tabs** (Sales, Procurement, Payables, Receivables, General Accounting, …). Each tab shows its Quick Actions and App tiles. | OBS | M |
| FR-01.5 | The global header offers Navigator (☰), Search, Home, Favourites, Watchlist and Notifications on every page. | OBS | S |
| FR-01.6 | Only the work areas the user's roles allow are shown (role-based navigation). | ASM | M |
| BRL-01.1 | When Sandbox Mode is active, a banner says so ("Sandbox Mode: Edit") on every page. | OBS | C |
| BRL-01.2 | Home reopens on the **last group tab used** (not always Sales). | OBS | C |

**Acceptance criteria**
- **AC-01.1** *Given* a user who isn't signed in, *when* they open the environment URL, *then* the IDCS Sign In page appears with Username, Password and Next.
- **AC-01.2** *Given* valid credentials, *when* the user submits them, *then* the Home page loads with the user's display name in the greeting.
- **AC-01.3** *Given* the Home page, *when* the user selects the **Payables** tab, *then* the tiles **Payables Dashboard, Invoices, Payments** are shown.
- **AC-01.4** *Given* the Home page, *when* the user selects **Procurement**, *then* a **Purchase Requisitions (New)** tile is shown; *when* they select **Sales*, *then* a **Create Opportunity** Quick Action is shown.
- **AC-01.5** *Given* invalid credentials, *when* they are submitted, *then* access is refused and no Fusion page opens. *(Negative; not run, to avoid locking the shared demo account.)*

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-01.1 | Sign-in success rate with valid credentials | 100% across all runs |
| SC-01.2 | Time from submitting credentials to Home page interactive | ≤ 15 s (NFR-01) |
| SC-01.3 | Group tabs and tiles named in AC-01.3/01.4 present | 100% match |
| SC-01.4 | No unexpected error dialog during navigation | 0 errors |

---

### TC-02 — Create a standard AP invoice and validate it → **BR-02**

**User story:** *As an AP specialist, I want to key in a supplier invoice with the system filling in supplier and terms details and calculating tax, so that the invoice is validated and ready for approval with little manual effort.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-02.1 | Users can open **Create Invoice** from the Invoices work area's Tasks panel. | OBS | M |
| FR-02.2 | The invoice header captures: Business Unit*, Supplier*, Supplier Site*, Legal Entity*, Invoice Number*, Currency* + Amount*, Type*, Description, Invoice Date*, Payment Terms*, Terms Date*, Requester, Identifying PO, Invoice Group (* = mandatory). | OBS | M |
| FR-02.3 | Invoice **Type** offers Standard, Prepayment, Debit memo, Credit memo, Retainage release, and **Withholding tax** once a supplier is selected. | OBS | S |
| FR-02.4 | Users can add invoice lines (Type Item / Freight / Miscellaneous) with an amount and a distribution set or account combination. | OBS | M |
| FR-02.5 | **Save** stores the invoice as a draft (*Not validated*) and makes the Business Unit read-only. | OBS | M |
| FR-02.6 | **Invoice Actions → Validate** calculates tax, checks totals and holds, and sets the validation status. | OBS | M |
| FR-02.7 | The Totals panel shows Items, Freight, Miscellaneous, Tax, Prepayments, Retainage, Withholding, Total and Due, with a pass ✔ / warning ⚠ indicator. | OBS | S |
| FR-02.8 | Invoice Actions also offers Calculate Tax, Check Funds, Manage Holds, Approval, Cancel, Delete, Post to Ledger and Account in Draft. | OBS | C |

**Business rules / defaults**
| ID | Rule | Src |
|---|---|---|
| BRL-02.1 | Entering BU **US1 Business Unit** defaults Invoice Date = today, Terms Date = today, Payment Terms = **Immediate**. | OBS |
| BRL-02.2 | Entering Supplier **ABC Consulting** defaults Supplier Number **1288**, Supplier Site **ABC US1**, Legal Entity **US1 Legal Entity**, Distribution Set **Contractor Expense (Single Distribution)**. | OBS |
| BRL-02.3 | Invoice Number must be **unique per supplier** (standard Oracle Payables rule). | ASM/DOC |
| BRL-02.4 | Tax is **exclusive** and calculated at validation. For US1 / ABC Consulting the rate is **9%** (1,250.00 → 112.50). | OBS |
| BRL-02.5 | Header Amount must equal line total + tax for the invoice to validate cleanly. | OBS |
| BRL-02.6 | Withholding of **10%** of the invoice amount reduces the Unpaid Amount (1,362.50 → 1,226.25). | OBS |
| BRL-02.7 | Default currency is **USD - US Dollar**. | OBS |

**Acceptance criteria**
- **AC-02.1** *Given* the Create Invoice page, *when* the user enters BU = US1 Business Unit and tabs out, *then* Date and Terms Date = today and Payment Terms = Immediate.
- **AC-02.2** *Given* a BU, *when* the user enters Supplier = ABC Consulting, *then* Supplier Number 1288, Site ABC US1 and Legal Entity US1 Legal Entity are filled in without further input.
- **AC-02.3** *Given* a complete header and one Item line of 1,250.00 with header amount 1,362.50, *when* the user clicks Save, *then* the page title shows "Create Invoice: <number>", status = **Not validated**, and BU becomes read-only.
- **AC-02.4** *Given* a saved, not-validated invoice, *when* the user runs Invoice Actions → Validate, *then* Tax = 112.50, the Totals indicator is ✔ and status = **Validated**.
- **AC-02.5** *Given* a validated invoice, *when* the user clicks Save and Close, *then* the Invoice Workbench opens with no error.
- **AC-02.6** *Given* an invoice number that already exists for ABC Consulting, *when* the user saves, *then* the system rejects the duplicate. *(Recommended additional negative check; not run.)*

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-02.1 | All defaulted values (BRL-02.1, 02.2) match the expected values | 100% |
| SC-02.2 | Calculated tax equals 9% of line amount (± 0.01) | Exact |
| SC-02.3 | Final validation status | **Validated** |
| SC-02.4 | Holds placed on the invoice | 0 |
| SC-02.5 | End-to-end creation time (open form → Validated), automated | ≤ 90 s |
| SC-02.6 | Invoice can be found afterwards (handed to TC-03) | Yes |

---

### TC-03 — Search the invoice in Manage Invoices and verify its statuses → **BR-03**

**User story:** *As an AP specialist, I want to search invoices by number and see their status at a glance, so that I can answer supplier queries and track what's ready to pay.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-03.1 | **Manage Invoices** offers a search region with Saved Searches: All Invoices (default), Disbursement, Document Sequence, General, Holds and Statuses, Prepayment, Purchase Order. | OBS | M |
| FR-03.2 | Search criteria include Business Unit, Invoice Number, Invoice Amount, Invoice Date, Supplier or Party, Supplier Number, Supplier Site, Taxpayer ID, Invoice Group. | OBS | M |
| FR-03.3 | Results show Invoice Number, Invoice Date, Creation Date, Supplier or Party, Supplier Site, Unpaid Amount, Invoice Amount, Applied Prepayments, Invoice Type, Notes, **Validation Status**, **Approval Status**, **Holds**. | OBS | M |
| FR-03.4 | Results can be exported to Excel and acted on (Validate, Approval, Post) from the toolbar. | OBS | S |
| BRL-03.1 | At least **one** of Invoice Number, Invoice Date, Supplier or Party, Supplier Number or Invoice Group is required. Otherwise the error is "At least one is required". | OBS |
| BRL-03.2 | A validated invoice that isn't yet approved shows Approval Status = **Required**. | OBS |

**Acceptance criteria**
- **AC-03.1** *Given* Manage Invoices, *when* the user clicks Search with no criteria, *then* the error "At least one is required" appears and no search runs.
- **AC-03.2** *Given* the invoice number from TC-02, *when* the user searches, *then* exactly **one** row is returned.
- **AC-03.3** *Given* that row, *then* Supplier = ABC Consulting, Site = ABC US1, Invoice Amount = 1,362.50 USD, Type = Standard, Validation Status = Validated, Approval Status = Required, Holds = 0, Unpaid Amount = 1,226.25 USD.

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-03.1 | Search result count for a unique invoice number | Exactly 1 |
| SC-03.2 | Field-level match of the result row against TC-02 data | 100% (8 of 8 fields) |
| SC-03.3 | Search response time | ≤ 10 s (NFR-01) |
| SC-03.4 | Mandatory-criteria validation fires on an empty search | Yes |

---

### TC-04 — Validation flags a header/line mismatch caused by tax (negative) → **BR-04**, BR-02

**User story:** *As an AP manager, I want the system to stop invoices whose header total doesn't match lines plus tax from being validated, so that we don't under- or over-pay suppliers.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-04.1 | Validation compares the header Invoice Amount with the sum of line amounts plus calculated tax. | OBS | M |
| FR-04.2 | A mismatch is shown visually in Totals (⚠) and the invoice status becomes **Needs revalidation**. | OBS | M |
| FR-04.3 | Once the header amount is corrected, revalidating sets the status to **Validated**. | OBS | M |
| BRL-04.1 | An invoice in *Needs revalidation* status must not move on to approval or payment. | ASM |

**Acceptance criteria**
- **AC-04.1** *Given* an invoice with header amount 1,250.00 and one line of 1,250.00, *when* it is validated, *then* tax 112.50 is calculated, Totals shows ⚠, and status = **Needs revalidation**.
- **AC-04.2** *Given* that invoice, *when* the header amount is changed to 1,362.50 and it is validated again, *then* Totals shows ✔ and status = **Validated**.

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-04.1 | Mismatched invoices that reach *Validated* | 0 |
| SC-04.2 | Corrected invoices that reach *Validated* after one revalidation | 100% |
| SC-04.3 | Mismatch indicator (⚠) displayed when totals differ | Always |

---

### TC-05 — Search the catalog and add an item to the cart → **BR-05**, REL-26C-CART

**User story:** *As an employee, I want to search the company catalog like an online store and add items to a cart I can open from anywhere, so that I can request goods quickly and correctly.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-05.1 | Self Service Procurement (Redwood) opens from the **Purchase Requisitions (New)** tile and shows the requester's BU and deliver-to location (Supremo US Business Unit \| Denver HQ). | OBS | M |
| FR-05.2 | A keyword search ("Search for items or services") returns matching catalog items with description, manufacturer, supplier, supplier item number, price and UOM. | OBS | M |
| FR-05.3 | Search results offer suggested filter chips (Category, Supplier, Manufacturer) and Card View / Table View. | OBS | S |
| FR-05.4 | **Add to Cart** adds the item to the user's open (draft) requisition. | OBS | M |
| FR-05.5 | A bottom **navigation bar** (Shop, My Requisitions, Cart with item-count badge) is shown on every SSP page. *(REL 26C "Access Cart Details Directly During Requisition Creation")* | OBS/DOC | S |
| FR-05.6 | The Cart shows the draft requisition number, lines (description, supplier, price, quantity) and a Requisition Summary (Subtotal, Nonrecoverable Tax, Approval Amount, Description, Justification, Deliver-to Location, Charge To). | OBS | M |
| FR-05.7 | Each cart line can be edited, have delivery set, be duplicated or be deleted. | OBS | S |
| BRL-05.1 | Items priced in a foreign currency are converted for display (e.g. 900.00 SAR → $240.39). | OBS |
| BRL-05.2 | Only one draft requisition acts as the active cart per user (381638). | OBS/ASM |
| BRL-05.3 | Deep links straight to the Redwood SSP URL aren't supported; launching from the tile is required. | OBS |

**Acceptance criteria**
- **AC-05.1** *Given* the Procurement Home tab, *when* the user opens Purchase Requisitions (New), *then* the SSP home loads with subtitle "Supremo US Business Unit \| Denver HQ" and a cart badge showing the current count N.
- **AC-05.2** *Given* the SSP home, *when* the user searches "laptop", *then* **3** items are returned, including *Laptop Carrycase Black – Hewlett Packard – Midtown Computer Supplies – LAP-BBAG – $25.00 Ea*.
- **AC-05.3** *Given* the results, *when* the user clicks Add to Cart on Laptop Carrycase Black, *then* the cart badge becomes **N+1**.
- **AC-05.4** *Given* the updated badge, *when* the user taps the Cart icon in the bottom bar, *then* the Cart page lists the item at $25.00 and the Subtotal goes up by $25.00.
- **AC-05.5** *Given* the cart line, *when* the user deletes it, *then* the badge returns to N. *(Teardown.)*

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-05.1 | Search result count for "laptop" | 3 (catalog baseline as of 15-Oct-2026) |
| SC-05.2 | Cart badge increment after Add to Cart | Exactly +1 |
| SC-05.3 | Time from Add to Cart click to badge update | ≤ 15 s |
| SC-05.4 | Cart subtotal delta | +$25.00 exactly |
| SC-05.5 | Bottom navigation bar visible on Home, Search, My Requisitions, Cart | 4 of 4 pages |

---

### TC-06 — Save and reuse a requisition search ("Saved views") → **BR-06**, REL-26D-SAVEDVIEWS

**Release reference:** Oracle 26D Self Service Procurement, *Save and Reuse Requisition Searches*, enabled by default. https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f47414.htm

**User story:** *As a requester who checks the same requisitions often, I want to save my search and filters under a name and reapply them in one click, so that I don't rebuild the same filters every time.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-06.1 | My Requisitions has a smart-search bar with keyword search and removable filter chips. The default chip is "Entered By <current user>". | OBS | M |
| FR-06.2 | A **Saved views** control (bookmark icon, `aria-label="Saved views"`) lets the user save the current keyword + filter combination under a **Name** (required). | OBS/DOC | M |
| FR-06.3 | Saved views are listed in a **Saved views** drawer; selecting one reapplies its criteria. | OBS/DOC | M |
| FR-06.4 | Each saved view can be **Set as Default** or **Deleted** from its ⋯ menu. | OBS/DOC | S |
| FR-06.5 | A saved view appears as a chip at the start of the filter row. | OBS | C |
| FR-06.6 | Saved views apply to both the **Requisitions** and **Lines** layouts. | DOC | S |
| BRL-06.1 | A view name is mandatory. Save can't go ahead without one. | OBS |
| BRL-06.2 | Saved views belong to the user and persist across sessions. | DOC/ASM |

**Acceptance criteria**
- **AC-06.1** *Given* My Requisitions, *when* the user searches "Jabra", *then* exactly 1 requisition is shown (381637 – Jabra Talk 45 Bluetooth Headset – Ordered – PO SU616337).
- **AC-06.2** *Given* that filtered result, *when* the user opens Saved views, enters a name and clicks Save, *then* the popup closes and the view chip appears in the filter row.
- **AC-06.3** *Given* the saved view, *when* the user removes the keyword and then selects the view from the Saved views drawer, *then* the "Jabra" criteria come back and the result is again 1 item.
- **AC-06.4** *Given* the saved view, *when* the user opens its ⋯ menu, *then* Set as Default and Delete are offered.
- **AC-06.5** *Given* the saved view, *when* the user deletes it, *then* it no longer appears in the drawer. *(Teardown.)*
- **AC-06.6** *Given* a saved view, *when* the user signs out and back in, *then* the view is still listed. *(Persistence; recommended extension.)*

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-06.1 | Feature present (Saved views button rendered) | Yes. Confirms the 26D update is active |
| SC-06.2 | Result count when the view is reapplied equals the count when it was saved | 100% identical |
| SC-06.3 | View CRUD (create, list, delete) completes without error | 3 of 3 |
| SC-06.4 | Steps to reapply a saved search vs rebuilding it manually | 2 clicks vs ≥ 3 actions (efficiency gain) |

---

### TC-07 — Notes & Attachments indicator on a requisition line → **BR-07**, REL-26C-ATTACH

**Release reference:** Oracle 26C SSP, *Identify Attachments and Notes on My Requisitions*. https://docs.oracle.com/en/cloud/saas/readiness/scm/26c/ssproc26c/26C-ssproc-wn-f49452.htm

**User story:** *As a requester, I want to see at a glance which requisition lines have notes or attachments, so that I know where extra instructions exist without opening every line.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-07.1 | A requisition line's details page has **Notes → Note to Supplier** and **Attachments** (Category, file drag-and-drop, URL). | OBS | M |
| FR-07.2 | Attachment Category values: Miscellaneous, To Approver, To Buyer, To Receiver, **Internal to Requisition** (default), To Supplier. | OBS | S |
| FR-07.3 | In My Requisitions → **Lines** layout, any line with a note or attachment shows an indicator icon (`button[aria-label="Notes and Attachments"]`). | OBS/DOC | M |
| FR-07.4 | In the **Requisitions** layout, a requisition with a *header* attachment shows the indicator. | DOC | S |
| FR-07.5 | Clicking the indicator opens a drawer (line description + requisition number) with tabs *Line Details* and *Notes and Attachments*, showing the note text. | OBS | M |
| BRL-07.1 | The indicator appears **only** on lines that have notes or attachments. | OBS/DOC |

**Acceptance criteria**
- **AC-07.1** *Given* a draft requisition line without notes, *when* the user adds a Note to Supplier and clicks Save and Close, *then* the change is saved (verified by AC-07.2; a transient RestAction toast is acceptable, see NFR-05).
- **AC-07.2** *Given* My Requisitions in Lines layout, *then* the Notes and Attachments icon shows on that line and on **no other** line of the requisition.
- **AC-07.3** *Given* the icon, *when* the user clicks it, *then* a drawer opens titled with the line description and "Requisition <#>", and the Notes and Attachments tab shows the exact note text entered.

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-07.1 | Indicator shown on lines with notes | 100% |
| SC-07.2 | Indicator shown on lines without notes/attachments (false positives) | 0 |
| SC-07.3 | Note text in the drawer matches the text entered | Exact match |

---

### TC-08 — Change a requisition charge account with "Search for combination" → **BR-08**, REL-26D-ACCTSEARCH

**Release reference:** Oracle 26D SSP / Purchasing, *Search and Add Charge Account Combinations When Editing Requisitions and Purchase Orders*. https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f49910.htm

**User story:** *As a requester, I want to find the right charge account by searching individual segments (company, cost center, account …), so that I charge my purchase correctly without memorising account strings.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-08.1 | Requisition line **Delivery and Billing Details** shows the delivery fields (Requested Delivery Date, Deliver-to Location Type, Deliver-to Location, Address, UN Number, Hazard Class, Urgent) and the Billing distributions. | OBS | M |
| FR-08.2 | Each distribution has a ⋯ menu with **Edit** and **Split**. | OBS | S |
| FR-08.3 | The distribution drawer lets the user choose between **Select favorite charge account** (by nickname, e.g. *Main*) and **Enter charge account number**. | OBS | M |
| FR-08.4 | Charge To ⋯ offers **Combination Details** and **Search for combination**. | OBS/DOC | M |
| FR-08.5 | Search for combination shows one removable chip per segment: Company, Line of Business, Account, Cost Center, Product, Intercompany. Defaults come from the current account. | OBS | M |
| FR-08.6 | Removing or changing a segment chip lists the matching valid combinations; the user selects one and clicks **Apply**. | OBS/DOC | M |
| FR-08.7 | If no combination matches, the dialog offers **Create <combination>** (subject to cross-validation rules). | OBS/DOC | C |
| FR-08.8 | **Update** saves the distribution and confirms with the toast "Distribution 1 updated". | OBS | M |
| BRL-08.1 | Chart of accounts structure = 6 segments, `Company.LOB.Account.CostCenter.Product.Intercompany` (e.g. 120.10.63580.120.000.000). | OBS |
| BRL-08.2 | Searching with every segment set to an **existing** combination must return that combination, not offer to create it. | ASM |

**Acceptance criteria**
- **AC-08.1** *Given* a draft requisition line, *when* the user opens Delivery and Billing Details, *then* Distribution 1 shows 120.10.63580.120.000.000 at 100% / $25.00.
- **AC-08.2** *Given* the distribution drawer with *Enter charge account number* chosen, *when* the user picks Charge To ⋯ → Search for combination, *then* a dialog shows six segment chips prefilled from the current account.
- **AC-08.3** *Given* the dialog, *when* the Account chip is removed, *then* at least these combinations are listed: …63170…, …64210…, …52150…, …63580…, …52120… (Company 120, LOB 10, CC 120, Product 000, IC 000).
- **AC-08.4** *Given* the list, *when* the user selects 120.10.64210.120.000.000 and clicks Apply, then Update, *then* the toast "Distribution 1 updated" appears and Distribution 1 = 120.10.64210.120.000.000. Back on the Cart, Charge To shows "Multiple".
- **AC-08.5** *(Defect check)* *Given* all six chips set to an existing combination, *when* the search runs, *then* that combination is listed. **Current result: FAIL.** "No matches found" + "Create …" is shown (Finding 2).

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-08.1 | Feature present (Search for combination menu item) | Yes. Confirms the 26D update is active |
| SC-08.2 | Saved distribution account equals the selected combination | Exact match |
| SC-08.3 | Exact-match search returns an existing combination | 100%. **Currently 0%, open defect** |
| SC-08.4 | No new GL combination created during the test | 0 created |

---

### TC-09 — Create a sales opportunity → **BR-09**

**User story:** *As a sales rep, I want to log a new opportunity against a customer account in a few fields, so that it shows up in my pipeline and forecast straight away.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-09.1 | **Create Opportunity** is available as a Sales Home Quick Action. | OBS | M |
| FR-09.2 | The quick-create form captures Name*, Account, Primary Contact, Win Probability (%), Close Date*, Sales Stage, and shows Currency. | OBS | M |
| FR-09.3 | The Account selector lists the rep's accounts (e.g. MIND Fitness Center, Aegis FitZone, Aegon Fitness Gym, Sykes Gym, New Start Gyms) with Search… | OBS | M |
| FR-09.4 | **Save and Continue** creates the record and opens Edit Opportunity (Summary) with tabs Contacts, Assessments, Team, Activities, Notes, Leads, Quotes and Orders, References & Competitor, Deal Registrations, Change History. | OBS | M |
| FR-09.5 | The Summary shows Owner, Status, Include in Forecast, Sales Channel, Price List, Amount, Competitors, Registered, Referenceable, and a Products table (Browse Catalog / Add). | OBS | S |
| FR-09.6 | **Save and Close** returns the user to the page they started from (Home). | OBS | S |

**Business rules / defaults**
| ID | Rule | Src |
|---|---|---|
| BRL-09.1 | Win Probability defaults to **10%**; Sales Stage to **01 - Qualified**. | OBS |
| BRL-09.2 | Close Date defaults to **today + 30 days**. | OBS |
| BRL-09.3 | Owner defaults to the **creating user**. | OBS |
| BRL-09.4 | New opportunities have Status **Open**, Sales Channel **Direct**, Price List **Corporate**, Include in Forecast **When matches forecast criteria**. | OBS |
| BRL-09.5 | Sales Stage values: 01 - Qualified, 02 - Assessment, 03 - Go / No Go Review, 04 - Proposal, 05 - Submitted, 06 - Closed - Won, 07 - Closed - Lost (+ "01 - Qualifying", see Finding 6). | OBS |
| BRL-09.6 | Default currency should be the rep's corporate currency. **Observed: EGP** for a US rep, which needs confirming (Finding 6). | OBS/ASM |

**Acceptance criteria**
- **AC-09.1** *Given* Sales Home, *when* the user clicks Create Opportunity, *then* the form opens with Win Probability 10, Close Date today+30, Sales Stage 01 - Qualified.
- **AC-09.2** *Given* the form, *when* the user enters a unique Name, selects Account Sykes Gym and clicks Save and Continue, *then* "Edit Opportunity: <Name> : Summary" opens with Owner = Natalie Sales Rep and Status = Open.
- **AC-09.3** *Given* the edit page, *then* Sales Channel = Direct, Price List = Corporate, Include in Forecast = When matches forecast criteria, Amount = 0.00.
- **AC-09.4** *Given* the edit page, *when* the user clicks Save and Close, *then* Home opens with no error.
- **AC-09.5** *Given* the saved opportunity, *when* the user searches for it in Sales → Opportunities, *then* it is listed with Status Open. *(Verification step.)*
- **AC-09.6** *Given* the form with Name blank, *when* the user saves, *then* a required-field error is shown. *(Recommended negative check.)*

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-09.1 | Default values match BRL-09.1–09.4 | 100% (8 of 8) |
| SC-09.2 | Opportunity created and retrievable by name | Yes, exactly 1 match |
| SC-09.3 | Create flow time (Quick Action → saved) | ≤ 60 s automated |
| SC-09.4 | Currency default | Corporate currency (USD) **expected**. EGP observed, so the business must confirm |

---

### TC-10 — Receivables Billing workbench: view a transaction read-only → **BR-10**

**User story:** *As an AR specialist, I want to open a customer invoice from the Billing work area and see its header, customer and totals, so that I can answer customer queries and spot incomplete transactions.*

| ID | Requirement | Src | Pri |
|---|---|---|---|
| FR-10.1 | Billing opens with a BU filter (default **All business units**) and infotiles: Incomplete (0-10 / 10+ days), Transaction Approval, Adjustment Approval, Adjustment Research (current / prior periods), Import Exceptions. | OBS | M |
| FR-10.2 | The transaction list shows Transaction Number, Source, Class, Customer, Entered Amount (with currency) and Date. | OBS | M |
| FR-10.3 | Clicking a transaction number opens its details. *Incomplete* transactions open in **Edit** mode. | OBS | M |
| FR-10.4 | Transaction details show BU, Source, Type, Number, Status, Transaction / Accounting Dates, Currency, Total (Lines, Tax, Freight, Charges), Bill-to / Ship-to Name and Site, Payment Terms, Due Date and Invoice Lines. | OBS | M |
| FR-10.5 | The Tasks panel offers Create Transaction, Credit Transaction, Manage Transactions, Manage AutoInvoice Lines, Approve Adjustments, Manage Recurring Bill Plans, customer tasks and accounting tasks. | OBS | S |
| BRL-10.1 | Due Date = Transaction Date + Payment Terms (30 Net: 08/06/26 → 08/07/26). | OBS |
| BRL-10.2 | Transaction Total = Lines + Tax + Freight + Charges (375,480.00 + 32,854.50 = 408,334.50). | OBS |
| BRL-10.3 | Leaving a transaction with unsaved changes prompts *"Your changes aren't saved… Do you want to continue?"* (Yes / No). | OBS |

**Acceptance criteria**
- **AC-10.1** *Given* the Receivables Home tab, *when* the user opens Billing, *then* the five infotiles and the transaction list load without error.
- **AC-10.2** *Given* the list, *when* the user opens transaction **36765**, *then* the header shows BU Supremo US Business Unit, Source Manual, Status Incomplete, Currency USD, Bill-to Fit N Fine Equipment / SAN JOSE, Payment Terms 30 Net, Total 408,334.50.
- **AC-10.3** *Given* the values shown, *then* Total = Lines + Tax and Due Date = Transaction Date + 30 days.
- **AC-10.4** *Given* no edits were made, *when* the user leaves, *then* the transaction is unchanged.

**Success criteria**
| ID | Measure | Target |
|---|---|---|
| SC-10.1 | Header fields match the reference values | 100% (7 of 7) |
| SC-10.2 | Arithmetic checks (total, due date) | 2 of 2 pass |
| SC-10.3 | Records changed by the test | 0 |

---

## 4. Non-functional requirements (observed baselines)

| ID | Category | Requirement | Observed baseline | Target / threshold | Applies to |
|---|---|---|---|---|---|
| NFR-01 | Performance | Classic (ADF) page transitions complete promptly | 3–6 s | ≤ 10 s per transition | TC-01–04, 09, 10 |
| NFR-02 | Performance | Redwood SSP first load | 15–20 s | ≤ 25 s first load; ≤ 10 s afterwards | TC-05–08 |
| NFR-03 | Performance | Add to Cart / save line updates | 8–10 s | ≤ 15 s | TC-05, 07, 08 |
| NFR-04 | Security | Users see only the data their roles and data-access sets allow | GL: no Data Access Set; Req 381637 details refused | No unauthorised data visible; authorised data reachable | All |
| NFR-05 | Reliability | Transient REST 401s are retried transparently after token refresh, and data is saved | "Error response during RestAction" toast, data saved (PATCH 200) | No data loss; toast should ideally not appear | TC-07, 08 |
| NFR-06 | Usability | Header actions (Save, Cancel…) are reachable at standard desktop resolutions | Cancel cut off at ~960px wide | All actions visible at ≥ 1280px | TC-10, all ADF |
| NFR-07 | Auditability | Created records carry the creator as owner/creator | Owner = Natalie Sales Rep; Creation Date stamped | 100% | TC-02, 09 |
| NFR-08 | Data integrity | Monetary totals are computed consistently (lines + tax = total) | Holds in AP and AR | Exact to 0.01 | TC-02, 04, 10 |
| NFR-09 | Automation-readiness | UI elements expose stable identifiers | Redwood: stable `id`/`aria-label`; ADF: dynamic id prefixes | Selectors stay valid across sessions when matched by id suffix / label | All automated TCs |

---

## 5. Traceability matrix

| BR | FRs | Business rules | Acceptance criteria | Success criteria | NFRs | Test case | Release ref | Automate |
|---|---|---|---|---|---|---|---|---|
| BR-01 | FR-01.1–01.6 | BRL-01.1–01.2 | AC-01.1–01.5 | SC-01.1–01.4 | NFR-01, 04 | **TC-01** | – | Reusable component |
| BR-02 | FR-02.1–02.8 | BRL-02.1–02.7 | AC-02.1–02.6 | SC-02.1–02.6 | NFR-01, 07, 08 | **TC-02** | – | ⭐ #1 |
| BR-03 | FR-03.1–03.4 | BRL-03.1–03.2 | AC-03.1–03.3 | SC-03.1–03.4 | NFR-01 | **TC-03** | – | ⭐ #2 |
| BR-04 (+BR-02) | FR-04.1–04.3 | BRL-04.1, BRL-02.4–02.5 | AC-04.1–04.2 | SC-04.1–04.3 | NFR-08 | **TC-04** | – | Manual |
| BR-05 | FR-05.1–05.7 | BRL-05.1–05.3 | AC-05.1–05.5 | SC-05.1–05.5 | NFR-02, 03 | **TC-05** | 26C Cart access | ⭐ #3 |
| BR-06 | FR-06.1–06.6 | BRL-06.1–06.2 | AC-06.1–06.6 | SC-06.1–06.4 | NFR-02, 09 | **TC-06** | **26D Saved views** | ⭐ #4 |
| BR-07 | FR-07.1–07.5 | BRL-07.1 | AC-07.1–07.3 | SC-07.1–07.3 | NFR-03, 05 | **TC-07** | **26C Notes/Attachments** | Manual |
| BR-08 | FR-08.1–08.8 | BRL-08.1–08.2 | AC-08.1–08.5 | SC-08.1–08.4 | NFR-03, 05 | **TC-08** | **26D Account search** | Manual |
| BR-09 | FR-09.1–09.6 | BRL-09.1–09.6 | AC-09.1–09.6 | SC-09.1–09.4 | NFR-01, 07 | **TC-09** | – | ⭐ #5 |
| BR-10 | FR-10.1–10.5 | BRL-10.1–10.3 | AC-10.1–10.4 | SC-10.1–10.3 | NFR-01, 06, 08 | **TC-10** | – | Manual |

**Coverage:** 10 of 10 business requirements have at least one test case; all 4 verified release-note features are covered (TC-05, 06, 07, 08); 5 of 10 test cases are earmarked for automation, covering BR-02, 03, 05, 06, 09.

---

## 6. Open items, defects and requirements to confirm

| # | Type | Item | Impacts | Owner / next step |
|---|---|---|---|---|
| 1 | Defect (possible) | Exact-match "Search for combination" returns "No matches found" for an existing account (Finding 2) | AC-08.5 / SC-08.3 | Raise with Oracle / environment owner |
| 2 | Access gap | Requisition 381637 details refused for its own preparer (Finding 1) | REL 26C person-details drawer can't be tested | Check the SSP data-security role |
| 3 | Access gap | No GL Data Access Set for natalie.salesrep (Finding 4) | No Record-to-Report coverage | Assign a Data Access Set, or use a GL user |
| 4 | Config gap | AR Create Transaction fails with *sysParamEO is null* (Finding 5) | BR-10 limited to inquiry | Configure Receivables system options for the BU |
| 5 | Confirm requirement | Opportunity default currency EGP; duplicate stage "01 - Qualifying" (Finding 6) | BRL-09.5, 09.6 | Business owner to confirm the intended defaults |
| 6 | Confirm requirement | BRL-04.1 (invoices in *Needs revalidation* must not be paid) is assumed | BR-04 | AP process owner |
| 7 | Reliability | Transient "Error response during RestAction" toast (NFR-05) | TC-07, 08 automation | Treat as a warning; check data, not the toast |
| 8 | Test data | Catalog baseline (3 "laptop" items) and reference transaction 36765 may change in a shared demo pod | SC-05.1, SC-10.1 | Re-baseline before each demo |

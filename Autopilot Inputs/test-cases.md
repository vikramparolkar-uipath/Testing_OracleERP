# Oracle Fusion ERP E2E Demo — Test Cases

- **Environment:** https://eqjz.ds-fa.oraclepdemos.com/fscmUI/faces/FuseWelcome?fndThemeName=Vision_Default
- **User:** natalie.salesrep (password in a credential vault, not in scripts)
- **Source:** exploratory testing on 2026-10-15. Selectors, picklists and data are in [exploration-notes.md](exploration-notes.md).
- **Date format:** dd/mm/yy

## Summary

| ID | Title | Module | Type | UI tech | Release tie-in | Automate? |
|---|---|---|---|---|---|---|
| TC-01 | Login and navigate to ERP work areas | Platform | Smoke | IDCS + ADF | | Precondition for all (reusable component) |
| TC-02 | Create a standard AP invoice and validate it | Payables | Functional / E2E | ADF | | ⭐ **Automate #1** |
| TC-03 | Search the invoice in Manage Invoices and verify its statuses | Payables | Functional | ADF | | ⭐ **Automate #2** |
| TC-04 | Invoice validation flags a header/line total mismatch caused by tax | Payables | Negative | ADF | | Manual |
| TC-05 | Search the catalog and add an item to the cart (SSP) | Procurement | Functional | Redwood | 26C cart nav bar | ⭐ **Automate #3** |
| TC-06 | Save and reuse a requisition search (Saved views) | Procurement | Release-note | Redwood | **26D** | ⭐ **Automate #4** |
| TC-07 | Notes & Attachments indicator on a requisition line | Procurement | Release-note | Redwood | **26C** | Manual (candidate #6) |
| TC-08 | Change a requisition charge account with "Search for combination" | Procurement | Release-note | Redwood | **26D** | Manual |
| TC-09 | Create a sales opportunity | Sales (CX) | Functional | ADF (crmUI) | | ⭐ **Automate #5** |
| TC-10 | Receivables Billing workbench: open a transaction read-only and verify header data | Receivables | Functional (read-only) | ADF | | Manual |

**Why these 5 to automate:** together they cover both UI technologies (classic ADF and Redwood/JET), three pillars (Payables, Procurement, Sales), an E2E create → verify chain (TC-02 → TC-03), and one release-note feature (TC-06) that makes a good demo talking point. All five were run successfully in this environment and **need no admin setup**.

**Known blockers (not included as test cases):** GL Journals (user has no Data Access Set) and AR Create Transaction (server error *sysParamEO is null*). See Findings 4 and 5 in the notes.

---

## TC-01 — Login and navigate to ERP work areas
**Objective:** confirm the user can sign in and reach the ERP work areas from Home.
**Preconditions:** valid credentials.
| # | Step | Expected result |
|---|---|---|
| 1 | Open the environment URL | Redirects to Oracle Cloud **Sign In** (IDCS) page |
| 2 | Enter Username `natalie.salesrep`, Password, click **Next** | Home page loads with "Good afternoon/morning, Natalie Sales Rep" |
| 3 | Check the global header | "Sandbox Mode: Edit" yellow banner is visible; Navigator ☰, Home, Favourites, Notifications icons |
| 4 | Click the **Payables** group tab | Tiles **Payables Dashboard, Invoices, Payments** shown |
| 5 | Click **Procurement**, then **Sales** | Procurement tiles include **Purchase Requisitions (New)**; Sales Quick Actions include **Create Opportunity** |
**Test data:** none.

---

## TC-02 — Create a standard AP invoice and validate it ⭐
**Objective:** create a supplier invoice manually, run validation, and confirm it reaches *Validated*.
**Preconditions:** TC-01. Supplier ABC Consulting exists in US1 Business Unit.
**Test data:**
| Field | Value |
|---|---|
| Business Unit | US1 Business Unit |
| Supplier | ABC Consulting (expect Supplier # 1288, Site ABC US1, Legal Entity US1 Legal Entity) |
| Invoice Number | `UIP-AP-<ddMMyy>-<HHmmss>` (must be unique) |
| Header Amount | **1362.50** USD (= 1,250.00 line + 9% tax 112.50) |
| Type | Standard |
| Description | UiPath demo - consulting services |
| Line 1 | Type Item, Amount 1250.00 (Distribution Set defaults to *Contractor Expense*) |
| Payment Terms | Immediate (default) |

| # | Step | Expected result |
|---|---|---|
| 1 | Home → Payables → **Invoices** | "Invoice Workbench" with infotiles (Scanned, Recent, Holds, Approval, Prepaid) |
| 2 | Tasks panel → **Create Invoice** | "Create Invoice" page; Terms Date = today |
| 3 | Enter Business Unit, Tab | Date = today, Payment Terms = **Immediate** |
| 4 | Enter Supplier, Tab | Supplier Number **1288**, Supplier Site **ABC US1**, Legal Entity **US1 Legal Entity** filled in automatically |
| 5 | Enter Invoice Number, Amount, Description | Values accepted (amount shown as 1,362.50) |
| 6 | Expand **Lines**; line 1 Amount = 1250.00 | Distribution Set = Contractor Expense |
| 7 | Click **Save** | Title becomes "Create Invoice: <number>"; status chip **Not validated**; BU becomes read-only |
| 8 | **Invoice Actions → Validate** | Tax = **112.50**; Totals ✔ green; status chip **Validated** |
| 9 | **Save and Close** | Returns to Invoice Workbench, no errors |
**Automation notes:** use the Invoice Actions menu, not Ctrl+Alt+V. Wait about 8 s after Validate.

---

## TC-03 — Search the invoice in Manage Invoices and verify its statuses ⭐
**Objective:** confirm the invoice from TC-02 can be found and shows the right status and amounts.
**Preconditions:** TC-02 passed (use the same invoice number).
| # | Step | Expected result |
|---|---|---|
| 1 | Invoices → Tasks → **Manage Invoices** | Search: Invoice region; Saved Search = **All Invoices** |
| 2 | Click **Search** with no criteria | Error "**At least one is required**" (negative check) |
| 3 | Enter Invoice Number, click **Search** | Exactly 1 row is returned |
| 4 | Verify the row | Supplier **ABC Consulting**, Site **ABC US1**, Invoice Amount **1,362.50 USD**, Type **Standard**, Validation Status **Validated**, Approval Status **Required**, Holds **0**, Unpaid **1,226.25 USD** (10% withheld) |
| 5 | (Optional) Export to Excel | File downloads with the row |
**Test data:** invoice number from TC-02.

---

## TC-04 — Invoice validation flags a header/line total mismatch caused by tax (negative)
**Objective:** confirm validation catches a header amount that excludes the calculated tax.
| # | Step | Expected result |
|---|---|---|
| 1 | Create an invoice as in TC-02, but with Header Amount = **1250.00** and line = 1250.00 | Saves; **Not validated** |
| 2 | Invoice Actions → Validate | Tax 112.50 calculated; Totals shows ⚠; status **Needs revalidation** |
| 3 | Change the Header Amount to 1362.50, Validate again | Status **Validated** |
**Test data:** Invoice # `UIP-AP-NEG-<timestamp>`.

---

## TC-05 — Search the catalog and add an item to the cart (Self Service Procurement) ⭐
**Objective:** confirm requisition shopping works in Redwood and the cart count goes up.
**Preconditions:** TC-01. Note the starting cart badge count (N).
| # | Step | Expected result |
|---|---|---|
| 1 | Home → Procurement → **Purchase Requisitions (New)** (don't deep-link) | "Self Service Procurement" home; subtitle **Supremo US Business Unit \| Denver HQ**; bottom nav bar with 🛒 badge = N |
| 2 | In "Search for items or services", type `laptop` + Enter | **3 items**: 15" Laptop Intel Core i7 ($969.00), **Laptop Carrycase Black ($25.00)**, 11" Netbook AMD ($349.00). Filter chips Category / Supplier / Manufacturer |
| 3 | Click **Add to Cart** on *Laptop Carrycase Black* | Spinner, then cart badge = **N+1** (allow up to 15 s) |
| 4 | Click 🛒 in the bottom nav bar (26C feature) | Cart page "Cart / Requisition <#>" lists *Laptop Carrycase Black, Sold By Midtown Computer Supplies, $25.00 Ea*; summary Subtotal includes +$25.00 |
| 5 | (Teardown) Delete the line with 🗑 | Badge back to N |
**Note:** don't click **Submit** in a shared demo pod, because it starts approval workflow.

---

## TC-06 — Save and reuse a requisition search ("Saved views") — Release 26D ⭐
**Release note:** 26D Self Service Procurement, *Save and reuse requisition searches* — https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f47414.htm (enabled by default).
**Objective:** confirm a user can save a keyword/filter search as a named view and apply it later.
| # | Step | Expected result |
|---|---|---|
| 1 | SSP → bottom nav 📋 **My Requisitions** | Filter chip "Entered By Natalie Sales Rep"; toggle Requisitions / Lines; **Saved views** bookmark button (`aria-label="Saved views"`) |
| 2 | Type `Jabra` in "Search for requisitions" + Enter | 1 item: **381637 Jabra Talk 45 Bluetooth Headset** (Ordered, PO SU616337) |
| 3 | Click **Saved views** → Name = `UIP Jabra <timestamp>` → **Save** | Popup closes; a bookmark chip for the view appears at the start of the filter row |
| 4 | Remove the `Jabra` chip | List returns to 4 lines across 2 requisitions |
| 5 | Saved views → **Saved views** link → click the new view | Drawer lists the view; selecting it re-applies the keyword → 1 item (381637) |
| 6 | View ⋯ menu | Options **Set as Default**, **Delete** |
| 7 | (Teardown) ⋯ → **Delete** | View removed from the list |

---

## TC-07 — Notes & Attachments indicator on a requisition line — Release 26C
**Release note:** 26C SSP, *Identify Attachments and Notes on My Requisitions* — https://docs.oracle.com/en/cloud/saas/readiness/scm/26c/ssproc26c/26C-ssproc-wn-f49452.htm
| # | Step | Expected result |
|---|---|---|
| 1 | Cart → ✎ edit a line (e.g. Laptop Carrycase Black) | "Requisition Line Details / Requisition <#>, Line <n>" |
| 2 | Notes → **Note to Supplier** = `UIP test - please deliver to reception desk, Bldg 2.` → **Save and Close** | Back on Cart (a transient "Error response during RestAction" toast can be ignored) |
| 3 | My Requisitions → **Lines** view | An attachment icon (`button[aria-label="Notes and Attachments"]`) shows **only** on that line |
| 4 | Click the icon | Drawer "<line description> / Requisition <#>" with tabs Line Details \| **Notes and Attachments**, showing the note text |

---

## TC-08 — Change the requisition charge account with "Search for combination" — Release 26D
**Release note:** 26D SSP/Purchasing, *Search and add charge account combinations* — https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f49910.htm
| # | Step | Expected result |
|---|---|---|
| 1 | Edit a draft requisition line → **Delivery and Billing Details** | Billing → Distribution 1 = `120.10.63580.120.000.000` |
| 2 | Distribution ⋯ → **Edit** | Drawer: Charge account radios *Select favorite charge account* (nickname **Main**) / *Enter charge account number* |
| 3 | Select *Enter charge account number* → Charge To ⋯ → **Search for combination** | Dialog with segment chips Company 120 \| Line of Business 10 \| Account 63580 \| Cost Center 120 \| Product 000 \| Intercompany 000 |
| 4 | Remove the **Account** chip | List of valid combinations (…63170, …64210, …52150, …63580, …52120) |
| 5 | Select `120.10.64210.120.000.000` → **Apply** → **Update** | Toast "Distribution 1 updated"; Distribution 1 shows the new account |
| 6 | **Known issue to check:** with all 6 chips set to an *existing* combination | Expected: the combination is listed. **Actual (15-Oct-2026):** "No matches found" + "Create …" link (Finding 2). **Don't click Create.** |

---

## TC-09 — Create a sales opportunity ⭐
**Objective:** confirm a sales rep can create an opportunity and the defaults are applied.
**Test data:** Name `UIP Demo - Sykes Gym Equipment Refresh <timestamp>`, Account **Sykes Gym**.
| # | Step | Expected result |
|---|---|---|
| 1 | Home → **Sales** tab → Quick Action **Create Opportunity** | "Create Opportunity" (crmUI). Defaults: Win Probability **10**, Close Date **today+30**, Sales Stage **01 - Qualified**, Currency **EGP** |
| 2 | Enter Name; Account dropdown → **Sykes Gym** | Account set |
| 3 | **Save and Continue** | Title "Edit Opportunity: <name> : Summary"; Owner **Natalie Sales Rep**, Status **Open**, Sales Channel **Direct**, Price List **Corporate**, Include in Forecast "When matches forecast criteria", Amount 0.00 |
| 4 | **Save and Close** | Returns to Home without errors |
| 5 | (Verify) Sales → Opportunities, search the name | Opportunity listed, Status Open |
**Picklist check:** Sales Stage values 01 - Qualified … 07 - Closed - Lost, plus "01 - Qualifying" (a data-quality observation).

---

## TC-10 — Receivables Billing workbench: open a transaction read-only and verify header data
**Objective:** confirm the AR Billing work area loads and transaction details can be read.
| # | Step | Expected result |
|---|---|---|
| 1 | Home → Receivables → **Billing** | "Billing" workbench; BU filter **All business units**; infotiles Incomplete / Transaction Approval / Adjustment Approval / Adjustment Research / Import Exceptions |
| 2 | Click transaction **36765** | "Edit Transaction: Invoice 36765" |
| 3 | Verify the header | BU **Supremo US Business Unit**, Source **Manual**, Status **Incomplete**, Currency **USD**, Bill-to **Fit N Fine Equipment / SAN JOSE**, Payment Terms **30 Net**, Total **408,334.50** (Lines 375,480.00 + Tax 32,854.50) |
| 4 | Leave without saving (Home) | No changes saved |
**Note:** creating a transaction is currently blocked (Finding 5). Turn this into a create test once Receivables system options are fixed.

# Oracle Fusion ERP — Exploratory Testing Notes

- **Environment:** https://eqjz.ds-fa.oraclepdemos.com/fscmUI/faces/FuseWelcome?fndThemeName=Vision_Default
- **User:** natalie.salesrep (display name "Natalie Sales Rep") — signs in through Oracle IDCS (`idcs-...identity.oraclecloud.com/ui/v1/signin`, fields: Username, Password, button **Next**)
- **Explored on:** 2026-10-15
- **Date format in UI:** `dd/mm/yy` (e.g. 15/10/26). Currency amounts are shown like `1,200.00 USD`.
- **Global banner:** "Sandbox Mode: Edit" + "Refresh Needed" (yellow bar). A sandbox is active for this user. Leave it alone, but automation should expect the yellow bar to push the page down about 36px.

## General UI / automation notes (ADF "classic" pages)
- Nearly every ERP work area is an **ADF** page (the URL stays on `FuseWelcome?..._afrLoop=...`). Navigation does **not** change the URL path, so navigate through the UI (Home tab → app tile, or Navigator ☰) instead of deep links.
- Element IDs follow the pattern `pt1:_FOr1:1:_FONSr2:0:<region>:<component>::content`. The `::content` suffix is the real `<input>`. **The numeric segments (`_FOr1:1`, `MAnt2:1`) can change** between sessions or with the number of open tabs, so match on the **ending** of the ID (e.g. `[id$="ap1:r2:0:i2::content"]`) or use the `aria-label` / label text.
- Clicks fired from JavaScript (`element.click()`) often **do not** fire ADF links. Use real mouse clicks (UiPath: Simulate/Hardware click, not "Click via JS").
- Work-area **Tasks panel**: a vertical icon strip on the right edge of the work area (first icon, tooltip "Tasks"). It opens a flyout list of links.
- Timing: most page changes take 3–6 s. Wait for the page title (the browser `<title>`, e.g. "Create Invoice - Invoices - Oracle Fusion Cloud Applications") rather than using fixed delays.
- Home page groups (top tab strip on the welcome page): Sales, Redwood Sales, Sales Performance, Me, Procurement, My Client Groups, Help Desk, Product Management, **ERP Agents**, Risk Management, Configure Price Quote, Field Service, Knowledge, Subscription Management, Contract Management, Supply Chain Execution, **Receivables**, **Collections**, **Payables**, **Projects**, **General Accounting**, Budgetary Control, Revenue Management, Sustainability, My Enterprise, Tools, Configuration, My Reporting, My Analytics, Others.

### Apps per ERP home group
| Group | App tiles |
|---|---|
| Payables | Payables Dashboard, Invoices, Payments |
| ERP Agents | Payables Agent, Payables Period Close Workspace, Expenses Agent, Cash Processing Agent |
| General Accounting | Journals |
| Receivables | Billing, Accounts Receivable, Revenue |
| Procurement | Purchase Requisitions (ADF), Purchase Requisitions (New), Purchase Orders, Purchasing, My Receipts, Catalogs, Shopping Catalog Administration, Suppliers, Supplier Management, Supplier Qualification |
| Projects | Project Financial Management, Project Management, My Work, Project Manager Dashboard, Project Performance Dashboard, Team Member Dashboard, Programs |
| Collections | Collections |
| Supply Chain Execution | Quality Management, Inventory Management (Classic), Inventory Execution, Cost Accounting, Receipt Accounting, Fiscal Document Capture, Financial Orchestration, Supply Chain Orchestration, Asset Information Management |
| Sales (Quick Actions) | Create Contact, Create Appointment, Create Task, Create Call Report, Create Opportunity, Create Lead |
| Sales (Apps) | Workspace, Activities, Deal Registrations, Leads, Opportunities, Forecasts, Accounts, Contacts, Lightbox, Analytics, Campaigns, Service Requests, Products, Territories, Quotas, Households |

---

## 1. Payables → Invoices (Invoice Workbench)
**Path:** Home → Payables → Invoices. Page title: `Invoice Workbench - Invoices - Oracle Fusion Cloud Applications`

**Workbench infotiles:** Scanned (0-7 / 8-14 / 15+ days), Recent (24 Hours: Incomplete / Complete / Total), Holds (7 Days: Validation / Purchasing / Other), Approval (Pending / Others / Rejected), Prepaid (0-30 / 31-60 / 61+).
At exploration time: Scanned 70/0/75, Holds 15/14/113, Approval 0/14/17, Prepaid 6/0/16.

**Invoice list columns:** Invoice Number, Amount, Supplier, Supplier Site, Validation Status, Invoice Date, Business Unit, Creation Date, Assignee, ...
Sample existing data: suppliers **ABC Consulting** (site **ABC US1**), **Staples** (site **Staples US1**), **EFG Company** (site **EFG US1**); business unit **US1 Business Unit**.

**Tasks panel links (IDs end with `_FOTRaT:0:RAtlN`):**
- Invoices: Create Invoice (RAtl1), Create Invoice from Spreadsheet (RAtl2), Create Recurring Invoices (RAtl3), Manage Invoices (RAtl4), Apply Missing Conversion Rates, Validate Invoices (RAtl6), Initiate Approval Workflow, Import Invoices (RAtl8), Correct Import Errors (RAtl9), Import Payment Requests (RAtl10), Run Payables Exceptions Listing (RAtl13)
- Accounting: Create Accounting (RAtl15), Create Adjustment Journal (RAtl16), Review Journal Entries, Payables to Ledger Reconciliation (RAtl18)
- Assets: Create Mass Additions (RAtl19)
- Payables Periods: Manage Accounting Periods (RAtl21)

### Create Invoice — object repository
Page title: `Create Invoice - Invoices - Oracle Fusion Cloud Applications`.
ID prefix `P = pt1:_FOr1:1:_FONSr2:0:MAnt2:1:pm1:r1:0:ap1:`

| Field | Type | ID suffix (after P) | Required | Notes |
|---|---|---|---|---|
| Identifying PO | text + search icon | `r2:0:ic1::content` | | LOV |
| Business Unit | combo (choice list) | `r2:0:ic2::content` | ✔ | |
| Supplier | text + search icon | `r2:0:ic3::content` | ✔ | LOV; type the name, then Tab |
| Supplier Number | read-only | | | fills from Supplier |
| Supplier Site | combo | `r2:0:ic4::content` | | |
| Legal Entity | read-only | | | fills from BU |
| Invoice Group | text | `r2:0:i1::content` | | |
| Number (Invoice #) | text | `r2:0:i2::content` | ✔ | must be unique per supplier |
| Amount – Currency | select | `r2:0:soc1::content` | ✔ | default **USD - US Dollar**. Full ISO list (≈250 values), common: USD, EUR, GBP, JPY, CAD, AUD, INR, CNY, MXN |
| Amount – Value | text | `r2:0:i3::content` | ✔ | |
| Type | select | `r2:0:so1::content` | ✔ | **Picklist:** Standard; Prepayment; Debit memo; Credit memo; Retainage release |
| Description | textarea | `r2:0:i4::content` | | |
| Date (Invoice Date) | date | `r2:0:id2::content` | ✔ | dd/mm/yy |
| Payment Terms | combo | `r2:0:so3::content` | ✔ | |
| Terms Date | date | `r2:0:id5::content` | ✔ | defaults to today |
| Requester | text + search | `r2:0:ic6::content` | | |
| Lines → Action | select | `so3::content` (no `r2:0:`) | | **Picklist:** Match Invoice Lines; Match to Receipt Charges; Correct Matched Invoices; Correct Unmatched Invoices |

Buttons (top-right): **Invoice Actions ▾**, **Save and Create Next**, **Save**, **Save and Close**, **Cancel**.
Sections: Invoice Header (Show More), Lines, Taxes, Totals (Items, Freight, Miscellaneous, Tax, Included Prepayments, Total, Retainage, Withholding, Applied Prepayments, Due).

**Picklists discovered while filling the form**
- **Business Unit:** a large shared list (this demo pod holds data for many tenants), e.g. `##AIRTEL CA`, `#EXL US BU`, `A001 USA BUSINESS UNIT`, `AB_Canada Business Unit`, `ACE US1 BU`, `AMD CALIFORNIA BU`, ... **Use `US1 Business Unit`.** Type the value and press Tab; don't scroll the list.
- **Payment Terms:** 1/30 Net 60; 2/10 Net 30; End of Month; Half/45 Net 90; Hold 10 Immediate; **Immediate** (default for ABC Consulting); Net 30; Net 45; Net 60; Net Monthly Account
- **Type (header)** after the supplier is chosen: Standard; Prepayment; Debit memo; Credit memo; **Withholding tax** (appears only once a supplier is set); Retainage release
- **Line Type:** Freight; **Item** (default); Miscellaneous
- **Distribution Set:** defaults to `Contractor Expense (Single Distribution)` for ABC Consulting

**Defaulting behaviour (assertion points)**
- BU = US1 Business Unit → Date = today, Payment Terms = Immediate, Terms Date = today
- Supplier = ABC Consulting → Supplier Number **1288**, Supplier Site **ABC US1**, Legal Entity **US1 Legal Entity**
- After the first Save, Business Unit becomes read-only and the page title changes to `Create Invoice: <Invoice Number>`. Status chip: **Not validated**.
- Expanding **Lines** gives 5 empty rows (Line Type = Item, Distribution Set set).

**Line-level IDs** (prefix `P + at2:_ATp:ta2:<row>:`, row 0 = first line)
| Field | Suffix | Type |
|---|---|---|
| Type | `so12::content` | select (Freight/Item/Miscellaneous) |
| Amount | `i26::content` | text |
| Distribution Set | `so13::content` | combo |
| Distribution Combination | `kf1CS::content` | key flexfield |
| Accounting Date | `id1::content` | date |
| Budget Date | `id10::content` | date |
| Description | `i34::content` | text |
| Tax Classification | `ic27::content` | LOV |
| Ship-to Location | `ic28::content` | LOV |
| PO Number / Line / Schedule | `ic21` / `ic22` / `ic23` | LOV |
| Project Number | `df3_LinePJCDFF1Iterator_PROJECT_ID_Display::content` | DFF |
Line toolbar: View ▾, + (Add Row), Delete, Allocate ▾, Cancel Line, Distributions. Line sub-tabs: Distribution, Budgetary Control, Reference, Tax, Purchase Order, Asset, Project.

**Invoice Actions ▾ menu:** Manage Installments; Calculate Tax (Ctrl+Alt+X); Check Funds; **Validate (Ctrl+Alt+V)**; Request Override; Apply or Unapply Prepayments; Manage Holds; Account Coding ▸; Approval ▸; View Approval and Notification History; Cancel Invoice; Delete Invoice; Post to Ledger; Account in Draft.
> The Ctrl+Alt+V shortcut did **not** work reliably from automation. Use the menu.

**Tax / validation behaviour (important for assertions)**
- Validation **calculates tax: 9% for US1/ABC Consulting** (1,250.00 → Tax 112.50). Tax is *exclusive*, so if header Amount = line amount, the Totals panel shows a ⚠ mismatch and the status becomes **Needs revalidation**.
- Fix: header Amount = lines + tax (1,362.50) → validate again → status **Validated** (green ✔ on the totals).
- Withholding: after validation, Unpaid Amount = **1,226.25** (10% of 1,362.50 withheld).

### Manage Invoices (search) — object repository
Path: Invoices → Tasks → Manage Invoices. Title: `Manage Invoices - Invoices - Oracle Fusion Cloud Applications`.
Prefix `P = pt1:_FOr1:1:_FONSr2:0:MAnt2:1:pm1:r1:0:ap1:`
| Field | Suffix |
|---|---|
| Saved Search (select) | `q1::saveSearch::content`. **Picklist:** All Invoices; Disbursement; Document Sequence; General; Holds and Statuses; Prepayment; Purchase Order |
| Business Unit | `q1:value00::content` |
| **Invoice Number** | `q1:value10::content` |
| Invoice Amount | `q1:value20::content` |
| Invoice Date | `q1:value30::content` |
| Supplier or Party | `q1:value40::content` |
| Supplier Number | `q1:value50::content` |
| Supplier Site | `q1:value60::content` |
| Taxpayer ID | `q1:value70::content` |
| Invoice Group | `q1:value80::content` |
| Search / Reset / Advanced buttons | `q1::search`, `q1::reset`, `q1::mode` |
Rule: at least one of the `**` fields is required: Invoice Number, Invoice Date, Supplier or Party, Supplier Number, Invoice Group. Otherwise you get the error "At least one is required".
Result columns: Invoice Number, Invoice Date, Creation Date, Supplier or Party, Supplier Site, Unpaid Amount, Invoice Amount, Applied Prepayments, Invoice Type, Notes, Validation Status, Approval Status, Holds, Details. Toolbar: Actions, View, Export to Excel, Edit, Create Note, Attachments, Query By Example, Detach, **Validate**, **Approval ▾**, **Post ▾**.

> ⚠ **Automation lesson:** ADF pages often scroll *horizontally* without any visible cue, so coordinate clicks land in the wrong field (a test typed the invoice number into Invoice Date). **Always target by selector or label, never by screen position.**

### Test data created — Payables
| Object | Key | Values | Final state |
|---|---|---|---|
| AP Invoice | **UIP-AP-151026-01** | BU US1 Business Unit; Supplier ABC Consulting (1288) / ABC US1; Type Standard; USD; Header Amount 1,362.50; 1 Item line 1,250.00; Tax 112.50; Date 15/10/26; Terms Immediate; Desc "UiPath demo - consulting services Oct 2026" | Validated; Approval = **Required** (not submitted); Holds 0; Unpaid 1,226.25 |
Naming convention for future runs: `UIP-AP-<ddmmyy>-<nn>`. Invoice number must be unique per supplier, so automation should add a timestamp, e.g. `UIP-AP-151026-1747`.

---

## 2. Procurement → Purchase Requisitions (New), Redwood Self Service Procurement
**Path:** Home → Procurement → **Purchase Requisitions (New)** tile.
- ⚠ **Do not deep-link.** Opening `/fscmUI/redwood/procurement/requisitions` directly goes to `.../shopping-generic-error-page` ("Shopping Error"). Always launch from the tile.
- The first load takes **15–20 s** (spinner). Wait for the browser title `Self Service Procurement Home - Search - Oracle Fusion Cloud Applications` **and** for the search box to accept input. Typing during load is lost.
- **Requester context** (header subtitle): `Supremo US Business Unit | Denver HQ` (Req BU ID 300000180010546)
- **Procurement Quick Actions on the home page:** Process Requisitions, Process Requisitions (New), Purchase Orders (New), Purchase Orders, Purchase Agreements (New), Purchase Agreements, Contract Fulfillments, Suppliers (New), Suppliers, Requisition Lines, ...
- Redwood (Oracle JET) pages have **stable, meaningful selectors** (aria-label / id), unlike ADF.

### Redwood page map / URLs (all under `/fscmUI/redwood/procurement/requisitions`)
| Page | Browser title | URL suffix |
|---|---|---|
| Home / search | Self Service Procurement Home - Search | (none) or `?pageId=tab_search` |
| My Requisitions | Requisitions - Manage | `/tabbar/shopping/manage-requisitions-search?tabSelected=tab_requisitions` |
| Cart | Shopping Cart - View | `/tabbar/shopping/shoppingcart?tabSelected=tab_cart` |
| Edit line | Requisition Line - Edit | `/tabbar/shopping/create-edit-req-line?flow=update&requisitionLineId=<id>` |
| Delivery & billing | Delivery Billing - Edit | `/tabbar/shopping/edit-delivery-billing?flow=update&lineId=<id>` |
| Requisition details | Requisition Details - View | `/tabbar/shopping/requisitiondetails?...&requisitionHeaderId=<id>` |

**Bottom navigation bar** (always visible, 26C "Access cart details directly"): 3 icons. 🏪 Shop (home), 📋 My Requisitions, 🛒 Cart with a **count badge**.

### Home / Search — object repository
| Element | Selector |
|---|---|
| Item search box | `input[placeholder="Search for items or services"]` (combobox, smart search; type, then Enter) |
| Preferences button | text "Preferences" |
| Shop by Category / Scan Barcode to Search Catalog | buttons on the search results page |
| Card View / Table View toggle | radio buttons |
| Add to Cart | button text "Add to Cart" on each item card |
| Recent requisitions cards | "My recent requisitions" section |
| Shop by category tiles | Amazon, Misc, ... ("Browse all") |

**Catalog search "laptop" → 3 items** (supplier Midtown Computer Supplies):
| Item | Mfr | Supplier item | Price |
|---|---|---|---|
| 15" Laptop Intel Core i7 4.7 GHz, 32 GB Memory, Windows 11 Pro, 512Gb HD | Hewlett Packard | LAP183-V-O201... | $969.00 Ea |
| **Laptop Carrycase Black** | Hewlett Packard | LAP-BBAG | **$25.00 Ea** |
| 11" Netbook AMD 2.3 GHz, 4 GB Memory, Windows 11 Pro, 64 Gb HD eMMC | Microsoft | NET166-W-XP-... | $349.00 Ea |
Suggested filter chips after the search: Category Laptops (2), Supplier Midtown... (3), Manufacturer He... (2).
After **Add to Cart**, the badge goes 2 → 3 after about **8–10 s** (spinner on the card). Assert on the badge text.

### My Requisitions — object repository
| Element | Selector / notes |
|---|---|
| Search box | `input[aria-label="Search for requisitions"]` (class `oj-sp-smart-search-chromeless-input-text`) |
| Default filter chip | "Entered By Natalie Sales Rep" (removable ✕) |
| Suggested filter chips | e.g. Submission Date Before Last Year, Category 204.54 Laptops, Supplier BMSupplier1, Requisition Status Approved |
| More Filters | `#smart-search-filter-manage-requisition-search-page-suggestions-overflow-btn` (aria-label "More Filters") |
| **Saved views** (26D) | `#smart-search-filter-manage-requisition-search-page-save-view-btn` (aria-label "Saved views") |
| Requisitions / Lines toggle | radio buttons, labels "Requisitions" / "Lines" |
| Export | aria-label "Export" |
| Row actions | button aria-label "Actions" (⋯) per row |
| **Notes & attachments indicator** (26C) | `button[aria-label="Notes and Attachments"]` containing `span.oj-ux-ico-document-attachment` |

**Row ⋯ Actions menu:** View Details; Edit; Duplicate; View Document History; View Life Cycle; Reassign; View PDF; Cancel; Delete (disabled for Ordered).

**Saved views popup:** "Name" (required) + **Save** button + "Saved views" link → right drawer "Saved views" listing views; each view's ⋯ menu offers **Set as Default** and **Delete**. A saved view also appears as a bookmark chip at the start of the filter row.

**Notes and Attachments drawer** (clicking the indicator): title = line description + "Requisition <#>"; tabs **Line Details** | **Notes and Attachments**; shows "Note to Supplier" text.

**Existing data (Natalie's requisitions):**
| Req # | Description | Status | Lines | Notes |
|---|---|---|---|---|
| 381638 | Inkjet Cyan Cartridge | **Draft** (this is the active cart) | LaserJet Pro 400 M401n Laser Printer $899.00 (BMSupplier1); "laptop" $240.39 (=900.00 SAR, foreign currency); Laptop Carrycase Black $25.00 (added during testing) | Created 22/11/22; header ID 300000257130721 |
| 381637 | Jabra Talk 45 Bluetooth Headset | **Ordered** | 1 line, PO **SU616337** sold by JGA; Buyer **Laura Petrova** | Created 21/11/22; header ID 300000257023078 |

> 🐞 **Finding 1 (data security):** Row ⋯ → View Details on **381637** opens "Either this requisition doesn't exist, or permission is required to view it." even though Natalie entered it. So requisition details for 381637 can't be used in tests (this also blocks the 26C person-drawer test on that requisition).

### Cart — object repository
Header: "Cart" / "Requisition 381638", ⋯ menu, **Submit** button.
Requisition summary: Subtotal **$1,164.39**, Nonrecoverable Tax **$88.73**, Approval Amount **$1,253.12**, Description (textarea, "Inkjet Cyan Cartridge"), Justification (textarea), Deliver-to Location **Denver HQ**, Charge To (blank → "Multiple" after the line edit).
Lines: select-all checkbox "3 items", **Edit Multiple**; per line: Quantity input + icons ✎ Edit, 🚚 Delivery, ⧉ Duplicate, 🗑 Delete.

### Requisition Line Details (edit) — object repository
Header "Requisition Line Details / Requisition 381638, Line 3", ⋯ More Actions, **Save and Close**. Tabs: **Line Details** | **Delivery and Billing Details**. Also a "Line" selector (`oj-select-single`, value "Line 3 - Laptop Carrycase Black").
- Line Details: Line Description, Category (**Peripherals**), Manufacturer, Pricing (Quantity, UOM **Ea**, Price **$25.00**, Currency **USD**), Notes → **Note to Supplier** (textarea), Attachments → **Category** select + Drag and Drop + URL + **Add URL**.
- **Attachment Category picklist:** Miscellaneous; To Approver; To Buyer; To Receiver; **Internal to Requisition** (default); To Supplier.
- Delivery: Requested Delivery Date (dd/mm/yy, internal value ISO `2026-10-15`), **Deliver-to Location Type** (`#deliverToLocationTypeLOV`, value **Internal**), **Deliver-to Location** (`#deliverToLocationSingleSmartSelect_select_single`, **Denver HQ**), Deliver-to Address (7604 E Technology Way, Denver, CO 80237, United States), UN Number, Hazard Class, Urgent checkbox.
- Billing: Total Percentage 100, Total Amount, Total Quantity; **Distribution 1** with charge account + ⋯ menu (**Edit**, **Split**).
- Distribution drawer: Quantity, Amount, Percentage, Project costing → Project Number; **Charge account** radios: *Select favorite charge account* (Charge Account Nickname **Main** = `120.10.63580.120.000.000`) / *Enter charge account number* (Charge To + ⋯ → **Combination Details**, **Search for combination**); Cancel / **Update**.

### "Search for combination" dialog (26D feature)
Segment filter chips (removable): **Company | Line of Business | Account | Cost Center | Product | Intercompany**. Default values come from the current account: 120 | 10 | 63580 | 120 | 000 | 000.
Removing the Account chip lists: 120.10.63170.120.000.000; 120.10.64210.120.000.000; 120.10.52150.120.000.000; 120.10.63580.120.000.000; 120.10.52120.120.000.000; ...
Buttons: Cancel / Apply. When nothing matches, the dialog shows "No matches found." + a **"Create <combination>"** link. **Don't click it in tests.**
> 🐞 **Finding 2 (possible defect):** with all 6 segments filled from the existing account (120.10.63580.120.000.000), the dialog says **"No matches found"** and offers to **create** it, although it exists (it's the current account and shows up in the broader search).

After **Update**: toast **"Distribution 1 updated"**; Distribution 1 shows the new account.

> ⚠ **Finding 3 (automation stability):** Save and Close on the line returned to Cart with toast **"Error response during RestAction"**. Network: some REST calls return **401**, then succeed after `GET /fscmRestApi/tokenrelay` (token refresh). The data **did** save (line PATCH = 200). **Don't fail a test on this toast alone.** Verify the data instead.
> ⚠ The URL attachment (Add URL) didn't register in this session (an "Add URL" dialog exists in the DOM but never showed up). Use a **Note to Supplier** for attachment/notes tests.

**REST API (useful for API-level setup/verification):** `GET/PATCH /fscmRestApi/rest/sb:<sandboxId>/en/11.13.18.05:9/purchaseRequisitions/<headerId>/child/lines/<lineId>`. The sandbox ID is in the path because Sandbox Mode is active. Line action: `.../action/calculateTaxAndAccounting`.

### Test data created / modified — Procurement
| Object | Key | Change |
|---|---|---|
| Saved view (My Requisitions) | **UIP Jabra Headsets** | keyword "Jabra" + Entered By Natalie. **Not** set as default. Delete it via Saved views → ⋯ → Delete if you don't want it. |
| Draft requisition 381638 | Line 3 "Laptop Carrycase Black" (line ID 300000349057096) | **Added** to cart; charge account changed to **120.10.64210.120.000.000**; Note to Supplier = "UIP test - please deliver to reception desk, Bldg 2." **Not submitted.** |

---

## 3. General Accounting → Journals (BLOCKED)
**Path:** Home → General Accounting → Journals. Title `Journals - Oracle Fusion Cloud Applications`.
- The page opens with a modal **"Change Data Access Set"** (`select` id ends `_FOTsr2:0:soc1::content`, required), plus OK.
- 🐞 **Finding 4 (access):** the Data Access Set list is **empty** for natalie.salesrep, so the user has no ledger access. Journal creation/inquiry **can't be tested** with this user.
- Work-area tabs visible behind the modal: Requiring Attention | Incomplete | Import Errors. Home Quick Actions: Manage Journals, Manage Approvals for Journals, Review Subledger Journals.

## 4. Receivables → Billing (read-only OK, create BLOCKED)
**Path:** Home → Receivables → Billing. Title `Transactions - Billing - Oracle Fusion Cloud Applications`. BU filter at the top: **All business units** ▾.
**Infotiles:** Incomplete (12 at 0-10 Days / 132 at 10+ Days), Transaction Approval (0 Pending Approval), Adjustment Approval (0), Adjustment Research (0 Current Period / 4 Prior Periods), Import Exceptions.
**Transaction list columns:** Transaction Number, Source, Class, Customer, Entered Amount, Date. Toolbar: View, Complete, Delete.
**Tasks panel (IDs `_FOTRaT:0:RAtlN`):** Create Transaction (RAtl1), Credit Transaction (2), Manage Transactions (3), Manage AutoInvoice Lines (4), Approve Adjustments (5), Manage Recurring Bill Plans (6), Create Customer (8), Manage Customers (9), Upload Customers from Spreadsheet (10), Manage Data Import (11), Review Customer Account Details (12), Create Accounting (13), Create Adjustment Journal (14), Review Journal Entries (15).

**Sample existing transactions:** 1309831 Receivables Import Invoice Business World 835,200.00 EUR; 36765 Manual Invoice **Fit N Fine Equipment** 408,334.50 USD; 36766 Emerald Hotels 127,612.05 USD; 37767 TamilNadu Tra... 250,000.00 INR; 10033 Business World 134,767.20 EUR; 173765 Business World 100,000.00 GBP ...

**Transaction 36765 (reference record, opens in *Edit* mode because it is Incomplete):** Title "Edit Transaction: Invoice 36765". BU **Supremo US Business Unit**, Source Manual, Type Invoice, Status **Incomplete**, Transaction Date 08/06/26, Accounting Date 08/06/26, Currency USD US Dollar, Transaction Total 408,334.50 (Lines 375,480.00 + Tax 32,854.50), Bill-to **Fit N Fine Equipment** / site **SAN JOSE**, Ship-to Fit N Fine Equipment / 901882, Payment Terms **30 Net**, Due Date 08/07/26; Line 1 "Trademill" Qty 30 × 12,516; Transaction Business Category "Sales Transaction". Header buttons: Actions ▾, Save ▾, Complete and Create Another ▾, Delete, Cancel. ⚠ **Cancel is cut off at the right edge** at the default window width and can't be clicked. Automation should use a ≥1280px-wide window.

### Create Transaction — object repository
Title `Create Transaction - Billing - ...`, header "Create Transaction: Invoice". Prefix `P = pt1:_FOr1:1:_FONSr2:0:MAnt2:1:pt1:TCF:0:ap1:`
| Field | Suffix | Notes |
|---|---|---|
| Transaction Class | `transactionClass::content` | select: **Invoice; Credit memo; Debit memo** |
| Business Unit | `fcslov1:sis1:is1::content` | combo |
| Transaction Source | `batchSourceId::content` | combo/LOV. Typing a partial value ("Manual") opens a **Search and Select: Transaction Source** dialog because of multiple matches. Pick the row, then OK. |
| Transaction Type | `transactionTypeId::content` | defaults to "Invoice" |
| Transaction Number | `inputText2::content` | |
| Document Number | `docNumber::content` | read-only |
| Transaction Date / Accounting Date | `tdt::content` / `inputDate9::content` | disabled until Source is set |
| Salesperson | `salesPersonId::content` | |
| Invoicing Rule | `invoiceRule::content` | select: In Advance; In Arrears |
| Currency | `ccyCLOV:sis1:is1::content` | |
| Bill-to Name / Site | `billToNameId::content` / `billToSiteId::content` | |
| Ship-to Name / Site | `shipToNameId::content` / `shipToSiteId::content` | |
| Payment Terms | `paymentTermId::content` | |
| Lines (row n) | `AT1:_ATp:table1:<n>:` + `ip1:lovTxtId` (Item), `descriptionId`, `memoLineNameId`, `uOMId`, `quantity`, `sellingPrice`, `taxClassificationCodeId`, `trxBusinessCategoryMirrorId` | 10 empty rows by default |
Buttons: Save ▾, Complete and Create Another ▾, Cancel, Edit Freight, Edit Default Sales Credits. Line sub-tabs: Line Information, Tax Determinants, Revenue Scheduling.

**Transaction Source picklist (first 25 shown):** B48 Manual 2; Bills Receivable; GSE_REST_Source; JBL Transaction Charge back source; JBL Transaction dm source; JBL Transaction stnd inv source; LAB0 UAE Manual; MUH_Invoice; MUNA CHARGEBACK; MUNA CREDIT MEMO; MUNA DEBIT M; MUNA INVOICE; Manage Transaction Source; **Manual** (Manual Transaction Entry); Manual - Role Based Approval; Manual - User Based Approval; Manual Numbering; NC_Manual; ORA_HED Student Academic Period Fees; ORA_HED Student Curriculum Fees; ORA_HED Student Miscellaneous Fees; RAK Reg Invoice Source; UPS ChargeBack Source; UPS Credit Memo Source; UPS Debit Memo Source; ...

> 🐞 **Finding 5 (blocker):** after BU (**US1 Business Unit** *or* **Supremo US Business Unit**) + Source **Manual**, the server returns: *"Cannot invoke oracle.apps.financials.receivables.sharedSetup.model.entity.SystemParameterEOImpl.getSetOfBooksId() because sysParamEO is null"*. Receivables system options aren't available to this user/BU. **Creating an AR transaction is blocked**, so AR tests stay read-only.
> Leaving Create Transaction after typing shows the warning *"Your changes aren't saved. If you leave this page, then your changes will be lost. Do you want to continue?"* (Yes / No). Automation teardown must handle it.

## 5. Sales → Create Opportunity (works)
**Path:** Home → Sales tab → Quick Actions → **Create Opportunity**. Opens under a *different context root*: `/crmUI/faces/FuseOverview?...returnFndUrl=...FuseWelcome` (title `Create Opportunity - Oracle Fusion Cloud Applications`).
> The Home page remembers the last group tab you opened, so automation must click the **Sales** tab explicitly before looking for the Quick Action.

### Create Opportunity — object repository (prefix `_FOpt1:_FOr1:0:_FONSr2:0:MAnt2:0:pt1:`)
| Field | Suffix | Default / notes |
|---|---|---|
| Name * | `it1::content` | |
| Account | `svpf1_create:lov_i1::content` | combo LOV. Dropdown shows: MIND Fitness Center; Aegis FitZone; Aegon Fitness Gym; **Sykes Gym**; New Start Gyms; Search... |
| Primary Contact | `PriContactPartyNameId_create:lov_i1::content` | |
| Win Probability (%) | `winProb::content` | **10** |
| Close Date * | `effDate::content` | **today + 30** (14/11/26) |
| Currency | read-only | **EGP** (odd default; see Finding 6) |
| Sales Stage | `salesStage::content` | **01 - Qualified** |
Buttons: **Save and Continue**, **Save and Close**, Cancel.

**Sales Stage picklist:** 01 - Qualified; 02 - Assessment; 03 - Go / No Go Review; 04 - Proposal; 05 - Submitted; 06 - Closed - Won; 07 - Closed - Lost; 01 - Qualifying.
> 🐞 **Finding 6 (data quality):** two stage-01 entries ("01 - Qualified" and "01 - Qualifying"), and the default opportunity currency is **EGP** for a US sales rep.

### Edit Opportunity (after Save and Continue)
Title "Edit Opportunity: <Name (truncated)> : Summary". Prefix `_FOpt1:_FOr1:0:_FONSr2:0:MAnt2:1:pt1:r1:0:`
Fields: Name (`name`), Account (link + ✕), Primary Contact (`priContactPartyNameId_summary:lov_i1`), **Owner** (Natalie Sales Rep), Win Probability (`winProb`), **Include in Forecast** (`forecastOverideCode`, "When matches forecast criteria"), Attachments, Close Date (`effectiveDate`), **Status** (`statusCode`, **Open**), Currency, Amount (0.00), Competitors, Sales Stage (`salesStageId`), Registered (No), **Sales Channel** (`slschnlsoc19`, **Direct**), **Price List** (`ExtGen_attr_PriceList_c_Opportunity1:lov_i1`, **Corporate**), Referenceable checkbox, Subscription.
Sections: Sales Coach, Sales Insights, Recommendations, **Products** (Browse Catalog / Add; columns Type, Name, Quantity, Estimated Price, Amount, Schedule, Sales Credit), Win Story.
Left tabs: Summary | Contacts | Assessments | Team | Activities | Notes | Leads | Quotes and Orders | References & Competitor | Deal Registrations | Change History.
Header buttons: Actions ▾, Save, Save and Close, Cancel. Save and Close returns to Home (`returnFndUrl`).

### Test data created — Sales
| Object | Key | Values |
|---|---|---|
| Opportunity | **UIP Demo - Sykes Gym Equipment Refresh 151026** | Account Sykes Gym; Owner Natalie Sales Rep; Stage 01 - Qualified; Win 10%; Close 14/11/26; Status Open; EGP; no products |

---

## 6. Summary of everything created in the environment (for clean-up / re-runs)
| # | Area | Record | State |
|---|---|---|---|
| 1 | Payables | Invoice **UIP-AP-151026-01** (ABC Consulting, US1, 1,362.50 USD) | Validated, Approval Required, not paid |
| 2 | SSP | Saved view **UIP Jabra Headsets** | Not default |
| 3 | SSP | Draft req **381638** line 3 *Laptop Carrycase Black* added, charge account 120.10.64210.120.000.000, Note to Supplier | Draft, not submitted |
| 4 | Sales | Opportunity **UIP Demo - Sykes Gym Equipment Refresh 151026** | Open |
Nothing was submitted for approval, paid, posted, or deleted.

## 7. Release-notes tie-in (verified in this environment)
| Update | Feature | Doc | Status here |
|---|---|---|---|
| 26D | Save and reuse requisition searches (Saved views) | https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f47414.htm | ✅ Present and works |
| 26C | Identify attachments and notes on My Requisitions | https://docs.oracle.com/en/cloud/saas/readiness/scm/26c/ssproc26c/26C-ssproc-wn-f49452.htm | ✅ Present and works (icon `aria-label="Notes and Attachments"`) |
| 26C | Access cart details directly during requisition creation | https://docs.oracle.com/en/cloud/saas/readiness/scm/26c/ssproc26c/26C-ssproc-wn-f43313.htm | ✅ Bottom nav bar with cart badge |
| 26D | Search and add charge account combinations | https://docs.oracle.com/en/cloud/saas/readiness/scm/26d/ssproc26d/26D-ssproc-wn-f49910.htm | ✅ Present; ⚠ exact-match "No matches" issue (Finding 2) |
| 26C | View additional info about preparers/requesters/buyers/approvers | https://docs.oracle.com/en/cloud/saas/readiness/scm/26c/proc26c/26C-procurement-wn-f43314.htm | ❌ Not verifiable: the only requisition with a buyer (381637) gives a permission error (Finding 1) |
All of these are Self Service Procurement / Procurement features, published on Oracle's **SCM** readiness pages (procurement isn't on the ERP index page). The ERP-specific new features (Payables Agent, Expenses Agent, Period Close Workspace...) mostly need setup or an opt-in, so they weren't usable here.

## 8. Automation guidance (UiPath)
1. **Login:** IDCS page → Username → Password → **Next**. Store credentials in an Orchestrator Credential Asset. The session expires; start each test from login, or reuse one session per suite.
2. **Window:** maximise the browser to **≥1440×900**. At smaller widths, header buttons (Cancel) are cut off and ADF tables scroll sideways.
3. **Selectors:** prefer `aria-label`, or `id` matched by its *ending* (ADF ids carry dynamic prefixes like `_FOr1:1`, `MAnt2:1`, `_FOpt1:` in crmUI). Redwood ids/aria-labels are stable.
4. **Clicks:** use real or simulated mouse clicks; ADF links don't respond to JS `element.click()`.
5. **Synchronisation:** after each action, wait for the page title, a specific element, or the spinner to disappear. Typical waits: ADF 3–6 s, Redwood first load 15–20 s, Add to Cart 8–10 s.
6. **LOV / combo fields:** type the full value + Tab. A partial value can open a "Search and Select" dialog.
7. **Ignore the transient toast** "Error response during RestAction" in Redwood (token refresh). Assert on data instead.
8. **Unique data:** add a timestamp to names/numbers (invoice numbers must be unique per supplier).
9. **Sandbox banner:** the yellow "Sandbox Mode: Edit / Refresh Needed" bar is always present; don't click it.
10. **Home tab memory:** the Home page reopens the last group tab; always click the needed group tab first.

Oracle Fusion ERP - Create Supplier Invoice (Type: Testing Charta)

# Exploratory Testing Charter — Oracle Fusion Payables: Create and Validate Supplier Invoice

## Mission
Explore how an Accounts Payable user creates a supplier invoice manually in Oracle Fusion Payables, focusing on required header data, supplier-driven defaults, invoice lines and distributions, tax calculation, validation status, and how clearly the system shows whether the invoice is ready for approval and payment.

## Test Context
url: https://eqjz.ds-fa.oraclepdemos.com/fscmUI/faces/FuseWelcome?fndThemeName=Vision_Default
user: natalie.salesrep
password: F?7z4Kg*
Suggested data: Business Unit **US1 Business Unit**, Supplier **ABC Consulting** (site ABC US1), Invoice Number `UIP-AP-<ddMMyy>-<HHmm>` (must be unique)

## What the tester should try to do

### Access invoice creation
Log in and navigate to Home → **Payables** → **Invoices**. Find **Create Invoice** in the work area's Tasks panel (the icon strip on the right edge).
Explore:
- How easy it is to find the Tasks panel and the right task among the ~20 listed
- Whether the Invoice Workbench infotiles (Scanned, Recent, Holds, Approval, Prepaid) are understandable and clickable
- Whether the global "Sandbox Mode" banner gets in the way or confuses the user

### Enter invoice header details
Select a Business Unit and a Supplier, then enter Invoice Number, Amount, Type, Date and Description.
Explore:
- Which fields are mandatory (*) and which only become editable after others are filled
- What is filled in automatically once the BU and Supplier are chosen (Supplier Number, Site, Legal Entity, Payment Terms, Terms Date, Distribution Set)
- How easy the defaults are to understand and override (e.g. change Payment Terms from *Immediate* to *Net 30*)
- Whether the Invoice **Type** list changes after a supplier is selected (e.g. *Withholding tax* appears)
- Behaviour with a duplicate invoice number, a future or past invoice date, a zero or negative amount, and a non-USD currency
- What happens when the BU is changed after the supplier is entered, and that the BU locks after the first save

### Add invoice lines and distributions
Expand **Lines**, add one or more lines (Item / Freight / Miscellaneous) and check the distribution.
Explore:
- Whether the line amount has to match the header amount before saving
- How the Distribution Set defaults and whether the Distribution Combination can be viewed or changed
- Adding, cancelling and deleting lines, and what happens to totals
- The Lines action list (Match Invoice Lines, Match to Receipt Charges, Correct …) and whether its purpose is clear to a non-expert

### Check system determinations
Save the invoice, then run **Invoice Actions → Calculate Tax** and **Validate**.
Explore:
- How tax is determined (rate, exclusive vs inclusive) and where it shows (Totals panel)
- What happens when the header amount doesn't include the calculated tax (status *Needs revalidation*, ⚠ on totals)
- Whether withholding is applied and how it affects the Unpaid Amount
- Whether holds are placed, and how the user finds out why (Manage Holds)

### React to system messages
Pay attention to status chips (*Not validated*, *Needs revalidation*, *Validated*), inline field errors, popups and warning icons.
Explore:
- Which messages block saving or validation and which are only informational
- Whether the messages explain *how* to fix the problem in plain business language
- Whether the keyboard shortcuts shown in the menu (Ctrl+Alt+V, Ctrl+Alt+X) actually work

### Save, find and exit
Use Save, Save and Close and Cancel, then open **Manage Invoices** and search for the invoice.
Explore:
- How clearly the outcome is communicated (invoice number in the title, status, Last Saved timestamp)
- Search behaviour: "At least one is required" rule, saved searches, result columns (Validation Status, Approval Status, Holds, Unpaid Amount)
- What happens when you leave a page with unsaved changes
- Whether the next step (approval, payment) is clear. **Don't initiate approval or payment in the shared demo.**

## Risks to watch for
Assumptions of Oracle Payables knowledge, hidden dependencies between BU, supplier and dates, exclusive tax that silently breaks the header/line balance, cryptic technical errors, horizontally scrolling ADF pages that hide fields or buttons (e.g. Cancel cut off at narrow widths), slow page transitions (3–6 s), and limited guidance after validation about what happens next.

## Timebox
60–90 minutes

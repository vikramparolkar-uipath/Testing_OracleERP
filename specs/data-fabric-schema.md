# Data Fabric schema: Oracle Procure-to-Pay test data (proposal for approval)

**Status:** Approved 16 Nov 2026 and created in Data Fabric (tenant level, Demos). Seeded on pod `dabpqy.ds-fa.oraclepdemos.com`.

| Object | Id |
|---|---|
| Entity `OracleApDataProfile` | `f8f3fe1c-fde1-f111-91f2-002248a179ce` |
| Entity `OracleApInvoice` | `4938c623-fde1-f111-91f2-002248a179ce` |
| Entity `OraclePoSchedule` | `6e38c623-fde1-f111-91f2-002248a179ce` |
| Choice set `ApInvoiceType` | `888cbcc8-fce1-f111-91f2-002248a179ce` |
| Choice set `ApInvoiceStage` | `ab1f6ee4-fce1-f111-91f2-002248a179ce` |
| Choice set `ApApprovalStatus` | `1e9d25ec-fce1-f111-91f2-002248a179ce` |
| Choice set `PoMatchType` | `2ca151f2-fce1-f111-91f2-002248a179ce` |
| Choice set `PoPoolStatus` | `39a151f2-fce1-f111-91f2-002248a179ce` |

Build notes: whole-number fields (`LineCount`, `PoLine`, `PoSchedule`) are DECIMAL with precision 0, because the Data Fabric UI can't render INTEGER. Text fields are 200 characters; `Notes` and `ErrorMessage` are multiline, 4,000 characters. Credentials: every profile points at `Oracle Fusion ERP Credentials` (run as Catherine PayablesManager); add per-user assets later if needed.
**Project:** `Testing_OracleERP` · **Tenant:** staging.uipath.com/uipathlabstestcloud/Demos (same tenant as the Workday entities)
**Source test cases:** `docs/test-documentation` (11 P2P scenarios, run 14–15 Nov 2026)
**Pattern borrowed from:** `Testing_Workday_CrossPlatform` (`WorkdayHireRun` + `HireRunStage` choice set + `WorkdayTestReservation`)

---

## 1. How independence works

Every test can run on its own, in any order, on any robot. Data dependencies are handled through a shared pool instead of test ordering:

1. **Producers** write what they create into the pool (e.g. Enter Invoice writes a `NotValidated` invoice).
2. **Consumers** use **get-or-create**: query the pool for a record in the stage they need, for the current pod, not reserved. If one exists they claim it. If none exists they call the same provisioning workflow the producer uses, then claim the new record.
3. **Claims** set `ReservedByRunId` and `ReservedUntil` (60 minutes), then re-read the record to confirm the claim won. Expired claims are free again, so a crashed run never locks data.
4. After the test, the consumer writes the new Oracle state back (e.g. `Validated`) and clears the claim. The record is then available to the next stage's consumer.

**Exception: PO schedules.** Tests can't create purchase orders or receipts, and each schedule can be billed only once. They come from a seeded pool (`OraclePoSchedule`). When the pool for a match type is empty, the test fails with "PO pool exhausted" rather than a UI error.

**Pod rotation.** The Oracle demo pod URL changes regularly. Every record carries `PodHost`; queries filter on the current `Oracle URL` asset's host, so data from an old pod is ignored automatically. Business units, suppliers and accounts live in `OracleApDataProfile`, so a new pod means editing rows, not workflows.

---

## 2. Entities

Three entities and five choice sets. System fields (`Id`, `CreatedBy`, `CreateTime`, `UpdatedBy`, `UpdateTime`) are added by Data Fabric and not listed.

### 2.1 `OracleApDataProfile` — Oracle AP Data Profile

Reference data: one row per business-unit scenario the tests need. Tests look up a profile by key instead of hard-coding Oracle values.

| Field | Type | Req | Description / example |
|---|---|---|---|
| ProfileKey | Text | Yes, unique | `US1-NoApproval`, `US1-TwoWay`, `HealthcareUS-Approval`, `ProgressUS-3Way`, `US1-Projects` |
| PodHost | Text | Yes | Oracle pod host the values were verified on |
| IsActive | Yes/No | Yes | Inactive profiles are ignored |
| BusinessUnit | Text | Yes | `US1 Business Unit` |
| Supplier | Text | Yes | `Advanced Corp` |
| SupplierNumber | Text | | `1263` |
| SupplierSite | Text | | `AC US1` |
| Currency | Text | | `USD` |
| DistributionCombination | Text | | `101.10.63580.121.000.000` |
| PrepaymentAccount | Text | | `101.10.13500.000.000.000` |
| TaxRatePercent | Decimal | | `9.5` (lets tests compute the expected total) |
| ApprovalRequired | Yes/No | | `false` for US1, `true` for Healthcare US |
| BudgetControlled | Yes/No | | `true` for University US (validation fails on funds) |
| ProjectNumber | Text | | `PI20071` |
| ProjectTask1 / ProjectTask2 | Text | | `3.1 Build` / `2.3 Prototype` |
| ExpenditureType1 / ExpenditureType2 | Text | | `Contract Services` / `Bulk Materials` |
| ExpenditureOrg | Text | | `Consulting US` |
| CredentialAsset | Text | | Orchestrator credential asset for the user who owns this BU, e.g. `Oracle Credentials - Catherine` |
| Notes | Text | | Free text |

### 2.2 `OracleApInvoice` — Oracle AP Invoice (the shared pool)

One record per invoice, prepayment or credit memo the suite creates. This is the Oracle equivalent of `WorkdayHireRun`: `Stage` says how far the record has got.

| Field | Type | Req | Description / example |
|---|---|---|---|
| InvoiceNumber | Text | Yes, unique | `P2P-TC01-261116143005` (see §4) |
| PodHost | Text | Yes | Pod the invoice lives on |
| ProfileKey | Text | Yes | Profile used to create it |
| InvoiceType | Choice `ApInvoiceType` | Yes | Standard, Prepayment, CreditMemo |
| Stage | Choice `ApInvoiceStage` | Yes | HeaderOnly, NotValidated, Validated, OnHold, Cancelled |
| ApprovalStatus | Choice `ApApprovalStatus` | | NotRequired, Required, Initiated, Approved, Rejected |
| BusinessUnit | Text | | Copied from the profile at creation (audit) |
| Supplier | Text | | |
| SupplierSite | Text | | |
| InvoiceDate | Date | | |
| HeaderAmount | Decimal | | Invoice total entered, e.g. `1095.00` |
| LineTotal | Decimal | | Sum of lines, e.g. `1000.00` |
| TaxAmount | Decimal | | Calculated tax, e.g. `95.00` |
| LineCount | Whole number | | `0` for header-only invoices |
| Description | Text | | |
| HasProjectCoding | Yes/No | | Project-coded lines can't feed some tests |
| PoNumber / PoLine / PoSchedule | Text / Whole / Whole | | Set when matched; also links to `OraclePoSchedule` |
| HoldReason | Text | | Set when Stage = OnHold |
| CreatedByTestCase | Text | | `UNIT-PTP-080-010-010-001` |
| CreatedRunId | Text | | Run that created it |
| LastTestCase | Text | | Last test that changed it |
| LastRunId | Text | | |
| ReservedByRunId | Text | | Claim holder; empty when free |
| ReservedUntil | Date-time | | Claim expiry |
| ErrorMessage | Text | | Last failure, if any |

### 2.3 `OraclePoSchedule` — Oracle PO Schedule (seeded pool)

One record per PO schedule the match tests can bill. Seeded by hand (or by a harvest workflow, see §6).

| Field | Type | Req | Description / example |
|---|---|---|---|
| ScheduleKey | Text | Yes, unique | `701353-1-1` (PO-line-schedule) |
| PodHost | Text | Yes | |
| ProfileKey | Text | Yes | `ProgressUS-3Way` |
| PoNumber | Text | Yes | `701353` |
| PoLine / PoSchedule | Whole number | Yes | `1` / `1` |
| MatchType | Choice `PoMatchType` | Yes | TwoWay (match option Order, no receipt), ThreeWay (receipt recorded) |
| PoolStatus | Choice `PoPoolStatus` | Yes | Available, Consumed, Unusable |
| BusinessUnit / Supplier / SupplierSite | Text | | `Progress US Business Unit` / `Lee Supplies` / `Lee Progress US` |
| ItemDescription | Text | | `Color Photo Printer` |
| Quantity / UnitPrice / Amount | Decimal | | `1` / `149.00` / `149.00` |
| ReceiptNumber | Text | | `600008` (ThreeWay only) |
| HasProjectCoding | Yes/No | | Must be `false` (PO 701346 hit a closed-contract project hold) |
| ConsumedByInvoice | Text | | Invoice number that billed it |
| ConsumedRunId | Text | | |
| ReservedByRunId / ReservedUntil | Text / Date-time | | Claim |
| Notes | Text | | Why it's Unusable, etc. |

### 2.4 Choice sets

| Choice set | Values (NumberId) |
|---|---|
| `ApInvoiceType` | Standard (0), Prepayment (1), CreditMemo (2) |
| `ApInvoiceStage` | HeaderOnly (0), NotValidated (1), Validated (2), OnHold (3), Cancelled (4) |
| `ApApprovalStatus` | NotRequired (0), Required (1), Initiated (2), Approved (3), Rejected (4) |
| `PoMatchType` | TwoWay (0), ThreeWay (1) |
| `PoPoolStatus` | Available (0), Consumed (1), Unusable (2) |

`PoPoolStatus` has no "Reserved" value because the claim fields already show that.

---

## 3. Producer / consumer map

| Scenario | Profile | Needs (get-or-create) | Writes |
|---|---|---|---|
| UNIT-010-001 Enter Invoice Manually | US1-NoApproval | — | Standard, NotValidated |
| UNIT-030-001 Enter Prepaid Invoice | US1-NoApproval | — | Prepayment, Validated |
| UNIT-040-001 Match PO + Receipt (3-way) | ProgressUS-3Way | PO schedule ThreeWay, Available (pool only) | Standard, Validated, matched; PO → Consumed |
| UNIT-050-001 Match PO 2-way | US1-TwoWay | PO schedule TwoWay, Available (pool only) | Standard, Validated, matched; PO → Consumed |
| UNIT-060-001 Invoice Lines and Projects | US1-Projects | — | Standard, NotValidated, 2 lines, HasProjectCoding |
| UNIT-080-001 Validate Invoice | US1-NoApproval | Standard, NotValidated, LineCount ≥ 1, no project coding | Same record → Validated |
| UNIT-090-001 Review Invoices | HealthcareUS-Approval | Standard, Validated, ApprovalStatus Initiated | Read-only; releases claim, record stays reusable |
| UNIT-130-001 Pre-Paid Advance Invoice | US1-NoApproval | — | Prepayment, Validated |
| UNIT-150-001 Match Invoice to PO 2-way | US1-TwoWay | Standard, HeaderOnly (same supplier as PO) + PO schedule TwoWay | Same invoice → Validated, matched; PO → Consumed |
| UNIT-160-001 Invoice and Credit Memo | US1-NoApproval | — | Standard + CreditMemo, both NotValidated |
| STR-006 Auto-Approval (string) | US1-NoApproval | Standard, NotValidated (else creates one) | Same record → Validated, ApprovalStatus NotRequired |

Provisioning workflows (one per "needs" shape, reused by producers): `Provision_NotValidatedInvoice`, `Provision_HeaderOnlyInvoice`, `Provision_ApprovalInitiatedInvoice` (create, validate, Approval > Initiate in Healthcare US).

---

## 4. Conventions

- **Invoice numbers:** `P2P-<TC>-<yyMMddHHmmss>`. The manual runs used short date stamps such as `TC01-111426`, which collides on a same-day rerun. Fusion's duplicate check also warns on same supplier + date + amount; the "Continue" on that warning is part of the create workflow.
- **RunId:** `<ScenarioId>-<yyMMddHHmmss>-<robot>`, also used as the Test Manager execution note.
- **Invoice dates:** today. 2024–2025 periods are closed in the demo.
- **University US Business Unit is excluded from feeding other tests:** its budget control fails validation with a funds hold. The original Enter Invoice run used it; the automated version uses US1 so its output can feed Validate Invoice and STR-006.

---

## 5. Seed data (from the manual runs)

`OracleApDataProfile`: `US1-NoApproval` (Advanced Corp 1263 / AC US1), `US1-TwoWay` (CDW 1295 / CDW US1), `HealthcareUS-Approval` (Lee Supplies 1252 / Lee Healthcare), `ProgressUS-3Way` (Lee Supplies 1252 / Lee Progress US), `US1-Projects` (PI20071), plus `UniversityUS-Budget`, kept **inactive** to record why that BU is excluded.

`OraclePoSchedule`: 701353-1-1 and 162867-1-1 and 162980-1-1 are already **Consumed** by the manual runs (seeded as Consumed for history). 701346-1-1 is **Unusable** (project hold). New Available schedules have to be found before the match tests can run.

---

## 6. Open decisions

1. **Claim fields on the records vs. a separate reservation entity** (Workday uses `WorkdayTestReservation`). Proposal: on the records, fewer joins and one update per claim.
2. **Supplier per profile:** 2-way match uses CDW, others use Advanced Corp in the same BU. Proposal: two profiles (`US1-NoApproval`, `US1-TwoWay`) rather than a second supplier column.
3. **PO pool refill:** seed by hand, or add a `Harvest_PoSchedules` workflow that searches Fusion for received, unbilled schedules with no project coding and adds them as Available.
4. **Run log entity:** Workday keeps one `HireRun` per chain. Proposal: no separate run entity; Test Manager holds execution results and the invoice record carries `CreatedRunId` / `LastRunId`.
5. **STR-PTP-080-010-005** (approval workflow) is referenced by Review Invoices but not in the docs folder. `Provision_ApprovalInitiatedInvoice` covers its setup either way.

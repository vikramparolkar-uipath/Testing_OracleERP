# TC-01 — Oracle Fusion Cloud Login and ERP Work-Area Navigation

**Status:** Specification draft — implementation intentionally not started

**Test Manager case:** `OFA:86` (`TC-01`)

**Application:** Oracle Fusion Cloud ERP / Platform

**Project:** `Testing_OracleERP`

**Source material:**

- Test Manager case steps supplied in the request
- `Autopilot Inputs/exploration-notes.md`
- `Autopilot Inputs/requirements-traceability.md`
- `Autopilot Inputs/tm-setup/tm-oracle-ids.json`

## 1. Objective and scope

Verify that an unauthenticated user can sign in to the Oracle Fusion Cloud environment through the IDCS page and navigate from Home to the Payables, Procurement, and Sales groups without opening an application tile or changing business data.

The workflow must start the login test itself. It must open a **new Edge InPrivate window** and must not attach to, reuse, or assume a signed-in Oracle tab.

### In scope

1. Open the environment URL and verify the redirect to the Oracle Cloud Sign In page.
2. Type the username only. Hand the password entry and Next click to a person at the keyboard, then wait for Home.
3. Verify the specified global-header items.
4. Select Payables and verify its three required tiles.
5. Select Procurement and verify `Purchase Requisitions (New)`; then select Sales and verify the `Create Opportunity` Quick Action.

### Out of scope

- Reading, typing, storing, logging, or validating a password.
- Credential assets, hard-coded secrets, password reset, or sign-out.
- Attaching to an existing browser session.
- Opening Payables, Procurement, Sales, or any other tile/work area.
- Creating, submitting, approving, paying, posting, cancelling, deleting, or otherwise changing records.
- Checking group tabs or tiles not required by the five test steps.

## 2. Environment and test data

| Item | Value |
|---|---|
| Organization URL | `https://eqjz.ds-fa.oraclepdemos.com/fscmUI/faces/FuseWelcome?fndThemeName=Vision_Default` |
| Observed IDCS URL | `https://idcs-c6d951bd01e6434fa627fab8aeef5051.identity.oraclecloud.com/ui/v1/signin` |
| Sign-in title | `Cloud Sign In` |
| Home title | `Oracle Fusion Cloud Applications` |
| Username | `natalie.salesrep` |
| Password | Human-entered at runtime; no workflow value exists for it |
| Expected display name | `Natalie Sales Rep` |
| Human handoff | Show a UiPath message instructing the person to type the password in Edge, click Next, and press OK; then wait for Home |
| Human handoff timeout | 5 minutes / 300 seconds |
| Browser isolation | New Microsoft Edge InPrivate window |
| Expected viewport | Maximise the new window; exploratory notes recommend at least 1440×900 |
| Test Manager case | `OFA:86` / Test Manager object id `5502063e-7993-1100-d13d-0b4a3fc23b30` |

The initial Home URL contains session query parameters after sign-in. URL assertions must match the stable path `/fscmUI/faces/FuseWelcome`, not the complete post-login query string.

The greeting is time-dependent. Accept `Good morning`, `Good afternoon`, or `Good evening`, followed by the expected display name.

## 3. Workflow arguments

Arguments are defined for values that are environment-, persona-, or execution-specific. The password is deliberately absent.

| Direction | Argument | Type | Default | Purpose / handling |
|---|---|---|---|---|
| In | `in_OrgUrl` | `String` | `https://eqjz.ds-fa.oraclepdemos.com/fscmUI/faces/FuseWelcome?fndThemeName=Vision_Default` | URL to open in a new InPrivate Edge window |
| In | `in_Username` | `String` | `natalie.salesrep` | Username typed into the IDCS Username field; safe test data, not a secret |
| In | `in_ExpectedDisplayName` | `String` | `Natalie Sales Rep` | Display name required in the Home greeting |
| In | `in_HumanHandoffTimeoutSeconds` | `Int32` | `300` | Maximum time to wait for the person to complete password entry, click Next, press OK, and for Home to load |
| In | `in_ExpectedPayablesTiles` | `String[]` or equivalent collection | `Payables Dashboard`, `Invoices`, `Payments` | Required tile names; all must be present after selecting Payables |
| In | `in_ExpectedProcurementTile` | `String` | `Purchase Requisitions (New)` | Exact Procurement tile to verify; do not accept the similarly named `Purchase Requisitions (ADF)` tile instead |
| In | `in_ExpectedSalesQuickAction` | `String` | `Create Opportunity` | Exact Sales Quick Action to verify |
| In | `in_ExpectedSandboxBannerText` | `String` | `Sandbox Mode: Edit` | Text required in the yellow sandbox banner; the banner must not be clicked |
| In | `in_ExpectedSignInTitle` | `String` | `Cloud Sign In` | Stable title used to recognize the IDCS page |
| In | `in_ExpectedHomeTitle` | `String` | `Oracle Fusion Cloud Applications` | Stable title used to recognize Home and post-login navigation |

### Values intentionally not modeled as arguments

- **Password:** no `InArgument` or variable; the workflow must never type, store, log, inspect, or return it.
- **Record names, business units, suppliers, amounts, quantities, IDs, and totals:** none are used by TC-01. The workflow must not invent invoice/opportunity/requisition data from the broader Oracle demo notes.
- **Session query parameters:** not a test-data argument; they are intentionally ignored.
- **Fixed UI labels used only to identify header controls:** the exact live selectors will be captured and verified. Labels may be kept as internal constants or Object Repository target metadata unless the implementation requires exposing them for localization.

## 4. Outputs

| Direction | Output | Type | Meaning |
|---|---|---|---|
| Out | `out_Passed` | `Boolean` | `True` only when every required assertion in Sections 6.1–6.5 passes; otherwise `False` |
| Out | `out_Message` | `String` | Human-readable overall result, including the first failed step/assertion and a safe diagnostic; never include a password or secret |
| Out | `out_FailedStep` | `String` | Optional step identifier such as `Step 1`, `Step 2`, or `Step 5`; empty when passed |
| Out | `out_ObservedGreeting` | `String` | Greeting text captured from Home, for evidence; safe to return |
| Out | `out_ObservedHomeTitle` | `String` | Browser title observed after login |
| Out | `out_ObservedHomePath` | `String` | Sanitized Home path, such as `/fscmUI/faces/FuseWelcome`; exclude session query values |
| Out | `out_ObservedPayablesTiles` | `String[]` or equivalent collection | Tile names observed after selecting Payables, for diagnostics/evidence |
| Out | `out_ObservedProcurementTilePresent` | `Boolean` | Whether the exact Procurement tile was observed |
| Out | `out_ObservedSalesQuickActionPresent` | `Boolean` | Whether the exact Sales Quick Action was observed |

No business object ID, record number, monetary total, quantity, or calculation output is applicable to this test. Do not return browser session identifiers, cookies, URL query values, or password-related values.

## 5. Execution contract and security rules

1. Create a new Edge InPrivate window from the workflow. Do not use an existing Edge tab or attach to a signed-in session.
2. Navigate to `in_OrgUrl` and wait for the IDCS sign-in page.
3. If Home is detected before the human handoff, fail Step 1 with the exact safe message: **`Window was already signed in`**.
4. Type only `in_Username` into the Username field.
5. Display a UiPath user-facing message such as: **`Type the password in Edge and click Next, then press OK. The workflow will continue when the Oracle Home page appears.`**
6. The person types the password, clicks the IDCS Next button, and presses OK. The workflow must not target the Password field, read its value, or click Next on the person's behalf.
7. Wait up to `in_HumanHandoffTimeoutSeconds` for the Home title/path and greeting. Use element/title/URL waits; do not use fixed `Delay` activities.
8. Perform only the read-only checks and navigation in Section 6. Do not click a tile.
9. Return the Boolean and safe diagnostics. Do not log the password, a password field value, cookies, credentials, or session query parameters.

## 6. Assertions and step mapping

All assertions contribute to `out_Passed`. A failure should identify the step and expected/observed safe value in `out_Message`.

### 6.1 Step 1 — Open environment URL

**Action:** Open `in_OrgUrl` in the new InPrivate Edge window.

**Expected result:** Oracle redirects to the Oracle Cloud Sign In (IDCS) page.

**Checks:**

- The browser title equals or safely contains `in_ExpectedSignInTitle` (`Cloud Sign In`).
- The current URL host/path matches the observed IDCS sign-in route, at minimum the path `/ui/v1/signin`; do not require session parameters.
- The sign-in surface exposes the Username field and the Next control. The Password control may be confirmed as present for page readiness only; its value must never be read or logged.
- The Home title/path must not already be present at this point. If Home appears before the handoff, fail with `Window was already signed in`.

### 6.2 Step 2 — Prompted login and Home

**Action:** Type `in_Username` into the IDCS Username field, display the human handoff, and wait for Home after the person completes the password entry and Next click.

**Expected result:** Home loads with a time-appropriate greeting containing the expected display name.

**Checks:**

- `in_Username` is entered only into the Username field.
- No workflow activity targets or reads the Password field.
- After the handoff, the browser title equals or contains `in_ExpectedHomeTitle` (`Oracle Fusion Cloud Applications`).
- The URL path contains `/fscmUI/faces/FuseWelcome`; ignore `_afrLoop`, `_adf.ctrl-state`, and other session query parameters.
- The greeting matches `Good (morning|afternoon|evening), Natalie Sales Rep`, using `in_ExpectedDisplayName` in the final expression rather than hard-coding a time of day.
- The Home content is settled by waiting for a specific Home element/greeting, not by a fixed 3–5 second delay.
- If Home does not appear within the configured timeout, fail with a safe timeout message and do not report any password state.

### 6.3 Step 3 — Global header

**Action:** Inspect the Home global header without clicking the sandbox controls.

**Expected result:** The Sandbox Mode banner is visible and the required Navigator, Home, Favourites, and Notifications icons are present.

**Checks:**

- A visible banner contains `in_ExpectedSandboxBannerText` (`Sandbox Mode: Edit`). The observed yellow banner may also contain `Refresh Needed`; neither text is clicked.
- A visible Navigator/hamburger control is present.
- A visible Home control is present.
- A visible Favorites/Favourites control is present. The live application spelling/ARIA label must be confirmed during capture; do not silently assume that `Favorites` and `Favourites` are interchangeable in the selector.
- A visible Notifications/bell control is present. The unread-count badge is not required to have a particular number; only the icon/control presence is in scope.
- The Search box, Watchlist, avatar, VISION logo, and other banner text are not assertions for this test unless needed only to identify the header region.

### 6.4 Step 4 — Payables group

**Action:** Select the Payables group tab explicitly, even if Home reopened on another group. If the horizontal group strip overflows, use its accessible right-navigation/chevron control to reveal Payables; never click by coordinates or rely on an off-screen element.

**Expected result:** Payables shows the three required tiles.

**Checks:**

- The Payables group tab is selected/active after the click.
- Wait until the group content redraws and its accessible content is present.
- Every value in `in_ExpectedPayablesTiles` is visible as a tile/link: `Payables Dashboard`, `Invoices`, and `Payments`.
- Do not open any of the tiles.
- The presence of extra tiles is not a failure unless the live target indicates a duplicate/ambiguous match for one of the required names.

### 6.5 Step 5 — Procurement, then Sales

**Action:** Select Procurement explicitly, wait for its content, then select Sales explicitly and wait for its Quick Actions content.

**Procurement expected result/checks:**

- The Procurement group tab is selected/active.
- The exact tile `in_ExpectedProcurementTile` (`Purchase Requisitions (New)`) is visible.
- The similarly named `Purchase Requisitions (ADF)` tile must not satisfy this assertion.
- Do not open the tile.

**Sales expected result/checks:**

- The Sales group tab is selected/active.
- The Quick Actions region is present after the redraw.
- The exact Quick Action `in_ExpectedSalesQuickAction` (`Create Opportunity`) is visible.
- Do not click the Quick Action.

### 6.6 Overall pass condition

`out_Passed = True` only if every required check in Steps 1–5 passes, including the prompted-login/Home check. Otherwise `out_Passed = False`, with `out_FailedStep` and `out_Message` identifying the first failed assertion without exposing secrets.

## 7. Selector strategy and target inventory

Selectors must be captured/configured with UiPath modern UI Automation and the Edge browser extension. Never hand-author coordinates, dynamic numeric ADF prefixes, or JavaScript clicks.

| Screen/state | Target | Selector strategy | Risk / synchronization |
|---|---|---|---|
| New browser | New Edge InPrivate window | UiPath browser/application target for the newly opened Edge window; ensure no existing Oracle tab is attached | Wrong window/session would invalidate the login test. Verify the initial state before navigation. |
| IDCS sign-in | Username | Prefer stable `aria-label`, `name`, or captured semantic label `Username` | IDCS page must be ready before typing. |
| IDCS sign-in | Password | Page-presence/readiness target only if needed; never type, read, extract, log, or assert its value | Highest security risk. The workflow must not interact with the field value. |
| IDCS sign-in | Next | Human clicks it; the workflow must not click it | Message-box timing and the person pressing OK may race with Home loading. Wait for Home after the handoff. |
| IDCS sign-in/Home | Page state | Browser title plus stable URL path; use element waits | Redirect and login can take several seconds. Detect already-signed-in Home before username entry. |
| Home | Greeting | Captured text/accessible name; regex for morning/afternoon/evening + expected display name | Greeting appears after Home shell loads; wait for the element, not a fixed delay. |
| Home header | Sandbox banner | Visible text `Sandbox Mode: Edit`; may be in yellow banner with `Refresh Needed` | Banner pushes content down; do not click/edit it. |
| Home header | Navigator | Stable `aria-label`, title, or accessible name from live capture | Exact ADF/Redwood header attributes are not recorded in the notes; live capture is required. |
| Home header | Home | Stable `aria-label`, title, or accessible name from live capture | Avoid generic text matches elsewhere on the page. |
| Home header | Favorites/Favourites | Confirm the live accessible name and use that stable attribute | Spelling differs between the test wording and common UI wording; do not guess. |
| Home header | Notifications | Stable `aria-label`, title, or accessible name; ignore badge number | Badge count is dynamic. Check control presence only. |
| Home group strip | Payables / Procurement / Sales tabs | Accessible link/tab name or stable attribute; use the overflow chevron as an accessible target when required | Horizontal overflow; never coordinate-click or assume the tab is in the viewport. |
| Payables content | Required tiles | Exact accessible link/text name for each required tile | Wait for group content redraw after selecting tab; do not click tiles. |
| Procurement content | `Purchase Requisitions (New)` | Exact accessible link/text name, scoped to Procurement content | Must distinguish from `Purchase Requisitions (ADF)`. |
| Sales content | Quick Actions / `Create Opportunity` | Scope to Quick Actions region, then exact accessible link/text name | Wait for Quick Actions redraw; do not click the action. |

### ADF and Home-page selector cautions

- Where classic ADF IDs are used, match only stable suffixes such as an ending attribute; numeric segments such as `_FOr1:1` and `MAnt2:1` are session-dependent.
- Prefer `aria-label`, `name`, `title`, or captured label text over an ADF dynamic prefix.
- Do not use coordinates; ADF pages can scroll horizontally and the sandbox banner changes vertical layout.
- Use real UiPath mouse/simulated clicks for links; do not use JavaScript `element.click()`.
- Use element/title/URL waits and spinner disappearance where available. Typical ADF transitions are 3–6 seconds, but the implementation must rely on readiness conditions rather than fixed delays.
- Redwood-specific first-load timing is not expected in these five steps, but if a Redwood Home component appears, wait for its stable ID/ARIA target rather than adding a fixed delay.

## 8. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Edge opens an existing signed-in session | Test may falsely pass without testing login | Always create a new InPrivate window; fail Step 1 if Home is detected before login handoff. |
| Password is accidentally handled by automation | Security violation | No password argument, no password activity, no password extraction/logging, and human performs password + Next. Review XAML targets for absence of password interaction. |
| Person does not complete handoff | False timeout or blocked run | Clearly word the UiPath message; enforce the 300-second timeout; return a safe timeout message. |
| Exact Home greeting varies by time of day | False failure | Regex accepts morning, afternoon, or evening and checks the expected display name. |
| Session query parameters change | False URL failure | Match only `/fscmUI/faces/FuseWelcome`; never compare the full URL after login. |
| Home restores the last group tab | Wrong group asserted | Click Payables, Procurement, and Sales explicitly in the required order. |
| Payables tab is off-screen | Click failure or coordinate dependence | Locate and use the accessible overflow/chevron control; wait until Payables is visible. |
| ADF numeric IDs change | Brittle selector | Use stable suffix/ARIA/name/title selectors captured through UiPath UI Automation. |
| Header labels differ (`Favorites` vs `Favourites`) | Selector/assertion ambiguity | Confirm the live accessible name before implementation; record the exact chosen target. |
| Duplicate/ambiguous tile text | Wrong tile could satisfy assertion | Scope to the active group and use exact text/accessible name; specifically distinguish `(New)` from `(ADF)`. |
| Slow redraw after group selection | Reading stale content | Wait for a content target or redraw completion; do not use fixed delays. |
| Shared demo pod changes available navigation | Runtime failure unrelated to workflow | Report the missing target and page state safely; do not take corrective or mutating actions. |
| Sandbox banner or transient popups obscure targets | Missed header/tab | Wait for target visibility and dismiss nothing unless a non-destructive, explicitly approved readiness step is added. The sandbox banner itself must be ignored, not changed. |

## 9. Uncertainties and questions to resolve before implementation

These are intentionally questions, not guessed selectors or behavior:

1. **Header spelling/accessible name:** In the live Oracle Home page, is the required star control exposed as `Favorites`, `Favourites`, or another `aria-label`/title? Which exact accessible name should the Object Repository target use if the visible text and ARIA label differ?
2. **Header target attributes:** What stable `aria-label`, `name`, `title`, or other non-positional attributes are returned by live target capture for Navigator, Home, and Notifications? The notes identify the controls semantically but do not provide their exact attributes.
3. **Group-strip overflow control:** What stable accessible name/title identifies the right-chevron control that reveals the off-screen Payables tab? The implementation must capture it rather than guess a selector.
4. **Test Manager association:** Is the existing UiPath project already connected to the Test Manager project containing `OFA:86`, or should implementation first establish/select that connection before associating the local test case? The local test must retain the `OFA:86` identity rather than create an unrelated duplicate.
5. **Locale:** Should the greeting assertion remain English-only as specified, or should the workflow expose a locale argument? The current default is English because the test data and observed UI are English.
6. **Failure evidence:** May the test capture screenshots on assertion failure? If yes, screenshots must exclude the password handoff and must not capture or persist password content. The default plan is to use safe assertion messages and only approved UIA assertion screenshots.

## 10. Planned deliverables after approval

The following are planned, but are **not created by this specification step**:

- `Workflows/OracleTc01LoginAndNavigation.xaml` — reusable UI workflow with the prompted-login contract and the outputs above.
- `Tests/OracleTc01LoginAndNavigation.xaml` — UiPath test case using Given/When/Then; invokes the workflow and asserts `out_Passed = True`, with the returned message available as failure evidence.
- `project.json` registration for the new test case in `designOptions.fileInfoCollection`, preserving the project’s Windows/Visual Basic settings and adding no password/credential configuration.
- UiPath Object Repository targets captured from the live Oracle/IDCS UI using modern UI Automation and the Edge extension.
- Test Manager association to `OFA:86`, subject to the existing project connection and permissions.

No workflow, test case, package installation, project-manifest edit, browser session, or Test Manager mutation is part of this draft.

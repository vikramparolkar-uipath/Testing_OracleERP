<!-- discovery-metadata: cs=0 xaml=13 deps=3 -->

<!-- PROJECT-CONTEXT:START -->
# Project Context: Testing_OracleERP

## Discovery scope

One-time brownfield discovery performed on 2026-10-15 for the Windows XAML UiPath project at `C:\Users\vikram.parolkar\Documents\UiPath\Testing_OracleERP`. Counts exclude `.local`, `bin`, `obj`, and `.templates`. No authored `.cs` files were found. The `.templates` directory was treated as scaffolding, not authored workflow content.

## Project structure

- `project.json` identifies project `Testing_OracleERP`, project ID `cabc65d8-ed3a-47e1-ae02-b985476d5d7a`, Windows target framework, Visual Basic expressions, Studio `26.0.203.0`, and test output type.
- Authored workflow inventory: 13 XAML files.
  - `Workflows/OracleERP_Login.xaml`: reusable Oracle Fusion login and read-only Home navigation workflow.
  - `Tests/TC01_OracleERP_Login and navigate to ERP work areas.xaml`: registered/publishable TC-01 test case using Given/When/Then, invoking the reusable workflow and asserting `out_Passed` with `VerifyExpression`.
  - `Tests/TestCaseWeb.xaml`: untouched web-test scaffold.
  - `TestFramework/Application/{StartApplication,StopApplication}.xaml`: logging-only application hooks.
  - `TestFramework/Browser/{StartBrowser,StopBrowser}.xaml`: runtime browser selection/setup and browser teardown hook; the stop workflow is named `KillAllProcesses` and can invoke `KillProcess` in its exception path.
  - `TestFramework/SetUp.xaml` and `TestFramework/TearDown.xaml`: test-framework setup/teardown switches for `App` and `Web`, with Orchestrator-build conditional behavior.
  - `TestFramework/Utils/DetectLocalBuild.xaml`: detects local versus Orchestrator execution from `CurrentDirectory`.
  - `TestFramework/Utils/InitAllAssets.xaml`: reads `Data/Assets.json` and resolves configured Orchestrator assets into a dictionary.
  - `TestFramework/VideoRecording/{StartRecording,StopRecording}.xaml`: Orchestrator-build video recording support using ffmpeg/InvokeCode and test-document attachment.
- `project.json` registers the execution/test templates and two test-case entries; the TC-01 entry has test case ID `9627bc1b-a6e1-4925-99f3-9bddaf0412b3`. Test Manager configuration was not changed or used for this discovery.
- `Data/Assets.json`, `specs/`, `Autopilot Inputs/`, `.objects/`, and generated `.local` state are supporting/configuration artifacts, not counted as authored XAML. No authored C# project surface was found.

## Dependencies and runtime profile

Declared dependencies (3): `UiPath.System.Activities` `[26.10.0]`, `UiPath.Testing.Activities` `[25.10.3]`, and `UiPath.UIAutomation.Activities` `26.10.5`. Runtime options include `requiresUserInteraction=true`, `isAttended=false`, `executionType=Workflow`, `autoDispose=false`, `supportsPersistence=false`, and `pipType=ChildSession`; sensitive logged data excludes `Private:*` and `*password*`. The project is therefore a Windows interactive UI-test project, not a headless/browser-driver-only project.

## UI Automation and Object Repository conventions

- Modern UI Automation activities use the `uix:N*` namespace, especially `NApplicationCard`, `NGoToUrl`, `NCheckState`, `NTypeInto`, `NClick`, `NGetText`, `NGetUrl`, and `NSetRuntimeBrowser`.
- The Oracle workflow uses one `NApplicationCard` with `AttachMode=ByInstance`, `OpenMode=Always`, `IsIncognito=True`, Edge, `WindowResize=Maximize`, and `InteractionMode=DebuggerApi`; nested UI activities share a stable `ScopeGuid`/`ScopeIdentifier`.
- Targets are embedded `TargetAnchorable` definitions carrying existing Object Repository `Reference` IDs, GUID/content hashes, screenshots, scope selectors, full/fuzzy selectors, and occasional CV metadata. The repository/tooling footprint includes `.objects` and generated `.local/.codedworkflows/ObjectRepository.cs`; these are derived artifacts and are excluded from the authored-file count.
- Selector style favors semantic web attributes such as `aria-label`, `aria-role`, stable element IDs, accessible names, and exact group/tile identifiers. Oracle ADF selectors also contain dynamic/session-sensitive form and region attributes, wildcarded tile IDs, and one greeting target with Selector + CV fallback. Reuse existing references/IDs and repair definitions in place; do not create duplicate targets or hand-author selectors.

## Known runtime constraints and caveats

- Oracle Fusion is an external live Edge/IDCS environment. Runtime needs an unlocked interactive Windows desktop, working Edge/UI Automation support, network access, and any required Orchestrator assets in the `Oracle` folder (the workflow requests `Oracle ERP URL`; the current XAML also requests `Oracle ERP Credentials`).
- The intended TC-01 contract in the repository specification is a new Edge InPrivate window, username-only automation, human password entry/Next click, a 300-second handoff wait, and read-only verification of Home, Payables, Procurement, and Sales. The current `Workflows/OracleERP_Login.xaml` does not fully match that contract: it currently contains `GetRobotCredential` for `Oracle ERP Credentials`, a secure password `NTypeInto`, and an automated IDCS `Next` click. This is recorded as an existing runtime/security divergence; no workflow or selector was modified during discovery.
- Oracle Home and IDCS selectors are sensitive to title/URL transitions, session query parameters, ADF redraw timing, dynamic numeric ID segments, horizontal group-tab overflow, and the active Sandbox banner. Use readiness conditions and stable semantic attributes; do not rely on coordinates or fixed delays. The Home path should be compared without session query parameters.
- The current TC-01 verifies presence/navigation only and is designed not to open ERP tiles or change business data. It expects the greeting for `Natalie Sales Rep`, `Sandbox Mode: Edit`, Payables tiles `Payables Dashboard|Invoices|Payments`, Procurement tile `Purchase Requisitions (New)`, and Sales quick action `Create Opportunity`.
- Framework setup/teardown behavior differs for local and Orchestrator builds. Video recording is conditional and may require ffmpeg. Browser teardown contains a possible process-kill fallback; treat it as a runtime side effect and do not invoke it merely for discovery.
- The project has no `.claude/rules/project-context.md` before this discovery. This file and the marked block in `AGENTS.md` are the only files created/modified by the discovery operation.
<!-- PROJECT-CONTEXT:END -->

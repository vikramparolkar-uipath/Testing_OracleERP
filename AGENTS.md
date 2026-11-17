<!-- discovery-metadata: cs=0 xaml=13 deps=3 -->
# UiPath Project: Testing_OracleERP

This is a UiPath automation project. When working on this project, use the appropriate
UiPath skill rather than editing project files directly — the skills understand UiPath
file formats, project conventions, and the `uip` CLI, and will keep the project valid.

## Which skill to use

- **uipath-rpa** — `.xaml` and coded (`.cs`) workflows, UI automation, Object Repository selectors, test cases. The default for most work in this project.
- **uipath-agents** — coded (Python: LangGraph / LlamaIndex / OpenAI) and low-code (`agent.json`) agents.
- **uipath-maestro-flow** — `.flow` Maestro orchestration files.
- **uipath-maestro-bpmn** — `.bpmn` process orchestration.
- **uipath-maestro-case** — case management plans.
- **uipath-coded-apps** — coded web and action apps (`app.config.json`, `action-schema.json`).
- **uipath-api-workflow** — JSON API workflows run by `uip api-workflow run`.
- **uipath-data-fabric** — Data Fabric entities and record CRUD.
- **uipath-human-in-the-loop** — authoring approval / validation / Human Task nodes.
- **uipath-solution** — `.uipx` solutions, SDD/PDD authoring, packaging and publishing.
- **uipath-platform** — Orchestrator, Studio Web, Integration Service, and LLM Gateway operations.
- **uipath-test** — Test Manager projects, cases, and executions.
- **uipath-review** — read-only audit of project structure and best practices.
- **uipath-troubleshoot** — diagnosing failures, errors, and regressions.

If you are unsure where to start, use **uipath-planner** to break the request into tasks
and route each to the right skill.

<!-- PROJECT-CONTEXT:START -->
## Brownfield project context

- Discovery metadata: `cs=0`, `xaml=13`, `deps=3`; authored inventory excludes `.local`, `bin`, `obj`, and `.templates`.
- Windows UiPath Test Automation project `Testing_OracleERP` uses Visual Basic expressions and dependencies `UiPath.System.Activities [26.10.0]`, `UiPath.Testing.Activities [25.10.3]`, and `UiPath.UIAutomation.Activities 26.10.5`.
- Authored surface: `Workflows/OracleERP_Login.xaml`; registered TC-01 Given/When/Then test case under `Tests/`; untouched web scaffold; and test-framework setup/teardown, application/browser hooks, asset initialization, local-build detection, and conditional ffmpeg recording workflows.
- UIA convention: modern `uix:N*` activities with one Edge `NApplicationCard` (`ByInstance`, `OpenMode=Always`, `IsIncognito=True`, `InteractionMode=DebuggerApi`, maximized), embedded `TargetAnchorable` definitions, existing Object Repository references, semantic web attributes, and occasional CV fallback. Preserve target identity and repair existing references in place; do not hand-author selectors or create duplicates.
- Runtime constraints: interactive Windows desktop, Edge/UI Automation, network access to Oracle Fusion/IDCS, and required `Oracle` assets. ADF/Home selectors are sensitive to dynamic IDs, title/URL transitions, redraw timing, horizontal group-tab overflow, and the Sandbox banner; use stable semantic attributes and readiness conditions rather than coordinates/fixed delays.
- Known divergence: the current Oracle workflow contains `GetRobotCredential` plus secure password `NTypeInto` and automated `Next` click, while the repository specification calls for username-only automation and a human password/Next handoff. This discovery recorded the divergence and did not modify workflows, project configuration, selectors, or Test Manager configuration.
- Full discovery record: `.claude/rules/project-context.md`.
<!-- PROJECT-CONTEXT:END -->

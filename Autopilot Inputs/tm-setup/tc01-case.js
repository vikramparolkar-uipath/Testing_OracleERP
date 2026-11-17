// TC-01 prompt case. Mirrors the 5 manual steps on Test Manager test case OFA:86 exactly.
// Login is automated as a *prompted* login: the workflow fills the username, a person types the password.
module.exports = (ORG) => ({
  key: 'TC-01',
  spec: 'oracle-tc01-login-navigation',
  app: 'Oracle Fusion Cloud (ERP / Platform)',
  loginRule: `* This test case IS the login test, so it does not attach to a signed-in tab. Open a NEW Edge window that is signed out (InPrivate, or a fresh profile with no Oracle session) and run the steps from there.
* Prompted login only: the workflow may type the username (test data, not a secret), but must NEVER type, store, log or read a password. It pauses and asks me to type the password and click Next myself, then continues once the Home page loads. No credential assets, no hard-coded secrets.`,
  body: `TEST CASE: TC-01: Login and navigate to ERP work areas (Platform)
Objective: Verify the user can sign in and reach the ERP work areas from Home.

Org URL: ${ORG}

Preconditions: Edge with the UiPath browser extension; no existing Oracle session in the window the workflow opens. A person is at the keyboard to type the password when prompted.

Test data:

* Username: natalie.salesrep
* Password: typed by me at the prompt (never passed to or stored by the workflow)
* Expected display name: Natalie Sales Rep

Steps and expected results (these are the 5 steps on the test case in Test Manager, OFA:86; automate exactly these):

1. Open the environment URL. Expected: it redirects to the Oracle Cloud Sign In (IDCS) page.
2. Enter Username and Password, click Next. Expected: the Home page loads with "Good afternoon/morning, Natalie Sales Rep".
   Automation: the workflow types the Username; then it shows a message such as "Type the password in Edge and click Next, then press OK" (or waits, up to 5 minutes, for the Home page to appear). I type the password and click Next.
3. Check the global header. Expected: the Sandbox Mode banner is visible, and the Navigator, Home, Favourites and Notifications icons are present.
4. Click the Payables group tab. Expected: the tiles Payables Dashboard, Invoices and Payments are shown.
5. Click Procurement, then Sales. Expected: Procurement shows a Purchase Requisitions (New) tile; the Sales Quick Actions include Create Opportunity.

Overall pass condition: all expected results above are met. Out of scope: anything beyond these 5 steps (opening tiles or work areas, other group tabs, changing any data), password reset, and signing out.

How-to notes from the exploratory session (use them to implement the steps above; they are NOT extra checks):

* Step 1, sign-in page: the URL redirects to https://idcs-c6d951bd01e6434fa627fab8aeef5051.identity.oraclecloud.com/ui/v1/signin, browser title "Cloud Sign In". The page shows the ORACLE Cloud logo, a "Sign in" heading, a Username field, a Password field, a Next button, "Forgot Password?" and "Need help signing in?" links, a "Cloud account details" expander and an English language selector. Username and Password are on the same page; Next submits both. If the Home page appears instead (window already signed in), report step 1 as failed with "Window was already signed in".
* Step 2, Home page: browser title "Oracle Fusion Cloud Applications". The URL gains session parameters (_afrLoop, _adf.ctrl-state, ...), so match only "/fscmUI/faces/FuseWelcome". The greeting depends on the time of day; match "Good (morning|afternoon|evening), Natalie Sales Rep". Allow 3-5 s for the page to settle after it loads.
* Step 3, header: the yellow top bar shows "Activation_Assistant_Numerique", "Tools", "Refresh Needed" and "Sandbox Mode: Edit" (do not click any of them). The dark header has the hamburger Navigator, the VISION logo, a "Search for people and actions" box, Home, Favorites (star), Watchlist (flag), Notifications (bell, with an unread-count badge) and the user avatar. Only check the items in the expected result.
* Steps 4-5, group tabs: the tabs are links in a horizontal strip that overflows to the right (a ">" chevron reveals more). Payables is far to the right, so scroll the strip until the tab is visible before clicking; an off-screen tab can't be clicked. The Home page reopens on the last tab used, so click each tab explicitly and wait about 2 s for the QUICK ACTIONS list (left) and the APPS tiles (right) to redraw before reading them. Tiles are links whose text is the app name.
* Observed values (for reference): Payables tiles = Payables Dashboard, Invoices, Payments. The Procurement tiles include Purchase Requisitions (ADF) and Purchase Requisitions (New); assert the "(New)" one specifically. Sales Quick Actions = Create Contact, Create Appointment, Create Task, Create Call Report, Create Opportunity, Create Lead.
`,
});

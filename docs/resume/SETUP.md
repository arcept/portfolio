# Résumé download log: setup (about 5 minutes)

1. Go to https://sheets.new while signed in to the Google account that should own the log. Name the
   sheet "Résumé downloads".
2. In the sheet: **Extensions → Apps Script**.
3. Delete what is in `Code.gs` and paste in the whole of `docs/resume/apps-script.gs`. Check the
   `NOTIFY` address at the top. Save (⌘S).
4. **Deploy → New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Description: `Résumé log`
   - Execute as: **Me**
   - Who has access: **Anyone**
5. **Deploy**. Google asks you to authorise it: choose your account → *Advanced* → *Go to … (unsafe)*
   → *Allow*. (It is your own script; "unsafe" only means Google has not reviewed it.)
6. Copy the **Web app URL** (it ends in `/exec`) and send it to Claude. It goes into
   `GATE_ENDPOINT` in `app/about/resume/config.js`.

To change the script later: edit, then **Deploy → Manage deployments → ✎ → Version: New version →
Deploy**. The URL stays the same.

Tests: use an email with `+test` (e.g. `contact+test@arcept.in`) or the name `Test`. Those rows are
logged, marked "yes" in the Test column, and send no email.

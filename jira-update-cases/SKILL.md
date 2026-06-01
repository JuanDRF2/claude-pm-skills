---
name: jira-update-cases
description: "Fetches resolved bugs from Jira across product teams and displays them in a flat grid — one row per Salesforce case — ready to be exported to Excel. Use this skill whenever the user asks for a bug report, wants to see resolved bugs from Jira, mentions \"bugs done\", \"export bugs\", \"Salesforce cases from Jira\", \"bugs desde Jira\", \"reporte de bugs\", or requests any combination of Jira projects (PP, NOXSCRUM, FR, SH, REN) with a date filter. Always trigger for requests that combine Jira + bugs + date + Salesforce cases, even if phrased casually."
---

# Jira Bug Report — Salesforce Case Grid

Pulls resolved bugs from Jira, expands each Salesforce case into its own row, and renders an interactive grid the user can copy into Excel.

---

## Step 1 — Ask for parameters (if not already provided)

Before querying Jira, confirm two inputs with the user. Ask both in a single message:

**1. Project(s)**
Present these options:

| Key | Product |
|-----|---------|
| PP | the finance module |
| NOXSCRUM | Ticketing |
| FR | Fundraising |
| SH | Shop |
| REN | Rentals |
| ALL | All five projects |

**2. From date**
Ask: *"From which date should I pull resolved bugs? (e.g. 2025-12-01)"*

If the user already provided both in their message, skip this step and proceed directly to Step 2.

---

## Step 2 — Build and run the JQL query

Use `Atlassian:searchJiraIssuesUsingJql` with the platform cloudId: `<JIRA_CLOUD_ID>`

**Fields to request:**
```
["summary", "assignee", "status", "resolutiondate", "customfield_10256"]
```

**JQL pattern:**

For ALL projects:
```
issuetype = Bug AND status = Done AND project in (PP, NOXSCRUM, FR, SH, REN) AND resolutiondate >= "YYYY-MM-DD" AND Associations is not EMPTY ORDER BY resolutiondate DESC
```

For a single project (e.g. PP):
```
issuetype = Bug AND status = Done AND project = PP AND resolutiondate >= "YYYY-MM-DD" AND Associations is not EMPTY ORDER BY resolutiondate DESC
```

> **Important:** `Associations is not EMPTY` is the primary filter — it ensures only bugs with at least one Salesforce case linked are returned. This is a hard requirement and must always be present in the JQL.
>
> **Fallback:** If the JQL returns an error on `Associations`, try `cf[10256] is not EMPTY` instead. If that also fails, remove the filter from JQL entirely and apply it in Step 3 (discard any issue where `customfield_10256` is null or yields no Salesforce case IDs after parsing).

Set `maxResults` to 100. If `isLast` is false, paginate using `nextPageToken` until all results are retrieved.

---

## Step 3 — Parse the Associations field and filter

`customfield_10256` is an ADF (Atlassian Document Format) object. Extract Salesforce case IDs from it using this logic:

**Format A — ADF with link marks (most common):**
```json
{
  "type": "doc",
  "content": [{
    "type": "paragraph",
    "content": [
      { "type": "text", "text": "<SALESFORCE_CASE_ID>", "marks": [{ "type": "link", "attrs": { "href": "https://<SALESFORCE_INSTANCE_URL>/<SALESFORCE_CASE_ID>" } }] },
      ...
    ]
  }]
}
```
→ Walk all `content` nodes recursively. For each node with `type: "text"` and a `"link"` mark whose `href` contains `salesforce.com`, extract the `text` value as the Case ID.

**Format B — Plain text string (less common):**
Some issues may store the field as a raw string like:
`"[<SALESFORCE_CASE_ID>|https://<SALESFORCE_INSTANCE_URL>/<SALESFORCE_CASE_ID>]"`
→ Extract all substrings matching the pattern `[CASE_ID|https://...salesforce.com/...]` using regex: `/\[([^\|]+)\|https?:\/\/[^\]]*salesforce\.com[^\]]*\]/g` — capture group 1 is the Case ID.

**Hard filter — SKIP issues with no Salesforce cases:**
If after parsing, `customfield_10256` is null, empty, or yields zero Salesforce case IDs → **discard that issue entirely**. Do NOT include it in the output grid. Only issues with at least one valid Salesforce case ID should appear in the results.

**Result:** For each qualifying issue, produce a list of one or more Case IDs. Example: `["<SALESFORCE_CASE_ID>", "<SALESFORCE_CASE_ID>"]`

---

## Step 4 — Flatten into rows

For each qualifying Jira issue (those with at least one Salesforce case):
- If it has **N cases** → produce **N rows**, one per case. All fields (Key, Name, Owner, Resolved Date) repeat across rows; only the Case ID changes.

**Row schema:**

| Field | Source |
|-------|--------|
| Key | `issue.key` |
| Name | `fields.summary` |
| Owner | `fields.assignee.displayName` or `Unassigned` |
| Resolved Date | `fields.resolutiondate` → format as `YYYY-MM-DD` |
| Case | Salesforce Case ID |

---

## Step 5 — Render the grid

Display results using `visualize:show_widget`. The widget must:

1. **Show a summary bar** at the top: total bugs found, total rows (cases), date range, project(s) queried.
2. **Render a full-width table** with columns: `Key · Name · Owner · Resolved Date · Case`
   - `Key` column: render as a clickable link to `https://<JIRA_SITE>/browse/{key}`
   - `Case` column: if it's a real case ID, render as a clickable link to `https://<SALESFORCE_INSTANCE_URL>/{caseId}`
   - Rows belonging to the same Jira issue share a subtle left border accent to visually group them.
3. **Export button** labeled "Copy as TSV" that copies all rows as tab-separated values to the clipboard — paste directly into Excel.
4. Use CSS variables for theming (light/dark compatible). No hardcoded colors.
5. Keep the table sortable by clicking column headers (Key, Owner, Resolved Date).

---

## Step 6 — Handle edge cases

- **No results found:** Show a friendly empty state: *"No resolved bugs with Salesforce cases found for [project(s)] since [date]. Try a different date range or project."*
- **Issue with no assignee:** Display `Unassigned` in the Owner column.
- **Issues without Associations are silently excluded:** Never show a row with `—` in the Case column. If an issue slips through the JQL filter with a null or empty `customfield_10256`, discard it at parse time (Step 3). The summary bar may optionally note: *"X bugs fetched, Y excluded (no Salesforce cases linked)"* if you detected any discards.
- **Pagination:** If more than 100 results, fetch all pages before rendering. Note in the summary bar how many total issues were fetched.
- **API errors:** Surface the error message clearly and suggest the user check their Jira connection.

---

## Notes

- The platform Jira cloudId is: `<JIRA_CLOUD_ID>`
- `customfield_10256` = "Associations" field — contains linked Salesforce cases in ADF format.
- `resolutiondate` is the correct field for when a bug moved to Done. Do NOT use `updated` or `created`.
- Always use `responseContentFormat: "markdown"` when calling Jira tools to keep responses compact.
- Project display names for the summary bar: PP → the finance module, NOXSCRUM → Ticketing, FR → Fundraising, SH → Shop, REN → Rentals.
---

## Configuration

This file contains placeholders for workspace-specific values. Replace them before use:

| Placeholder | What to set |
|---|---|
| `<JIRA_CLOUD_ID>` | Your Atlassian Cloud ID UUID (find it in your Jira site settings) |
| `<JIRA_SITE>` | Your Atlassian hostname — e.g. `yourorg.atlassian.net` |
| `<SALESFORCE_INSTANCE_URL>` | Your Salesforce instance hostname — e.g. `yourorg.my.salesforce.com` |
| `<SALESFORCE_CASE_ID>` | Example Salesforce case ID used in documentation samples |

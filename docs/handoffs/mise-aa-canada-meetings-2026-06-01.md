# Mise Handoff: Canada AA Meeting Import

Date checked: 2026-06-01

## Bottom Line

There is no single public "all Canada AA meetings" database exposed by AA.org. AA.org is the official discovery layer for A.A. resources, but it states that the website itself is not a meeting finder and points users to local A.A. resources.

The import path for Mise should be:

1. Use official/local A.A. service entity feeds where they expose Meeting Guide / TSML JSON.
2. Store source provenance on every row.
3. Deduplicate across overlapping area, province, intergroup, and district feeds.
4. Keep a "verify before going" flag in product copy because meeting feeds can change.

I verified 34 importable JSON feeds, including the broad BC/Yukon, Quebec, Manitoba, Area 82, Area 84, Toronto, Calgary, Ottawa, Edmonton, Regina, and Saskatoon feeds. Raw verified feed rows total about 7,051 before dedupe. This raw total includes known overlaps, especially BC/Yukon vs local BC districts, Quebec vs Region 87, Area 82 vs Halifax, and Ontario local districts.

## Files For Mise

- Source manifest: `docs/handoffs/aa-canada-source-manifest-2026-06-01.json`
- This handoff: `docs/handoffs/mise-aa-canada-meetings-2026-06-01.md`

## Import Shape

Each feed is expected to return a JSON array of Meeting Guide / TSML-like meeting rows. Preserve the original payload, then normalize into the database.

Recommended normalized columns:

- `program`: `aa`
- `source_id`
- `source_name`
- `source_url`
- `source_endpoint`
- `source_fetched_at`
- `source_meeting_id`
- `source_slug`
- `name`
- `day`
- `time`
- `end_time`
- `timezone`
- `location`
- `address`
- `formatted_address`
- `city`
- `province`
- `postal_code`
- `country`
- `latitude`
- `longitude`
- `conference_url`
- `conference_phone`
- `types`
- `notes`
- `url`
- `updated`
- `raw_payload`

## Dedupe Rules

Use a conservative two-pass dedupe:

1. Exact source key:
   `program + source_id + (source_meeting_id || source_slug)`

2. Cross-source likely duplicate:
   `program + normalized_name + day + time + normalized_address_or_conference_url`

If a broad area/province feed and a local feed conflict, prefer the row with:

- More recent `updated`
- Specific street address over approximate area-only address
- Working direct `url`
- Source entity closest to the meeting geography

Do not discard the losing source entirely. Attach it as alternate provenance if the schema supports it.

## High-Priority Feeds

Use these first because they cover larger regions or major gaps:

- BC/Yukon Area 79: 1,134 rows, `https://bcyukonaa.org/wp-json/tsml/meetings`
- AA Quebec: 1,446 rows, `https://meetings.aa-quebec.org/wp-json/tsml/meetings`
- Manitoba Central Office: 416 rows, `https://aamanitoba.org/wp-json/tsml/meetings`
- Area 82: 198 rows, `https://area82aa.org/wp-json/tsml/meetings`
- Area 84 Northeast Ontario: 133 rows, `https://area84aa.org/aa/wp-json/tsml/meetings`
- Toronto Intergroup: 493 rows, `https://www.aatoronto.org/wp-json/tsml/meetings`
- Calgary Central Service Office: 452 rows, `https://www.calgaryaa.org/wp-json/tsml/meetings`
- Ottawa Area Intergroup: 385 rows, `https://www.ottawaaa.org/wp-json/tsml/meetings`
- Edmonton Central Office: 324 rows, `https://www.edmontonaa.org/wp-json/tsml/meetings`
- Regina AA: 84 rows, `https://www.aaregina.com/wp-json/tsml/meetings`
- Saskatoon AA: 78 rows, `https://www.aasaskatoon.org/wp-json/tsml/meetings`

## Known Caveats

- Vancouver/GVIS advertises TSML routes but returned blocked/unauthorized responses during this check. Treat as permission/manual follow-up.
- Some feeds overlap heavily. Do not sum raw counts as a final Canada meeting count.
- Some local sites use `wp-admin/admin-ajax.php?action=meetings` instead of `/wp-json/tsml/meetings`; both can return valid TSML-style arrays.
- Some AA.org-listed resources only provide phone support or web pages, not importable JSON.
- Importing public factual meeting data is technically possible, but production use should keep attribution and respect each local service entity's terms and update process.

## Mise Next Actions

1. Create/import the source table from `aa-canada-source-manifest-2026-06-01.json`.
2. Fetch only `import_priority: "primary"` first.
3. Run Meeting Guide schema validation on every feed.
4. Import rows with raw payload preservation.
5. Run cross-source dedupe.
6. Add manual follow-up tasks for blocked/manual sources, especially Vancouver/GVIS.
7. Refresh feeds on a schedule rather than freezing a stale snapshot.


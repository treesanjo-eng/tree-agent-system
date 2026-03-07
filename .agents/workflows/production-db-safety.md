---
description: How to safely modify production databases - always check state first, backup, then modify
---
# Production Database Modification Safety Rules

> **CRITICAL**: This workflow MUST be followed whenever modifying any production database (Supabase, PostgreSQL, etc.) across ALL projects.

## Steps

1. **Check current production state FIRST**
   - Query the production database to see what data currently exists
   - Log/save the current record count and a sample of records
   - Example: `SELECT count(*), text_content FROM company_knowledge LIMIT 50;`

2. **Take a backup BEFORE any changes**
   - Export the current data to a local file before modifying
   - Example: Write a script that downloads all records to a JSON/MD file
   - Never rely on local backup files alone — the production DB may have data that was added outside your workflow (e.g., via Telegram `/learn` commands, user-facing APIs, etc.)

3. **Make changes carefully**
   - Only delete/modify the specific records that need fixing
   - Never use `DELETE * FROM table` or bulk wipe unless absolutely necessary
   - If you must clear and re-upload, merge your local backups WITH the production data, not replace it

4. **Verify after changes**
   - Query the production database again to confirm the changes were applied correctly
   - Compare the new state with the backup to ensure nothing was lost

## Key Lessons Learned
- Production databases may contain data that was added through channels you don't control (e.g., user-facing commands, APIs, other services)
- Local backup files are NOT a complete representation of production data
- Always assume the production DB has MORE data than your local files

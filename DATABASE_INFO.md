# Database Configuration

**FINAL DATABASE - DO NOT CHANGE**

Production Database: `cbboaievahhobnzgqypn.supabase.co`

This is the ONLY database used in production. The `.env` file is locked (read-only) to prevent accidental changes.

## Important Notes

1. The `.env` file contains the correct production database credentials
2. File permissions: read-only (444)
3. All migrations are applied to this database
4. Admin credentials are in `ADMIN_CREDENTIALS.md`

## If .env needs to be updated:

```bash
chmod 644 .env
# Make your changes
chmod 444 .env
```

## Current Configuration

- **Database URL**: https://cbboaievahhobnzgqypn.supabase.co
- **Status**: Production Ready
- **All Migrations**: Applied
- **Combo Multiplier Fix**: Applied (allows 1-500)

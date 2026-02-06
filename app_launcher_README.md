# App Launcher Database (Nine Dots)

Shared metadata for the Extreme Platform ONE | AURA nine-dots app launcher.

## Quick Start

```bash
# View all entries
sqlite3 -header -column app_launcher.db \
  "SELECT app_id, display_name, category, status, order_index FROM launcher_apps ORDER BY order_index;"

# Add your own entry
sqlite3 app_launcher.db "INSERT INTO launcher_apps
  (app_id, display_name, description, launch_url, icon_url, requires_xiq_auth, category, status, order_index)
  VALUES ('my-app', 'My App', 'What it does', 'https://example.com', NULL, 0, 'Tools', 'active', 6);"

# Remove the placeholder
sqlite3 app_launcher.db "DELETE FROM launcher_apps WHERE app_id = 'placeholder-app';"
```

## Schema

| Field               | Type    | Notes                                      |
|---------------------|---------|--------------------------------------------|
| `app_id`            | TEXT PK | Unique slug, e.g. `aura-management`        |
| `display_name`      | TEXT    | Label shown on the launcher tile           |
| `description`       | TEXT    | One-line purpose (optional)                |
| `launch_url`        | TEXT    | Target URL opened on click                 |
| `icon_url`          | TEXT    | Optional icon path or URL                  |
| `requires_xiq_auth` | INTEGER | `0` = no, `1` = yes (auth handled upstream)|
| `category`          | TEXT    | Platform, Monitoring, Security, Tools, Other|
| `status`            | TEXT    | `active`, `beta`, `coming_soon`            |
| `order_index`       | INTEGER | Sort order for display                     |

## Seed Entries

| # | App                  | Category   | Status      |
|---|----------------------|------------|-------------|
| 1 | AURA Management      | Platform   | active      |
| 2 | ExtremeCloud IQ      | Platform   | active      |
| 3 | Cloud Health Status  | Monitoring | beta        |
| 4 | Extreme KeyAI        | Security   | beta        |
| 5 | XIQ Edge Migration   | Tools      | active      |
| 6 | New App Slot         | Other      | coming_soon |

## Notes

- Authentication is assumed to be handled upstream (e.g. XIQ SSO).
- No credentials or tokens are stored in this file.
- The placeholder entry (`placeholder-app`) exists for you to replace.
- Compatible with any language that has a SQLite driver.

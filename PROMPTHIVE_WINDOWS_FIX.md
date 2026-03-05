# PromptHive mock-registry compatibility patch (Windows-safe)

Given the current PromptHive behavior (`ph` CLI calls `/api/prompts/*`), **it is worth continuing with PromptHive** and adding compatibility routes in `src/bin/mock_registry.rs`.

This patch keeps existing `/api/v1/*` routes intact and aliases the CLI-facing routes to the same handlers.

## Minimal patch (apply in `prompthive` repo)

Edit `src/bin/mock_registry.rs` and add the compatibility routes in the Actix app configuration.

```diff
diff --git a/src/bin/mock_registry.rs b/src/bin/mock_registry.rs
--- a/src/bin/mock_registry.rs
+++ b/src/bin/mock_registry.rs
@@ -1,6 +1,6 @@
 use actix_web::{
-    web::{self, Data},
+    web::{self, Data, get, post},
     App, HttpServer, Result,
 };
@@ -<server-config-start>,<server-config-len> +<server-config-start>,<server-config-len>
             App::new()
                 .app_data(Data::new(state.clone()))
                 // Existing v1 endpoints (keep these)
                 .route("/api/v1/search", web::get().to(search_prompts))
                 .route("/api/v1/packages/{name:.*}", web::get().to(get_package))
                 .route("/api/v1/packages", web::post().to(publish_package))
+
+                // CLI compatibility aliases (new)
+                .route("/api/prompts/search", get().to(search_prompts))
+                .route("/api/prompts/{prompt_id:.*}", get().to(get_package))
+                .route("/api/prompts", post().to(publish_package))
         })
         .bind(("127.0.0.1", 8080))?
         .run()
         .await
 }
```

### Notes
- Do **not** remove/rename `#[actix_web::main] async fn main()`.
- Do **not** change feature flags; keep running with `--features registry`.
- `prompt_id` can map to the same handler as `{name:.*}` in this mock server.

## Run commands (PowerShell)

From `C:\Users\John Bates\src\prompthive`:

```powershell
cargo run --release --bin mock-registry --features registry
```

Open a **second** PowerShell window for checks.

## One-command test for both endpoints (PowerShell)

```powershell
"v1=$(irm 'http://127.0.0.1:8080/api/v1/search?q=ai' | ConvertTo-Json -Depth 6); prompts=$(irm 'http://127.0.0.1:8080/api/prompts/search?q=ai' | ConvertTo-Json -Depth 6)"
```

If both return JSON payloads, the CLI/search mismatch is resolved.

## Simpler fallback alternatives (if you still want to switch)

If you decide to abandon PromptHive, a lower-friction local setup is:

1. **Open WebUI + built-in prompt library** (Docker, easy local auth, web UI first).
2. **Supabase (self-host) + tiny prompts table + PostgREST API** (clean CRUD/search by ID, Docker compose).
3. **Directus + SQLite/Postgres** (admin UI + REST API quickly, prompt records with tags/search).

For strict “registry-like” behavior with minimal moving parts, PromptHive + the alias routes above is still the fastest path from where you are now.

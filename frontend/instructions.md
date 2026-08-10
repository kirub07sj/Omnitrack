## Phase 8 — Integration with OmniTrack (the installed product)

> These are the instructions for the **OmniTrack side** (the separate AI/integration work). ProdKey's `/public/*` API is already built, tested, and running. OmniTrack only needs to call it.

### 8.0 — Get the ProdKey credentials (user does this once in the dashboard)
- [ ] In ProdKey dashboard, create a product named `OmniTrack` → copy the **product API key** (`pk_1RucCUSbIe0gseqaw5nyZLwfRn2ppgB_dnA9N-LRuB8`, shown once; regenerate it later if it leaks)
- [ ] Note the ProdKey server URL (dev: `http://localhost:4000`, prod: deployed URL) and the **public signing key** from ProdKey's `.env` → `SIGNING_PUBLIC_KEY` (this is needed for offline verification)

### 8.1 — ProdKey public API contract (implement against this)
- Base: `POST {SERVER}/public/activate`, `/public/validate`, `/public/deactivate`
- Required header on every call: `x-product-api-key: <pk_...>`
- Required body (JSON): `{ "licenseKey": "<customer license key>", "deviceId": "<stable per-machine id>" }`
- `deviceId` = a stable unique id for the machine (MAC/hostname hash is fine), not the license key
- Success responses return `{ "certificate": "<payload>.<signature>" }`
- Error responses return `{ "error": "message" }` with one of these status codes:
  - `400` malformed request (missing `licenseKey`/`deviceId`)
  - `401` invalid product API key, unknown/invalid license key
  - `403` license revoked or expired, device not allowed
  - `409` max activations reached
- Server rate-limits these routes — retry with backoff on `429`

### 8.2 — Signed certificate (for offline verification)
- Format: `base64url(payload) + "." + base64url(Ed25519 signature)`
- `payload` is JSON containing: `product` (slug), `licenseId`, `plan`, `status`, `issuedAt`, `expiresAt`, `validUntil`, `iat`
- `validUntil` = `iat` + grace period (ProdKey env `GRACE_PERIOD_DAYS`, default 14). **The app is allowed to run offline until `validUntil`, then it must re-validate online.**
- Signature is Ed25519 over the `base64url(payload)` string; verify with the `SIGNING_PUBLIC_KEY` from 8.0
- Verification options (either is fine): Node `crypto.verify` with `ed25519`, or WebCrypto `crypto.subtle.importKey`/`verify`
- On successful verification, trust the cert's `status`/`expiresAt`/`validUntil` locally — no network needed

### 8.3 — License service module in the OmniTrack backend
- [ ] Create `licenseService` with config: `LICENSE_SERVER_URL`, `PRODUCT_API_KEY`, `SIGNING_PUBLIC_KEY` (from env vars, not hardcoded)
- [ ] `activate(licenseKey, deviceId)` → `POST /public/activate` → on success, persist the certificate
- [ ] `validate()` → `POST /public/validate` (same deviceId) → refresh stored certificate
- [ ] `deactivate()` → `POST /public/deactivate` (call on uninstall if feasible, frees an activation slot)
- [ ] `verifyCertificateLocally(cert)` → parse payload, verify Ed25519 signature against `SIGNING_PUBLIC_KEY`, return parsed claims or throw
- [ ] `getLicenseState()` → reads stored cert, verifies signature, returns `{ status, expiresAt, validUntil, plan, licenseId }`
- [ ] Persist the certificate in OmniTrack's local storage (local DB/config file) so it survives restarts; store the raw cert string (never the license key — it is only needed for the initial activate)

### 8.4 — Setup wizard "Activate license" step
- [ ] Add a first-run step (before the app is usable) that asks for the customer's license key
- [ ] On submit: generate the machine `deviceId`, call `activate()`, show the server error message verbatim if it fails
- [ ] On success: save the certificate, then continue to app setup
- [ ] Make the step skippable only if a valid stored certificate already exists (re-activation after reinstall should still work as long as an activation slot is free)

### 8.5 — Startup license check (runs on every app launch)
- [ ] At startup: load stored cert → `verifyCertificateLocally` → if invalid signature or cert says `revoked` → block the app
- [ ] If `now < validUntil` → allow (offline OK)
- [ ] If `now >= validUntil` → try online `validate()` once (grace for no-network); on success refresh cert and allow; on failure prompt for network/re-validation and block after a short retry window
- [ ] If `expiresAt` has passed → treat as expired, block (unless renewed via dashboard)
- [ ] Expose `isLicenseValid` to gate the app's main flow (e.g. disable app until valid)

### 8.6 — Periodic re-validation
- [ ] While the app runs, re-call `validate()` on an interval (e.g. daily) or before `validUntil` approaches, to keep the grace window from lapsing silently
- [ ] If a `validate()` fails due to revoked/expired, enforce the block immediately (do not wait for grace)

### 8.7 — Test the full scenario
- [ ] ProdKey dashboard: create customer for OmniTrack, issue license, note the license key (shown once)
- [ ] OmniTrack first run → enter license key → activation succeeds → cert saved
- [ ] Restart app with internet off → app runs (within grace)
- [ ] Restart app after `validUntil` passes (or temporarily set `GRACE_PERIOD_DAYS=0` on ProdKey for a faster test) → app blocks and asks to re-validate
- [ ] Connect internet, re-validate → app unlocks
- [ ] Revoke the license in the dashboard → next `validate` call blocks the app
- [ ] Bad license key, wrong `deviceId` (e.g. another machine using the same key beyond `maxActivations`) → correct error surfaces in the wizard
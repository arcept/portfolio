# Idea (on hold): Phone-controlled QA Ops Simulator

**Status:** Deferred. Fix the rest of the product first, revisit later.

## The idea

Run the existing QA Ops Simulator (bottom-right corner, `src/components/qa-ops-simulator.tsx`)
from a phone instead of only from the desktop panel. A QR code rendered inside the desktop panel
would open a `/remote`-style page on the phone, from which someone could trigger the same
application-status transitions (`applied` → `shared` → `in_process` → ..., reject/disqualify/offer
at the right stages) that the desktop panel already exposes — simulating the placement ops team
acting from a second device during a demo.

## Constraints that shaped the plan

- The whole app is a static bundle pushed to GitHub and hosted from there (e.g. GitHub Pages) — it
  is never run from a local dev server during a demo, and there is no backend of any kind.
- The two devices (desktop + phone) will always be physically near each other during a demo, on
  the same network, in the same room.

## Why a local/LAN relay doesn't work here

The obvious-seeming approach — spin up a tiny local WebSocket server and have the QR code encode
the desktop's LAN IP — requires *something with a server process* running at demo time. Since the
deployed site is static with zero backend, there is nothing to run that relay on. Physical/network
proximity doesn't help: the limiting factor isn't distance, it's that a static site has no
server-side capability at all. So even for a same-room demo, the phone and the desktop tab are two
independent static-page loads with no way to talk to each other unless a third party relays
messages between them.

## Decision: use a managed realtime service (Supabase Realtime)

Since some third-party relay is required regardless of proximity, and the whole point is to avoid
introducing a backend into this repo, a managed realtime service is the right fit:

- **Chosen: Supabase Realtime.** Called directly from client-side JS on both ends — no server code
  in this repo, nothing to deploy separately. A public/anon key gets committed alongside the rest
  of the static bundle (Supabase anon keys are designed for this).
- Because proximity is guaranteed, the QR code only needs to encode a session/room ID, not a LAN
  IP: `https://<site-url>/remote?session=<id>`. A fresh session ID is generated each time the QA
  panel is opened, so old QR codes just go stale (good enough security for a demo tool).
- The `/remote` page can be a route inside the existing SPA (e.g. `/remote`) rather than a separate
  deployment — same build, same GitHub Pages URL, same `OPS_ACTIONS` logic
  (`src/lib/ops-actions.ts`) reused as-is.

## Shape of the implementation, when picked back up

1. Add the Supabase JS client + a project (free tier) with Realtime enabled.
2. Add a `/remote` route to the SPA that renders the same status badge + `OPS_ACTIONS` buttons as
   the desktop panel, but driven by channel state instead of local `useJobs()`.
3. `QaOpsSimulator` (desktop):
   - On mount/open, generate a session ID and open/subscribe to a Supabase Realtime channel keyed
     by that ID.
   - Render a QR code (small client-side `qrcode` package) pointing at `/remote?session=<id>`.
   - On receiving a message from the phone, call `jobsStore.setApplicationStatus(...)` exactly as
     the local buttons already do — everything downstream (tracker, notifications, My Offers)
     reacts automatically since it's the same store.
4. `/remote` page: subscribes to the same channel, shows the current job/status (broadcast by the
   desktop on subscribe and on every change), and posts the chosen action back over the channel
   instead of calling `jobsStore` directly (it has no access to the desktop tab's in-memory store).

## Explicitly out of scope for now

- LAN/local relay approach (ruled out — see above).
- A custom backend (unnecessary — a managed realtime service avoids writing/hosting one).
- Cross-network / not-in-the-same-room usage (not a real requirement per the user).

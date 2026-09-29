# The web client

Next.js 15 App Router, React 19, Tailwind v4. It is a thin, honest view over the control plane:
every screen reads through one gateway route handler and the learner's tokens never reach the
browser.

## The gateway

`app/api/gateway/[...path]/route.ts` is the only place that talks to NestJS.

- The browser calls `/api/gateway/<control-plane-path>`; the handler adds the bearer token and
  forwards. Nothing else on the client knows the control plane exists.
- `POST auth/login|register|refresh` stores the issued tokens in httpOnly cookies
  (`eos_access` for the tab, `eos_refresh` for 7 days) and returns only the user object, so a
  session cannot be lifted out of a stored JSON response or read by page script.
- A 401 is retried once after a silent refresh instead of dumping the learner back to sign-in
  mid-answer.
- Refresh rotation is **single-flight per presented token**. A dashboard fires five reads at once,
  and the control plane treats a replayed refresh token as theft: it revokes the whole family and
  every tab dies. The map is keyed by the presented token, so concurrent requests that present the
  same token share one rotation and all retry with the token it issued.
- If the control plane is not answering, the handler returns a 502 JSON error envelope. A dead
  dependency is a fact the screen can report, not a stack trace.

## Screens

`/` dashboard · `/path` learning path · `/topics/[slug]` topic · `/lessons/[slug]` lesson ·
`/practice` drills and the recall queue · `/practice/[slug]` an attempt · `/progress` the mastery
ledger · `/diagnostic` the 30-question placement sit.

Every screen renders loading, empty, error and success from `components/states.tsx`. Reads go
through `lib/useQuery.ts`, which counts tickets so a stale response can never overwrite a fresh
one.

## The look

Inter only, dark developer-tool palette, hairline borders instead of shadows, and colour that only
ever means something: green is a held rung, red is a missing one, amber is work in progress. The
answer model on a drill stays closed until an attempt exists — that is the measurement, not a
restriction.

## Scripts

```bash
bun run dev        # next dev on :3000
bun run build      # production build
bun run typecheck  # tsc --noEmit
bun run test       # bun test — the pure view helpers in test/
```

## Environment

`API_URL` — where the gateway sends traffic. Defaults to `http://127.0.0.1:4000`, which is the
control plane's dev port. See `.env.example`.

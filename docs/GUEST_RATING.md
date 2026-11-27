# Anonymous 1-Click Guest Rating Architecture

## Motivation
Students arriving via viral WhatsApp or Discord links (e.g., `engirate.app/s/engineering-mathematics-3`) often bounce when immediately confronted by a mandatory registration wall. Allowing instant 1-click ratings removes onboarding friction while preserving rating integrity.

## How It Works
1. **Instant Guest Session (`requireAuthOrGuest`)**:
   - When an unauthenticated visitor submits a rating via `POST /api/ratings/subjects/:subjectId/rate`, the server checks for a valid `token` or `guest_token` cookie.
   - If neither exists, the backend creates a lightweight `User` record (`role: 'guest'`, `passwordHash: null`) and issues a 30-day `httpOnly` signed `guest_token` cookie.
2. **Sybil & Spam Defense**:
   - Because each guest session maps to a unique `userId` and the database enforces `@@unique([userId, subjectId])` on `ratings`, a single guest visitor can only submit **one** rating per subject (subsequent submissions update their existing rating rather than duplicating votes).
   - Rate limiting (`10 req/min`) remains enforced on `/api/ratings`.
3. **Account Claiming (`claimGuestRatings`)**:
   - After a guest rates a subject, the UI displays a non-intrusive toast inviting them to **Claim Account** to save their Critic Transcript.
   - Upon registering (`POST /api/auth/register`) or logging in (`POST /api/auth/login`), the backend automatically transfers all non-conflicting guest ratings and reviews to their permanent account and deletes the temporary guest row.

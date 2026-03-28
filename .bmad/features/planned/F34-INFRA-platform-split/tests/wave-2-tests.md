# Test Spec: Wave 2 — Import Migration

## Scope

Verify that both apps have been fully migrated away from `@lustre/app` and `@lustre/ui` imports, that platform-specific hooks are correctly localized, and that the platform middleware gates content correctly.

---

## T2.1: Mobile Import Verification

**Tool:** Shell commands + grep
**Scope:** `apps/mobile/`

### Import Checks

1. **No @lustre/app imports** — `grep -r "from '@lustre/app'" apps/mobile/ --include='*.ts' --include='*.tsx' | wc -l` equals 0
2. **No @lustre/ui imports** — `grep -r "from '@lustre/ui'" apps/mobile/ --include='*.ts' --include='*.tsx' | wc -l` equals 0
3. **@lustre/hooks imports exist** — `grep -r "from '@lustre/hooks'" apps/mobile/ --include='*.ts' --include='*.tsx' | wc -l` is greater than 0
4. **@lustre/tokens imports exist** — `grep -r "from '@lustre/tokens'" apps/mobile/ --include='*.ts' --include='*.tsx' | wc -l` is greater than 0

### Local Hook Checks

5. **useSwipeGesture is local** — `apps/mobile/hooks/useSwipeGesture.ts` exists and imports from `react-native-reanimated`
6. **useHaptics is local** — `apps/mobile/hooks/useHaptics.ts` exists and imports from `expo-haptics`
7. **usePressAnimation is local** — `apps/mobile/hooks/usePressAnimation.ts` exists

### Build Check

8. **Mobile builds** — `pnpm build --filter apps/mobile` exits 0 (or `npx expo export` or equivalent)

---

## T2.2: Web Import Verification

**Tool:** Shell commands + grep
**Scope:** `apps/web/`

### Import Checks

1. **No @lustre/app imports** — `grep -r "from '@lustre/app'" apps/web/ --include='*.ts' --include='*.tsx' | wc -l` equals 0
2. **No @lustre/ui imports** — `grep -r "from '@lustre/ui'" apps/web/ --include='*.ts' --include='*.tsx' | wc -l` equals 0
3. **@lustre/hooks imports exist** — `grep -r "from '@lustre/hooks'" apps/web/ --include='*.ts' --include='*.tsx' | wc -l` is greater than 0
4. **@lustre/tokens imports exist** — `grep -r "from '@lustre/tokens'" apps/web/ --include='*.ts' --include='*.tsx' | wc -l` is greater than 0

### Build Check

5. **Web builds** — `pnpm build --filter apps/web` exits 0 (Next.js build)

---

## T2.3: Platform Middleware Tests

**Tool:** Vitest + Fastify inject (supertest-style)
**File:** `services/api/src/__tests__/platform.test.ts`

### Header Extraction

1. **Mobile header** — request with `X-Lustre-Platform: mobile` → `request.platform === 'mobile'`
2. **Web header** — request with `X-Lustre-Platform: web` → `request.platform === 'web'`
3. **Admin header** — request with `X-Lustre-Platform: admin` → `request.platform === 'admin'`
4. **Missing header** — request without header → `request.platform === 'unknown'`
5. **Invalid header** — request with `X-Lustre-Platform: invalid` → `request.platform === 'unknown'`

### Content Gating

6. **ConsentVault mobile** — `consent.getPlaybackToken` with platform=mobile → 200 OK
7. **ConsentVault web** — `consent.getPlaybackToken` with platform=web → FORBIDDEN
8. **SafeDate GPS mobile** — `safedate.logGPS` with platform=mobile → 200 OK
9. **SafeDate GPS web** — `safedate.logGPS` with platform=web → FORBIDDEN
10. **Feed NSFW web** — `post.feed` with platform=web excludes MEDIUM/HIGH nudity posts

---

## T2.4: Cross-App Build Verification

**Tool:** Shell commands

1. **Root build** — `pnpm build` from monorepo root exits 0
2. **Root test** — `pnpm test` from monorepo root exits 0
3. **Root typecheck** — `pnpm typecheck` from monorepo root exits 0

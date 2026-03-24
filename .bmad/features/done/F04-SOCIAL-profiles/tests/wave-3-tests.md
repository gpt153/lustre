# Test Spec: Wave 3 — Profile Screens & Pair Linking

## Tests
1. **Onboarding wizard completes** — Step through all 5 wizard steps, verify profile.create called with correct data
2. **Profile displays correctly** — Load profile view, verify all fields render including photos and tags
3. **Pair linking invitation** — Send invite, verify PENDING status, accept, verify PairLink created
4. **Pair profile in search** — Create pair link, search, verify connected unit display
5. **Pair link leave** — Leave pair link, verify removed from members
6. **Max 5 pair members** — Create pair with 5 members, try to add 6th, expect error

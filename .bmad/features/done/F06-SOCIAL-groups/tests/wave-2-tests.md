# Test Spec: Wave 2 — Group Screens

## Tests

### T1: Group creation and joining works on mobile
- Navigate to Groups tab
- Tap create group button
- Fill in name, description, category, set to OPEN
- Submit and verify group appears in list
- Another user views group and taps Join
- Verify member count increments

### T2: Group feed shows member posts only
- View group detail screen
- Verify only posts with matching groupId are shown
- Non-member posts do not appear in group feed

### T3: Moderation panel accessible to moderators
- Group owner navigates to group detail
- Moderation button/link is visible
- Opens moderation screen with pending members, member list, settings
- Non-moderator does NOT see moderation button

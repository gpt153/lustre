# Test Spec: Wave 1 — Group Backend

## Tests

### T1: Group CRUD works
- Create a group with name, description, category, visibility=OPEN
- Verify the creator is an OWNER moderator and ACTIVE member
- Get the group and verify all fields returned
- List groups and verify the new group appears
- Search by name and verify match

### T2: Private group requires approval
- Create a group with visibility=PRIVATE
- Another user calls group.join → membership status should be PENDING
- Moderator calls group.approve → membership status should be ACTIVE
- Verify approved user can now see group posts

### T3: Moderator can ban members
- Create group, add a member
- Moderator calls group.ban on the member
- Verify member status is BANNED
- Verify banned user cannot rejoin (group.join should throw)
- Moderator calls group.unban
- Verify user can rejoin

### T4: Moderation permissions
- Non-moderator cannot call group.ban, group.approve, group.removePost
- MODERATOR cannot ban another MODERATOR (only OWNER can)
- Owner can add/remove moderators

### T5: Group post removal
- Create post with groupId
- Moderator calls group.removePost
- Verify post's groupId is now null

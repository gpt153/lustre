# PRD: Interest Groups

## Overview

User-created interest groups around themes (kink categories, lifestyle topics, local communities). Groups can be open or private (requires approval), have their own chat, forum, and events. Moderators manage members and content.

## Target Audience

Community-oriented users, kink communities, local lifestyle groups

## Functional Requirements (FR)

### FR-1: Group CRUD
- Priority: Must
- Acceptance criteria:
  - Given a user, when creating a group, then they set name, description, category, open/private, and cover image
  - Given a private group, when a user requests to join, then the moderator must approve

### FR-2: Group Feed
- Priority: Must
- Acceptance criteria:
  - Given a group member, when viewing the group, then they see posts from group members only

### FR-3: Group Chat
- Priority: Should
- Acceptance criteria:
  - Given a group, then members can chat in a group chat channel

### FR-4: Group Moderation
- Priority: Must
- Acceptance criteria:
  - Given a group creator, when assigning moderators, then those users can remove posts and ban members

## MVP Scope

FR-1, FR-2, FR-4 are MVP. FR-3 depends on F09 (chat).

## Risks and Dependencies

- Depends on F04 (profiles), F05 (feed for group posts)

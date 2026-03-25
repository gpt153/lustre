# PRD: ConsentVault — DRM Video Recording with Consent Framework

## Overview

Secure video recording system for intimate moments with full mutual consent, DRM protection (Widevine L1/FairPlay), forensic watermarking, streaming-only access (never downloadable), and revocable permissions. Prevents revenge porn by making it technically impossible to download or share without both parties' consent.

## Target Audience

Couples, partners wanting to record intimate moments safely

## Functional Requirements (FR)

### FR-1: Mutual Consent Capture
- Priority: Must
- Acceptance criteria:
  - Given two users in proximity (Bluetooth/NFC), when both open ConsentVault, then mutual consent is captured with verified identity, timestamp, and GPS
  - Given consent, then it is stored as legally binding digital evidence

### FR-2: DRM-Protected Recording
- Priority: Must
- Acceptance criteria:
  - Given recording, then video streams to server (never stored locally), encrypted, DRM-packaged via AWS MediaConvert
  - Given playback, then only streaming is allowed (no download button, screen recording blocked by DRM)

### FR-3: Access Control
- Priority: Must
- Acceptance criteria:
  - Given a recording, then both parties must have "access active" to view
  - Given revocation by either party, then access is immediately removed for everyone

### FR-4: Forensic Watermarking
- Priority: Should
- Acceptance criteria:
  - Given playback, then invisible watermarks embed viewer ID, session ID, and timestamp
  - Given a leaked video, then the source viewer can be identified

### FR-5: Permanent Deletion
- Priority: Must
- Acceptance criteria:
  - Given either party, when requesting permanent deletion, then the recording is irrecoverably destroyed

## MVP Scope

FR-1, FR-2, FR-3, FR-5 are MVP. FR-4 (watermarking) is Phase 2.

## Risks and Dependencies

- AWS MediaConvert + PallyCon: $500-2000/month
- DRM license server setup complex
- Bluetooth/NFC proximity check may have edge cases
- Legal review required for consent framework

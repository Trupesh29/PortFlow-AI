# PortFlow AI Execution Plans

These plans replace the original Plan 1 and Plan 2 prompts. They merge the existing PortFlow architecture decisions with the official IBM Bobathon repository and submission requirements.

Run them sequentially:

1. `PLAN_01_HACKATHON_CONTRACTS.md` - documentation, scope, metadata, and submission contract.
2. `PLAN_02_HACKATHON_SKELETON.md` - repository layout, application skeleton, and verification.

Both plans are intentionally idempotent. The assigned AI must inspect and preserve correct existing work, update only missing or conflicting parts, and stop at the stated boundary.

Important: work performed in Antigravity or another AI tool does not count as IBM Bob task evidence. Use the IBM Bob IDE for meaningful later implementation/review tasks and export the real histories plus usage-summary screenshots into `bob_sessions/`.

# ReferralPro Sprint 1 POC

Click-through for the 9 Sep look-see. Extends the WeInsureEverything intake look. Does not write to live GHL.

Live: https://chrismarrs72.github.io/referralpro-poc/

## Walk (top bar)

1. House. Hennepin + Health, Individual. No Active Primary. Consumer sees We'll assign a specialist. Destination is EMS.
2. EMS. Hennepin + Group Health, Major Medical. Live proof row MN-HENNEPIN-GROUP_HEALTH / RP-A0001.
3. Accept / reject. 24 / 48 / 72 then state + category round-robin.
4. Agent-to-agent referral. Same resolver. Source = agent.
5. Territory list. Seed seats only, not the 378.
6. Replace Miami-Dade Individual Health with fictitious RP-A0002. Future leads only.
7. Record home. Platform SoR. ReferralPro pipeline is the copy. GHL is the echo.
8. Admin. Locked window and catalogue notes.
9. Measurement tiles from this session.

Home keeps the live WIE three-up strip and marks it illustrative. Submit uses one result.

## Pages

Repo Settings, Pages, Source: GitHub Actions. First workflow run publishes the URL above.

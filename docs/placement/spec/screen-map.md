# Screen map — spine → Figma frames

**Export:** figma.com downloads are blocked in the Cowork workspace. First task in Claude Code: export every node below via Figma MCP to `spec/screens/`, then resolve every ⚠ against the images and update this file.

File `PdyMV2HJfhopCns7oyZcNL`, Handover page. All desktop, 1920 wide. IDs identified from frame copy, component instances and board position; sticky meanings from `claude/sticky-annotations.md`. **⚠ = inferred from position, verify on export.**
Export target: `spec/screens/<spine>-<nn>-<slug>.png` at 1440w.

## Shared entry — Learner Hub → graduation (board 5, 3727:105237)
| Slug | Node | State |
|---|---|---|
| lh-graduate-popup | 3813:29779 (corrected, confirmed via text search) | "Congratulations! You are one of our successful graduates 🎉 / Placement Hub will be unlocked for you soon…" → single "Go to Placement Hub" CTA. Exact match for interest already known. |
| lh-graduate-no-interest | 3813:147020 (confirmed correct, no change) | "You haven't showcased interest… Are you interested in seeking assistance with finding jobs with Novatr?" — graduate who never showed interest |
| lh-interest-prompt | 3813:152100 | "Are you interested in seeking assistance…" (shown on the already-unlocked Home, not the Learning Hub) |
| lh-graduate-not-eligible-popup | 3813:58636 | NEW — "We are sorry! You did not pass the eligibility criteria" popup on the Learning Hub courses page (this was wrongly assigned to lh-graduate-popup before verification) |
| lh-decline-interest-confirm-a | 3905:155719 / 3905:156490 | NEW — "It seems you are not interested in placement assistance from Novatr!" (shown after declining) — not currently used by any scenario |
| lh-decline-interest-confirm-b | 4021:57848 | NEW — "Are you sure you are not interested in placement assistance from Novatr?" (confirm-decline step) — not currently used by any scenario |
| hub-eligible-complete | 3905:160044 | Eligible, profile complete |
| hub-eligible-incomplete | 3905:160102 | Eligible, profile incomplete |
| hub-not-eligible | 3727:108051 | "We are sorry! You did not pass the eligibility criteria…" |

## Interest form (board 2, 3473:87740)
| Slug | Node | State |
|---|---|---|
| form-locked-home | 3473:92425 | Home locked, "Fill out the form…" |
| form-blank | 3473:92978 | Blank (alt 5911:50024) |
| form-filled | 3473:93147 | Filled |
| form-confirm | 3473:94075 | Confirm details pop-up |
| form-success | 3813:147524 | Success (20s redirect) |
| form-view-only | 3727:92773 | View only |
| form-editable | 3727:93470 | Editable |
| selfplaced-form | 3483:149490 / 3485:152823 | Self-placement blank / filled |

## Home (3905:167397)
| Slug | Node | State |
|---|---|---|
| home-empty-a | 3905:162054 | No jobs posted (profile complete) ⚠ a/b split |
| home-empty-b | 3905:163303 | No jobs posted (profile incomplete) ⚠ |
| home-jobs-not-applied | 3905:163842 ⚠ (see Gaps) | Jobs posted, not applied — node actually renders with "Profile Incomplete" banner + "Browse Jobs" CTA, not the profile-complete state the happy-path scenario needs |
| home-criteria | 3905:163574 | Eligibility criteria panel open |
| home-updates-compressed | 3905:166008 | Updates feed, 6 items + "Show More" |
| home-updates-expanded | 3905:166435 ⚠ (corrected from 3905:167565, see Gaps) | Updates feed fully expanded (12 items) + "Hide" + "You've reached the end of the list" |
| home-updates-end | 3905:166435 | Same node/content as home-updates-expanded above — see Gaps, may not need a separate slug |
| home-placed | 3943:168491 | Placed — welcome + focus mode |
| home-rating | 3943:168825 | Congratulations for Job Offer + rate |
| home-feedback-received | 3943:168998 | Thank you, feedback received |
| home-return-visit | 4004:37604 ⚠ (see Gaps) | "If user comes back again" — node renders identically to home-feedback-received, content doesn't distinguish a return visit |
| home-closure | 3943:169546 | Closing Your Job Search Journey |
| home-disqualified | 3943:169912 | Disqualified fully |
| home-access-restricted | 4004:37864 | Declined for invalid reason |

## Jobs (3943:170880)
| Slug | Node | State |
|---|---|---|
| jobs-all | 3943:174846 | All Jobs (36): relevant + irrelevant + expired |
| jobs-relevant | 3943:175929 | Relevant (12) |
| jobs-expired | 3943:177338 | Expired (4) |
| jobs-none | 3943:178748 | All Jobs (0) — no openings |
| jobs-status-aware | 3943:179395 ⚠ | Combined list under a learner-status condition (offer / disqualified / placed) |
| jobs-filter-open → narrow | 3958:106366 · 3958:111267 · 3958:111936 · 3958:112883 | Filter open → applied → Relevant (1) |
| (skip) jobs-other | 3943:177867 | Other Jobs — never populated |

## My Applications (3956:180077)
| apps-list | 3956:185201 | My Applications (12), mixed statuses |
| apps-empty | 3956:184383 | Never applied |
| apps-filter-empty | 4877:49211 | Filtered, no match |

## Job Description (3956:186089)
Row 1–2, pre-application:
| jd-apply-48h | 3956:187623 | Relevant, normal (48h) |
| jd-apply-soft | 3956:195783 | Relevant, soft deadline |
| jd-offer-held | 3956:189805 | Apply disabled, offer already held |
| jd-profile-incomplete | 3956:193460 | Profile incomplete |
| jd-expired | 3956:194569 | Expired (side panel) |
| jd-irrelevant | 3956:194975 | Irrelevant, share concern |

Row 3, tracker (left → right, ⚠ order from sticky sequence + banner colour):
| jd-t-applied | 3956:197247 | Applied |
| jd-t-shared | 3956:197654 | Profile shared |
| jd-t-shortlisted | 3956:197977 | Shortlisted |
| jd-t-interview | 3956:198300 | Interview |
| jd-t-offer | 3956:198615 | Offer received |
| jd-t-not-shared | 3956:201245 | Not shared — criteria mismatch |
| jd-t-rej-profile | 3956:201633 | Rejected (profile) |
| jd-t-rej-interview | 3956:201992 | Rejected (interview) |
| jd-t-declined | 3956:202366 | Declined |
| jd-t-accepted | 3956:202421 | Accepted |
| jd-t-inactive | 3956:202476 | Company inactive |
| jd-t-rej-interview-2 | 3956:203453 | Rejected (interview), variant |

## JD pop-ups (3956:205310)
| Flow | Nodes (in order) |
|---|---|
| Apply | 3956:204290 JD (dupe of jd-apply-48h) → step1 3972:208917 (no location issue) **or** 3972:211237 (location mismatch, confirmed) → step2 3972:210477 "Placement policy reminder" (always shown) → step3 3972:210857 success |
| Raise query (irrelevant) | 3956:204611 JD (dupe of jd-irrelevant) → 3956:205999 relevancy concern form → 3956:206085 (form submitting/mid state) → 3956:206171 acknowledged (24 hrs) |
| Accept offer | 3956:204943 JD (dupe of jd-t-offer) → 3972:213374 confirm accept (with location note) → 5915:50451 variant (adds "Add detailed Review" textarea) → 4058:40030 → 4058:39636 → 4058:39242 → 4021:59891, confirmed as ONE sequence (congrats+rate → review textarea → redirecting → thank-you), see Gaps |
| Offer concern | 4065:53834 form → 4065:53899 (mid/submitting state) → 4065:53964 acknowledged (24–48 hrs) |

## Spine → screens
1. **Happy path (hero):** lh-graduate-popup → hub-eligible-complete → home-jobs-not-applied → jobs-all → jd-apply-48h → Apply flow (incl. location mismatch) → apps-list → jd-t-shared → jd-t-shortlisted → jd-t-interview → jd-t-offer → Accept-offer flow (rating happens inside this popup sequence, see Gaps) → home-placed
2. **Rejection + closure (hero):** apps-list → jd-t-interview → jd-t-rej-interview → home-updates-expanded → jobs-relevant → jd-irrelevant → Raise-query flow → home-closure
3. **Gate (short):** lh-graduate-popup → hub-eligible-incomplete → jd-profile-incomplete ⟷ hub-not-eligible (+ selfplaced-form)
4. **Exit ladder (short):** jd-t-offer → decline → jd-t-declined → home-access-restricted ⟷ disqualified → home-disqualified

## Gaps found
- **No "disqualified once — warning" home screen exists.** DECIDED: show "once" through the tracker message + applied-card badge only. Do not invent a screen.
- **No "portal closing in a week" frame found.** Checked home-empty-a/b, home-updates-*, home-return-visit, home-closure — none show this copy. DECIDED (Manik, 16 Sep 2026): skip for phase 1 — `windowClosingSoon` stays a state flag with no dedicated visual for now.
- **No decline-reason capture pop-up** found on the JD pop-ups board. DECIDED (Manik): decline runs through the offer-concern form (4065:53834 → 4065:53899 → 4065:53964); ops then judges validity.
- **lh-graduate-popup node was wrong** — RESOLVED. 3813:58636 actually rendered the not-eligible "sorry" popup. Found the correct single-CTA node via text search: 3813:29779 has the exact "Congratulations! You are one of our successful graduates 🎉 / Placement Hub will be unlocked for you soon…" copy with a single "Go to Placement Hub" button. Reassigned above.
- **home-jobs-not-applied node shows the wrong profile state.** 3905:163842 renders with a "Profile Incomplete" banner and "Browse Jobs" CTA, not the profile-complete / jobs-posted state the happy-path scenario (step 3) needs. DECIDED (Manik, 16 Sep 2026): use this node as the visual reference anyway; when building, swap the banner/CTA copy by hand to the profile-complete state.
- **home-updates-compressed and the original home-updates-expanded node were identical.** 3905:166008 and 3905:167565 render pixel-identical content (6 items + "Show More"). The true fully-expanded state (12 items + "Hide" + "reached the end of the list") lives at 3905:166435, previously labeled home-updates-end. Reassigned home-updates-expanded to that node above; home-updates-end is likely a redundant slug for the same screen.
- **home-return-visit renders identically to home-feedback-received.** 4004:37604 and 3943:168998 are pixel-identical ("Congratulations for Job Offer!" + "Thank you Feedback Received"). No distinct "returning visitor" content found — not blocking, not used by the 4 current scenarios.
- **Apply-flow location-mismatch node was wrong.** 3972:210477 (previously assigned to popup-apply-location-mismatch) actually shows a generic "Placement policy reminder" step with no location content. The real location-mismatch warning (red icon + "This job isn't in your preferred location") appears at 3972:211237, previously labeled as an untitled "alt" success variant. Corrected above.
- **jd-t-not-shared and jd-t-rej-profile render identically** (3956:201245 vs 3956:201633 — same "Rejected" badge, same "does not match our current requirements" copy, same 2-step tracker). Likewise **jd-t-rej-interview and jd-t-rej-interview-2** (3956:201992 vs 3956:203453) render identically. Treating as intentional: ops-side status distinctions without a separate UI. No change needed for phase 1.
- **Offer-accepted flow — RESOLVED (Manik, 16 Sep 2026):** the 4 "celebration" nodes are one sequence, not alternate variants: 4058:40030 (congrats + empty rating stars) → 4058:39636 (rating + review textarea, after a star is picked) → 4058:39242 (redirecting/loading) → 4021:59891 (redirecting + "Thank you Feedback Received"). DECIDED: rating happens inside this popup sequence. The separate home-rating (3943:168825) and home-feedback-received (3943:168998) screens are now redundant and dropped from the happy-path spine — scenario 01 steps 15–17 need updating (see below).

## Slug aliases used in scenario scripts
| Slug | Node |
|---|---|
| popup-apply-confirm | 3972:208917 (step 1, no location issue) |
| popup-apply-location-mismatch | 3972:211237 (corrected — step 1 with location-mismatch warning) |
| popup-apply-policy-reminder | 3972:210477 (corrected — step 2, generic policy reminder, always shown) |
| popup-apply-success | 3972:210857 (confirmed correct — step 3) |
| popup-accept-confirm | 3972:213374 |
| popup-accept-confirm-variant | 5915:50451 (adds "Add detailed Review" textarea) |
| popup-offer-accepted-1 | 4058:40030 (congrats + empty rating stars) |
| popup-offer-accepted-2 | 4058:39636 (rating + review textarea, after a star is picked) |
| popup-offer-accepted-3 | 4058:39242 (redirecting/loading) |
| popup-offer-accepted-4 | 4021:59891 (redirecting + "Thank you Feedback Received") — DECIDED: rating lives in this 4-step popup sequence, not on Home; see Gaps |
| popup-query-form | 3956:205999 |
| popup-query-ack | 3956:206171 |
| popup-offer-concern | 4065:53834 |
| popup-offer-concern-ack | 4065:53964 |
| jd-t-disqualified-message | no frame — compose from jd-t-* layout + Messages "Disqualified" (3956:204263) + badge (3886:55666) |

**Scenario script update needed (Task 1):** `scenarios/01-happy-path.json` steps 13–17 (popup-accept-confirm → popup-offer-accepted → home-placed → home-rating → home-feedback-received) should become popup-accept-confirm → popup-offer-accepted-1 → popup-offer-accepted-2 → popup-offer-accepted-3 → popup-offer-accepted-4 → home-placed (drop the separate home-rating/home-feedback-received steps).

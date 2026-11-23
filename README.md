# Day-Conflict Outfit Planner

A web app prototype that turns tomorrow's schedule and forecast into one practical outfit plan, including what to bring, swap, or layer when events have conflicting dress requirements.

**Intended user:** Grad students and early-career professionals whose day mixes hands-on settings (workshop, lab, fabrication) with professional ones (interviews, sponsor calls, career fairs) and who cannot go home to change.

## Links to every component

| Component | Link |
| --- | --- |
| Running prototype (Replit) | https://day-conflict-outfit-planner.replit.app |
| Demo video (Google Drive) | https://drive.google.com/file/d/1z6ZRmmN_oe735w_U6YhNbpCJXuMmnDi8/view?usp=sharing (view access granted to Emelia Hughes and Samuel Huang) |
| Prototype code and assets | This repository (`artifacts/`, `lib/`, `scripts/`) |
| Revision documentation: peer feedback, tests, risk response | [`revision.md`](./revision.md) |
| AI-use disclosure | [`ai-use-disclosure.md`](./ai-use-disclosure.md) |

## Try the prototype

Open the Replit link above. No account or setup is needed.

1. Pick an example from the **Try an example** dropdown (these are prewritten and labeled "Simulated example"), **or** type your own events, such as `Lab 9-11, class 1:00, dinner with advisor 6:00`.
2. Optionally add preferences (for example, "I run hot").
3. Click **Generate my outfit plan**. Plans for your own events use a live AI model and take about 15–25 seconds.
4. Review the plan, then **Accept**, **Edit**, or **Reject** it.

Use sample or made-up events; do not enter private information.

## What changed in this revision

1. Events the user types now get a plan from a live AI model (examples stay simulated and are labeled).
2. A specific, usable plan replaced the generic "Comfortable, business casual" text in the vague-event example.
3. A safety warning appears when preferences such as open shoes or loose clothing conflict with a workshop or lab event.
4. Clarity fixes: audience statement, "weather is a lookup (not AI)" label, and a stale error message that now clears.

Details, peer-feedback responses, and test results are in [`revision.md`](./revision.md).

## AI behavior: what is live, simulated, and planned

**Intended AI role:** Read messy, free-text event descriptions, infer what each event requires, and reason across conflicts to generate one combined outfit plan with reasons and flagged assumptions.

| Feature | Status |
| --- | --- |
| Plan for events the user types | **Live AI** (a hosted AI model; output can vary and may be wrong) |
| Plans for the three dropdown examples | **Simulated** (prewritten) |
| Tomorrow's weather forecast | Live lookup by city, or sample data labeled "Sample weather for this example" (not AI) |
| Weather tips (breathable fabrics, extra layer, rain reminder) | Simple rules (not AI) |
| Safety warning for risky preferences | Keyword rule (not AI) |
| Accept / Edit controls | Working |
| Reject, then "Try a different approach" | Working (live AI regenerates the plan using the user's note) |
| Calendar sync, morning or evening notifications, wardrobe photos, store links, multiple outfit options | **Planned**, not built |

No API keys or secrets are in this repository; the key is stored in Replit Secrets.

## Test results

Five distinct cases plus a three-run repeat test of the live AI are documented in [`revision.md`](./revision.md#3-evaluation). Summary: Typical 2 (live AI), Challenge, Invalid/empty and Risk cases passed; Typical 1 (Class-only example) was partial because of a text-fragment bug, which was fixed and retested.

## Known limitations

1. **Live output varies and can be wrong.** In repeat runs the specific garments changed, and once the AI stated a preference the user never entered. Next step: test more inputs and constrain the output.
2. **The app does not know a specific shop's rules or whether an event is in person or virtual.** It assumed an in-person dinner and recommended a blazer. Next step: let users mark events as virtual or in person and enter their own shop rules.
3. **Slow and untested at scale.** Live plans take about 15–25 seconds, and only a few inputs, one city, and no phone or screen-reader testing were done. Next step: speed and broader testing.

# Prototype Revision

**Product:** Day-Conflict Outfit Planner
**Intended user:** Grad students and early-career professionals whose day mixes hands-on settings (workshop, lab, fabrication) with professional ones (interviews, sponsor calls, career fairs) and who cannot go home to change.

## 1. What changed in this revision

| # | Change | Status |
| --- | --- | --- |
| 1 | **Live AI for custom schedules.** Events the user types are now sent to an AI model, which returns a plan (Head / Torso / Legs / Shoes, bring-swap-layer, conflicts, assumptions with confidence). The three dropdown examples remain prewritten and are labeled "Simulated example." | Working (live) |
| 2 | **Specific garments in the vague-event example.** Legs and Shoes in "Weather swing + vague event" no longer both read "Comfortable, business casual." | Working |
| 3 | **Safety check for risky preferences.** A plain-rule warning appears when preferences mention open shoes, loose clothing, etc. and the events mention a workshop/lab; the AI is also instructed never to override shop safety rules. | Working (rule-based, not AI) |
| 4 | **Clarity fixes.** Added who the app is for, a note that weather is a lookup (not AI), and the stale "please paste an event" error now clears as soon as the user types. | Working |

## 2. Response to peer feedback

Feedback is summarized and anonymized (four reviews).

| Feedback or observed issue | Decision | What changed, or why deferred |
| --- | --- | --- |
| Typing your own events only showed a "simulated" notice, so a reviewer could not tell how an AI would handle an unseen event (raised by three reviewers). | **Acted on** | Custom events now call a live AI model. Examples stay simulated and are labeled. |
| In the vague-event plan, Legs and Shoes both said "Comfortable, business casual," which tells the user nothing. | **Acted on** | Replaced with specific items (dark chinos or lightweight trousers; flat closed-toe shoes). |
| A reviewer's preferences ("loose clothes, open shoes") were not reflected in the plan. | **Adapted** | These preferences are unsafe in a shop, so instead of simply applying them the app shows a safety warning and the AI keeps the safety rule and explains why. This became the risk case (section 4). |
| The README and page did not say who the app is for. | **Acted on** | Added a one-line audience statement to the page and README. |
| "Does the AI pick the weather?" | **Acted on** | Added a label: weather is looked up by city (a simple lookup, not AI). |
| Show real pictures of clothes / sync with the user's wardrobe (two reviewers). | **Deferred** | Wardrobe upload was an explicit non-goal in the problem framing, and photos of a person's closet raise privacy concerns. Needs its own design. |
| Add store links, a generated style image, gender or closet inputs. | **Deferred** | Outside the central task (turning a day's schedule into one plan). |
| Offer 2–3 options with short descriptions of how they differ. | **Deferred (next priority)** | Most promising extension; would need changes to the AI output format and the layout. |
| Icons next to each section improve readability. | **Kept** | No change. |

## 3. Evaluation

Tests were run against the development preview of the revised app. "Expected" was written before running each test.

| Case | Input or action | Expected result / success criterion | Actual result | Pass, partial, or fail | Implication / next step |
| --- | --- | --- | --- | --- | --- |
| Typical 1 (example) | "Class-only day" example: `Class 10-11:15, Library 1-3`, sample mild weather | Simple plan, no invented conflict | No conflict flagged, and the plan said so. However, the Torso, Legs and Shoes rows showed one sentence split into fragments ("a light top," / "Jeans or chinos," / "and comfortable shoes for…"). | **Partial** (before fix) → **Pass** (after fix) | Bug found by testing and fixed. After the fix, Torso reads "A light top (a tee or casual button-up)," Legs "Jeans or chinos," and Shoes "Comfortable shoes for a full day of class and library time." |
| Typical 2 (live AI) | `Lab 9-11, class 1:00, dinner with advisor 6:00` | Specific garments in all four zones; lab safety items; every event addressed; vague details flagged | Live forecast (about 44°F high / 32°F low) was used. Each zone named specific garments (e.g., charcoal chinos, leather boots, oxford shirt under a merino sweater). Safety glasses, hair tied back, long pants and closed-toe shoes were included. All three events were addressed; class and dinner were marked low confidence. | **Pass** | Plan is usable. Took about 15–25 seconds, which is slow. |
| Challenge | "Weather swing + vague event" example: `Class 9-10, meeting 1:00`, 42°F to 70°F | Layering advice for the swing; "meeting" flagged as an assumption, not guessed silently | Light jacket or cardigan advice; "meeting" marked Low confidence with the stated assumption. Legs and Shoes now give specific items after the revision. | **Pass** | This is simulated, so it shows the intended experience, not model behavior. |
| Invalid / empty | Clicked Generate with the events box empty | Friendly error, no plan | "Please paste at least one event with a time." and no plan. The error clears when the user starts typing. | **Pass** | None. |
| Risk | `Workshop 10-12, interview 2:00` with preferences "I wear loose clothes and open shoes most of the time" | Unsafe preferences not silently applied; user warned; control remains | A warning card appeared immediately. The AI kept closed-toe leather shoes and rolled sleeves, and its conflict section explained that open shoes and loose clothing were only partly honored because of shop safety. Edit and Reject were still available. | **Pass** | The warning is keyword-based and will miss unlisted phrasings. |

**Repeat test (live AI).** I ran the `Lab 9-11, class 1:00, dinner with advisor 6:00` input three times. Each run named specific garments in all four zones, kept the lab safety requirements (safety glasses appeared in every run, sometimes under Head and sometimes under Bring), and marked the class and dinner as low confidence. Specific items varied between runs (lace-up boots, chukka boots or derbies; different sweater colors), which did not matter for safety. One run invented a user preference that was never entered ("even if you'd prefer a softer or more open look for dinner"). That is the kind of variation that matters, because it states something the user did not say.

**Before and after (same task).**
- *Vague-event example:* Before, Legs and Shoes both read "Comfortable, business casual." After, Legs read "Dark chinos or lightweight trousers" and Shoes read "Flat closed-toe shoes you can walk in (loafers or clean sneakers)." This helped.
- *Custom events:* Before, typing your own schedule produced only a notice that plans were simulated examples. After, the same kind of input produced a full, specific plan. This helped; it also introduced new problems (latency, occasional invented details).

### What the evidence tells me

**What works reasonably well now.** The central flow works from start to finish. The live plans were specific and usable, the safety items were consistently present, and the warning and Edit/Reject controls kept the user in charge.

**What remains unreliable, confusing, or untested.** Live output varies between runs and once invented a preference. The app assumes events are in person (it recommended a blazer for the dinner and did not ask whether an interview was virtual). Latency of 15–25 seconds is long. I tested only South Bend and only a handful of inputs, and I have not tested the page on a phone or with a screen reader.

**Do the results support the claimed value?** Partly. They suggest the experience is understandable and the AI can reconcile a lab and a dinner in one outfit. They do not show the plans are *correct* for a particular shop or workplace, and five tests plus three repeats are early evidence, not proof of reliability.

**What I would test next.** More users running their own real schedules, comparing the plan with what they would have worn, and checking whether in-person vs. virtual labeling changes the advice.

## 4. Concrete risk addressed: unsafe recommendations in hands-on settings

**Who could be affected and what could go wrong.** Users who work in shops or labs could receive, or request, an outfit that is unsafe around machinery, such as open-toe shoes, loose sleeves, or dangling jewelry. A reviewer's own preferences ("loose clothes, open shoes") showed this is a realistic case, and the AI could also state a suggestion too confidently.

**What I changed.** (1) A plain-rule check shows a warning card when the preferences mention things like open shoes, sandals, shorts or loose clothing and the events mention a workshop, shop, lab or fab. (2) The AI instructions say shop and lab events require long pants, closed-toe shoes, tied-back hair and safety glasses, and to keep those rules when preferences conflict. (3) Every plan shows "Live AI-generated. May be wrong; posted safety rules override," and the user can Edit, Accept or Reject.

**What risk remains.** The warning is keyword-based, so an unusual phrasing will slip through; the AI does not know a specific shop's posted rules; and a user could still over-trust a confident plan. The safeguard that depends on the AI following its instructions is tested only through the examples above, not guaranteed.

**Course connection.** This is the over-reliance theme: the interface keeps the human responsible and visible (edit, reject, posted rules override) rather than relying on a generic disclaimer.

## 5. What is functional, simulated, and planned

| Feature | Status |
| --- | --- |
| Page, city field, events box, preferences, example dropdown, Accept / Edit / Reject | Working |
| Weather forecast for tomorrow | Working (live lookup), or sample data labeled "Sample weather for this example" |
| Weather tips (breathable fabrics, extra layer, rain reminder) | Working (simple rules, not AI) |
| Plans for the three dropdown examples | Simulated (prewritten) |
| Plans for custom events | Working (live AI) |
| Safety warning for risky preferences | Working (rules, not AI) |
| "Reject" then "Try a different approach" | Working: opens "What should be different?" and the live AI regenerates the plan using the note (tested: "Make it warmer and skip the beanie" returned a plan with no beanie and thermal layers) |
| Calendar sync, morning or evening notifications, wardrobe photos, store links, multiple outfit options | Planned, not built |

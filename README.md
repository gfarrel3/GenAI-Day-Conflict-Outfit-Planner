# Day-Conflict Outfit Planner

A web app prototype that turns tomorrow's schedule and forecast into one practical outfit plan, including what to bring, swap, or layer when events have conflicting dress requirements.

## What the First Working Slice Does

A user opens the page, confirms their city (defaults to South Bend, IN), pastes tomorrow's events with times (or picks a built-in example), and clicks **Generate my outfit plan**. The app then shows:

- Tomorrow's weather
- A base outfit organized by Head, Torso, Legs, and Shoes
- Bring / swap / layer suggestions with a one-line reason for each
- Assumptions, with vague events marked "Low confidence"
- A reminder that posted shop or lab safety requirements override the suggestions

The user can **Accept** the plan, **Edit** it in place, or **Reject** it and ask for a different approach.

## Try the Prototype

Open: Replit[https://day-conflict-outfit-planner.replit.app]

1. Pick an example from the "Try an example" dropdown (or paste your own events, such as `Workshop 10-12, Lenovo interview 2:00`).
2. Click **Generate my outfit plan**.
3. Review the plan, then try Accept, Edit, or Reject.

No account, login, or setup is needed. Nothing the user enters is stored.

## AI Behavior: Simulated

**Intended AI role (future product):** An AI model will read messy, free-text event descriptions, infer what each event requires (setting, dress expectation, practical constraints like working in a shop), and reason across conflicts to generate one combined outfit plan with reasoning and flagged assumptions.

**What currently works:**
- The page, the example dropdown, and the Accept / Edit / Reject controls
- Input validation (an empty submission shows an error instead of a plan)
- [KEEP IF LIVE WEATHER WORKS, otherwise DELETE: Live forecast for South Bend from the Open-Meteo API when the user types their own events]
- A simple rule-based weather check (not AI): breathable fabrics when the high is above 85°F, an extra layer when the low is below 50°F, and a rain reminder when rain chance is above 40%

**What is simulated (Wizard-of-Oz):**
- **All outfit plans are prewritten.** The app matches keywords in the pasted text (such as "workshop" plus "interview") and displays a hard-coded plan. No AI model is called.
- The example days use sample weather, labeled as such on the page.
- Preferences text is displayed back to the user but not factored into the plan.
- "Reject" and "Try a different approach" show a message explaining that the full product's AI would regenerate the plan.
- Calendar and app sync are not built. Events must be pasted.

No API keys or secrets are used in this repository.

## Test Results

| Test | Input or action | What happened | Pass, partial, or fail |
| --- | --- | --- | --- |
| Typical case | "Class-only day" example: `Class 10-11:15, Library 1-3`, mild weather | Showed a simple outfit, no conflict flagged, and said so. [CONFIRM] | [Pass] |
| Challenge case | "Clash day" example: `Workshop 10-12, Lenovo interview 2:00, career fair 4:30`, hot weather | Flagged the shop-safety vs. interview-polish conflict. Plan used one pair of lightweight long pants all day, a nice top protected by a throwaway t-shirt while sanding, closed-toe shoes, and safety glasses and tied-back hair for the shop. [CONFIRM] | [Pass] |
| Challenge case (vague event) | "Weather swing" example: `Class 9-10, meeting 1:00`, 42°F morning and 70°F afternoon | Suggested removable layers and marked "meeting" as Low confidence with a stated assumption. [CONFIRM] | [Pass] |
| Invalid or empty case | Clicked Generate with the events box empty | Showed "Please paste at least one event with a time" and no plan. [CONFIRM] | [Pass] |
| Unrecognized input | Typed `dentist 3pm` | Showed the "Simulated prototype" notice and a generic low-confidence plan. [CONFIRM] | [Pass/Partial] |

## Known Limitations

1. **Plans are prewritten, not generated.** The app only handles a few kinds of days well. A pasted schedule outside those patterns gets a generic fallback plan, so it can't yet reason about arbitrary events. Next step: connect a live AI model, with the key stored in Replit Secrets.
2. **Assumes the Zoom interview and does not verify shop rules.** The clash-day plan treats the interview as a Zoom call, so only the top changes, and the shop requirements (long pants, safety glasses, hair tied back) are typical examples, not checked against a specific shop. Posted requirements override the app. Next step: let the user mark events as in-person or virtual and enter their own shop rules.
3. **No calendar sync, saved preferences, or timing logic.** Events must be pasted, preferences are only displayed back, and the app doesn't yet detect when back-to-back events leave no time to change. Next step: opt-in calendar connection and travel-time-aware conflict detection.

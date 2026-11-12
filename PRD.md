# Product Requirements Document

**Project:** Good Deeds
**Version:** 1.0
**Date:** 12 November 2026
**Prepared by:** Requirements Elicitation Skill
**Status:** Draft - Awaiting stakeholder sign-off

---

## 1. Overview

### 1.1 Purpose

Good Deeds is a mobile-first web app that makes volunteering easy. Members of the public find local
good deeds on a map, take part on their own or in a group, log their hours, and earn points they can
spend with local businesses. Community members can post their own low-risk opportunities, such as a
litter pick, in under a minute.

This version is a **hackathon demo** (Team 7), set in **Brighton**, presented live in a 5-minute slot.
All data is fictional and every integration is mocked, but every journey in scope must work end to end
during the demo.

### 1.2 Success Criteria

- The full demo script (Section 4.15) can be run live in **5 minutes or less** without errors, dead ends
  or placeholder screens.
- A new volunteer can go from sign-up to joining their first opportunity in **under 90 seconds**.
- Hours and points update visibly across screens as a result of actions taken during the demo
  (join → log done → poster confirms → points appear → points redeemed).
- The demo can be reset to a clean starting state in one command, so it can be rehearsed and then
  presented.

### 1.3 Background

The idea came from a Team 7 whiteboard session. The team saw that volunteering has too much friction:
it's hard to find things to do nearby, hard to fit them around your life, and there's little
recognition once you've done them. The working proposition was a "volunteer hub" connecting people
who want to help with people and groups who need help, with rewards and social sharing to encourage
people to come back.

Nothing exists yet. The GitHub repository (`kkedem/good-deeds`) is empty apart from agent tooling.

---

## 2. Users

| User type | Description | Primary goal | Key frustration today |
| --- | --- | --- | --- |
| Volunteer | Any member of the public aged 16 or over | Find a worthwhile thing to do nearby that fits their interests and time, and get recognised for it | Opportunities are scattered across charity websites and Facebook groups. Sign-up is slow, and nothing records what you've done |
| Community poster | An individual, informal group, or someone posting on behalf of a registered charity, organising a local activity (e.g. litter pick, graffiti clean-up, greening, food bank shift) | Get enough people to turn up and recognise the people who helped | No simple way to advertise a one-off local activity beyond word of mouth and social media posts |

A community poster may personally be affiliated with a registered charity (e.g. a food bank
coordinator) — that's in scope as persona context. What's out of scope for this demo is any
**organisation verification** (Charity Commission / Companies House checks) or a separate
organisation account type: every poster, charity-affiliated or not, posts as the same kind of
logged-in user, with no special account, privileges or verification badge. See Section 3.2.

### User Personas

> **Placeholder personas.** The team's full personas are in `PERSONAS.md` (Maya and Sam) and will
> replace these when ready. The demo users in `users.csv` will be updated to match.

**Maya (Volunteer), 27,** is a junior designer living in Kemptown. She's wanted to volunteer for ages
but never knows where to start, and her weekends fill up fast. She likes being outdoors, would rather
go with a friend than alone, and spends most of her day on her phone. If something takes more than a
couple of taps to sign up for, she'll leave it for later and forget.

**Sam (Volunteer), 16,** is a sixth-former in Hove who needs volunteering hours for their Duke of
Edinburgh award and university applications. They need a reliable record of hours that an organiser
has confirmed. They're comfortable with tech and keen on anything with points or rewards.

**Dave (Community poster), 52,** organises a monthly litter pick on The Level. At the moment he posts
in a neighbourhood Facebook group and hopes people turn up. He wants a quick way to post an event, share
it, and thank the people who came.

**Sam (Community poster), 45,** coordinates volunteers part-time for a local foodbank that's part of a
registered charity. Her problem isn't finding interest — it's turning interest into a firm commitment
in time to fill a last-minute gap. She posts an opportunity, publishes it, and tracks who's committed.
For this demo she signs up and posts exactly like Dave: no organisation account, no verification step —
her charity affiliation is context, not a feature. *(Note: there are two personas named Sam — one a
16-year-old volunteer, one a 45-year-old poster. Distinguished by role throughout this document.)*

---

## 3. Scope

### 3.1 In Scope

- Mock login and email sign-up (no real authentication, no passwords stored)
- Location set by postcode (any valid UK postcode; opportunities are in Brighton & Hove)
- 16+ age check at sign-up
- Preferences: indoor/outdoor, manual/non-manual, skills, solo/group
- Terms & Conditions page that must be accepted
- Mock ID verification with a "Verified ✓" badge
- Profile page: skills, preferences, pending and confirmed hours, points balance, history
- Community poster can create an opportunity with full details
- Share an opportunity, and a completed good deed, to social media using the device share sheet or a copied link and caption
- Map view with pins and list view of opportunities
- Filter by category and by preferences/skills
- "Recommended for you", based on the user's preferences (passive discovery)
- Opportunity detail page, join an opportunity, add to calendar (`.ics` download)
- Volunteer logs a deed as done (hours become pending)
- Poster marks an opportunity complete (hours confirmed, points awarded)
- Points at 10 per confirmed hour
- Redeem points for mock offers from fictional Brighton businesses
- Eight seed categories: litter picking, graffiti removal, beach cleaning, greening, food banks,
  animal welfare (dog walking), local school tech support, skill swap
- All data held in CSV files, read and written back by a small local server
- One-command demo reset back to the original seed data
- Docker container to run the demo

### 3.2 Out of Scope

- Real authentication, password storage, SSO or email verification
- Real ID verification provider
- Verified organisation accounts and organisation verification (Charity Commission / Companies House).
  A poster may be personally affiliated with a registered charity as persona context (Section 2), but
  there is no organisation account type, verification step or badge for it — they sign up and post
  exactly as any other community poster.
- Category risk levels and posting restrictions. **Local school tech support is included as a normal
  category with no restriction for the demo.** This knowingly departs from the intended live rule that
  safeguarding categories can only be posted by verified organisations.
- Safeguarding controls for 16–17-year-olds (e.g. parental consent, restricted task types)
- Referring or inviting specific volunteers to an opportunity
- Partner/featured charity opportunities
- Calendar availability matching, weather checks, friends' availability, LinkedIn integration
- Joining as a group / inviting friends to join with you
- Refer-a-friend, monthly streaks, badges and milestones, social feed
- Charity partnerships, local business directory, funds and donations
- Real local business integrations (all offers and voucher codes are fictional)
- Direct posting to the Instagram API
- Push or email notifications
- Categories: household help, childcare/toys, law/legal, admin work (online), social volunteering,
  sight & recognition
- Production hosting, scaling, monitoring and backups
- Any real personal data

---

## 4. Features & Acceptance Criteria

### 4.1 Login (mock)

**Description:** Returning users log in with their email. No real authentication happens: any
password is accepted for an email that exists in `users.csv`. This lets presenters switch quickly
between the volunteer and the poster during the demo.

**Requirement ref:** FR-01

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] A user can enter the email of any user in `users.csv` and any non-empty password, tap **Log in**,
      and land on the Home/Find screen as that user.
- [ ] If the email isn't in `users.csv`, the user sees "We couldn't find an account with that email"
      and a link to **Sign up**.
- [ ] If either field is empty, the **Log in** button shows a message saying which field is missing.
- [ ] A logged-in user stays logged in after refreshing the page, until they tap **Log out**.
- [ ] A **Log out** option is available from the Profile screen and returns the user to the login screen.
- [ ] Passwords are never written to any CSV file or to the server logs.

**Usability Criteria:**

- [ ] A presenter can switch from one demo user to another (log out → log in) in under 15 seconds.

---

### 4.2 Sign-up and preferences

**Description:** New volunteers create an account in a short, step-by-step flow: basic details and
postcode, age check, preferences, then T&Cs. The new user is saved to `users.csv` (without a password)
and can log in again later.

**Requirement ref:** FR-02

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] Step 1 asks for first name, email, date of birth and postcode. Password is shown as a field but is not stored.
- [ ] Any valid UK postcode format is accepted (e.g. `BN1 1AA`, `SW1A 2AA`, `M1 1AE`). A postcode that
      isn't in a valid UK format shows "Please enter a valid UK postcode". The format is checked
      locally; no external lookup is made.
- [ ] Postcodes are accepted in upper or lower case, with or without a space (e.g. `bn1 1aa`, `BN11AA`).
- [ ] **Age check:** if the date of birth makes the user younger than 16 today, sign-up stops with a
      friendly message: "You need to be 16 or over to volunteer with Good Deeds." The user is not saved.
- [ ] A user who is exactly 16 today can continue.
- [ ] If the email already exists in `users.csv`, the user sees "You already have an account" with a link to **Log in**.
- [ ] Step 2 (preferences) lets the user choose:
  - indoor / outdoor / either
  - manual / non-manual / either
  - one or more skills from a fixed list (e.g. Tech, Gardening, Cooking, Driving, Admin, Teaching, Animal care, DIY)
  - solo / group / either.

  All preference fields can be skipped and changed later on the Profile screen.
- [ ] Step 3 shows a summary of the T&Cs with a link to the full T&Cs page. The **Create account**
      button stays disabled until the "I accept the Terms & Conditions" checkbox is ticked.
- [ ] On **Create account**, the user is added to `users.csv` and logged in, then taken to ID verification (4.3).
- [ ] A progress indicator shows the user which step they're on (e.g. "Step 2 of 4").

**Usability Criteria:**

- [ ] A first-time user can complete sign-up (excluding ID verification) in under 60 seconds.
- [ ] Every field has a visible label, and every error message appears next to the field it relates to.

---

### 4.3 ID verification (mock)

**Description:** Builds trust in the platform. The user "uploads" a photo of their ID, sees a short
checking animation, and receives a "Verified ✓" badge on their profile. No image leaves the device and
no real check is performed.

**Requirement ref:** FR-03

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] The user can choose a photo (file picker / camera) or tap **Use demo ID**.
- [ ] After choosing, a "Checking your ID…" state shows for about 2 seconds, then "You're verified ✓".
- [ ] The user's `id_verified` flag is set to `true` in `users.csv`, and a **Verified ✓** badge shows on their profile.
- [ ] The uploaded image is not sent to the server or stored anywhere.
- [ ] The user can tap **Skip for now**. Their profile then shows "Not verified" with a **Verify now** link.

**Usability Criteria:**

- [ ] The screen says clearly that this is a demo and no real ID is checked or stored.

---

### 4.4 Profile

**Description:** The volunteer's home for their impact: who they are, what they've done and what they've earned.

**Requirement ref:** FR-04

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] Shows first name, postcode district, verified status, skills and preferences.
- [ ] The user can edit their preferences and skills. Changes are saved to `users.csv` and immediately
      affect "Recommended for you" (4.6).
- [ ] Shows **Confirmed hours** and **Pending hours** as separate totals.
- [ ] Shows the **Points balance**, worked out as (confirmed hours × 10) − points redeemed.
- [ ] Shows a history list of the user's opportunities, each with title, date, hours and status:
      *Joined*, *Pending confirmation*, *Confirmed* or *Cancelled*.
- [ ] Shows a list of redeemed vouchers with their codes.
- [ ] For a user who has posted opportunities, shows a **My posts** section listing them with status.

**Usability Criteria:**

- [ ] A user can tell their confirmed hours and points balance within 3 seconds of opening the profile.

---

### 4.5 Find: map and list

**Description:** The main discovery screen. Opportunities near the user's postcode are shown as pins
on a map of Brighton, with a toggle to a list view.

**Requirement ref:** FR-05

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] The map is centred on the user's postcode district and shows a pin for every open opportunity.
      If the user's district isn't in `postcodes.csv` (i.e. outside Brighton & Hove), the map is centred
      on Brighton city centre with the message "Good deeds are live in Brighton & Hove. Here's what's on there."
- [ ] Each pin shows the category icon. Tapping a pin shows a card with title, date and time, distance
      and spaces left, plus a **View** button.
- [ ] A **Map / List** toggle switches to a list of the same opportunities, sorted by distance (nearest first).
- [ ] Each list item shows title, category, date, distance, hours and individual/group.
- [ ] Opportunities that are completed, in the past, or full do not appear.
- [ ] Distance is shown in miles to one decimal place, measured from the centre of the user's postcode
      district, or from Brighton city centre if the district isn't in `postcodes.csv`.
- [ ] If the map tiles fail to load (e.g. no internet), the list view still works and a message suggests using it.

**Usability Criteria:**

- [ ] A user can open the app and identify the nearest opportunity within 10 seconds.
- [ ] Every opportunity on the map is also reachable through the list view, so the map isn't the only way in.

---

### 4.6 Filters and "Recommended for you"

**Description:** Helps users narrow down opportunities (active search) and surfaces ones that match
their preferences without them searching (passive discovery).

**Requirement ref:** FR-06

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] A filter panel lets the user filter by category (multi-select) plus:
  - indoor/outdoor
  - manual/non-manual
  - individual/group
  - required skill.
- [ ] Filters apply to both map and list views at once, and the count of matching opportunities updates.
- [ ] A **Clear filters** button resets all filters.
- [ ] If no opportunities match, the user sees "No good deeds match these filters" and a **Clear filters** button.
- [ ] A **Recommended for you** strip on the Find screen shows up to 3 open opportunities that best match
      the user's preferences. Matches are ranked by how many preferences and skills match, then by distance.
- [ ] Changing preferences on the Profile screen changes the recommendations.

**Usability Criteria:**

- [ ] A user can filter to "outdoor, group" opportunities in 3 taps or fewer.

---

### 4.7 Opportunity details and join

**Description:** Everything a volunteer needs to decide, then a one-tap join.

**Requirement ref:** FR-07

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] The detail page shows:
  - title, category and description
  - poster name
  - date, start time and hours required
  - address or meeting point with a small map
  - indoor/outdoor, manual/non-manual, individual/group, and online/in person
  - required skills
  - spaces left (e.g. "6 of 10 spaces left")
  - points available (hours × 10).
- [ ] Tapping **Join** adds a row to `signups.csv` with status *Joined*, reduces spaces left by one, and
      changes the button to **You're going ✓** with options to **Add to calendar** and **Cancel**.
- [ ] A user cannot join the same opportunity twice.
- [ ] When an opportunity is full, **Join** is replaced by "This opportunity is full".
- [ ] An *individual* opportunity has 1 space. A *group* opportunity has the capacity the poster set.
- [ ] A user can cancel before the opportunity is marked complete. This sets the signup to *Cancelled*
      and frees the space.
- [ ] A poster viewing their own opportunity sees **Manage** (attendee list, Share, Mark complete) instead of **Join**.

**Usability Criteria:**

- [ ] A user can join an opportunity from its detail page in one tap.

---

### 4.8 Add to calendar

**Description:** Removes a barrier to turning up by putting the deed in the user's own calendar.

**Requirement ref:** FR-08

**Priority:** Should Have

**Acceptance Criteria:**

- [ ] **Add to calendar** downloads a valid `.ics` file containing the title, start time, end time
      (start + hours required), location and description.
- [ ] The file opens and imports correctly in Apple Calendar, Google Calendar and Outlook.

---

### 4.9 Log as done (volunteer)

**Description:** After taking part, the volunteer claims their hours. They stay pending until the
poster confirms, so people can't claim deeds they didn't do.

**Requirement ref:** FR-09

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] After joining, the volunteer sees an **I've done it** button on the opportunity and in their profile history.
- [ ] For the demo, **I've done it** is available at any time after joining (not just after the start
      time), so the flow can be shown live.
- [ ] Tapping it sets the signup status to *Pending confirmation* in `signups.csv`. The opportunity's
      hours are added to the user's **Pending hours**.
- [ ] The volunteer sees "Nice one! Your hours are pending until the organiser confirms."
- [ ] If the poster has already marked the opportunity complete, hours are confirmed straight away (see 4.12).

---

### 4.10 Create an opportunity (poster)

**Description:** Any logged-in user can act as a community poster and post an opportunity in a short form.

**Requirement ref:** FR-10

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] A **Post a good deed** button is available from the main navigation.
- [ ] The form captures:
  - Title (required, max 60 characters)
  - Category (required, one of the 8 seed categories)
  - Description (required, max 500 characters)
  - Date and start time (required, must be in the future)
  - Hours required (required, 0.5–8 in 0.5 steps)
  - Location: Brighton & Hove postcode (district must be in `postcodes.csv`), plus an optional tap on
    the map to set the exact pin (required)
  - Indoor/outdoor (required)
  - Manual/non-manual (required)
  - In person/online (required)
  - Individual/group (required). If group, capacity is required (2–50).
  - Required skills (optional, multi-select).
- [ ] If the form is submitted with missing or invalid fields, each problem is shown next to its field
      and nothing is saved.
- [ ] On **Post**, the opportunity is added to `opportunities.csv` with status *Open* and the logged-in
      user as poster. It then appears on the map and list straight away for all users.
- [ ] After posting, the poster sees a confirmation with **Share** (4.11) and **View post** buttons.
- [ ] Online opportunities show in the list view with an "Online" label. They show on the map at the
      poster's postcode, marked "Online".

**Usability Criteria:**

- [ ] A poster can create a litter-pick post in under 60 seconds.

---

### 4.11 Share an opportunity or a completed deed

**Description:** Spreads the word, using the same opportunity details to build a social post.

**Requirement ref:** FR-11

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] A **Share** button appears on the detail page of every opportunity, and on each confirmed deed in the volunteer's history.
- [ ] Sharing an opportunity builds a caption from its details, e.g. "Join me for a Seafront Beach Clean
      on Sat 14 Nov, 10:00 – 2 hrs 🌊 #GoodDeeds #Brighton", plus a link to the opportunity.
- [ ] Sharing a completed deed builds a caption such as "I just gave 2 hours to a Seafront Beach Clean
      with Good Deeds 💚 #GoodDeeds".
- [ ] On devices that support it, **Share** opens the native share sheet (Web Share API). Otherwise the
      caption and link are copied to the clipboard and a "Copied – paste it anywhere" message shows.
- [ ] The shared link opens that opportunity's detail page in the app.

---

### 4.12 Mark complete (poster) – confirm hours and award points

**Description:** The poster closes the opportunity and confirms who took part. This turns pending
hours into confirmed hours and awards points.

**Requirement ref:** FR-12

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] On their own opportunity, the poster sees the attendee list with each person's status
      (*Joined* / *Pending confirmation*).
- [ ] Tapping **Mark complete** asks "Confirm hours for everyone who took part?" with a tickbox per
      attendee, all ticked by default.
- [ ] On confirm:
  - the opportunity's status becomes *Completed* and it disappears from Find
  - every ticked attendee's signup becomes *Confirmed*
  - their hours move from pending (or joined) to **Confirmed hours**
  - they are awarded **hours × 10 points**.
- [ ] Unticked attendees' signups become *Cancelled* and they get no hours or points.
- [ ] The poster sees "Done! X volunteers confirmed for Y total hours."
- [ ] When the confirmed volunteer next opens the app or their profile, they see a message such as
      "+20 points – your 2 hours at Seafront Beach Clean were confirmed 🎉".
- [ ] A completed opportunity cannot be joined, edited or completed again.

**Usability Criteria:**

- [ ] The poster can mark an opportunity complete in 3 taps or fewer from their profile.

---

### 4.13 Redeem points with local businesses (mock)

**Description:** Turns points into a tangible reward and supports local businesses. Businesses and
offers are fictional and loaded from CSV.

**Requirement ref:** FR-13

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] A **Rewards** screen lists offers from `offers.csv`, each showing the business name, offer
      (e.g. "Free flat white"), points cost, and the business's Brighton area.
- [ ] The user's points balance shows at the top of the screen.
- [ ] Offers the user can afford have an active **Redeem** button. Offers they can't afford show
      "You need X more points" and are disabled.
- [ ] Tapping **Redeem** asks for confirmation ("Spend 20 points on a Free flat white at Seaside Beans?").
- [ ] On confirm:
  - a row is added to `redemptions.csv`
  - the points balance drops straight away
  - a voucher screen shows a unique code (e.g. `GD-7K3P9`) and a "Show this at the till" message.
- [ ] The voucher code appears afterwards in the user's profile under **My vouchers**.
- [ ] A user can't redeem if doing so would take their balance below zero.

**Usability Criteria:**

- [ ] A user with enough points can redeem an offer in 2 taps from the Rewards screen.

---

### 4.14 Demo data and reset

**Description:** Seed data makes the demo believable. The reset command makes it repeatable.

**Requirement ref:** FR-14

**Priority:** Must Have

**Acceptance Criteria:**

- [ ] Seed CSVs contain at least:
  - 15 open opportunities across all 8 categories, at real Brighton & Hove locations (e.g. the seafront
    near the Palace Pier, The Level, Preston Park, Hove Lawns, a North Laine food bank, an animal shelter)
  - 3 demo users matching the placeholder personas (Section 2), one of whom is a poster with at least
    one open opportunity that has attendees
  - 5 fictional local businesses, with at least 6 offers costing between 10 and 100 points.
- [ ] At least one seed opportunity is the **Seafront Beach Clean** (outdoor, manual, group, 2 hours)
      used in the demo script.
- [ ] Running `npm run reset` (or the equivalent Docker command) restores every CSV to its original seed state.
- [ ] The original seed files are kept separately (e.g. `data/seed/`) and the app never changes them.

---

### 4.15 Demo script (reference)

The build must support this 5-minute script end to end:

| Time | Step | Features used |
| --- | --- | --- |
| 0:00–0:30 | The problem (slides) | – |
| 0:30–1:30 | **Onboard:** new volunteer signs up with a BN1 postcode, passes the 16+ check, sets preferences (outdoor, group), accepts T&Cs, gets the Verified ✓ badge | 4.2, 4.3 |
| 1:30–2:30 | **Find and select:** map of Brighton, recommended Seafront Beach Clean, view details, Join, Add to calendar, I've done it | 4.5, 4.6, 4.7, 4.8, 4.9 |
| 2:30–3:30 | **Poster:** log in as Dave, create a new litter pick on The Level, share it, then mark the Seafront Beach Clean complete | 4.1, 4.10, 4.11, 4.12 |
| 3:30–4:30 | **Reward:** back as the volunteer, sees hours confirmed and +20 points, redeems a coffee voucher, shares the deed | 4.4, 4.11, 4.13 |
| 4:30–5:00 | Wrap-up and future vision (verified orgs, weather, friends) | – |

---

## 5. Non-Functional Requirements

| ID | Category | Requirement | Acceptance criterion |
| --- | --- | --- | --- |
| NFR-01 | Performance | Every screen loads and every action (join, post, complete, redeem) responds within 1 second on a laptop running the demo locally | Time each step of the demo script during rehearsal. None takes more than 1 second, apart from the intentional 2-second ID "check" |
| NFR-02 | Responsiveness | Designed mobile-first for a 390px-wide viewport, and usable up to desktop width | Run the demo script in Chrome DevTools at iPhone 14 size and at 1280px width with no overflow or clipped controls |
| NFR-03 | Browser support | Works in the latest Chrome (the demo browser). Safari and Edge best effort | Full demo script passes in Chrome |
| NFR-04 | Reliability | The demo can be rehearsed and reset any number of times without errors | Run the demo script, then `npm run reset`, then the script again: both runs pass |
| NFR-05 | Data integrity | CSV writes never corrupt a file. Values containing commas, quotes or line breaks (e.g. descriptions) round-trip correctly | Create a post with a description containing commas and quotes, restart the server, and check the text is unchanged |
| NFR-06 | Security / privacy | No passwords and no ID images are stored or logged. All data is fictional | Search the CSVs and server output after a sign-up: no password or image data is present |
| NFR-07 | Accessibility | Practical WCAG 2.2 AA basics: text contrast ≥ 4.5:1, labelled form fields, keyboard-operable controls, visible focus, map content also available as a list, icons have text labels | Check contrast with a tool. Run the sign-up and join journeys using only the keyboard. Run the axe browser extension and fix any critical issues |
| NFR-08 | Portability | Runs with a single command, either `npm start` or `docker compose up`, with no external accounts or API keys | A teammate with a fresh clone runs the app using only the README instructions |
| NFR-09 | Offline resilience | The demo still works if map tiles can't load (venue Wi-Fi fails). The list view and all journeys keep working | Disconnect from the network after the first load and run the demo script using the list view |

---

## 6. Constraints

- **Timeline:** must be built within the hackathon. The live presentation is **5 minutes**.
- **Tech stack:**
  - Node.js with Express for the server
  - plain HTML, CSS and JavaScript on the frontend, with no build step
  - Leaflet with OpenStreetMap tiles for the map
  - packaged in a single Docker container.
- **Data:** CSV files only. No database. The server reads the CSVs and writes changes back.
- **Mocks:** login, ID verification, business rewards and voucher codes are all simulated but must work in the demo.
- **Geography:** volunteers can sign up with any UK postcode, but all opportunities are in Brighton & Hove.
  Postcode districts are looked up from a local CSV table, with no external geocoding API. Districts not
  in the table fall back to Brighton city centre for map centring and distances.
- **External dependency:** map tiles come from OpenStreetMap and need internet access (see NFR-09 for the fallback).
- **Repository:** `github.com/kkedem/good-deeds` (public). Nothing sensitive may be committed.

---

## 7. Data & Integrations

**Key data entities (CSV files in `data/`):**

| File | Key fields |
| --- | --- |
| `users.csv` | id, first_name, email, date_of_birth, postcode, indoor_outdoor, manual_pref, skills (pipe-separated), solo_group, terms_accepted_at, id_verified, created_at |
| `opportunities.csv` | id, poster_id, title, category, description, date, start_time, hours, postcode, lat, lng, indoor_outdoor, manual, online, type (individual/group), capacity, skills, status (open/completed), created_at |
| `signups.csv` | id, opportunity_id, user_id, status (joined/pending/confirmed/cancelled), joined_at, done_at, confirmed_at, points_awarded |
| `businesses.csv` | id, name, area, description |
| `offers.csv` | id, business_id, title, points_cost |
| `redemptions.csv` | id, user_id, offer_id, points_spent, voucher_code, redeemed_at |
| `postcodes.csv` | district, lat, lng (Brighton & Hove districts) |
| `categories.csv` | id, name, icon, default_indoor_outdoor |

Points balance is calculated rather than stored: the sum of `points_awarded` minus the sum of `points_spent`.

**External integrations:**

- OpenStreetMap tiles through Leaflet (read-only, no key needed)
- Web Share API (browser built-in)
- `.ics` calendar files (standard format, no integration)

**Data sensitivity:** fictional demo data only. Real sign-ups during the demo collect a name, email,
date of birth and postcode into `users.csv`. Presenters should use made-up details, and the CSVs must
be reset before committing to the public repo.

---

## 8. UX Requirements Summary

**Mental models and language:**
- Use warm, everyday words, not charity-sector jargon: "good deed", "I've done it", "You're going ✓",
  "Post a good deed", "Points", "Rewards".
- Hours have two clearly different states, **pending** and **confirmed**, and the UI must never blur them.

**Journeys needing particular care:**
- **Sign-up** is the biggest barrier to entry. Keep it short, show progress, and make preferences skippable.
- **Find** is the most-used screen. The nearest and most relevant deeds must be obvious at a glance.
- **Mark complete** is the highest-stakes action because it awards points. Ask for confirmation and let
  the poster untick people who didn't attend.

**Accessibility:** see NFR-07. Never rely on colour alone for status (always add a text label or icon),
and offer the list view as an equal alternative to the map.

---

## 9. Sign-off

This document represents the agreed requirements for the project as captured in conversation
with the stakeholder. Before development begins, the stakeholder should review this document
and confirm it accurately reflects what was discussed.

| Role | Name | Status | Date |
| --- | --- | --- | --- |
| Stakeholder | Team 7 | Summary confirmed in session; document pending review | |
| BA / UX Researcher | Requirements Elicitation Skill | Prepared | 12 November 2026 |

---

_This document is the reference for all development, testing, and assurance activity on this
project. Any changes to requirements after sign-off must be captured in an updated version of
this document before implementation begins._

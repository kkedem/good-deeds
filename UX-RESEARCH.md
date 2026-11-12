# UX Research Summary

**Project:** Good Deeds
**Date:** 12 November 2026
**Prepared by:** Requirements Elicitation Skill (CPUX)

> **Research basis.** This summary comes from the Team 7 whiteboard session and the elicitation
> interview, not from direct research with end users. Because of hackathon time limits, UX research
> was shortened. User profiles are **placeholders** until the team's personas are finished. Treat the
> insights below as hypotheses to check with the usability test at the end of this document.

---

## User Profiles

### Volunteer (member of the public, 16+)

- **Who:** anyone in Brighton & Hove aged 16 or over. Placeholder personas: **Maya**, 27, a busy
  professional who wants to start volunteering, and **Sam**, 16, a student who needs hours they can prove.
- **Context:** on their phone, often on the move or in a spare moment. They decide in seconds whether something is worth it.
- **Goals:**
  - *Underlying:* feel they're giving back, meet people, have something to show for it (CV, DofE,
    university applications), and get a small reward.
  - *Surface:* find something nearby that fits their interests and time, and sign up without hassle.
- **Mental model:** "I'll do a good deed when it's easy, nearby, and ideally with a friend." They think
  in **places** (the seafront, The Level, near me) and **times** (this Saturday), not in charity names.

### Community poster (individual or informal group)

- **Who:** placeholder persona **Dave**, 52, who organises a monthly litter pick on The Level.
- **Context:** organises in his spare time with no admin support. Currently relies on a Facebook group and word of mouth.
- **Goals:**
  - *Underlying:* make his neighbourhood better and feel his effort is noticed.
  - *Surface:* get enough people to turn up and thank them afterwards.
- **Mental model:** "Post the event → share it around → see who's coming → say thanks." For him,
  confirming attendance is the "thanks" step, not an admin chore.

---

## Key Insights

1. **The barrier is effort, not willingness.** The whiteboard's design principles say it directly:
   *easy, low barrier to entry*. Every extra step in sign-up or joining loses people.
2. **Location is the main way people browse.** The team kept coming back to "by location", "on a
   map" and "map pins". People look for good deeds near them, not good deeds of a particular type.
3. **Social motivation matters.** "Do it with friends", "social interaction" and "share/celebrate" all
   came up. Sharing is part of the reward, not an extra.
4. **Recognition drives repeat use.** "Build hours", "bank hours", rewards and points show that people
   want proof of their contribution, especially younger volunteers who need verified hours.
5. **Trust comes before participation.** ID verification, T&Cs and the two-tier poster model show the
   team sees safety and legitimacy as preconditions for the platform working at all.

---

## Mental Models & Domain Language

| Users say / think | UI should say | Avoid |
| --- | --- | --- |
| "A good deed", "helping out" | **Good deed** | "Volunteering engagement", "placement" |
| "I'm going" | **You're going ✓** | "Registration confirmed" |
| "I did it" | **I've done it** | "Submit completion claim" |
| "Put something on" (poster) | **Post a good deed** | "Create listing" |
| "Points", "rewards" | **Points**, **Rewards** | "Credits", "tokens" |
| "Near me" | Distance in **miles** | Kilometres, coordinates |
| "Waiting for the organiser" | **Pending** (with explanation) | "Unverified hours" |
| "Counted" | **Confirmed** | "Validated" |

---

## Task Analysis

| Task | Frequency | Stakes | Key friction | Design implication |
| --- | --- | --- | --- | --- |
| Browse opportunities nearby | High | Low | Too many options, unclear relevance | Map plus list, nearest first, "Recommended for you" at the top |
| Sign up for the app | Once | Medium | Long forms, ID check feels intrusive | Short steps with progress shown, skippable preferences, explain why ID is checked |
| Join an opportunity | Medium | Low | Doubt about what's involved | All key facts on the detail page; one-tap Join; easy cancel |
| Log a deed as done | Medium | Medium | Unclear why hours aren't counted straight away | Explain "pending until the organiser confirms" at the moment of tapping |
| Post an opportunity | Low–Medium | Medium | Too many fields for a quick community event | Sensible defaults, required fields only, under 60 seconds |
| Mark complete / confirm attendees | Low | **High** (awards points) | Accidentally confirming someone who didn't come | Confirmation step with a per-attendee tickbox |
| Redeem points | Low | Medium (points are spent) | Redeeming by mistake | Confirmation dialog showing the points cost; voucher kept in profile |
| Share a deed or opportunity | Medium | Low | Writing a caption | Pre-filled caption from the opportunity details |

---

## Design Risks

- **Pending vs confirmed hours.** Volunteers may think the app is broken if their hours don't count
  straight away. Always show both totals and explain what "pending" means.
- **Map-only discovery.** The map relies on sight and on internet access for the tiles. Keep the list
  view equal to the map, never secondary.
- **Sign-up length.** The flow has four steps (details, preferences, T&Cs, ID). Preferences and ID must
  be skippable, or the "low barrier" principle is broken.
- **Under-16 rejection.** Turning someone away can feel harsh. Use a warm message, and possibly suggest
  coming back at 16.
- **Unrestricted safeguarding category (demo only).** Local school tech support can be posted by anyone
  in the demo. Presenters should mention that in the live product this is limited to verified
  organisations, so the audience doesn't think it's a design flaw.
- **Real data in a public repo.** Demo sign-ups write to `users.csv`. Reset before committing.

---

## Usability Test Plan

**When:** after the build and before the final rehearsal. Allow about 20 minutes.

**Participants:** 3 people who haven't seen the app (e.g. members of other hackathon teams). Include
at least one who isn't technical.

**Method:** think-aloud test on a phone-sized browser window. The facilitator reads each task and
doesn't help. Note the time taken, hesitations and wrong taps.

| # | Task | Pass |
| --- | --- | --- |
| 1 | "Sign up as a new volunteer living in BN1." | Completed in under 60 seconds (excluding ID) with no help |
| 2 | "Find an outdoor group activity this week and join it." | Joined within 30 seconds; participant can explain what they signed up for |
| 3 | "You've done it – tell the app." | Taps **I've done it** and can explain why hours show as pending |
| 4 | (As Dave) "Post a litter pick on The Level this Sunday at 10am for 2 hours." | Posted in under 60 seconds with no validation dead ends |
| 5 | (As Dave) "Confirm the beach clean happened." | Marked complete in 3 taps or fewer, and understood the attendee tickboxes |
| 6 | (As volunteer) "How many points do you have? Spend some on a coffee." | Says the right balance and gets a voucher code within 20 seconds |

**Overall pass:** at least 2 of 3 participants complete every task without help. Fix any task that 2
or more participants fail, or that takes more than double its target time, before the demo.

# Good Deeds – Hackathon Scope Checklist

Tick `[x]` the items in scope for today. ⭐ = suggested core for a working demo.
🔜 = in the PRD, but deferred to V1 (after the demo path works) — too slow to build first.

## 1. Sign-up & profile (Taker)⭐
- [x ] ⭐ Create account / sign up
- [x] ⭐ Set location by postcode
- [x ] Age check (16+ only)
- [x ] Preferences: indoor / outdoor
- [x ] Preferences: manual / non-manual
- [x ] Preferences: skills offered
- [x ] Preferences: groups / do it with friends
- [x ] T&Cs page + accept terms
- [x ] ID verification — 🔜 real file-picker/camera deferred; ship only **Use demo ID** + **Skip for now**
- [x ] Profile page (skills, hours, history)

## 2. Poster accounts
- [x ] ⭐ Community poster (individual / informal group – low-risk categories only)
- [ ] Verified organisation account (registered charity / org / community group)
- [ ] Organisation verification (e.g. Charity Commission / Companies House check)
- [ ] Category-based risk levels (restricted categories = verified orgs only)

## 3. Poster journey
- [x ] ⭐ Create post
- [x ] ⭐ Add detail: description, hours required, location, date/time
- [x ] Required skills on a post
- [x ] Individual vs group opportunity
- [x ] Manual vs online / admin opportunity
- [ ] Refer to volunteer (invite specific people)
- [ ] 🔜 Cancel an opportunity (poster) — not in demo script
- [x ] Share opportunity (Insta / social, reusing post metadata) — 🔜 Web Share API detection deferred; always copy caption+link to clipboard
- [x ] ⭐ Mark as complete (poster confirms)
- [ ] Partner opportunities (featured charity partners)

## 4. Find (Taker)
- [x ] ⭐ Browse opportunities by location
- [x ] ⭐ Map view with pins — 🔜 pin tap opens detail page directly; skip the mini-card popup
- [x ] List view
- [ ] 🔜 Filter by category — not used in demo script
- [ ] 🔜 Filter by preferences / skills — not used in demo script
- [x ] Active search vs passive (recommended for you / notifications)

## 5. Barriers to entry (smart matching)
- [ ] Calendar integration – show opportunities that fit available hours
- [ ] Weather check – flag outdoor tasks with bad forecast
- [ ] Friends' availability – find a time that works for a group
- [ ] LinkedIn integration (skills / showcase volunteering) [?]

## 6. Select & execute (Taker)
- [x ] ⭐ View opportunity details
- [x ] ⭐ Sign up / join an opportunity
- [ ] Join as a group / invite friends
- [ ] 🔜 Cancel a joined opportunity — not in demo script
- [x ] Add to calendar
- [x ] ⭐ Log as done / mark complete
- [x ] ⭐ Bank / log volunteering hours

## 7. Share & engagement
- [x ] Share / celebrate completion to social
- [ ] Refer others
- [ ] Monthly streak
- [x ] Rewards / points
- [ ] Badges / milestones (e.g. "marathon" bonus)
- [ ] Social feed (friends' good deeds)

## 8. Charity & local support
- [ ] Charity partnerships
- [ ] Support local – find local businesses
- [x] Redeem points with local businesses
- [ ] Funds / donations

## 9. Categories (seed data for demo)
- [x ] Litter picking
- [x ] Graffiti removal
- [x ] Beach cleaning
- [x ] Greening
- [x ] Food banks
- [x ] Animal welfare / dogs [?]
- [x ] Local school – tech support (restricted)
- [ ] Household help (restricted)
- [ ] Childcare / toys (restricted)
- [ ] Law / legal (skilled)
- [x ] Skill swap
- [ ] Admin work (online)
- [ ] Social volunteering
- [ ] Sight & recognition [unclear – clarify]

## 10. Build process (deferred to V1)
- [ ] 🔜 Docker packaging — rehearse with `npm start` first; add the container last, once the demo path works
- [ ] 🔜 Full accessibility audit (axe, full keyboard pass) — do labels/contrast/focus inline as you build, but treat the formal audit as post-demo polish


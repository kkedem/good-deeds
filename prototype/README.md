# Good Deeds – iOS volunteering prototype

React 19 + Vite + Tailwind CSS v4. All data is fictional and stored in the browser (localStorage).

## Run locally
Requires Node.js 20+ and pnpm (or npm).

    pnpm install
    pnpm dev        # http://localhost:8443
    pnpm build      # production build in dist/

## Where things live
- src/App.tsx – device frame, tab bar, navigation stacks, modals, prototype controls
- src/store.tsx – all state and actions (join, cancel, I've done it, confirm, redeem, post, reset)
- src/data.ts – seed opportunities, users, businesses and offers (Brighton & Hove)
- src/screens/ – Auth (welcome, login, sign-up, ID check), Find, Detail, MyDeeds, Rewards, Profile, Post
- src/components/ – shared UI kit (buttons, chips, status badges, sheets, alerts), opportunity cards, map

Use "Prototype controls" (right-hand panel or Profile) to simulate the organiser confirming hours, go offline, or reset the demo.

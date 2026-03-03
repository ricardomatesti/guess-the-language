# Guess The Language

## Welcome! 👋

[![Video Preview](https://cdn.loom.com/sessions/thumbnails/f72d3f068be84435ad419a1a46112ee6-01a1b572c44ee982-full-play.gif)](https://www.loom.com/share/f72d3f068be84435ad419a1a46112ee6)

This is a game where you have to guess the language. Will give you up to 5 hints! You can check the [live site right here](https://guess-the-language-taupe.vercel.app/).

It was built using React, Vite, Tailwind, and **Zustand** for state management.

## Auth + Cloud Stats (Supabase)

This project supports:

- Guest mode (no login required)
- Email/password auth (separate Log in + Sign up pages)
- Password recovery flow (Forgot Password + Reset Password pages)
- Google OAuth sign in
- Cloud-synced game stats and recent games
- Progression system (XP + levels)
- Badge collection
- Daily quests

### Required environment variables

Copy `.env.example` to `.env` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Supabase auth configuration

In Supabase Dashboard:

1. `Authentication -> Providers`
   - Enable `Email`
   - Enable `Google` (optional but supported by the app)
2. `Authentication -> Settings`
   - Require email confirmation for sign up
3. `Authentication -> URL Configuration`
   - Site URL: `http://localhost:5173`
   - Redirect URLs:
     - `http://localhost:5173/profile`
     - `http://localhost:5173/reset-password`
     - `http://localhost:5173/login`

## Learnings

### Context vs. State Manager (Zustand)

Initially, this project used React Context for global state management. However, as the game logic grew (handling hints, scores, timers, and levels), the Context became "heavy".

**Why I moved to Zustand:**

- **Performance**: React Context triggers a re-render for all consumers whenever any part of the value changes. Zustand allows components to subscribe to specific parts of the state, preventing unnecessary re-renders.
- **Simplicity**: Zustand provides a cleaner API without the need for complex Provider nesting.
- **Organization**: Moving game logic into a dedicated store makes it easier to test and maintain outside of the component tree.

**Key takeaway**: React Context is excellent for low-frequency updates or simple dependency injection (like themes or auth). For complex global states that change frequently, a dedicated store manager like Zustand is a better fit.

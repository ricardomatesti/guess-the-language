# Guess The Language

## Welcome! 👋

[![Video Preview](https://cdn.loom.com/sessions/thumbnails/590e526e390a477284a00d720bde0a30-3283025b8dff14ec-full-play.gif)](https://www.loom.com/share/590e526e390a477284a00d720bde0a30)

This is a game where you have to guess the language. Will give you up to 5 hints! You can check the [live site right here](https://guess-the-language-taupe.vercel.app/).

It was built using React, Vite, Tailwind, and **Zustand** for state management.

## Learnings

### Context vs. State Manager (Zustand)

Initially, this project used React Context for global state management. However, as the game logic grew (handling hints, scores, timers, and levels), the Context became "heavy". 

**Why I moved to Zustand:**
- **Performance**: React Context triggers a re-render for all consumers whenever any part of the value changes. Zustand allows components to subscribe to specific parts of the state, preventing unnecessary re-renders.
- **Simplicity**: Zustand provides a cleaner API without the need for complex Provider nesting.
- **Organization**: Moving game logic into a dedicated store makes it easier to test and maintain outside of the component tree.

**Key takeaway**: React Context is excellent for low-frequency updates or simple dependency injection (like themes or auth). For complex global states that change frequently, a dedicated store manager like Zustand is a better fit.

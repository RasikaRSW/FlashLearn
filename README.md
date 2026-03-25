This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First,

```bash
npm install
```
# Connecting FlashLearn to a New Weaviate Cloud Account

✅ **Connection verified** — New cluster is running Weaviate **v1.36.6** with `text2vec-huggingface` available.

---

## Step-by-Step Setup

### Step 1: Initialize the Schema (Creates Show, Episode, Flashcard classes)

Open a terminal in the project root and run:

```bash
npm run weaviate:setup
```

This runs [setup-weaviate.ts](file:///c:/development/flashlearn/flashlearn/scripts/setup-weaviate.ts), which:
- Connects to your new Weaviate Cloud cluster
- Deletes any existing classes (clean slate)
- Creates **Show**, **Episode**, and **Flashcard** classes with `text2vec-huggingface` vectorizer

> [!IMPORTANT]
> You should see `✅ Connected to Weaviate Cloud: 1.36.6` followed by class creation confirmations. If you see errors, double-check your [.env.local](file:///c:/development/flashlearn/flashlearn/.env.local) credentials.

---

### Step 2: Populate Sample Shows (Friends, Game of Thrones, etc.)

```bash
npm run weaviate:populate-shows
```

This runs [populate-weaviate.ts](file:///c:/development/flashlearn/flashlearn/scripts/populate-weaviate.ts), which adds 4 sample shows: **Friends**, **Game of Thrones**, **The Big Bang Theory**, and **Breaking Bad**.

---

### Step 3: Populate Sample Episodes (with subtitle content)

```bash
npm run weaviate:populate-episodes
```

This runs [add-sample-episodes.ts](file:///c:/development/flashlearn/flashlearn/scripts/add-sample-episodes.ts), which adds sample episodes with subtitles for Friends, Big Bang Theory, and Breaking Bad.

> [!NOTE]
> This step depends on Step 2 — it looks up the show IDs created in the previous step.

---

### Step 4: Start the Dev Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. Your app should now be working with the new Weaviate Cloud cluster.

---

## Summary of Commands (in order)

| Step | Command | What it does |
|------|---------|-------------|
| 1 | `npm run weaviate:setup` | Creates schema (Show, Episode, Flashcard classes) |
| 2 | `npm run weaviate:populate-shows` | Adds 4 sample TV shows |
| 3 | `npm run weaviate:populate-episodes` | Adds sample episodes with subtitles |
| 4 | `npm run dev` | Starts the development server |





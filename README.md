# ModelJudge Frontend

The web client for **ModelJudge**, a platform for comparing AI language models on the same prompt.

This repository contains the frontend only. The backend (API, model providers, AI judge and database) lives in a separate repository maintained by another part of the team; this application talks to it over HTTP.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Backend Integration](#backend-integration)
8. [Application Workflow](#application-workflow)
9. [Screenshots](#screenshots)
10. [Responsive Design](#responsive-design)
11. [Known Limitations and Planned Work](#known-limitations-and-planned-work)

---

## Project Overview

ModelJudge helps people decide which AI model fits a task by comparing models on evidence rather than reputation. A user picks two models, writes one prompt, and receives:

- both answers, side by side;
- technical metrics for each answer (latency, token usage and estimated cost, when the backend provides them);
- an evaluation from an independent AI judge, with scores for accuracy, relevance, clarity and completeness, an overall score, the winning answer, the judge's reasoning, and strengths and weaknesses for each answer.

Every comparison made while signed in is saved as an **experiment**. An experiment can be run again; each execution is stored as a separate **run**, so earlier results remain available.

**The frontend's role:** it collects user input, calls the backend API, and presents the returned data. It does not call AI providers and does not calculate scores, winners, tokens, latency or cost. Every value shown comes from the backend, and values the backend does not provide are displayed as `—` or `N/A`, never as zero.

---

## Features

### Implemented

| Area | What the user can do |
|---|---|
| **Landing page** (`/`) | Read what ModelJudge does, see the six-step "How it works" flow and the main benefits, and start right away: "Get Started" opens the comparison page without an account. Sign up and log in are one click away. Signed-in users get a direct link into the app. |
| **Registration** (`/register`) | Create an account with first name, optional last name, email and password. Backend validation errors are shown under the related field in plain language. The password can be shown or hidden while typing. |
| **Login** (`/login`) | Sign in with email and password, with a show/hide password control. Wrong credentials, connection problems and a slow server each get a clear message. The user's name is loaded from the account after login. |
| **Guest comparisons** | Visitors can run a comparison without an account. The Results page notes that it was not saved, with links to log in or sign up. |
| **Session handling** | The session is renewed automatically when the access token expires. If renewal is no longer possible, the user is signed out. |
| **Model selection** (`/compare`) | Choose two different models from the list returned by the backend. Inactive models are not offered. |
| **Prompt submission** (`/compare`) | Enter a prompt and run the comparison. The button is disabled while a comparison is running, so it cannot be submitted twice. |
| **Comparison results** (`/results?experiment=<id>&run=<id>`) | See both answers side by side, the status of each model, a metrics table, and the judge's evaluation. A failed model shows a short error message while the other answer stays visible. The link identifies the experiment and run, so the page can be refreshed, reopened or bookmarked by the signed-in owner. |
| **AI evaluation** | Winner, reasoning, a table of the four criteria plus the overall score, and strengths and weaknesses per model. When there is no evaluation (for example, one model failed), the backend's explanation is shown. |
| **Performance metrics** | Latency, input/output/total tokens and estimated cost with its currency. |
| **Rerun from results** | Run the same experiment again from the results page (signed-in users), with a link to all runs of the experiment. |
| **Experiment history** (`/experiments`) | A paginated list of the user's experiments: title (taken from the prompt), the two models, the winner of the latest run, the number of runs and the date. |
| **Delete experiment** | Delete an experiment from the history after confirming in a dialog. |
| **Experiment details** (`/experiments/:experimentId`) | Experiment summary (prompt, models, date, run count), a table of all runs, and for the selected run: model responses, performance metrics and the AI judge section. The selected run is kept in the URL (`?run=<id>`). |
| **Run again** | Execute an experiment again from its details page. The new run is saved under the same experiment and opened automatically. |
| **User profile** (`/profile`) | View the account, edit first and last name, change the password, and sign out. The email cannot be changed. |
| **Navigation** | A header on desktop, a collapsible side panel on tablet, and a slide-in drawer on mobile. The ModelJudge logo always links back to the home page. |
| **Loading, empty and error states** | Pages show clear, human-readable states for loading, no data, expired sessions, missing experiments, connection failures, timeouts and server errors. The model list can be reloaded with "Try again" if it fails to load. |

---

## Tech Stack

| Category | Technology |
|---|---|
| UI library | [React](https://react.dev/) 19 (`react`, `react-dom`) |
| Routing | [React Router](https://reactrouter.com/) 7 (`react-router-dom`) |
| Build tool and dev server | [Vite](https://vite.dev/) 8 with `@vitejs/plugin-react` |
| Language | JavaScript (ES modules, JSX) |
| Styling | Plain CSS with CSS custom properties (design tokens), media queries and CSS container queries. No CSS framework or UI component library. |
| HTTP | The browser Fetch API, wrapped in a single service module |
| Dialogs | The native HTML `<dialog>` element |
| Linting | [oxlint](https://oxc.rs/) with the React plugin |

There is no global state library and no automated test runner in this repository.

---

## Project Structure

```text
frontend/
├── index.html                  # HTML entry point
├── vite.config.js              # Vite config, including the /api proxy for development
├── .env.example                # Example environment variables
├── .oxlintrc.json              # Lint rules
├── package.json
└── src/
    ├── main.jsx                # Mounts the React app and loads global styles
    ├── App.jsx                 # Routes, current user, session start-up and sign-out
    ├── assets/                 # Static assets imported by components (currently empty)
    ├── components/
    │   ├── AppHeader/          # Header, tablet side panel and mobile drawer
    │   ├── ConfirmDialog/      # Reusable confirmation dialog
    │   └── PageState/          # Loading, empty and error messages
    ├── pages/
    │   ├── Landing/            # Public home page
    │   ├── Login/              # Sign in
    │   ├── Register/           # Create an account
    │   ├── Compare/            # Model selection and prompt submission
    │   ├── ComparisonResults/  # Results of the latest comparison
    │   ├── Experiments/        # Experiment history
    │   ├── ExperimentDetails/  # One experiment and its runs
    │   └── Profile/            # Account details and password
    ├── services/
    │   ├── api.js              # HTTP client: auth header, token renewal, timeouts, errors
    │   ├── authService.js      # Register, login, current user, profile, password
    │   ├── comparisonService.js# Models list and new comparisons
    │   ├── experimentService.js# History, details, delete, rerun
    │   ├── normalize.js        # Turns backend payloads into view models for the pages
    │   └── format.js           # Dates, numbers, cost, statuses, names, error messages
    └── styles/
        ├── global.css          # Design tokens, base styles, form controls, responsive tables
        ├── history.css         # Shared styles for the History and Experiment Details pages
        ├── App.css             # Empty
        └── index.css           # Empty
```

### Conventions

- **One folder per page or component**, holding its `.jsx` file and its own `.css` file.
- **API calls live only in `src/services/`.** Pages never call `fetch` directly and never build API URLs themselves.
- **Design tokens** (colors, the 8-point spacing scale, radii, shadows, control height) are defined once in `src/styles/global.css` and reused through `var(--...)`.
- **`normalize.js`** is the only place that knows the shape of backend experiment data; pages work with the normalized view models.

---

## Getting Started

### Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0` (required by Vite 8)
- **npm** (comes with Node.js)
- Access to a running ModelJudge backend. By default the development server forwards API calls to the deployed backend, so no local backend is required.

### Installation

```bash
git clone <frontend-repository-url>
cd <repository-folder>
npm install
```

### Run the development server

```bash
npm run dev
```

Open the address printed in the terminal, normally **http://localhost:5173**.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint on the project |

---

## Environment Variables

Copy `.env.example` to `.env.local` and change only what you need. `.env` and `.env.*` files are ignored by git, except `.env.example`.

```bash
cp .env.example .env.local
```

| Variable | Used by | Default | Description |
|---|---|---|---|
| `VITE_API_PROXY_TARGET` | Development server (`vite.config.js`) | `https://backend-jeo0.onrender.com` | Where the dev server forwards requests that start with `/api`. Set it to a local backend, for example `http://127.0.0.1:8000`, to develop against your own backend. |
| `VITE_API_BASE_URL` | The app (`src/services/api.js`) | empty | Prefix added before every API path. Leave it empty in development (the proxy handles `/api`). For a production build served from a different origin than the backend, set it to the backend origin **without** `/api`, because all paths already start with `/api/`. |

Example `.env.local` for working against a local backend:

```dotenv
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
VITE_API_BASE_URL=
```

No API keys or secrets are used by the frontend. AI provider keys belong to the backend only and must never be added here.

---

## Backend Integration

### How requests are made

All requests go through `apiRequest()` in `src/services/api.js`:

- **Base URL:** `VITE_API_BASE_URL` + the endpoint path (for example `/api/models/`). In development the Vite proxy forwards `/api` to `VITE_API_PROXY_TARGET`.
- **Authentication:** JWT bearer tokens. When an access token exists, every request sends `Authorization: Bearer <access>`.
- **Token renewal:** if a request returns `401`, the client calls `POST /api/auth/refresh/` once and repeats the request with the new token. Requests that fail at the same moment share a single refresh call. Login, register and refresh themselves are never retried. If the refresh token is rejected, the session is cleared and the app signs the user out.
- **Timeouts:** 60 seconds by default; 180 seconds for rerunning an experiment, which waits for both models and the judge.
- **Errors:** failed requests throw an `Error` with `status` (HTTP status) and `data` (the parsed response body). Field errors from the backend (`{ "email": ["..."] }`) are mapped to the matching form fields. HTML error pages from the server are replaced by a readable message.

### Session storage

| `localStorage` key | Purpose |
|---|---|
| `accessToken` | JWT access token |
| `refreshToken` | JWT refresh token |
| `modeljudge.sidebarCollapsed` | Remembers whether the tablet side panel is collapsed |

The current user is loaded from `GET /api/auth/me/` when the app starts and after login. Signing out clears the tokens; there is no logout endpoint.

### Endpoints used

| Method | Endpoint | Purpose | Auth | Used in |
|---|---|---|---|---|
| `POST` | `/api/auth/register/` | Create an account (`email`, `first_name`, `last_name`, `password`); returns the user and tokens | None | Register |
| `POST` | `/api/auth/login/` | Exchange email and password for `access` and `refresh` tokens | None | Login |
| `POST` | `/api/auth/refresh/` | Get a new access token from the refresh token | Refresh token in body | `api.js` |
| `GET` | `/api/auth/me/` | Current user (`id`, `email`, `first_name`, `last_name`) | Bearer | App start-up, Login |
| `PATCH` | `/api/auth/me/` | Update `first_name` and/or `last_name` | Bearer | Profile |
| `POST` | `/api/auth/change-password/` | Change the password (`old_password`, `new_password`) | Bearer | Profile |
| `GET` | `/api/models/` | Models available for comparison | None | Compare |
| `POST` | `/api/comparisons/` | Run a comparison (`prompt`, `model_ids`) and get both answers, metrics and the evaluation | Optional (when signed in, the experiment is saved to the account) | Compare |
| `GET` | `/api/experiments/?page=&page_size=` | The user's experiments, paginated (20 per page) | Bearer | History |
| `GET` | `/api/experiments/{id}/` | One experiment with all runs, results and evaluations | Bearer | Experiment Details |
| `DELETE` | `/api/experiments/{id}/` | Delete an experiment | Bearer | History |
| `POST` | `/api/experiments/{id}/rerun/` | Run the experiment again as a new run | Bearer | Experiment Details, Results |

### Data handling rules

- The frontend shows backend values as they are; it does not compute scores, winners, metrics or costs.
- Missing values are shown as `—` (history pages) or `N/A` / `Unavailable` (results page), never as `0`.
- Experiment details: each run's `evaluation` object provides the scores, overall score, strengths and weaknesses; if a run has no `evaluation`, the per-criterion `scores` on each result are used.

---

## Application Workflow

```text
Landing (/) ──► Register (/register) or Login (/login)
                         │
                         ▼
                 Compare (/compare)  ──run──►  Results (/results)
                         ▲                         │
                         │                         ├── Rerun ──► new run of the same experiment
                         │                         └── "See all runs" ──┐
                         │                                             ▼
                 History (/experiments) ◄──────────────►  Experiment Details (/experiments/:id)
                         │                                  ├── select a run (?run=<id>)
                         └── Delete (with confirmation)     └── Run Again ──► new run opens
```

1. **Start.** Visitors land on `/`. "Get Started" opens `/compare` straight away, without an account. "Log In" and "Sign Up" are available in the header. After signing in, the user arrives at `/compare`.
2. **Compare.** The user writes a prompt, chooses Model A and Model B (two different models) and clicks **Run Comparison**. The request is synchronous: the page shows a running state until the backend returns both answers and the evaluation.
3. **Results.** `/results?experiment=<id>&run=<id>` shows a summary (quality, latency, estimated cost), both answers side by side, a metrics table and the quality evaluation (winner, reasoning, criteria scores, strengths and weaknesses). Right after a comparison the page uses the data it just received; when it is opened from the link later (refresh, new tab, bookmark), it loads the saved run with `GET /api/experiments/{id}/`. **Rerun** saves a new run of the same experiment, shows its results and updates the link.
4. **History.** `/experiments` lists saved experiments with their models, latest winner, run count and date. **View** opens an experiment; **Delete** removes it after confirmation.
5. **Experiment details.** The page shows the experiment summary and a table of runs (newest first, numbered from the oldest). Selecting a run shows its model responses, technical performance and AI judge evaluation. **Run Again** creates a new run and opens it.
6. **Profile.** `/profile` lets the user change their name and password, or sign out.

**Signed-out users:** the header shows "Log In" and "Sign Up". History, Experiment Details and Profile show a prompt to sign in or create an account. The Compare page works without an account; such comparisons are shown right away but are not saved, so they do not appear in History and cannot be run again. A note on the Results page says so.

---

## Screenshots

The screenshots follow the order in which a user moves through the app: first as a visitor without an account, then signed in.

### 1. Landing page (`/`)

The first screen introduces ModelJudge: one prompt, two models and a clear verdict. **Get Started** opens the comparison page right away, without an account, and **Log In** opens the login page. The top bar links to the page sections and to **Log In** and **Sign Up**.

![Landing page hero](docs/screenshots/01-landing-hero.png)

**How it works** explains the six steps of the product, from choosing the models to running an experiment again.

![How it works section](docs/screenshots/02-landing-how-it-works.png)

**Why ModelJudge** lists what the app offers: a fair comparison on the same prompt, side-by-side answers, an independent judge, measurable performance and a saved history. Visitors also get a button to create a free account.

![Why ModelJudge section](docs/screenshots/03-landing-why-modeljudge.png)

The footer repeats the main links.

![Landing page footer](docs/screenshots/04-landing-footer.png)

### 2. Comparison without an account (`/compare` → `/results`)

A visitor can run a comparison without signing in. The header shows **Log In** and **Sign Up** instead of the user's name. The visitor writes a prompt, chooses Model A and Model B from the models the backend offers and clicks **Run Comparison**.

![Compare page for a visitor](docs/screenshots/05-guest-compare.png)

Below the form, **Execution Status** shows a card for each model. It stays empty until a comparison starts.

![Execution status before running](docs/screenshots/06-guest-compare-status.png)

The results appear right away, and a note explains that the comparison is not saved, with links to log in or create an account. **Rerun** is disabled because there is no saved experiment to run again.

The summary shows the quality score, latency and estimated cost of each model, followed by both answers side by side.

![Guest comparison results](docs/screenshots/07-guest-results-summary.png)

The metrics table lists tokens (input / output), latency, estimated cost, quality and status for each model. A cost the backend does not report is shown as "Unavailable", not as zero.

![Guest results metrics table](docs/screenshots/08-guest-results-metrics.png)

The quality evaluation shows the winner, the judge's reasoning, the score for each criterion (accuracy, relevance, clarity, completeness and overall) and the strengths and weaknesses of each answer.

![Guest results quality evaluation](docs/screenshots/09-guest-results-evaluation.png)

### 3. Create an account (`/register`)

To save comparisons, the visitor creates an account with a first name, an optional last name, an email and a password. The eye icon shows or hides the password. Problems such as an email that is already registered appear under the related field.

![Register page](docs/screenshots/10-register.png)

### 4. Log in (`/login`)

The user signs in with email and password. The eye icon shows or hides the password while typing. Wrong credentials, connection problems and a slow server each get a clear message.

![Login page](docs/screenshots/11-login.png)

### 5. Comparison while signed in (`/compare` → `/results`)

The signed-in header shows the user's name, **Profile** and **Sign Out**. The user writes a prompt, chooses Model A and Model B and clicks **Run Comparison**. If something is missing, the page names it and marks the field instead of sending the request.

![Compare page](docs/screenshots/12-compare.png)

While the comparison runs, the button shows **Running…** and cannot be clicked again, so the same comparison is not sent twice.

![Comparison running](docs/screenshots/13-compare-running.png)

**Execution Status** shows that both models are generating their answers and that the AI judge evaluates them next.

![Execution status while running](docs/screenshots/14-compare-running-status.png)

When the backend returns, the results page opens. The comparison is saved to the user's history, so **Rerun** is available and the page can be reopened later from its link.

![Signed-in comparison results](docs/screenshots/15-results-summary.png)

The metrics table and the quality evaluation show the same information as for a visitor.

![Signed-in results metrics table](docs/screenshots/16-results-metrics.png)

![Signed-in results quality evaluation](docs/screenshots/17-results-evaluation.png)

### 6. History (`/experiments`)

History lists the user's saved experiments, newest first, with the prompt, the two models, the winner of the latest run, the number of runs and the date. **View** opens an experiment and **Delete** removes it after confirmation.

![History page](docs/screenshots/18-history.png)

### 7. Experiment details (`/experiments/:id`)

The header shows the prompt, the models, the creation date and the number of runs. The runs table lists every run with its date and status; the selected run is marked **Viewing**. **Run Again** runs the same experiment again on the backend and adds a new run (here, Run #2) without changing earlier runs.

![Experiment details and runs](docs/screenshots/19-details-runs.png)

**Model responses** shows both answers side by side, with each model's status and the winner badge.

![Model responses](docs/screenshots/20-details-responses.png)

**Technical performance** lists latency, input, output and total tokens and cost for each model. **AI Judge** shows the winner, the reasoning, the judge model and the criteria scores.

![Technical performance and AI judge](docs/screenshots/21-details-performance-judge.png)

The strengths and weaknesses of each answer appear below the scores.

![Strengths and weaknesses](docs/screenshots/22-details-strengths-weaknesses.png)

### 8. Profile (`/profile`)

The profile page shows the user's name and email, with sections for personal information, password and signing out.

![Profile page](docs/screenshots/23-profile.png)

**Edit Profile** makes the first and last name editable. The email cannot be changed.

![Editing the profile](docs/screenshots/24-profile-edit.png)

**Change Password** asks for the current password and the new one twice. The eye icon on each field shows or hides what was typed.

![Change password form](docs/screenshots/25-change-password.png)

A confirmation appears when the password has been changed.

![Password changed](docs/screenshots/26-password-changed.png)

---

## Responsive Design

The layout adapts to the space available, without horizontal scrolling.

| Screen | Behavior |
|---|---|
| **Desktop** (wider than 1024px) | Full header with the logo, navigation links (Compare, History) and account actions. Multi-column layouts. |
| **Tablet** (641px to 1024px) | Navigation moves to a side panel that is open by default and pushes the content aside. A menu button collapses or expands it, and the choice is remembered. |
| **Mobile** (640px and below) | Navigation becomes a drawer that slides over the content. It opens with the menu button and closes by swiping it away, tapping outside it, choosing a link, or pressing Escape. |

Other responsive details:

- **Tables become cards.** Data tables (history, runs, metrics, criteria scores) switch to cards when their container is narrower than 760px: two cards per row while there is room, one per row below 480px. This uses CSS container queries, so it also works when the tablet side panel narrows the content.
- **Pages reflow.** Forms, answer cards and sections stack into a single column on small screens, and the landing page moves from three columns to two and then one.
- **Short or zoomed windows.** Pages grow with their content and scroll vertically instead of overlapping.
- **Reduced motion.** Animations and transitions are disabled when the user's system requests reduced motion.

---

## Known Limitations and Planned Work

The following items are present in the code but not complete, or are not implemented yet:

| Item | Current state |
|---|---|
| **Results of signed-out comparisons** | A comparison made without signing in is shown right after it runs, but cannot be reopened later from its link, because it is not saved to an account. |
| **Number of models** | The Compare page selects exactly two models. |
| **Route protection** | There are no route guards. Pages that need an account show a sign-in prompt instead. |
| **Password reset** | Not available. |

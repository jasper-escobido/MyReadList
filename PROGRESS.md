# PROGRESS.md — MyReadList

_Last updated: 2026-10-21_
_Source of truth for the design: `Plan sa MyReadList.md` (the contract). This file is the running log._

## Current phase / feature
- Phase 1 (skeleton and mock data) is the team focus.
- Frontend (HTML/CSS) has not been started yet.
- Jasper (Tech Lead) is starting on the JS layer first: `js/db.js` and `js/api.js`.

## Setup done
- GitHub repo created.
- Folder structure and empty files created (`index.html`, `css/`, `js/`).

## Decisions made (and why)
- Build the JS before the HTML/CSS. The frontend isn't started, so the data layer is built and checked in isolation first.
- Keep `PROGRESS.md` separate from the plan doc. The plan is a contract that rarely changes, while progress is a log that changes every session.
- Follow the Standardized Book Object from the plan (`bookId`, `title`, `author`, `coverImageUrl`, `totalPages`, `currentPage`, `description`, `status`) in both `api.js` and `db.js`.
- 1 person per file per branch/PR, to avoid merge conflicts.

## Concepts I can explain in my own words
- (none yet)

## Tests / checks actually run
- (none yet)

## Blockers
- None right now.

## Next smallest step
- Choose which to build first, `db.js` or `api.js`, and write down the first function to implement.
- Before coding it, write one line describing how I'll check it works without a UI (for example, `console.log` or DevTools).
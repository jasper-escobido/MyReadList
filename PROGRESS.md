# PROGRESS.md: MyReadList

_Last updated: 2026-10-22_
_Design contract: `Plan sa MyReadList.md`. This file is the running log._

## Current phase / feature
- Phase 2 (core logic in isolation): Jasper (Tech Lead) is building `js/db.js`.
- `openDB()` is written and checked in the browser Console.
- Still to write in `db.js`: `addBook`, `getAllBooks`, `updateBook`, `deleteBook`.
- Frontend (HTML/CSS) is being built by the friends in parallel.

## Decisions made (and why)
- Build `db.js` before `api.js`, because storage defines the book shape the API data must fit.
- Database `MyReadListDB`, store `books`, keyPath `bookId` (from the data contract).
- `openDB()` returns a Promise so every other db function can reuse it with `await openDB()`.
- Keep `PROGRESS.md` (log) separate from the plan doc (contract).

## What `openDB()` looks like


function openDB() {

return new Promise((resolve, reject) => {
    const req = indexedDB.open("MyReadListDB", 1);


    req.onsuccess = () => {
        const db = req.result;
        resolve(db);
    }

    req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("books")) {
        req.result.createObjectStore("books", {keyPath: "bookId"});
        }
    }

    req.onerror = () => {
        reject(req.error);
    }
    
    })
}

## Concepts explained (for the team)
- IndexedDB is built into the browser. Nothing to install.
- Analogy: database = filing cabinet, store = a drawer, books = what goes in the drawer.
- `indexedDB.open(name, version)` returns a request right away. The result arrives later.
- Code written first doesn't always run first. A function assigned to `onsuccess` is a plan for later, and the browser calls it when it's ready.
- `onupgradeneeded` runs only when the database is new OR opened with a higher version number. Stores can only be created there.
- `onsuccess` runs on every successful open, so that's where `resolve(db)` goes.
- Creating a store that already exists throws a ConstraintError and cancels the whole upgrade, so we guard with `if (!db.objectStoreNames.contains("books"))`.
- Why `return req.result` doesn't work: `return` runs immediately, before the browser finishes opening, so there is nothing to return yet.
- Promise basics: `openDB()` returns a Promise immediately, and the database arrives later.
  - `resolve(db)` hands the database to whoever is waiting (`.then` or `await`).
  - `reject(req.error)` tells the waiter the open failed, and why.
  - If neither is ever called, the caller waits forever with no error shown.
- Handler names are case-sensitive and spelled exactly. A typo such as `onsucess` or `keypath` fails silently.

## Tests / checks actually run (results reported by Jasper)
- Console: `openDB().then(db => console.log(db))` printed `Promise {<pending>}`, then an `IDBDatabase` named `MyReadListDB`.
- Console: changing `resolve(db)` to `resolve("hello")` made `.then` receive "hello" (confirms `resolve` is the hand-off).
- Console: opening `MyReadListTest` at version 1 when version 3 was stored gave `VersionError`, and it reached `.catch` through `reject(req.error)`.
- Application tab: the `books` store with keyPath `bookId` appeared after deleting the test database and rerunning.

## Still shaky (review these)
- `await` syntax, and how `await openDB()` compares to `.then`.
- Remembering that `openDB()` returns a Promise, not the database itself.

## Debugging tips we learned
- Nothing happens and no error shows: check handler spelling first, then add a `console.log` inside the handler to see whether it runs.
- Count braces. Each `{` needs its own `}`, and a handler must be fully closed before the next statement.
- If you change `onupgradeneeded`, it only takes effect on a new database or a higher version. Delete the database in DevTools (Application, IndexedDB) or bump the version.
- Every teammate has their own browser database, so deleting yours doesn't affect anyone else.

## Blockers
- None.

## Next smallest step
1. Write `addBook(book)` in `db.js`, starting with the question: what does it need before it can store anything?
2. Check it by adding one mock book and looking in DevTools, Application, IndexedDB, `books`.

## Cleanup
- Test databases (`TestDB`, `TestDB2`, `TestDB3`, `TestDB4`, `MyReadListTest`) can be deleted from DevTools.
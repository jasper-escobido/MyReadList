# PROGRESS.md: MyReadList

_Last updated: 2026-10-23_
_Design contract: `Plan sa MyReadList.md`. This file is the running log._

## Current phase / feature
- Phase 2 (core logic in isolation): Jasper (Tech Lead) is building `js/db.js`.
- Done: `openDB()` and `addBook(book)`, both checked in the browser Console.
- Still to write in `db.js`: `getAllBooks`, `updateBook`, `deleteBook`.
- Frontend (HTML/CSS) is being built by the friends in parallel.

## Decisions made (and why)
- Build `db.js` before `api.js`, because storage defines the book shape the API data must fit.
- Database `MyReadListDB`, store `books`, keyPath `bookId` (from the data contract).
- DB version is `4` (bumped on purpose while testing). Never lower it: opening with a lower version throws `VersionError`. Teammates start from a fresh database, so they just go through the upgrade once.
- `openDB()` returns a Promise so every other db function can reuse it with `await openDB()`.
- Keep `PROGRESS.md` (log) separate from the plan doc (contract).

## Current code in `js/db.js`

    function openDB() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open("MyReadListDB", 4);

        req.onsuccess = () => {
          const db = req.result;
          resolve(db);
        };

        req.onupgradeneeded = () => {
          if (!req.result.objectStoreNames.contains("books")) {
            req.result.createObjectStore("books", { keyPath: "bookId" });
          }
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    }

    async function addBook(book) {
      const db = await openDB();
      const tx = db.transaction("books", "readwrite");
      const store = tx.objectStore("books");
      const req = store.add(book);

      return new Promise((resolve, reject) => {
        req.onsuccess = () => {
          resolve(req.result);
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    }

## Concepts explained (for the team)
- IndexedDB is built into the browser. Nothing to install.
- Analogy: database = filing cabinet, store = a drawer, books = what goes in the drawer.
- Opening and saving are asynchronous: the request exists right away, the result arrives later.
- `onupgradeneeded` runs only on a new database or a higher version. Stores can only be created there. Guard with `if (!contains("books"))` to avoid a ConstraintError.
- `onsuccess` goes with `resolve`, `onerror` goes with `reject`.
- `openDB()` returns a Promise, and `await openDB()` gives the database object.
- Every db operation follows four moves: get db, open a transaction, get the store, make the request and wait for it.
- Transaction modes: `"readwrite"` to add or change data, `"readonly"` to only read.
- The `bookId` keyPath makes keys unique, so adding a duplicate rejects with `ConstraintError`.
- Without wrapping the request in a Promise, `addBook` reported "fulfilled" even when the save failed. Now it waits and reports honestly.
- Handler names and property names are case-sensitive. A typo such as `onsucess` fails silently.

## Tests / checks actually run (results reported by Jasper)
- Console: `addBook` with a new `bookId` (`test2`) printed `saved: test2`.
- Console: `addBook` with an existing `bookId` (`test1`) was caught as `ConstraintError`.
- Application tab: `books` store showed both `test1` and `test2`.
- Earlier: `openDB()` resolves with an `IDBDatabase`, and `VersionError` reaches `.catch` through `reject`.

## Still shaky (review these)
- `await` syntax in new functions.
- Remembering that async functions and `openDB()` return Promises, not the final value.
- Not yet tried: `getAllBooks`.

## Debugging tips we learned
- Nothing happens and no error shows: check handler spelling first, then add a `console.log` inside the handler.
- Count braces and check line endings (`;` not `:`).
- "Fulfilled" on an async function only means its lines ran, not that the work succeeded.
- Delete your local database in DevTools (Application, IndexedDB) to re-run upgrade code. Each teammate has their own browser database.

## Blockers
- None.

## Next smallest step
1. Write the first four moves of `getAllBooks()`: db, transaction (`"readonly"`), store, `const req = store.getAll();`.
2. Then wrap the request in a Promise, same as `addBook`, resolving with `req.result` (the array of books).
3. Check it in the Console: it should return `test1` and `test2`.

## Cleanup
- Test databases (`TestDB`, `TestDB2`, `TestDB3`, `TestDB4`, `MyReadListTest`) and the `test1`/`test2` rows can be deleted from DevTools before real use.
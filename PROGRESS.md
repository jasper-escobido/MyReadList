# PROGRESS.md: MyReadList

_Last updated: 2026-10-24_
_Design contract: `Plan sa MyReadList.md`. This file is the running log._

## Current phase / feature
- Phase 2 (core logic in isolation): Jasper (Tech Lead) is building `js/db.js`.
- Done and checked in the browser Console: `openDB`, `addBook`, `getAllBooks`, `updateBook`, `deleteBook`.
- All five db functions are done and checked in the Console: `openDB`, `addBook`, `getAllBooks`, `updateBook`, `deleteBook`, `getBook`.
- After that: decide how `db.js` shares its functions with `app.js`, then start `api.js`.
- Frontend (HTML/CSS) is being built by the friends in parallel.

## Decisions made (and why)
- Build `db.js` before `api.js`, because storage defines the book shape the API data must fit.
- Database `MyReadListDB`, store `books`, keyPath `bookId` (from the data contract).
- DB version is `4` (bumped on purpose while testing). Never lower it: opening with a lower version throws `VersionError`. Teammates start from a fresh database, so they just go through the upgrade once.
- `openDB()` returns a Promise so every other db function can reuse it with `await openDB()`.
- `updateBook` always receives the COMPLETE book object, because `put` replaces the whole record.
- Clamping `currentPage` between 0 and `totalPages` and auto-marking `"completed"` belongs in the caller (`app.js`), not in `db.js`.
- Keep `PROGRESS.md` (log) separate from the plan doc (contract).

## Current code in `js/db.js`

    function openDB() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open("MyReadListDB", 1);

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

    async function getAllBooks() {
      const db = await openDB();
      const tx = db.transaction("books", "readonly");
      const store = tx.objectStore("books");
      const req = store.getAll();

      return new Promise((resolve, reject) => {
        req.onsuccess = () => {
          resolve(req.result);
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    }

    async function updateBook(book) {
      const db = await openDB();
      const tx = db.transaction("books", "readwrite");
      const store = tx.objectStore("books");
      const req = store.put(book);

      return new Promise((resolve, reject) => {
        req.onsuccess = () => {
          resolve(req.result);
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    }

    async function deleteBook(bookId) {
      const db = await openDB();
      const tx = db.transaction("books", "readwrite");
      const store = tx.objectStore("books");
      const req = store.delete(bookId);

      return new Promise((resolve, reject) => {
        req.onsuccess = () => {
          resolve(req.result);
        };

        req.onerror = () => {
          reject(req.error);
        };
      });
    }

    async function getBook(bookId) {
    const db= await openDB();
    const tx = db.transaction("books", "readonly");
    const store = tx.objectStore("books");
    const req = store.get(bookId);
    
    return new Promise((resolve, reject) => {

        req.onsuccess = () => {
            resolve(req.result);
        }

        req.onerror = () => {
            reject(req.error);
        }
    })
    

}

## Concepts explained (for the team)
- IndexedDB is built into the browser. Nothing to install.
- Analogy: database = filing cabinet, store = a drawer, books = what goes in the drawer.
- Opening and saving are asynchronous: the request exists right away, the result arrives later.
- `onupgradeneeded` runs only on a new database or a higher version. Stores can only be created there. Guard with `if (!contains("books"))` to avoid a ConstraintError.
- `onsuccess` goes with `resolve`, `onerror` goes with `reject`.
- `openDB()` returns a Promise, and `await openDB()` gives the database object.
- Every db operation follows four moves: get db, open a transaction, get the store, make the request and wait for it.
- Transaction modes: `"readwrite"` to add, change or delete data, `"readonly"` to only read.
- `add` creates a new record and rejects a duplicate `bookId` with `ConstraintError`.
- `put` replaces the WHOLE record (it does not merge) and creates it if the `bookId` doesn't exist. Always pass the complete book object.
- Safe update pattern for callers: `get` the full book, change one field (for example `currentPage`), then `put` it back.
- `req.result` depends on the method that made the request: `add` and `put` give the key, `getAll` gives an array of books, `delete` gives `undefined`.
- Deleting a `bookId` that doesn't exist is NOT an error. It resolves with `undefined`.
- Without wrapping the request in a Promise, a function reports "fulfilled" even when the save failed. Wrapping it makes the function wait and report honestly.
- Handler names and property names are case-sensitive. A typo such as `onsucess` fails silently.
- `getBook(bookId)` fetches ONE complete book. `req.result` is the book object, or `undefined` if the `bookId` doesn't exist (not an error). Callers must check for    `undefined` before using it.
- The `+1` / `+10` buttons use `getBook`, change `currentPage` on the full object, then call `updateBook` with it, so no fields are lost.

## Tests / checks actually run (results reported by Jasper)
- Console: `addBook` with a new `bookId` (`test2`) printed `saved: test2`.
- Console: `addBook` with an existing `bookId` (`test1`) was caught as `ConstraintError`.
- Console: `getAllBooks()` returned both `test1` and `test2` with all fields.
- Console: `put` with only `{ bookId, currentPage }` wiped the other fields of `test1` (confirms `put` replaces the whole record).
- Console: `updateBook` with a complete `test1` printed `updated: test1`, and the Application tab showed the row repaired.
- Console: `deleteBook("test2")` and `deleteBook("nope")` both printed `deleted: undefined`.
- Earlier: `openDB()` resolves with an `IDBDatabase`, and `VersionError` reaches `.catch` through `reject`.
- Console: `getBook("test1")` returned the full book, and `getBook("nope")` printed `undefined`.

## Still shaky (review these)
- `await` syntax when writing new functions from scratch.
- Remembering that async functions return Promises, not the final value.
- Why `req.result` holds different things for different methods.

## Debugging tips we learned
- Nothing happens and no error shows: check handler spelling first, then add a `console.log` inside the handler.
- Count braces and check line endings (`;` not `:`).
- "Fulfilled" on an async function only means its lines ran, not that the work succeeded.
- Delete your local database in DevTools (Application, IndexedDB) to re-run upgrade code. Each teammate has their own browser database.

## Blockers
- None.

## Next smallest step
1. Decide how `db.js` shares its functions with `app.js` (script loading order or ES modules).
2. Start `api.js`: fetch from Google Books and normalize into the Standardized Book Object.

## Cleanup
- Test databases (`TestDB`, `TestDB2`, `TestDB3`, `TestDB4`, `MyReadListTest`) and the `test1`/`test2` rows can be deleted from DevTools before real use.
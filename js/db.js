// IndexedDB setup and CRUD functions

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
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

async function addBook(book) {   
    const db = await openDB();
    const tx = db.transaction("books",  "readwrite");
    const store = tx.objectStore("books");
    const req = store.add(book);

    return new Promise((resolve, reject) => {

        req.onsuccess = () => {
        resolve(req.result);
        }

        req.onerror = () =>  {
        reject(req.error);
        }

    })
}

async function getAllBooks() {
    const db= await openDB();
    const tx = db.transaction("books", "readonly");
    const store = tx.objectStore("books");
    const req = store.getAll();
    
    return new Promise((resolve, reject) => {

        req.onsuccess = () => {
            resolve(req.result);
        }

        req.onerror = () => {
            reject(req.error);
        }
    })
    

}



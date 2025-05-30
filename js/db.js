let db;
const DB_NAME = "CrudKeep";
const STORE_NAME = "items";

function openDB(callback) {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
  };
  request.onsuccess = function (e) {
    db = e.target.result;
    if (callback) callback();
  };
}

function addItem(type, data, parent = null) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.add({ type, data, parent });
}

function updateItem(id, data) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.get(id).onsuccess = function (e) {
    const item = e.target.result;
    item.data = data;
    store.put(item);
  };
}

function deleteItem(id, callback) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const deleteRequest = store.delete(Number(id));

  deleteRequest.onsuccess = () => {
    console.log(`Item ${id} deleted`);
    if (callback) callback();
  };

  deleteRequest.onerror = () => {
    console.error(`Failed to delete item ${id}`);
  };
}

function getAllItems(callback, parent = null) {
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  req.onsuccess = () => {
    const result = req.result.filter(item => item.parent === parent);
    callback(result);
  };
}

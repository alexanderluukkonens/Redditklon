class LocalStorageManager {
  constructor() {}

  getFromLocalStorage(key) {
    const data = localStorage.getItem(key);

    if (data !== null) {
      return JSON.parse(data); // If data excist, convert and return
    } else {
      return []; // if data is 0, return empty array
    }
  }

  saveToLocalStorage(key, value) {
    if (key && value !== undefined) {
      const jsonData = JSON.stringify(value); // Convert value to string
      localStorage.setItem(key, jsonData); // Save to localstorage
    }
  }
}

export const localStorageManager = new LocalStorageManager();

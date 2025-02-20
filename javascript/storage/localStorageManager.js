class LocalStorageManager {
  constructor() {}

  getFromLocalStorage(key) {
    const data = localStorage.getItem(key);

    if (data !== null) {
      return JSON.parse(data); // Om det finns data, konvertera och returnera
    } else {
      return []; // Om det inte finns data, returnera en tom array
    }
  }

  saveToLocalStorage(key, value) {
    if (key && value !== undefined) {
      const jsonData = JSON.stringify(value); // Konvertera värdet till en sträng
      localStorage.setItem(key, jsonData); // Spara i localStorage
    }
  }
}

export const localStorageManager = new LocalStorageManager();

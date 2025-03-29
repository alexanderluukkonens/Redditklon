export class LocalStorageManager {
  constructor() {}

  getFromLocalStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log(`Error getting ${key} from localStorage`);
      return null;
    }
  }

  saveToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(`Error saving ${key} to localStorage`);
    }
  }
}

export const localStorageManager = new LocalStorageManager();

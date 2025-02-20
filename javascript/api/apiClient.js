import { localStorageManager } from "../storage/localStorageManager.js";

class ApiClient {
  constructor() {}
  async fetchPostsFromDummyJson() {
    const response = await fetch("https://dummyjson.com/posts/?limit=10");
    const data = await response.json();
    localStorageManager.saveToLocalStorage("posts", data);
    return data;
  }

  async fetchUsersFromDummyJson() {
    const response = await fetch("https://dummyjson.com/users");
    const data = await response.json();
    localStorageManager.saveToLocalStorage("users", data);
    return data;
  }

  async fetchCommentsFromDummyJson() {
    const response = await fetch("https://dummyjson.com/Comments");
    const data = await response.json();
    localStorageManager.saveToLocalStorage("comments", data);
    return data;
  }
}

export const api = new ApiClient();

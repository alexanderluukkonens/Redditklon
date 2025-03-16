import { localStorageManager } from "../storage/localStorageManager.js";

class ApiClient {
  async fetchPostsFromDummyJson() {
    try {
      const response = await fetch("https://dummyjson.com/posts/");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch posts: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      localStorageManager.saveToLocalStorage("posts", data);

      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);

      return { posts: [] };
    }
  }

  async fetchUsersFromDummyJson() {
    try {
      const response = await fetch(
        "https://dummyjson.com/users/?select=id,username"
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      localStorageManager.saveToLocalStorage("users", data);

      return data;
    } catch (error) {
      console.error("Error fetching users:", error);

      return { users: [] };
    }
  }

  async fetchCommentsFromDummyJson() {
    try {
      const response = await fetch("https://dummyjson.com/comments/?limit=340");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch comments: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      // Make sure commentsData follows expected structure
      if (!data.comments) {
        data.comments = [];
      }

      localStorageManager.saveToLocalStorage("comments", data);

      return data;
    } catch (error) {
      console.error("Error fetching comments:", error);

      return { comments: [] };
    }
  }
}

// Create and export a single instance of the API client
export const api = new ApiClient();

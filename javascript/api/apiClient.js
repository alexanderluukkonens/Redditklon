//apiClient.js

import { localStorageManager } from "../storage/localStorageManager.js";

class ApiClient {
  async fetchPostsFromDummyJson() {
    try {
      // Get all posts
      const response = await fetch("https://dummyjson.com/posts");
      // Check if request was successful
      if (!response.ok) {
        throw new Error(
          `Failed to fetch posts: ${response.status} ${response.statusText}`
        );
      }
      // Parse JSON response
      const data = await response.json();
      // Save to localStorage for future use
      localStorageManager.saveToLocalStorage("posts", data);

      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      // Return empty data structure to allow app to continue
      return { posts: [] };
    }
  }

  async fetchUsersFromDummyJson() {
    try {
      // Get users with only id and username fields
      const response = await fetch(
        "https://dummyjson.com/users/?select=id,username"
      );
      // Check if request was successful
      if (!response.ok) {
        throw new Error(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }
      // Parse JSON response
      const data = await response.json();
      // Save to localStorage for future use
      localStorageManager.saveToLocalStorage("users", data);

      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      // Return empty data structure to allow app to continue
      return { users: [] };
    }
  }

  async fetchCommentsFromDummyJson() {
    try {
      // Get all comments (limit 340)
      const response = await fetch("https://dummyjson.com/comments/?limit=340");

      // Check if request was successful
      if (!response.ok) {
        throw new Error(
          `Failed to fetch comments: ${response.status} ${response.statusText}`
        );
      }
      // Parse JSON response
      const data = await response.json();
      // Make sure commentsData follows expected structure
      if (!data.comments) {
        data.comments = [];
      }
      // Save to localStorage for future use
      localStorageManager.saveToLocalStorage("comments", data);

      return data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      // Return empty data structure to allow app to continue
      return { comments: [] };
    }
  }
}

// Create and export a single instance of the API client
export const api = new ApiClient();

// api/apiClient.js
import { localStorageManager } from "../storage/localStorageManager.js";

class ApiClient {
  constructor() {
    this.postsData = null;
    this.usersData = null;
    this.commentsData = null;
  }

  async fetchAllData() {
    try {
      // Step 1: Fetch posts first
      const posts = await this.fetchPostsFromDummyJson(false);
      console.log("Posts count:", posts.posts.length);

      // Step 2: Extract unique user IDs from posts
      const uniqueUserIds = [
        ...new Set(posts.posts.map((post) => post.userId)),
      ];
      console.log("Unique user IDs in posts:", uniqueUserIds);

      // Step 3: Fetch comments
      const comments = await this.fetchCommentsFromDummyJson(false);
      console.log("Comments count:", comments.comments.length);

      // Step 4: Extract user IDs from comments
      const commentUserIds = [
        ...new Set(
          comments.comments.map((comment) => {
            // Handle both formats that might exist in the API
            return comment.userId || (comment.user && comment.user.id);
          })
        ),
      ].filter((id) => id); // Filter out any undefined/null

      console.log("Unique user IDs in comments:", commentUserIds);

      // Step 5: Combine all user IDs we need to fetch
      const allUserIds = [...new Set([...uniqueUserIds, ...commentUserIds])];
      console.log("Total unique user IDs to fetch:", allUserIds.length);

      // Step 6: Fetch specific users directly from DummyJSON API
      const users = await this.fetchSpecificUsers(allUserIds);
      console.log("Users fetched:", users.users.length);

      // Step 5: Create processed data objects
      const processedData = {
        posts: posts,
        users: users,
        comments: comments,
      };

      // Step 6: Save all processed data to localStorage
      localStorageManager.saveToLocalStorage("posts", processedData.posts);
      localStorageManager.saveToLocalStorage("users", processedData.users);
      localStorageManager.saveToLocalStorage(
        "comments",
        processedData.comments
      );

      return processedData;
    } catch (error) {
      console.error("Error fetching all data:", error);
      return {
        posts: { posts: [] },
        users: { users: [] },
        comments: { comments: [] },
      };
    }
  }

  // New method to fetch specific users by ID
  async fetchSpecificUsers(userIds) {
    try {
      // Create an array to store all users
      let allUsers = [];

      console.log(`Fetching ${userIds.length} users by ID...`);

      // To avoid overwhelming the API, fetch in batches
      const BATCH_SIZE = 10;

      for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
        const batch = userIds.slice(i, i + BATCH_SIZE);
        console.log(
          `Fetching batch of users ${i + 1} to ${Math.min(
            i + BATCH_SIZE,
            userIds.length
          )}`
        );

        // Fetch users in this batch
        const batchPromises = batch.map(async (userId) => {
          try {
            const response = await fetch(
              `https://dummyjson.com/users/${userId}`
            );
            if (response.ok) {
              return await response.json();
            } else {
              console.warn(`User with ID ${userId} not found`);
              return null;
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
          }
        });

        // Wait for this batch to complete
        const batchResults = await Promise.all(batchPromises);

        // Add successful results to allUsers
        batchResults
          .filter((user) => user !== null)
          .forEach((user) => {
            allUsers.push({
              id: user.id,
              username: user.username || `User #${user.id}`,
            });
          });
      }

      console.log(
        `Successfully fetched ${allUsers.length} out of ${userIds.length} users`
      );

      // Add any users we already had cached
      if (this.usersData && this.usersData.users) {
        // Get IDs we already fetched to avoid duplicates
        const fetchedIds = allUsers.map((user) => user.id);

        // Add cached users that aren't duplicates
        const cachedUsers = this.usersData.users.filter(
          (user) => !fetchedIds.includes(user.id)
        );

        allUsers = [...allUsers, ...cachedUsers];
      }

      // If we're still missing any users, create fallbacks
      const fetchedIds = allUsers.map((user) => user.id);
      const missingIds = userIds.filter((id) => !fetchedIds.includes(id));

      if (missingIds.length > 0) {
        console.log(
          "Creating fallbacks for users that couldn't be fetched:",
          missingIds
        );
        const fallbackUsers = missingIds.map((id) => ({
          id: id,
          username: `User #${id}`,
        }));

        allUsers = [...allUsers, ...fallbackUsers];
      }

      // Return in the expected format
      return { users: allUsers };
    } catch (error) {
      console.error("Error fetching specific users:", error);

      // Return fallback users if the fetch fails
      const fallbackUsers = userIds.map((id) => ({
        id: id,
        username: `User #${id}`,
      }));

      return { users: fallbackUsers };
    }
  }

  async fetchPostsFromDummyJson(saveToStorage = true) {
    try {
      if (this.postsData) return this.postsData;

      // Fetch posts with limit
      const response = await fetch("https://dummyjson.com/posts?limit=15");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch posts: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();

      if (saveToStorage) {
        localStorageManager.saveToLocalStorage("posts", data);
      }

      this.postsData = data;
      return data;
    } catch (error) {
      console.error("Error fetching posts:", error);
      return { posts: [] };
    }
  }

  async fetchUsersFromDummyJson(saveToStorage = true) {
    try {
      if (this.usersData) return this.usersData;

      const response = await fetch(
        "https://dummyjson.com/users?select=id,username"
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch users: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();

      if (saveToStorage) {
        localStorageManager.saveToLocalStorage("users", data);
      }

      this.usersData = data;
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return { users: [] };
    }
  }

  async fetchCommentsFromDummyJson(saveToStorage = true) {
    try {
      if (this.commentsData) return this.commentsData;

      const response = await fetch("https://dummyjson.com/comments?limit=340");
      if (!response.ok) {
        throw new Error(
          `Failed to fetch comments: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();

      if (!data.comments) {
        data.comments = [];
      }

      if (saveToStorage) {
        localStorageManager.saveToLocalStorage("comments", data);
      }

      this.commentsData = data;
      return data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return { comments: [] };
    }
  }
}

// Create and export a single instance of the API client
export const api = new ApiClient();

import { localStorageManager } from "../storage/localStorageManager.js";

class ApiClient {
  constructor() {
    this.postsData = null;
    this.usersData = null;
    this.commentsData = null;
  }

  async fetchAllData() {
    try {
      // Fetch posts
      const postsResponse = await fetch("https://dummyjson.com/posts?limit=15");
      const posts = await postsResponse.json();

      // Fetch users
      const usersResponse = await fetch(
        "https://dummyjson.com/users?select=id,username"
      );
      const users = await usersResponse.json();

      // Fetch comments
      const commentsResponse = await fetch(
        "https://dummyjson.com/comments?limit=100"
      );
      const comments = await commentsResponse.json();

      // Get user IDs from posts and comments
      const postUserIds = posts.posts.map((post) => post.userId);
      const commentUserIds = comments.comments
        .map((comment) => comment.userId || (comment.user && comment.user.id))
        .filter((id) => id);

      // Combine unique user IDs
      const allUserIds = [...new Set([...postUserIds, ...commentUserIds])];

      // Fetch any missing users
      const fetchedUsers = await this.fetchMissingUsers(
        allUserIds,
        users.users
      );

      // Update users object with any newly fetched users
      if (fetchedUsers.length > 0) {
        users.users = [...users.users, ...fetchedUsers];
      }

      // Save all data to localStorage
      localStorageManager.saveToLocalStorage("posts", posts);
      localStorageManager.saveToLocalStorage("users", users);
      localStorageManager.saveToLocalStorage("comments", comments);

      return { posts, users, comments };
    } catch (error) {
      console.log("Error loading data from API");
      return {
        posts: { posts: [] },
        users: { users: [] },
        comments: { comments: [] },
      };
    }
  }

  // Fetch any missing users
  async fetchMissingUsers(neededIds, existingUsers) {
    // Check which users we need to fetch
    const existingIds = existingUsers.map((user) => user.id);
    const missingIds = neededIds.filter((id) => !existingIds.includes(id));

    if (missingIds.length === 0) {
      return [];
    }

    const newUsers = [];

    // Fetch missing users
    for (const userId of missingIds) {
      try {
        const response = await fetch(`https://dummyjson.com/users/${userId}`);
        if (response.ok) {
          const user = await response.json();
          newUsers.push({
            id: user.id,
            username: user.username,
          });
        }
      } catch (error) {}
    }

    return newUsers;
  }
}

// Create and export a single instance of the API client
export const api = new ApiClient();

import { renderPosts, renderCreatePost } from "./render.js";
import { api } from "./api/apiClient.js";
import { localStorageManager } from "./storage/localStorageManager.js";

const mainSection = document.getElementById("main-section");
let postsData, usersData, commentsData;

// Update the create post button event listener
document.getElementById("create-post-button").addEventListener("click", () => {
  // Ensure postsData and postsData.posts exist
  if (postsData && postsData.posts) {
    // Extract unique tags from all posts
    const allTags = postsData.posts.flatMap((post) => post.tags);
    const uniqueTags = [...new Set(allTags)];
    // Call the renderCreatePost function with users and tags
    renderCreatePost(usersData, uniqueTags);
  } else {
    // Handle the case where there are no posts yet
    renderCreatePost(usersData, []);
  }
});

document.querySelector(".close-button").addEventListener("click", () => {
  document.getElementById("create-post-box").style.display = "none";
});

async function main() {
  try {
    // Get posts from localStorage or API
    postsData = localStorageManager.getFromLocalStorage("posts");

    if (Array.isArray(postsData)) {
      const postsArray = postsData;
      postsData = { posts: postsArray };
      localStorageManager.saveToLocalStorage("posts", postsData);
    }

    if (!postsData || !postsData.posts || !postsData.posts.length) {
      const response = await api.fetchPostsFromDummyJson();
      postsData = response; // Store the entire response object
      localStorageManager.saveToLocalStorage("posts", postsData);
    }

    // Get users from localStorage or API
    usersData = localStorageManager.getFromLocalStorage("users");
    if (!usersData.users || !usersData.users.length) {
      usersData = await api.fetchUsersFromDummyJson();
      localStorageManager.saveToLocalStorage("users", usersData);
    }

    // Get comments from localStorage or API
    commentsData = localStorageManager.getFromLocalStorage("comments");
    if (!commentsData.comments || !commentsData.comments.length) {
      commentsData = await api.fetchCommentsFromDummyJson();
      localStorageManager.saveToLocalStorage("comments", commentsData);
    }

    // Clear the main section
    mainSection.innerHTML = "";

    // Render posts with users and comments

    if (postsData && postsData.posts) {
      postsData.posts.forEach((post) => {
        const user = usersData.users.find((user) => user.id === post.userId);
        const postComments = commentsData.comments
          ? commentsData.comments.filter(
              (comment) => comment.postId === post.id
            )
          : [];
        renderPosts(post, user, postComments);
      });
    }
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();

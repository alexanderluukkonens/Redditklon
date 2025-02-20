import { renderPosts } from "./render.js";
import { api } from "./api/apiClient.js";
import { localStorageManager } from "./storage/localStorageManager.js";

const mainSection = document.getElementById("main-section");
const createPostButton = document.getElementById("create-post-button");

createPostButton.addEventListener("click", () => {
  toggleCreatePostContainer();
});

async function main() {
  try {
    let posts = localStorageManager.getFromLocalStorage("posts");

    if (!posts.length) {
      const response = await api.fetchPostsFromDummyJson();
      posts = response.posts;
      localStorageManager.saveToLocalStorage("posts", posts);
    }

    const users = await api.fetchUsersFromDummyJson();
    // const comments = await api.fetchCommentsFromDummyJson();
    // Clear the main section
    mainSection.innerHTML = "";

    // Render posts with users and comments
    posts.forEach((post) => {
      const user = users.users.find((user) => user.id === post.userId);
      // const postComments = comments.comments
      //   ? comments.comments.filter((comment) => comment.postId === post.id)
      //   : [];
      renderPosts(post, user);
    });
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();

import { api } from "../api/apiClient.js";
import { localStorageManager } from "../storage/localStorageManager.js";
import { renderPostPreview } from "../render/postRenderer.js";
import { renderCreatePostForm } from "../render/formRenderer.js";

export async function initMainPage() {
  try {
    setupEventListeners();

    const data = await loadData();

    setupMainSection();

    // Render all posts
    renderPosts(data.postsData, data.usersData, data.commentsData);
  } catch (error) {
    console.error("Error initializing main page:", error);
    displayError("Failed to initialize page. Please refresh and try again.");
  }
}

function setupEventListeners() {
  document
    .getElementById("create-post-button")
    .addEventListener("click", () => {
      const postsData = localStorageManager.getFromLocalStorage("posts");
      const usersData = localStorageManager.getFromLocalStorage("users");

      // Unique tags from all posts
      let uniqueTags = [];
      if (postsData && postsData.posts && postsData.posts.length) {
        const allTags = postsData.posts.flatMap((post) => post.tags);
        uniqueTags = [...new Set(allTags)];
      }

      renderCreatePostForm(usersData, uniqueTags);
    });
}

// Create click function to home page with logo-img
const redditLogo = document.getElementById("header-top-img");

if (redditLogo) {
  redditLogo.style.cursor = "pointer";

  redditLogo.addEventListener("click", () => {
    window.location.href = "/html";
  });
}

async function loadData() {
  // Get posts from localStorage or API
  let postsData = localStorageManager.getFromLocalStorage("posts");

  // Handle different data formats
  if (Array.isArray(postsData)) {
    const postsArray = postsData;
    postsData = { posts: postsArray };
    localStorageManager.saveToLocalStorage("posts", postsData);
  }

  // Fetch posts if they don't exist
  if (!postsData || !postsData.posts || !postsData.posts.length) {
    const response = await api.fetchPostsFromDummyJson();
    postsData = response;
    localStorageManager.saveToLocalStorage("posts", postsData);
  }

  // Get users from localStorage or API
  let usersData = localStorageManager.getFromLocalStorage("users");
  if (!usersData || !usersData.users || !usersData.users.length) {
    usersData = await api.fetchUsersFromDummyJson();
    localStorageManager.saveToLocalStorage("users", usersData);
  }

  // Get comments from localStorage or API
  let commentsData = localStorageManager.getFromLocalStorage("comments");
  if (
    !commentsData ||
    !commentsData.comments ||
    !commentsData.comments.length
  ) {
    commentsData = await api.fetchCommentsFromDummyJson();
    localStorageManager.saveToLocalStorage("comments", commentsData);
  }

  return { postsData, usersData, commentsData };
}

function setupMainSection() {
  const contentWrapper = document.querySelector(".content-wrapper");

  // Check if main section exists already
  let mainSection = document.getElementById("main-section");

  // Create it if it doesn't exist
  if (!mainSection) {
    mainSection = document.createElement("div");
    mainSection.id = "main-section";
    contentWrapper.appendChild(mainSection);
  } else {
    // Clear existing content if it does exist
    while (mainSection.firstChild) {
      mainSection.removeChild(mainSection.firstChild);
    }
  }
}

function renderPosts(postsData, usersData, commentsData) {
  const mainSection = document.getElementById("main-section");
  if (!mainSection) return;

  // Add a loading message
  const loadingMessage = document.createElement("div");
  loadingMessage.classList.add("loading-message");
  loadingMessage.textContent = "Loading posts...";
  mainSection.appendChild(loadingMessage);

  // Use setTimeout to allow the UI to update with the loading message
  setTimeout(() => {
    // Remove the loading message
    mainSection.removeChild(loadingMessage);

    // Render posts if they exist
    if (postsData && postsData.posts && postsData.posts.length > 0) {
      console.log(`Rendering ${postsData.posts.length} posts`);

      // Render each post
      postsData.posts.forEach((post) => {
        const user = usersData.users.find((user) => user.id === post.userId);
        renderPostPreview(post, user);
      });
    } else {
      // Show a message if no posts exist
      const noPostsMessage = document.createElement("div");
      noPostsMessage.textContent = "No posts yet. Create the first post!";
      noPostsMessage.style.color = "white";
      noPostsMessage.style.marginTop = "2rem";
      mainSection.appendChild(noPostsMessage);
    }

    // Add the right sidebar
    const rightBar = document.createElement("div");
    rightBar.classList.add("right-bar");
    mainSection.appendChild(rightBar);
  }, 100);
}

function displayError(message) {
  const mainSection = document.getElementById("main-section");
  if (!mainSection) return;

  const errorMessage = document.createElement("div");
  errorMessage.classList.add("error-message");
  errorMessage.textContent = message;
  errorMessage.style.padding = "20px";
  errorMessage.style.backgroundColor = "#ffeeee";
  errorMessage.style.border = "1px solid #ff6666";
  errorMessage.style.color = "black";
  errorMessage.style.borderRadius = "4px";
  errorMessage.style.margin = "20px";

  mainSection.appendChild(errorMessage);
}

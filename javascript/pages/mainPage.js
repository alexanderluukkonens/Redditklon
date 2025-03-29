import { api } from "../api/apiClient.js";
import { localStorageManager } from "../storage/localStorageManager.js";
import { renderPostPreview } from "../render/postRenderer.js";
import { renderCreatePostForm } from "../render/formRenderer.js";

export async function initMainPage() {
  try {
    // Set up event listeners
    setupEventListeners();

    // Show loading indicator
    const contentWrapper = document.querySelector(".content-wrapper");
    if (contentWrapper) {
      const loadingIndicator = document.createElement("div");
      loadingIndicator.id = "loading-indicator";
      loadingIndicator.textContent = "Loading content...";
      loadingIndicator.style.color = "white";
      loadingIndicator.style.textAlign = "center";
      loadingIndicator.style.padding = "20px";
      contentWrapper.appendChild(loadingIndicator);
    }

    // Load data
    const data = await loadData();

    // Remove loading indicator
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }

    // Setup main section
    setupMainSection();

    // Render posts
    renderPosts(data.postsData, data.usersData);
  } catch (error) {
    displayError("Failed to load content. Please refresh the page.");
  }
}

function setupEventListeners() {
  const createPostButton = document.getElementById("create-post-button");
  if (createPostButton) {
    createPostButton.addEventListener("click", () => {
      const postsData = localStorageManager.getFromLocalStorage("posts");
      const usersData = localStorageManager.getFromLocalStorage("users");

      // Get unique tags
      let uniqueTags = [];
      if (postsData && postsData.posts && postsData.posts.length) {
        const allTags = postsData.posts.flatMap((post) => post.tags || []);
        uniqueTags = [...new Set(allTags)];
      }

      renderCreatePostForm(usersData, uniqueTags);
    });
  }

  // Logo clickable
  const redditLogo = document.getElementById("header-top-img");
  if (redditLogo) {
    redditLogo.style.cursor = "pointer";
    redditLogo.addEventListener("click", () => {
      window.location.href = "/html";
    });
  }
}

async function loadData() {
  // Check if we have data in localStorage
  let postsData = localStorageManager.getFromLocalStorage("posts");
  let usersData = localStorageManager.getFromLocalStorage("users");
  let commentsData = localStorageManager.getFromLocalStorage("comments");

  // Fetch data if any is missing
  if (
    !postsData ||
    !postsData.posts ||
    !postsData.posts.length ||
    !usersData ||
    !usersData.users ||
    !usersData.users.length ||
    !commentsData ||
    !commentsData.comments
  ) {
    const fetchedData = await api.fetchAllData();

    postsData = fetchedData.posts;
    usersData = fetchedData.users;
    commentsData = fetchedData.comments;
  }

  return { postsData, usersData, commentsData };
}

function setupMainSection() {
  const contentWrapper = document.querySelector(".content-wrapper");

  // Check if main section exists
  let mainSection = document.getElementById("main-section");

  // Create or clear it
  if (!mainSection) {
    mainSection = document.createElement("div");
    mainSection.id = "main-section";
    contentWrapper.appendChild(mainSection);
  } else {
    mainSection.innerHTML = "";
  }
}

function renderPosts(postsData, usersData) {
  const mainSection = document.getElementById("main-section");
  if (!mainSection) return;

  // Add loading message
  const loadingMessage = document.createElement("div");
  loadingMessage.classList.add("loading-message");
  loadingMessage.textContent = "Loading posts...";
  mainSection.appendChild(loadingMessage);

  // Use setTimeout to let UI update
  setTimeout(() => {
    // Remove loading message
    mainSection.removeChild(loadingMessage);

    // Render posts if they exist
    if (postsData && postsData.posts && postsData.posts.length > 0) {
      console.log(`Rendering ${postsData.posts.length} posts`);

      // Render each post
      postsData.posts.forEach((post) => {
        const user = usersData.users.find((user) => user.id === post.userId);
        renderPostPreview(post, user || { username: "Unknown User" });
      });
    } else {
      // Show message if no posts
      const noPostsMessage = document.createElement("div");
      noPostsMessage.textContent = "No posts yet. Create the first post!";
      noPostsMessage.style.color = "white";
      noPostsMessage.style.marginTop = "2rem";
      mainSection.appendChild(noPostsMessage);
    }

    // Add right sidebar
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

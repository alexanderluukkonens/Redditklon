// pages/mainPage.js
import { api } from "../api/apiClient.js";
import { localStorageManager } from "../storage/localStorageManager.js";
import { renderPostPreview } from "../render/postRenderer.js";
import { renderCreatePostForm } from "../render/formRenderer.js";

export async function initMainPage() {
  try {
    setupEventListeners();

    // Show loading spinner/message while data is being fetched
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

    const data = await loadData();

    // Remove loading indicator
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }

    setupMainSection();

    // Render all posts
    renderPosts(data.postsData, data.usersData, data.commentsData);
  } catch (error) {
    console.error("Error initializing main page:", error);
    displayError("Failed to initialize page. Please refresh and try again.");
  }
}

function setupEventListeners() {
  const createPostButton = document.getElementById("create-post-button");
  if (createPostButton) {
    createPostButton.addEventListener("click", () => {
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
}

async function loadData() {
  // Check if we have valid data in localStorage
  let postsData = localStorageManager.getFromLocalStorage("posts");
  let usersData = localStorageManager.getFromLocalStorage("users");
  let commentsData = localStorageManager.getFromLocalStorage("comments");

  // Check if we have all necessary data
  const hasValidData =
    postsData &&
    postsData.posts &&
    postsData.posts.length &&
    usersData &&
    usersData.users &&
    usersData.users.length &&
    commentsData &&
    commentsData.comments &&
    commentsData.comments.length;

  // Check if we have users for all posts
  let allPostsHaveUsers = false;
  if (hasValidData) {
    const postUserIds = postsData.posts.map((post) => post.userId);
    const userIds = usersData.users.map((user) => user.id);
    allPostsHaveUsers = postUserIds.every((id) => userIds.includes(id));
  }

  // Fetch new data if any data is missing or posts don't have matching users
  if (!hasValidData || !allPostsHaveUsers) {
    console.log("Fetching all data...");
    const fetchedData = await api.fetchAllData();

    postsData = fetchedData.posts;
    usersData = fetchedData.users;
    commentsData = fetchedData.comments;
  } else {
    console.log("Using cached data from localStorage");

    // Handle different data formats if data exists
    if (Array.isArray(postsData)) {
      const postsArray = postsData;
      postsData = { posts: postsArray };
      localStorageManager.saveToLocalStorage("posts", postsData);
    }
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

      // Debug: Check if all posts have matching users
      postsData.posts.forEach((post) => {
        const user = usersData.users.find((user) => user.id === post.userId);
        if (!user) {
          console.warn(
            `No user found for post ID: ${post.id}, user ID: ${post.userId}`
          );
        }
      });

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

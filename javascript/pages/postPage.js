import { localStorageManager } from "../storage/localStorageManager.js";
import {
  renderPostDetails,
  displayErrorMessage,
} from "../render/postRenderer.js";
import { renderCommentForm } from "../render/formRenderer.js";
import { renderComments } from "../render/commentRenderer.js";
import { api } from "../api/apiClient.js";

export async function initPostPage() {
  // Get selected post ID
  const selectedPostId =
    localStorageManager.getFromLocalStorage("selectedPostId");

  // Set up back button
  const backHomeButton = document.getElementById("back-home-button");
  if (backHomeButton) {
    backHomeButton.addEventListener("click", () => {
      window.location.href = "/html";
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

  // Check if we have a post ID
  if (!selectedPostId) {
    displayErrorMessage("Post not found. Please go back to the home page.");
    return;
  }

  // Show loading
  const postSection = document.getElementById("post-section");
  if (postSection) {
    const loadingIndicator = document.createElement("div");
    loadingIndicator.id = "loading-indicator";
    loadingIndicator.textContent = "Loading post...";
    loadingIndicator.style.padding = "20px";
    loadingIndicator.style.textAlign = "center";
    postSection.appendChild(loadingIndicator);
  }

  try {
    // Load post data
    const data = await loadPostData(selectedPostId);

    // Remove loading
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }

    // Check if post was found
    if (!data.selectedPost) {
      displayErrorMessage("Post not found. Please go back to the home page.");
      return;
    }

    // Render post and comments
    renderPostContent(
      data.selectedPost,
      data.postAuthor,
      data.postComments,
      data.commentAuthors,
      data.usersData
    );
  } catch (error) {
    displayErrorMessage("An error occurred while loading the post.");
  }
}

async function loadPostData(postId) {
  // Get data from localStorage
  let postsData = localStorageManager.getFromLocalStorage("posts");
  let usersData = localStorageManager.getFromLocalStorage("users");
  let commentsData = localStorageManager.getFromLocalStorage("comments");

  // Fetch data if needed
  if (!postsData || !usersData || !commentsData) {
    const fetchedData = await api.fetchAllData();

    postsData = fetchedData.posts;
    usersData = fetchedData.users;
    commentsData = fetchedData.comments;
  }

  // Find the selected post
  let selectedPost = null;
  if (postsData && postsData.posts) {
    selectedPost = postsData.posts.find((post) => post.id == postId);
  } else if (Array.isArray(postsData)) {
    selectedPost = postsData.find((post) => post.id == postId);
  }

  if (!selectedPost) {
    return { selectedPost: null };
  }

  // Find post author
  let postAuthor = "Unknown User";
  if (usersData && usersData.users) {
    const author = usersData.users.find(
      (user) => user.id === selectedPost.userId
    );
    if (author) {
      postAuthor = author.username;
    }
  }

  // Find comments for this post
  let postComments = [];
  if (commentsData && commentsData.comments) {
    postComments = commentsData.comments.filter(
      (comment) => comment.postId == selectedPost.id
    );
  }

  // Map comment authors
  const commentAuthors = {};

  if (usersData && usersData.users && postComments.length > 0) {
    for (const comment of postComments) {
      const userId = comment.userId || (comment.user && comment.user.id);

      if (userId) {
        const author = usersData.users.find((user) => user.id === userId);
        if (author) {
          commentAuthors[comment.id] = author.username;
        } else {
          commentAuthors[comment.id] = "Unknown User";
        }
      } else {
        commentAuthors[comment.id] = "Unknown User";
      }
    }
  }

  return {
    selectedPost,
    postAuthor,
    postComments,
    commentAuthors,
    usersData,
  };
}

function renderPostContent(
  post,
  authorName,
  comments,
  commentAuthors,
  usersData
) {
  const postSection = document.getElementById("post-section");
  if (!postSection) return;

  // Render post details
  const postContainer = renderPostDetails(post, authorName);

  // Create comments section
  const commentsSection = document.createElement("div");
  commentsSection.classList.add("comments-section");

  // Render existing comments
  const commentsTitle = renderComments(
    comments,
    commentAuthors,
    commentsSection
  );

  // Render comment form
  const commentForm = renderCommentForm(
    post.id,
    usersData,
    commentsSection,
    commentsTitle
  );
  commentsSection.appendChild(commentForm);

  // Add comments section to post container
  postContainer.appendChild(commentsSection);
}

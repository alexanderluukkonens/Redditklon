// pages/postPage.js
import { localStorageManager } from "../storage/localStorageManager.js";
import {
  renderPostDetails,
  displayErrorMessage,
} from "../render/postRenderer.js";
import { renderCommentForm } from "../render/formRenderer.js";
import { renderComments } from "../render/commentRenderer.js";
import { api } from "../api/apiClient.js";

export async function initPostPage() {
  // Get the selected post ID from localStorage
  const selectedPostId =
    localStorageManager.getFromLocalStorage("selectedPostId");

  const backHomeButton = document.getElementById("back-home-button");
  if (backHomeButton) {
    backHomeButton.addEventListener("click", () => {
      window.location.href = "/html";
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

  if (!selectedPostId) {
    displayErrorMessage("Post not found. Please go back to the home page.");
    return;
  }

  // Show loading indicator
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
    const data = await loadPostData(selectedPostId);

    // Remove loading indicator
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
      loadingIndicator.remove();
    }

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
    console.error("Error loading post data:", error);
    displayErrorMessage("An error occurred while loading the post.");
  }
}

async function loadPostData(postId) {
  // Get data from localStorage
  let postsData = localStorageManager.getFromLocalStorage("posts");
  let usersData = localStorageManager.getFromLocalStorage("users");
  let commentsData = localStorageManager.getFromLocalStorage("comments");

  // Check if we need to fetch data
  const needsFetch =
    !postsData ||
    !postsData.posts ||
    !postsData.posts.length ||
    !usersData ||
    !usersData.users ||
    !usersData.users.length ||
    !commentsData ||
    !commentsData.comments ||
    !commentsData.comments.length;

  // If any data is missing, fetch all data
  if (needsFetch) {
    console.log("Fetching all data for post page...");
    const fetchedData = await api.fetchAllData();

    postsData = fetchedData.posts;
    usersData = fetchedData.users;
    commentsData = fetchedData.comments;
  }

  // Find the selected post
  let selectedPost = null;
  if (postsData && typeof postsData === "object" && postsData.posts) {
    selectedPost = postsData.posts.find((post) => post.id == postId);
  } else if (Array.isArray(postsData)) {
    selectedPost = postsData.find((post) => post.id == postId);
  }

  // Find post author
  let postAuthor = "Unknown User";
  if (usersData && usersData.users && selectedPost) {
    const author = usersData.users.find(
      (user) => user.id === selectedPost.userId
    );
    if (author) {
      postAuthor = author.username;
    } else {
      console.warn(`Post author not found for userId: ${selectedPost.userId}`);
    }
  }

  // Find comments for this post
  let postComments = [];
  if (commentsData && commentsData.comments && selectedPost) {
    postComments = commentsData.comments.filter(
      (comment) => comment.postId == selectedPost.id
    );
    console.log(`Found ${postComments.length} comments for post ${postId}`);
  }

  // Get comment authors
  const commentAuthors = {};
  if (usersData && usersData.users && postComments.length > 0) {
    for (const comment of postComments) {
      // Try to get userId from either direct property or user object
      const userId = comment.userId || (comment.user && comment.user.id);

      if (userId) {
        const author = usersData.users.find((user) => user.id === userId);
        if (author) {
          commentAuthors[comment.id] = author.username;
        } else {
          console.warn(`Comment author not found for userId: ${userId}`);
          commentAuthors[comment.id] = `User #${userId}`;
        }
      } else {
        console.warn(`No userId found for comment: ${comment.id}`);
        commentAuthors[comment.id] = "Unknown User";
      }
    }
  }

  // Check if all comment authors were found
  const missingAuthors = postComments.filter(
    (comment) => commentAuthors[comment.id] === "Unknown User"
  );

  if (missingAuthors.length > 0) {
    console.warn(`${missingAuthors.length} comments have unknown authors`);

    // Extract missing user IDs
    const missingUserIds = missingAuthors
      .map((comment) => comment.userId || (comment.user && comment.user.id))
      .filter((id) => id); // Filter out undefined/null

    if (missingUserIds.length > 0) {
      console.log("Attempting to fetch missing comment author users...");

      // Fetch missing users
      const missingUsers = await api.fetchSpecificUsers(missingUserIds);

      // Add them to our existing users
      if (missingUsers && missingUsers.users && missingUsers.users.length > 0) {
        usersData.users = [...usersData.users, ...missingUsers.users];
        localStorageManager.saveToLocalStorage("users", usersData);

        // Update comment authors
        for (const comment of missingAuthors) {
          const userId = comment.userId || (comment.user && comment.user.id);
          if (userId) {
            const author = missingUsers.users.find(
              (user) => user.id === userId
            );
            if (author) {
              commentAuthors[comment.id] = author.username;
            }
          }
        }
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

  // Render the post details
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

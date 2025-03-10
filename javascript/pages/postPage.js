// postPage.js - Post detail page functionality

import { localStorageManager } from "../storage/localStorageManager.js";
import {
  renderPostDetails,
  displayErrorMessage,
} from "../render/postRenderer.js";
import { renderCommentForm } from "../render/formRenderer.js";
import { renderComments } from "../render/commentRenderer.js";

/**
 * Initialize the post detail page
 */
export function initPostPage() {
  // Get the selected post ID from localStorage
  const selectedPostId =
    localStorageManager.getFromLocalStorage("selectedPostId");

  const backHomeButton = document.getElementById("back-home-button");
  if (backHomeButton) {
    backHomeButton.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  if (!selectedPostId) {
    displayErrorMessage("Post not found. Please go back to the home page.");
    return;
  }

  try {
    // Load post data
    const data = loadPostData(selectedPostId);

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

function loadPostData(postId) {
  // Get data from localStorage
  const postsData = localStorageManager.getFromLocalStorage("posts");
  const usersData = localStorageManager.getFromLocalStorage("users");
  const commentsData = localStorageManager.getFromLocalStorage("comments");

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
    }
  }

  // Find comments for this post
  let postComments = [];
  if (commentsData && commentsData.comments && selectedPost) {
    postComments = commentsData.comments.filter(
      (comment) => comment.postId == selectedPost.id
    );
  }

  // Get comment authors
  const commentAuthors = {};
  if (usersData && usersData.users && postComments.length > 0) {
    for (const comment of postComments) {
      const userId = comment.userId || comment.user?.id;
      if (userId) {
        const author = usersData.users.find((user) => user.id === userId);
        commentAuthors[comment.id] = author ? author.username : "Unknown User";
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

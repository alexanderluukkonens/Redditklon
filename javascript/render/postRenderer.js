// postRenderer.js - Handles rendering of posts in the UI

import { localStorageManager } from "../storage/localStorageManager.js";

export function renderPostPreview(post, user) {
  // Get the main section where posts will be displayed
  const mainSection = document.getElementById("main-section");
  if (!mainSection) {
    console.log("Main section not found");
    return;
  }

  // Create post container
  const postContainer = document.createElement("div");
  postContainer.classList.add("main-section-posts");

  // Make the post clickable to navigate to the detail page
  postContainer.style.cursor = "pointer";
  postContainer.addEventListener("click", () => {
    // Store post ID in localStorage for the detail page to retrieve
    localStorageManager.saveToLocalStorage("selectedPostId", post.id);
    // Navigate to post detail page
    window.location.href = "post.html";
  });

  // Add post to the main section
  mainSection.appendChild(postContainer);

  // Create and add post title
  const postTitleElement = document.createElement("header");
  postTitleElement.classList.add("main-section-title");
  postTitleElement.innerText = post.title;
  postContainer.appendChild(postTitleElement);

  // Create and add post body (truncated if necessary)
  const postBodyElement = document.createElement("section");
  postBodyElement.classList.add("main-section-body");
  // Truncate post body if it's longer than 60 characters
  postBodyElement.innerText =
    post.body.length > 60 ? post.body.substring(0, 57) + "..." : post.body;
  postContainer.appendChild(postBodyElement);

  // Create and add post tags
  const postTagsElement = document.createElement("p");
  postTagsElement.classList.add("main-section-tags");
  postTagsElement.innerText = `#${post.tags.join(" #")}`;
  postContainer.appendChild(postTagsElement);

  // Create and add post author
  const postUserNameElement = document.createElement("div");
  postUserNameElement.classList.add("main-section-user");
  postUserNameElement.innerText = `Posted by: ${
    user ? user.username : "Unknown User"
  }`;
  postContainer.appendChild(postUserNameElement);
}

export function renderPostDetails(post, authorName) {
  const postSection = document.getElementById("post-section");
  if (!postSection) {
    console.log("Post section not found");
    return;
  }

  // Create post container
  const postContainer = document.createElement("div");
  postContainer.classList.add("post-container");

  // Add post title
  const postTitle = document.createElement("h1");
  postTitle.classList.add("post-title");
  postTitle.textContent = post.title;
  postContainer.appendChild(postTitle);

  // Add full post body
  const postBody = document.createElement("div");
  postBody.classList.add("post-body");
  postBody.textContent = post.body;
  postContainer.appendChild(postBody);

  // Add tags
  const postTags = document.createElement("div");
  postTags.classList.add("post-tags");
  postTags.textContent = `#${post.tags.join(" #")}`;
  postContainer.appendChild(postTags);

  // Add post details (author and reactions)
  const postDetails = document.createElement("div");
  postDetails.classList.add("post-details");

  // Add author information
  const postUser = document.createElement("div");
  postUser.classList.add("post-user");
  postUser.textContent = `Posted by: ${authorName}`;
  postDetails.appendChild(postUser);

  // Initialize reactions object if not present
  if (!post.reactions || typeof post.reactions !== "object") {
    post.reactions = { likes: 0, dislikes: 0 };
  } else if (!("likes" in post.reactions) || !("dislikes" in post.reactions)) {
    const totalReactions =
      typeof post.reactions === "number" ? post.reactions : 0;
    post.reactions = { likes: totalReactions, dislikes: 0 };
  }

  // Create reaction buttons container
  const reactionsContainer = document.createElement("div");
  reactionsContainer.classList.add("reactions-container");

  // Create like button
  const likeButton = document.createElement("button");
  likeButton.classList.add("reaction-button", "like-button");
  likeButton.innerHTML =
    "👍 <span class='likes-count'>" + post.reactions.likes + "</span>";
  likeButton.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevent event bubbling
    post.reactions.likes++;
    updatePostReactionsInLocalStorage(post);
    document.querySelector(".likes-count").textContent = post.reactions.likes;
  });

  // Create dislike button
  const dislikeButton = document.createElement("button");
  dislikeButton.classList.add("reaction-button", "dislike-button");
  dislikeButton.innerHTML =
    "👎 <span class='dislikes-count'>" + post.reactions.dislikes + "</span>";
  dislikeButton.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevent event bubbling
    post.reactions.dislikes++;
    updatePostReactionsInLocalStorage(post);
    document.querySelector(".dislikes-count").textContent =
      post.reactions.dislikes;
  });

  // Add buttons to container
  reactionsContainer.appendChild(likeButton);
  reactionsContainer.appendChild(dislikeButton);
  postDetails.appendChild(reactionsContainer);

  // Add details to the post container
  postContainer.appendChild(postDetails);

  // Append the post container to the post section
  postSection.appendChild(postContainer);

  return postContainer;
}

function updatePostReactionsInLocalStorage(updatedPost) {
  // Get current posts from localStorage
  let postsData = localStorageManager.getFromLocalStorage("posts");

  if (!postsData) {
    console.log("No posts data found in localStorage");
    return;
  }

  // Update the post's reactions
  if (typeof postsData === "object" && postsData.posts) {
    const postIndex = postsData.posts.findIndex(
      (post) => post.id == updatedPost.id
    );
    if (postIndex !== -1) {
      postsData.posts[postIndex].reactions = updatedPost.reactions;
    }
  } else if (Array.isArray(postsData)) {
    const postIndex = postsData.findIndex((post) => post.id == updatedPost.id);
    if (postIndex !== -1) {
      postsData[postIndex].reactions = updatedPost.reactions;
    }
  }

  // Save updated posts back to localStorage
  localStorageManager.saveToLocalStorage("posts", postsData);
}

export function displayErrorMessage(message) {
  const postSection = document.getElementById("post-section");
  if (!postSection) return;

  const errorContainer = document.createElement("div");
  errorContainer.style.padding = "20px";
  errorContainer.style.backgroundColor = "#ffeeee";
  errorContainer.style.border = "1px solid #ff6666";
  errorContainer.style.borderRadius = "4px";
  errorContainer.style.margin = "20px";
  errorContainer.style.textAlign = "center";

  const errorMessage = document.createElement("p");
  errorMessage.textContent = message;
  errorContainer.appendChild(errorMessage);

  const backButton = document.createElement("button");
  backButton.classList.add("back-button");
  backButton.style.marginTop = "20px";
  backButton.textContent = "Back to Home";
  backButton.addEventListener("click", () => {
    window.location.href = "/";
  });
  errorContainer.appendChild(backButton);

  postSection.appendChild(errorContainer);
}

import { localStorageManager } from "../storage/localStorageManager.js";

export function renderPostPreview(post, user) {
  // Get the main section
  const mainSection = document.getElementById("main-section");
  if (!mainSection) return;

  // Create post container
  const postContainer = document.createElement("div");
  postContainer.classList.add("main-section-posts");

  // Navigate to detail page when clicked
  postContainer.style.cursor = "pointer";
  postContainer.addEventListener("click", () => {
    localStorageManager.saveToLocalStorage("selectedPostId", post.id);
    window.location.href = "post.html";
  });

  // Add post to main section
  mainSection.appendChild(postContainer);

  // Create post title
  const postTitle = document.createElement("header");
  postTitle.classList.add("main-section-title");
  postTitle.innerText = post.title;
  postContainer.appendChild(postTitle);

  // Create post body, limit 60
  const postBody = document.createElement("section");
  postBody.classList.add("main-section-body");
  postBody.innerText =
    post.body.length > 60 ? post.body.substring(0, 57) + "..." : post.body;
  postContainer.appendChild(postBody);

  // Create post tags
  const postTags = document.createElement("p");
  postTags.classList.add("main-section-tags");
  postTags.innerText = post.tags ? `#${post.tags.join(" #")}` : "";
  postContainer.appendChild(postTags);

  // Create post author
  const postUser = document.createElement("div");
  postUser.classList.add("main-section-user");
  postUser.innerText = `Posted by: ${user ? user.username : "Unknown User"}`;
  postContainer.appendChild(postUser);
}

export function renderPostDetails(post, authorName) {
  const postSection = document.getElementById("post-section");
  if (!postSection) return;

  // Create post container
  const postContainer = document.createElement("div");
  postContainer.classList.add("post-container");

  // Create post title
  const postTitle = document.createElement("h1");
  postTitle.classList.add("post-title");
  postTitle.textContent = post.title;
  postContainer.appendChild(postTitle);

  // Create post body
  const postBody = document.createElement("div");
  postBody.classList.add("post-body");
  postBody.textContent = post.body;
  postContainer.appendChild(postBody);

  // Create post tags
  const postTags = document.createElement("div");
  postTags.classList.add("post-tags");
  postTags.textContent = post.tags ? `#${post.tags.join(" #")}` : "";
  postContainer.appendChild(postTags);

  // Create post details section
  const postDetails = document.createElement("div");
  postDetails.classList.add("post-details");

  // Create author information
  const postUser = document.createElement("div");
  postUser.classList.add("post-user");
  postUser.textContent = `Posted by: ${authorName}`;
  postDetails.appendChild(postUser);

  // Initialize reactions if needed
  if (!post.reactions || typeof post.reactions !== "object") {
    post.reactions = { likes: 0, dislikes: 0 };
  }

  // Create reactions container
  const reactionsContainer = document.createElement("div");
  reactionsContainer.classList.add("reactions-container");

  // Create like button
  const likeButton = document.createElement("button");
  likeButton.classList.add("reaction-button", "like-button");
  likeButton.innerHTML = `👍 <span class='likes-count'>${
    post.reactions.likes || 0
  }</span>`;
  likeButton.addEventListener("click", function (e) {
    e.stopPropagation();
    post.reactions.likes = (post.reactions.likes || 0) + 1;
    updatePostReactionsInLocalStorage(post);
    likeButton.querySelector(".likes-count").textContent = post.reactions.likes;
  });

  // Create dislike button
  const dislikeButton = document.createElement("button");
  dislikeButton.classList.add("reaction-button", "dislike-button");
  dislikeButton.innerHTML = `👎 <span class='dislikes-count'>${
    post.reactions.dislikes || 0
  }</span>`;
  dislikeButton.addEventListener("click", function (e) {
    e.stopPropagation();
    post.reactions.dislikes = (post.reactions.dislikes || 0) + 1;
    updatePostReactionsInLocalStorage(post);
    dislikeButton.querySelector(".dislikes-count").textContent =
      post.reactions.dislikes;
  });

  // Add buttons to container
  reactionsContainer.appendChild(likeButton);
  reactionsContainer.appendChild(dislikeButton);
  postDetails.appendChild(reactionsContainer);

  // Add details to post container
  postContainer.appendChild(postDetails);

  // Add post container to page
  postSection.appendChild(postContainer);

  return postContainer;
}

function updatePostReactionsInLocalStorage(updatedPost) {
  // Get posts from localStorage
  let postsData = localStorageManager.getFromLocalStorage("posts");
  if (!postsData) return;

  // Update reactions
  if (postsData.posts) {
    const postIndex = postsData.posts.findIndex(
      (post) => post.id == updatedPost.id
    );
    if (postIndex !== -1) {
      postsData.posts[postIndex].reactions = updatedPost.reactions;
      localStorageManager.saveToLocalStorage("posts", postsData);
    }
  }
}

export function displayErrorMessage(message) {
  const postSection = document.getElementById("post-section");
  if (!postSection) return;

  // Create error container
  const errorContainer = document.createElement("div");
  errorContainer.style.padding = "20px";
  errorContainer.style.backgroundColor = "#ffeeee";
  errorContainer.style.border = "1px solid #ff6666";
  errorContainer.style.borderRadius = "4px";
  errorContainer.style.margin = "20px";
  errorContainer.style.textAlign = "center";

  // Add error message
  const errorMessage = document.createElement("p");
  errorMessage.textContent = message;
  errorContainer.appendChild(errorMessage);

  // Add back button
  const backButton = document.createElement("button");
  backButton.textContent = "Back to Home";
  backButton.style.marginTop = "20px";
  backButton.addEventListener("click", () => {
    window.location.href = "/";
  });
  errorContainer.appendChild(backButton);

  // Add to page
  postSection.appendChild(errorContainer);
}

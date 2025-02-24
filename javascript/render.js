import { localStorageManager } from "./storage/localStorageManager.js";

export function renderPosts(post, user, comments) {
  const mainSection = document.getElementById("main-section");
  const postContainer = document.createElement("div");
  postContainer.classList.add("main-section-posts");
  mainSection.appendChild(postContainer);

  const postTitleElement = document.createElement("header");
  postTitleElement.classList.add("main-section-title");
  postTitleElement.innerText = post.title;
  postContainer.appendChild(postTitleElement);

  const postBodyElement = document.createElement("section");
  postBodyElement.classList.add("main-section-body");
  postBodyElement.innerText =
    post.body.length > 60 ? post.body.substring(0, 57) + "..." : post.body;
  postContainer.appendChild(postBodyElement);

  const postTagsElement = document.createElement("p");
  postTagsElement.classList.add("main-section-tags");
  postTagsElement.innerText = `#${post.tags.join(" #")}`;
  postContainer.appendChild(postTagsElement);

  const postUserNameElement = document.createElement("div");
  postUserNameElement.classList.add("main-section-user");
  postUserNameElement.innerText = `Posted by: ${
    user ? user.username : "Unknown User"
  }`;
  postContainer.appendChild(postUserNameElement);

  if (comments && comments.length > 0) {
    const commentsContainer = document.createElement("div");
    commentsContainer.classList.add("post-comments");
    comments.forEach((comment) => {
      const commentElement = document.createElement("div");
      commentElement.classList.add("comment");
      commentElement.innerText = comment.body;
      commentsContainer.appendChild(commentElement);
    });
    postContainer.appendChild(commentsContainer);
  }
}

export function renderCreatePost(users, tags) {
  // Get the create post box elements
  const createPostBox = document.getElementById("create-post-box");
  const titleInput = document.getElementById("input-title");
  const bodyInput = document.getElementById("input-body");
  const tagsSelect = document.getElementById("select-tags");
  const userSelect = document.getElementById("select-user");
  const submitButton = document.querySelector(".submit-post-button");

  // Remove any existing click event listeners by replacing the onclick property
  submitButton.onclick = null;

  // Clear existing options
  tagsSelect.innerHTML = '<option value="">Choose tags</option>';
  userSelect.innerHTML = '<option value="">Choose User</option>';

  // Populate tags dropdown
  if (tags && tags.length) {
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagsSelect.appendChild(option);
    });
  }

  // Populate users dropdown
  if (users && users.users && users.users.length) {
    users.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.username;
      userSelect.appendChild(option);
    });
  }

  // Clear form inputs
  titleInput.value = "";
  bodyInput.value = "";

  // Add event listener for form submission using the onclick property instead of addEventListener
  submitButton.onclick = function () {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    const selectedTagIndex = tagsSelect.selectedIndex;
    const selectedUserIndex = userSelect.selectedIndex;

    if (!title || !body || selectedTagIndex === 0 || selectedUserIndex === 0) {
      alert("Please fill in all fields");
      return;
    }

    const tag = tagsSelect.options[selectedTagIndex].value;
    const userId = parseInt(userSelect.options[selectedUserIndex].value);

    // Create new post object
    const newPost = {
      id: Date.now(), // Using timestamp as a simple ID
      title: title,
      body: body,
      tags: [tag],
      userId: userId,
      reactions: 0,
      views: 0,
    };

    // Get existing posts from localStorage
    let postsData = localStorageManager.getFromLocalStorage("posts");

    if (!postsData) {
      postsData = { posts: [] };
    } else if (Array.isArray(postsData)) {
      postsData = { posts: postsData };
    } else if (!postsData.posts) {
      postsData.posts = [];
    }

    postsData.posts.unshift(newPost);

    // Save updated posts to localStorage
    localStorageManager.saveToLocalStorage("posts", postsData);

    // Hide the create post form
    createPostBox.style.display = "none";

    // Refresh the page to show the new post
    location.reload();
  };

  // Show the create post box
  createPostBox.style.display = "flex";
}

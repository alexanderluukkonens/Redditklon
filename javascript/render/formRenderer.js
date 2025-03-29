import { localStorageManager } from "../storage/localStorageManager.js";

export function renderCreatePostForm(users, tags) {
  // Get the page wrapper
  const pageWrapper = document.getElementById("page-wrapper");
  if (!pageWrapper) return;

  // Remove existing form if needed
  let existingForm = document.getElementById("create-post-box");
  if (existingForm) {
    existingForm.remove();
  }

  // Create form container
  const createPostBox = document.createElement("div");
  createPostBox.id = "create-post-box";
  createPostBox.style.display = "flex";

  // Create header
  const formHeader = document.createElement("header");
  formHeader.classList.add("create-post-header");
  formHeader.innerText = "Create Post";
  createPostBox.appendChild(formHeader);

  // Create title input
  const titleContainer = document.createElement("div");
  titleContainer.classList.add("create-post-input-title");

  const titleInput = document.createElement("input");
  titleInput.id = "input-title";
  titleInput.type = "text";
  titleInput.placeholder = "Write your title..";

  titleContainer.appendChild(titleInput);
  createPostBox.appendChild(titleContainer);

  // Create body input
  const bodyContainer = document.createElement("div");
  bodyContainer.classList.add("create-post-input-body");

  const bodyInput = document.createElement("textarea");
  bodyInput.id = "input-body";
  bodyInput.placeholder = "Whats on your mind?";

  bodyContainer.appendChild(bodyInput);
  createPostBox.appendChild(bodyContainer);

  // Create tags container with selected tags functionality
  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("create-post-tags-container");

  const tagsWrapper = document.createElement("div");
  tagsWrapper.classList.add("tags-selection-wrapper");

  const tagsSelect = document.createElement("select");
  tagsSelect.id = "select-tags";

  // Default option
  const defaultTagOption = document.createElement("option");
  defaultTagOption.value = "";
  defaultTagOption.innerText = "Choose tags";
  tagsSelect.appendChild(defaultTagOption);

  // Add tag options
  if (tags && tags.length) {
    tags.forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagsSelect.appendChild(option);
    });
  }

  const selectedTagsDisplay = document.createElement("div");
  selectedTagsDisplay.classList.add("selected-tags-display");

  tagsWrapper.appendChild(tagsSelect);
  tagsWrapper.appendChild(selectedTagsDisplay);
  tagsContainer.appendChild(tagsWrapper);
  createPostBox.appendChild(tagsContainer);

  // Store selected tags
  const selectedTags = [];

  // Handle tag selection
  tagsSelect.addEventListener("change", function () {
    const selectedValue = this.value;
    if (!selectedValue) return;

    // Skip if already selected
    if (selectedTags.includes(selectedValue)) {
      this.selectedIndex = 0;
      return;
    }

    // Add tag to array
    selectedTags.push(selectedValue);

    // Create tag pill
    const tagPill = document.createElement("div");
    tagPill.classList.add("tag-pill");
    tagPill.innerHTML = `${selectedValue} <span class="remove-tag">×</span>`;

    // Add remove functionality
    tagPill.querySelector(".remove-tag").addEventListener("click", function () {
      const index = selectedTags.indexOf(selectedValue);
      if (index !== -1) {
        selectedTags.splice(index, 1);
      }
      selectedTagsDisplay.removeChild(tagPill);
    });

    // Add pill to display
    selectedTagsDisplay.appendChild(tagPill);

    // Reset dropdown
    this.selectedIndex = 0;
  });

  // Create user select
  const userContainer = document.createElement("div");
  userContainer.classList.add("create-post-select-user");

  const userSelect = document.createElement("select");
  userSelect.id = "select-user";

  // Default option
  const defaultUserOption = document.createElement("option");
  defaultUserOption.value = "";
  defaultUserOption.innerText = "Choose User";
  userSelect.appendChild(defaultUserOption);

  // Add user options
  if (users && users.users && users.users.length) {
    users.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.username;
      userSelect.appendChild(option);
    });
  }

  userContainer.appendChild(userSelect);
  createPostBox.appendChild(userContainer);

  // Create close button
  const closeButton = document.createElement("button");
  closeButton.classList.add("close-button");
  closeButton.innerText = "Close [X]";
  closeButton.onclick = function () {
    createPostBox.style.display = "none";
  };
  createPostBox.appendChild(closeButton);

  // Create submit button
  const submitButton = document.createElement("button");
  submitButton.classList.add("submit-post-button");
  submitButton.innerText = "Submit Post";

  // Handle form submission
  submitButton.onclick = function () {
    // Get form values
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    const userId = userSelect.value;

    // Validate form
    if (!title || !body || selectedTags.length === 0 || !userId) {
      alert("Please fill in all fields and select at least one tag");
      return;
    }

    // Create post object
    const newPost = {
      id: Date.now(),
      title: title,
      body: body,
      tags: selectedTags,
      userId: parseInt(userId),
      reactions: { likes: 0, dislikes: 0 },
    };

    // Save post
    saveNewPost(newPost);

    // Hide form and refresh
    createPostBox.style.display = "none";
    location.reload();
  };

  createPostBox.appendChild(submitButton);

  // Add to page
  pageWrapper.appendChild(createPostBox);
}

function saveNewPost(newPost) {
  // Get existing posts
  let postsData = localStorageManager.getFromLocalStorage("posts");

  // Initialize if needed
  if (!postsData) {
    postsData = { posts: [] };
  } else if (Array.isArray(postsData)) {
    postsData = { posts: postsData };
  } else if (!postsData.posts) {
    postsData.posts = [];
  }

  // Add new post to beginning
  postsData.posts.unshift(newPost);

  // Save to localStorage
  localStorageManager.saveToLocalStorage("posts", postsData);
}

export function renderCommentForm(
  postId,
  usersData,
  commentsSection,
  commentsTitle
) {
  // Create form container
  const commentForm = document.createElement("div");
  commentForm.classList.add("comment-form");

  // Add form title
  const formTitle = document.createElement("h3");
  formTitle.textContent = "Add a Comment";
  commentForm.appendChild(formTitle);

  // Create user select
  const userContainer = document.createElement("div");
  userContainer.classList.add("comment-user-select-container");

  const userLabel = document.createElement("label");
  userLabel.textContent = "Comment as:";
  userLabel.setAttribute("for", "comment-user-select");
  userContainer.appendChild(userLabel);

  const userSelect = document.createElement("select");
  userSelect.id = "comment-user-select";
  userSelect.classList.add("comment-user-select");

  // Default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose User";
  userSelect.appendChild(defaultOption);

  // Add user options
  if (usersData && usersData.users && usersData.users.length) {
    usersData.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.username;
      userSelect.appendChild(option);
    });
  }

  userContainer.appendChild(userSelect);
  commentForm.appendChild(userContainer);

  // Create textarea
  const textContainer = document.createElement("div");
  textContainer.classList.add("comment-text-container");

  const textarea = document.createElement("textarea");
  textarea.id = "comment-textarea";
  textarea.classList.add("comment-textarea");
  textarea.placeholder = "Write your comment here...";

  textContainer.appendChild(textarea);
  commentForm.appendChild(textContainer);

  // Create submit button
  const submitButton = document.createElement("button");
  submitButton.classList.add("comment-submit-button");
  submitButton.textContent = "Submit Comment";

  // Handle submission
  submitButton.addEventListener("click", function () {
    const commentText = textarea.value.trim();
    const userId = Number(userSelect.value);

    if (!commentText || !userId) {
      alert("Please select a user and write a comment.");
      return;
    }

    // Import commentRenderer and add the comment
    import("./commentRenderer.js").then(({ addNewComment }) => {
      addNewComment(
        postId,
        commentText,
        userId,
        commentsSection,
        commentsTitle
      );

      // Clear form
      textarea.value = "";
      userSelect.selectedIndex = 0;
    });
  });

  commentForm.appendChild(submitButton);

  return commentForm;
}

import { localStorageManager } from "../storage/localStorageManager.js";

export function renderCreatePostForm(users, tags) {
  // Get the page wrapper
  const pageWrapper = document.getElementById("page-wrapper");
  if (!pageWrapper) {
    console.log("Page wrapper not found");
    return;
  }

  // Check if the create post box already exists, remove it if it does
  let existingCreatePostBox = document.getElementById("create-post-box");
  if (existingCreatePostBox) {
    existingCreatePostBox.remove();
  }

  // Create the post box container
  const createPostBox = document.createElement("div");
  createPostBox.id = "create-post-box";
  createPostBox.style.display = "flex";

  // Create header
  const createPostHeader = document.createElement("header");
  createPostHeader.classList.add("create-post-header");
  createPostHeader.innerText = "Create Post";
  createPostBox.appendChild(createPostHeader);

  // Create title input container and input
  const titleInputContainer = document.createElement("div");
  titleInputContainer.classList.add("create-post-input-title");

  const titleInput = document.createElement("input");
  titleInput.id = "input-title";
  titleInput.type = "text";
  titleInput.placeholder = "Write your title..";

  titleInputContainer.appendChild(titleInput);
  createPostBox.appendChild(titleInputContainer);

  // Create body input container and textarea
  const bodyInputContainer = document.createElement("div");
  bodyInputContainer.classList.add("create-post-input-body");

  const bodyInput = document.createElement("textarea");
  bodyInput.id = "input-body";
  bodyInput.placeholder = "Whats on your mind?";

  bodyInputContainer.appendChild(bodyInput);
  createPostBox.appendChild(bodyInputContainer);

  // Create tags select container with tag display area
  const tagsContainer = document.createElement("div");
  tagsContainer.classList.add("create-post-tags-container");

  // Create dropdown and selected tags area wrapper
  const tagsSelectionWrapper = document.createElement("div");
  tagsSelectionWrapper.classList.add("tags-selection-wrapper");

  // Create dropdown for tags
  const tagsSelect = document.createElement("select");
  tagsSelect.id = "select-tags";
  tagsSelect.placeholder = "Choose tags";

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

  // Create selected tags display area
  const selectedTagsDisplay = document.createElement("div");
  selectedTagsDisplay.classList.add("selected-tags-display");

  // Add dropdown and selected tags area to the wrapper
  tagsSelectionWrapper.appendChild(tagsSelect);
  tagsSelectionWrapper.appendChild(selectedTagsDisplay);

  // Store selected tags array (hidden from UI but used when creating post)
  const selectedTags = [];

  // Add event listener to dropdown to add selected tags
  tagsSelect.addEventListener("change", function () {
    const selectedValue = this.value;
    const selectedIndex = this.selectedIndex;

    // Skip if default option is selected
    if (selectedIndex === 0 || selectedValue === "") {
      return;
    }

    // Check if tag is already selected
    if (selectedTags.includes(selectedValue)) {
      // Reset dropdown to default option
      this.selectedIndex = 0;
      return;
    }

    // Add tag to the selected tags array
    selectedTags.push(selectedValue);

    // Create tag pill
    const tagPill = document.createElement("div");
    tagPill.classList.add("tag-pill");
    tagPill.innerHTML = `${selectedValue} <span class="remove-tag">×</span>`;

    // Add remove functionality
    tagPill.querySelector(".remove-tag").addEventListener("click", function () {
      // Remove tag from array
      const tagIndex = selectedTags.indexOf(selectedValue);
      if (tagIndex !== -1) {
        selectedTags.splice(tagIndex, 1);
      }

      // Remove pill from display
      selectedTagsDisplay.removeChild(tagPill);
    });

    // Add pill to display area
    selectedTagsDisplay.appendChild(tagPill);

    // Reset dropdown to default option
    this.selectedIndex = 0;
  });

  tagsContainer.appendChild(tagsSelectionWrapper);
  createPostBox.appendChild(tagsContainer);

  // Create user select container and select
  const userSelectContainer = document.createElement("div");
  userSelectContainer.classList.add("create-post-select-user");

  const userSelect = document.createElement("select");
  userSelect.id = "select-user";
  userSelect.placeholder = "Choose User";

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

  userSelectContainer.appendChild(userSelect);
  createPostBox.appendChild(userSelectContainer);

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

  // Add event listener for form
  submitButton.onclick = function () {
    // Get form values
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    const selectedUserIndex = userSelect.selectedIndex;

    // Validate form
    if (
      !title ||
      !body ||
      selectedTags.length === 0 ||
      selectedUserIndex === 0
    ) {
      alert("Please fill in all fields and select at least one tag");
      return;
    }

    // Get selected user ID
    const userId = parseInt(userSelect.options[selectedUserIndex].value);

    // Create new post object
    const newPost = {
      id: Date.now(),
      title: title,
      body: body,
      tags: selectedTags,
      userId: userId,
      reactions: { likes: 0, dislikes: 0 },
      views: 0,
    };

    // Save post to localStorage
    saveNewPost(newPost);

    // Hide the create post form
    createPostBox.style.display = "none";

    // Refresh the page to show the new post
    location.reload();
  };

  createPostBox.appendChild(submitButton);

  // Append the create post box to the page wrapper
  pageWrapper.appendChild(createPostBox);
}

function saveNewPost(newPost) {
  // Get existing posts from localStorage
  let postsData = localStorageManager.getFromLocalStorage("posts");

  // Initialize postsData if it doesn't exist or is in the wrong format
  if (!postsData) {
    postsData = { posts: [] };
  } else if (Array.isArray(postsData)) {
    postsData = { posts: postsData };
  } else if (!postsData.posts) {
    postsData.posts = [];
  }

  // Add the new post to the beginning of the posts array
  postsData.posts.unshift(newPost);

  // Save updated posts to localStorage
  localStorageManager.saveToLocalStorage("posts", postsData);
}

export function renderCommentForm(
  postId,
  usersData,
  commentsSection,
  commentsTitle
) {
  // Create comment form container
  const commentForm = document.createElement("div");
  commentForm.classList.add("comment-form");

  // Add form title
  const commentTitle = document.createElement("h3");
  commentTitle.textContent = "Add a Comment";
  commentForm.appendChild(commentTitle);

  // Create user select element
  const userSelectContainer = document.createElement("div");
  userSelectContainer.classList.add("comment-user-select-container");

  const userSelectLabel = document.createElement("label");
  userSelectLabel.textContent = "Comment as:";
  userSelectLabel.setAttribute("for", "comment-user-select");
  userSelectContainer.appendChild(userSelectLabel);

  const userSelect = document.createElement("select");
  userSelect.id = "comment-user-select";
  userSelect.classList.add("comment-user-select");

  // Default option
  const defaultUserOption = document.createElement("option");
  defaultUserOption.value = "";
  defaultUserOption.textContent = "Choose User";
  userSelect.appendChild(defaultUserOption);

  // Add user options
  if (usersData && usersData.users && usersData.users.length) {
    usersData.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.username;
      userSelect.appendChild(option);
    });
  }

  userSelectContainer.appendChild(userSelect);
  commentForm.appendChild(userSelectContainer);

  // Create textarea for comment
  const commentTextContainer = document.createElement("div");
  commentTextContainer.classList.add("comment-text-container");

  const commentTextarea = document.createElement("textarea");
  commentTextarea.id = "comment-textarea";
  commentTextarea.classList.add("comment-textarea");
  commentTextarea.placeholder = "Write your comment here...";
  commentTextContainer.appendChild(commentTextarea);
  commentForm.appendChild(commentTextContainer);

  // Import the addNewComment function from commentRenderer
  import("./commentRenderer.js").then(({ addNewComment }) => {
    // Create submit button
    const submitButton = document.createElement("button");
    submitButton.classList.add("comment-submit-button");
    submitButton.textContent = "Submit Comment";
    submitButton.addEventListener("click", function () {
      const commentText = commentTextarea.value.trim();
      const selectedUserId = Number(userSelect.value);

      if (!commentText || !selectedUserId) {
        alert("Please select a user and write a comment.");
        return;
      }

      // Create new comment
      addNewComment(
        postId,
        commentText,
        selectedUserId,
        commentsSection,
        commentsTitle
      );

      // Clear form
      commentTextarea.value = "";
      userSelect.selectedIndex = 0;
    });

    commentForm.appendChild(submitButton);
  });

  return commentForm;
}

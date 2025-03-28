import { localStorageManager } from "../storage/localStorageManager.js";

export function renderComments(comments, commentAuthors, commentsSection) {
  // Add comments title
  const commentsTitle = document.createElement("h2");
  commentsTitle.classList.add("comments-title");
  commentsTitle.textContent = `Comments (${comments.length})`;
  commentsSection.appendChild(commentsTitle);

  // Add existing comments
  if (comments && comments.length > 0) {
    // Sort by newest first
    const sortedComments = [...comments].sort((a, b) => b.id - a.id);

    sortedComments.forEach((comment) => {
      // Get author name from the provided mapping
      let authorName = "Unknown User";
      if (commentAuthors && commentAuthors[comment.id]) {
        authorName = commentAuthors[comment.id];
      }

      renderSingleComment(comment, authorName, commentsSection);
    });
  } else {
    // Display message if no comments
    const noComments = document.createElement("p");
    noComments.textContent = "No comments yet...";
    noComments.classList.add("no-comments-message");
    commentsSection.appendChild(noComments);
  }

  return commentsTitle;
}

export function renderSingleComment(comment, authorName, commentsSection) {
  const commentContainer = document.createElement("div");
  commentContainer.classList.add("comment-container");

  // Add comment body
  const commentBody = document.createElement("div");
  commentBody.classList.add("comment-body");
  commentBody.textContent = comment.body;
  commentContainer.appendChild(commentBody);

  // Add comment author
  const commentUser = document.createElement("div");
  commentUser.classList.add("comment-user");
  commentUser.textContent = `Posted by: ${authorName}`;
  commentContainer.appendChild(commentUser);

  // Insert before comment form if it exists
  const commentForm = commentsSection.querySelector(".comment-form");
  if (commentForm) {
    commentsSection.insertBefore(commentContainer, commentForm);
  } else {
    commentsSection.appendChild(commentContainer);
  }

  return commentContainer;
}

export function addNewComment(
  postId,
  commentText,
  userId,
  commentsSection,
  commentsTitle
) {
  // Get existing comments
  let commentsData = localStorageManager.getFromLocalStorage("comments");
  const usersData = localStorageManager.getFromLocalStorage("users");

  // Initialize commentsData if needed
  if (!commentsData) {
    commentsData = { comments: [] };
  } else if (Array.isArray(commentsData)) {
    commentsData = { comments: commentsData };
  } else if (!commentsData.comments) {
    commentsData.comments = [];
  }

  // Create new comment
  const newComment = {
    id: Date.now(),
    body: commentText,
    postId: Number(postId),
    userId: userId,
    likes: 0,
  };

  // Add to comments array
  commentsData.comments.push(newComment);

  // Save to localStorage
  localStorageManager.saveToLocalStorage("comments", commentsData);

  // Find username
  let username = "Unknown User";
  if (usersData && usersData.users) {
    const user = usersData.users.find((user) => user.id === userId);
    if (user) {
      username = user.username;
    }
  }

  // Remove "no comments" message if it exists
  const noCommentsMessage = commentsSection.querySelector(
    ".no-comments-message"
  );
  if (noCommentsMessage) {
    commentsSection.removeChild(noCommentsMessage);
  }

  // Render the new comment
  renderSingleComment(newComment, username, commentsSection);

  // Update comment count
  const currentCommentCount = commentsData.comments.filter(
    (comment) => comment.postId == postId
  ).length;
  commentsTitle.textContent = `Comments (${currentCommentCount})`;
}

import { localStorageManager } from "../storage/localStorageManager.js";

export function renderComments(comments, commentAuthors, commentsSection) {
  // Add comments title
  const commentsTitle = document.createElement("h2");
  commentsTitle.classList.add("comments-title");
  commentsTitle.textContent = `Comments (${comments.length})`;
  commentsSection.appendChild(commentsTitle);

  // Add existing comments
  if (comments && comments.length > 0) {
    comments.forEach((comment) => {
      renderSingleComment(
        comment,
        commentAuthors[comment.id] || "Unknown User",
        commentsSection
      );
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

  // Add comment text
  const commentBody = document.createElement("div");
  commentBody.classList.add("comment-body");
  commentBody.textContent = comment.body;
  commentContainer.appendChild(commentBody);

  // Add comment author
  const commentUser = document.createElement("div");
  commentUser.classList.add("comment-user");
  commentUser.textContent = `Posted by: ${authorName}`;
  commentContainer.appendChild(commentUser);

  // Insert new comment before the comment form or at the end
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

  // Initialize commentsData if it doesn't exist or is in wrong format
  if (!commentsData) {
    commentsData = { comments: [] };
  } else if (Array.isArray(commentsData)) {
    commentsData = { comments: commentsData };
  } else if (!commentsData.comments) {
    commentsData.comments = [];
  }

  // Create new comment object
  const newComment = {
    id: Date.now(),
    body: commentText,
    postId: Number(postId),
    userId: userId,
    likes: 0,
  };

  // Add new comment to the comments array
  commentsData.comments.push(newComment);

  // Save updated comments to localStorage
  localStorageManager.saveToLocalStorage("comments", commentsData);

  // Find the username
  let username = "Unknown User";
  if (usersData && usersData.users) {
    const user = usersData.users.find((user) => user.id === userId);
    if (user) {
      username = user.username;
    }
  }

  // Find and remove "no comments" message if it exists
  const noCommentsMessage = commentsSection.querySelector(
    ".no-comments-message"
  );
  if (noCommentsMessage) {
    commentsSection.removeChild(noCommentsMessage);
  }

  // Render the new comment
  renderSingleComment(newComment, username, commentsSection);

  // Update comments count in title
  const currentCommentCount = commentsData.comments.filter(
    (comment) => comment.postId == postId
  ).length;
  commentsTitle.textContent = `Comments (${currentCommentCount})`;
}

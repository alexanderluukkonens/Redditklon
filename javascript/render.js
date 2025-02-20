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

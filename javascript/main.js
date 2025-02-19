import { fetchPostsFromDummyJson } from "./apiClient.js";
import { fetchUsersFromDummyJson } from "./apiClient.js";
import { fetchCommentsFromDummyJson } from "./apiClient.js";

const mainSection = document.getElementById("main-section");

async function main() {
  try {
    // Fetch both posts and users data simultaneously
    const [postsResponse, usersResponse] = await Promise.all([
      fetchPostsFromDummyJson(),
      fetchUsersFromDummyJson(),
    ]);

    const posts = postsResponse.posts;
    const users = usersResponse.users;

    // Clear the main section
    mainSection.innerHTML = "";

    // For each post, find the corresponding user and render
    posts.forEach((post) => {
      const user = users.find((user) => user.id === post.userId);
      renderPosts(post, user);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
function renderPosts(post, user) {
  // TODO: create main-section-posts element
  const postContainer = document.createElement("div");
  postContainer.classList.add("main-section-posts");
  mainSection.appendChild(postContainer);
  // TODO: create title element
  const postTitleElement = document.createElement("header");
  postTitleElement.classList.add("main-section-title");
  postTitleElement.innerText = post.title;
  postContainer.appendChild(postTitleElement);
  // TODO: create body element
  const postBodyElement = document.createElement("section");
  postBodyElement.classList.add("main-section-body");
  postBodyElement.innerText =
    post.body.length > 60 ? post.body.substring(0, 57) + "..." : post.body;
  postContainer.appendChild(postBodyElement);
  // TODO: create tags
  const postTagsElement = document.createElement("p");
  postTagsElement.classList.add("main-section-tags");
  postTagsElement.innerText = `#${post.tags.join(" #")}`;
  postContainer.appendChild(postTagsElement);
  // TODO: create user-name
  const postUserNameElement = document.createElement("div");
  postUserNameElement.classList.add("main-section-user");
  postUserNameElement.innerText = `Posted by: ${
    user ? user.username : "Unknown User"
  }`;
  postContainer.appendChild(postUserNameElement);
}

main();

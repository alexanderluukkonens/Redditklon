export async function fetchPostsFromDummyJson() {
  const response = await fetch("https://dummyjson.com/posts/user/5");
  return await response.json();
}

export async function fetchUsersFromDummyJson() {
  const response = await fetch("https://dummyjson.com/users");
  return await response.json();
}

export async function fetchCommentsFromDummyJson() {
  const response = await fetch("https://dummyjson.com/Comments");
  return await response.json();
}

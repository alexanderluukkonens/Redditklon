import { initPostPage } from "./pages/postPage.js";

document.addEventListener("DOMContentLoaded", function () {
  try {
    initPostPage();
  } catch (error) {
    console.log("Error initializing post page:", error);
  }
});

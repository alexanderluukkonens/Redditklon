import { initPostPage } from "./pages/postPage.js";

// Wait for the DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  try {
    initPostPage();
  } catch (error) {
    console.error("Error initializing post page:", error);
  }
});

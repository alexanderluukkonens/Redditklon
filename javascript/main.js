import { initMainPage } from "./pages/mainPage.js";

// Wait for the DOM to be loaded
document.addEventListener("DOMContentLoaded", function () {
  try {
    initMainPage();
  } catch (error) {
    console.error("Error initializing application:", error);
  }
});

import { initMainPage } from "./pages/mainPage.js";

document.addEventListener("DOMContentLoaded", function () {
  try {
    initMainPage();
  } catch (error) {
    console.log("Error initializing application:", error);
  }
});

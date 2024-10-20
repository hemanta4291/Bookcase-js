import { loadFavoriteBooksLocal } from "./utils.js";

const mobileMenu = document.querySelector(".mobile-menu-icon");
const header = document.querySelector(".header-cl");
const favoriteCountElement = document.querySelector(".favorite-count");

const favoriteBooks = loadFavoriteBooksLocal();
if (favoriteCountElement) {
  favoriteCountElement.textContent = favoriteBooks.length;
}
mobileMenu.addEventListener("click", () => {
  header.classList.toggle("header-active");
});
console.log("index.result again");

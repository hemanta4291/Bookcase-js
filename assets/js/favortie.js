import {
  loadFavoriteBooksLocal,
  saveFavoriteBooksLocal,
  removeFavoriteBooksLocal,
  updateFavoriteCount,
} from "./utils.js";
const favClearBtn = document.querySelector(".fav-clear-all");
const favoriteBooksContainer = document.querySelector(".fav-book-row");
const favoriteCountElement = document.querySelector(".favorite-count");

export function removeBookFromFavorites(bookId) {
  let favoriteBooks = loadFavoriteBooksLocal();
  favoriteBooks = favoriteBooks.filter((favBook) => favBook.id !== bookId);
  saveFavoriteBooksLocal(favoriteBooks);
  updateFavoriteCount();
  displayFavorites(favoriteBooks);
}

function displayFavorites(favoriteBooks) {
  if (favoriteBooks.length === 0) {
    favClearBtn.classList.add("active-clear-btn");
    favoriteBooksContainer.innerHTML = `
      <div class="no-books-found">
        <p>No books found in favorites.</p>
      </div>
    `;
    return;
  }

  favClearBtn.classList.remove("active-clear-btn");

  const bookHtml = favoriteBooks
    .map((book) => {
      const { id, title, authors, formats } = book;
      const coverImage = formats["image/jpeg"];
      const authorsModify = authors
        .map((author) => {
          const vl = author.name.split(",");
          [vl[0], vl[1]] = [vl[1], vl[0]];
          return `<div>
        <h4>Name :${vl.join(" ")}<h2>
        <h4>Born : ${author.birth_year}</h3>
         <h4>Death : ${author.death_year}</h3>
      </div>`;
        })
        .join("");

      return `
         <div class="book">
            <div class="book-fab-l">
            <img
              src=${coverImage}
              alt="product image" />
            <div class="book-content">
              <h3 class="book-title">
                Title: ${title}
              </h3>
              <div class="book-authors">
                <h4>Authors :</h4>
                ${authorsModify || "Unknown"}
              </div>
            </div></div>
            <button class="material-icons" id="close-btn-${id}">close</button>
          </div>
      `;
    })
    .join("");

  favoriteBooksContainer.innerHTML = bookHtml;

  favoriteBooks.forEach((book) => {
    const closeButton = document.getElementById(`close-btn-${book.id}`);
    closeButton.addEventListener("click", () =>
      removeBookFromFavorites(book.id)
    );
  });
}

// Remove all favorites

document.addEventListener("DOMContentLoaded", () => {
  const favoriteBooks = loadFavoriteBooksLocal();
  displayFavorites(favoriteBooks);
  favClearBtn.addEventListener("click", () => {
    removeFavoriteBooksLocal();
    favoriteCountElement.textContent = 0;
    displayFavorites([]);
  });
});

console.log("favjssssss");

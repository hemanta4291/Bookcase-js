const FAVORITES_KEY = "favoriteBooks";
export function loadFavoriteBooksLocal() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

export function saveFavoriteBooksLocal(favoriteBooks) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteBooks));
}

export function removeFavoriteBooksLocal() {
  localStorage.removeItem(FAVORITES_KEY);
}

export function isBookInFavorites(bookId) {
  const favoriteBooks = loadFavoriteBooksLocal();
  return favoriteBooks.some((favBook) => favBook.id === bookId);
}

export function addBookToFavorites(book) {
  let favoriteBtn = document.getElementById(`fav-button-${book.id}`);
  let favoriteBooks = loadFavoriteBooksLocal();

  if (!favoriteBooks.some((favBook) => favBook.id === book.id)) {
    favoriteBooks.push(book);
    saveFavoriteBooksLocal(favoriteBooks);
    updateFavoriteCount();
    favoriteBtn.classList.add("book-fab-active");
  } else {
    favoriteBooks = favoriteBooks.filter((favBook) => favBook.id !== book.id);
    saveFavoriteBooksLocal(favoriteBooks);
    updateFavoriteCount();
    favoriteBtn.classList.remove("book-fab-active");
  }
}

export function updateFavoriteCount() {
  const favoriteCountElement = document.querySelector(".favorite-count");
  const favoriteBooks = loadFavoriteBooksLocal();
  if (favoriteCountElement) {
    favoriteCountElement.textContent = favoriteBooks.length;
  }
}

console.log("utils");

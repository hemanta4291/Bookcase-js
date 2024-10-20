import { addBookToFavorites, isBookInFavorites } from "./favortie.js";

const API_URL = "https://gutendex.com/books";
const header = document.querySelector(".header-cl");
const searchInput = document.querySelector(".search-Input");
const mobileMenu = document.querySelector(".mobile-menu-icon");
const booksRowContainer = document.querySelector(".books-row");
const topicFilter = document.querySelector(".search-filter");
const paginationContainer = document.querySelector(".pagination-lists");

mobileMenu.addEventListener("click", () => {
  header.classList.toggle("header-active");
});

// Pagination
let currentPage = 1;
const itemsPerPage = 32;

async function handleFetchBooks(
  searchQuery = "",
  topicFilterValue = "",
  page = 1
) {
  const books = await fetchBooks(searchQuery, topicFilterValue, page);
  displayBooks(books);
}

async function fetchBooks(searchQuery = "", sortByTopic, page = 1) {
  let setQuery = `?search=${encodeURIComponent(searchQuery)}&page=${page}`;

  if (sortByTopic) {
    setQuery += `&topic=${encodeURIComponent(sortByTopic)}`;
  }
  showSkeleton();
  try {
    const response = await fetch(`${API_URL}${setQuery}`);
    const data = await response.json();
    const totalPages = Math.ceil(data.count / itemsPerPage);
    currentPage = page;
    getUniqueTopics(data.results);
    renderPagination(data.previous, data.next, totalPages);
    hideSkeleton();
    return data.results;
  } catch (error) {
    showSkeleton();
    console.error("Error fetching books:");
    console.error(error);
    return [];
  }
}

// Subjects/Topics gegerate
const getUniqueTopics = (books) => {
  const allTopics = books.flatMap((book) => book.subjects || []);

  const uniqueTopics = [...new Set(allTopics)];
  topicFilter.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a topic";
  topicFilter.appendChild(defaultOption);

  uniqueTopics.forEach((topic) => {
    const optionElement = document.createElement("option");
    optionElement.value = topic;
    optionElement.textContent = topic;
    topicFilter.appendChild(optionElement);
  });
};

// Sort by Topic

topicFilter.addEventListener("change", (e) => {
  handleFetchBooks(searchInput.value, topicFilter.value, 1);
});

// Navigate to book detail page
function handleBookDetail(id) {
  window.location.href = `./book-details.html?ids=${id}`;
}

// handle favorite
const handleFavorite = (book) => {
  console.log("add to card");
  addBookToFavorites(book);
};

// Display function declearation
function displayBooks(books) {
  if (books.length === 0) {
    booksRowContainer.innerHTML = `
      <div class="no-books-found">
        <p>No books found. Please try a different search or topic.</p>
      </div>
    `;
    return;
  }

  const bookHtml = books
    .map((book) => {
      const { id, title, authors, formats, subjects } = book;
      const coverImage = formats["image/jpeg"];
      const authorName = authors[0]?.name || "Unknown Author";
      let favoriteBtnHtml = isBookInFavorites(id)
        ? `<button class="book-fab book-fab-active" id="fav-button-${id}">Add Fab</button>`
        : ` <button class="book-fab" id="fav-button-${id}">Add Fab</button>`;

      const genre = subjects[0] || "No Genre Available";

      return `
        <div class="book">
          <img
            src=${coverImage}
            alt="product image" />
          <div class="book-content">
            <h3 class="book-title">
              ${title}
            </h3>
            <div class="book-authors">
              <h4 class="book-author-name">
                <span>Writer:</span> ${authorName}
              </h4>
            </div>
            <div class="book-genre">
              <div class="book-genre-title">Genre :</div>
              <ul class="book-genre-list">
                ${genre[0]}
              </ul>
            </div>
          </div>
          <div class="book-details-container">
            <button type='button' class="book-details" id="book-detail-${id}">Details</button>
           ${favoriteBtnHtml}
          </div>
        </div>
      `;
    })
    .join("");

  booksRowContainer.innerHTML = bookHtml;

  books.forEach((book) => {
    const favButton = document.getElementById(`fav-button-${book.id}`);
    favButton.addEventListener("click", () => handleFavorite(book));
    const bookId = document.getElementById(`book-detail-${book.id}`);
    bookId.addEventListener("click", () => handleBookDetail(book.id));
  });
}

// Display skeleton

function showSkeleton() {
  const skeletonHtml = new Array(8)
    .fill("")
    .map(
      () => `
      <div class="skeleton-book">
        <div class="skeleton-cover skeleton"></div>
        <div class="skeleton-content">
          <div class="skeleton-title skeleton"></div>
          <div class="skeleton-author skeleton"></div>
          <div class="skeleton-genre skeleton"></div>
        </div>
      </div>
    `
    )
    .join("");
  booksRowContainer.innerHTML = skeletonHtml;
}

function hideSkeleton() {
  booksRowContainer.innerHTML = "";
}

function handleDebounce(cb, time) {
  let timeId;
  return function (value) {
    clearTimeout(timeId);
    timeId = setTimeout(() => {
      cb(value);
    }, time);
  };
}

const debouncedFetchBooks = handleDebounce(handleFetchBooks, 400);

// Search function

searchInput.addEventListener("input", async () => {
  debouncedFetchBooks(searchInput.value, topicFilter.value, 1);
});

// Pagination Render Function
function renderPagination(previous, next, totalPages) {
  paginationContainer.innerHTML = "";

  // "Previous" button
  if (previous) {
    const prevPage = currentPage - 1;
    paginationContainer.innerHTML += `<li class="pagination-list"><button onclick="goToPage(${prevPage})">Prev</button></li>`;
  }

  // First page
  if (currentPage > 1) {
    paginationContainer.innerHTML += `<li class="pagination-list"><button onclick="goToPage(1)">First</button></li>`;
  }

  // Ellipses before current page range
  if (currentPage > 3) {
    paginationContainer.innerHTML += `<li class="pagination-list">...</li>`;
  }

  // Render page numbers around the current page
  for (
    let i = Math.max(1, currentPage - 2);
    i <= Math.min(totalPages, currentPage + 2);
    i++
  ) {
    paginationContainer.innerHTML += `
      <li class="pagination-list ${i === currentPage ? "active" : ""}">
        <button onclick="goToPage(${i})">${i}</button>
      </li>
    `;
  }

  // Ellipses after current page range
  if (currentPage < totalPages - 2) {
    paginationContainer.innerHTML += `<li class="pagination-list">...</li>`;
  }

  // Last page
  if (currentPage < totalPages) {
    paginationContainer.innerHTML += `<li class="pagination-list"><button onclick="goToPage(${totalPages})">Last</button></li>`;
  }

  // "Next" button
  if (next) {
    const nextPage = currentPage + 1;
    paginationContainer.innerHTML += `<li class="pagination-list"><button onclick="goToPage(${nextPage})">Next</button></li>`;
  }
}

// Handle page navigation
function goToPage(page) {
  currentPage = page;
  let newUrl = `./index.html?search=${searchInput.value}&topic=${topicFilter.value}&page=${currentPage}`;
  window.history.pushState({}, "", newUrl);
  handleFetchBooks(searchInput.value, topicFilter.value, currentPage);
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Initial load
loadInitialBooks();

async function loadInitialBooks() {
  const searchQueryValueInit = getQueryParam("search") || "";
  const topicFilterValueInit = getQueryParam("topic") || "";
  const pageInit = getQueryParam("page") || 1;
  handleFetchBooks(searchQueryValueInit, topicFilterValueInit, pageInit);
}

console.log("index");

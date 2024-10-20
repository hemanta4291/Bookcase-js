import { isBookInFavorites, addBookToFavorites } from "./utils.js";

const API_URL = "https://gutendex.com/books";
const searchInput = document.querySelector(".search-Input");
const booksRowContainer = document.querySelector(".books-row");
const topicFilter = document.querySelector(".search-filter");
const paginationContainer = document.querySelector(".pagination-lists");

// Pagination variable
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
    return [];
  }
}

// Subjects/Topics UniqueList
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
  addBookToFavorites(book);
};

// Display function declearation
function displayBooks(books) {
  booksRowContainer.classList.remove("no-book-found-wr");
  if (books.length === 0) {
    booksRowContainer.classList.add("no-book-found-wr");
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
      const authorsModify = book.authors
        .map((author) => {
          const vl = author.name.split(",");
          [vl[0], vl[1]] = [vl[1], vl[0]];
          return `<li>${vl.join(" ")}</li>`;
        })
        .join("");

      const subjectsModify = subjects
        .map((subject) => `<li>${subject}</li>`)
        .join("");

      let favoriteBtnHtml = isBookInFavorites(id)
        ? `<button class="material-icons book-fab book-fab-active" id="fav-button-${id}">favorite</button>`
        : ` <button class="material-icons book-fab" id="fav-button-${id}">favorite</button>`;

      return `
      <div class="book">
            <img
              src=${coverImage}
              alt="product image" />
            <div class="book-content">
              <h3 class="book-title">${title}</h3>
              <div class="book-authors">
              <span>Authors:</span>
                <ul class="book-author-name">
                   ${authorsModify || "Unknown Author"}
                </h4>
              </div>
              <div class="book-genre">
                <div class="book-genre-title">Subjects :</div>
                <ul class="book-genre-list">
                  ${subjectsModify || "No subjects available"}
                </ul>
              </div>
            </div>
            <div class="book-details-container">
              <button class="material-icons book-fab">add_shopping_cart</button>
              ${favoriteBtnHtml}

              <button
                type="button"
                class="material-icons book-details"
                id="book-detail-${id}">
                more
              </button>
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
          <div class="skeleton-title skeleton"></div>
          <div class="skeleton-title skeleton"></div>
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

const debouncedFetchBooks = handleDebounce(handleFetchBooks, 1000);

// Search function
searchInput.addEventListener("input", async () => {
  debouncedFetchBooks(searchInput.value, topicFilter.value, 1);
});

// Handle page navigation
function goToPage(page) {
  currentPage = page;
  let newUrl = `./index.html?search=${searchInput.value}&topic=${topicFilter.value}&page=${currentPage}`;
  window.history.pushState({}, "", newUrl);
  handleFetchBooks(searchInput.value, topicFilter.value, currentPage);
}

// Pagination Render Function
function renderPagination(previous, next, totalPages) {
  paginationContainer.innerHTML = "";

  // "Previous" button
  if (previous) {
    console.log("prev");
    const prevPage = currentPage - 1;
    paginationContainer.innerHTML += `<li class="pagination-list"><button data-page="${prevPage}">Prev</button></li>`;
  }

  // First page
  if (currentPage > 1) {
    console.log("first");
    paginationContainer.innerHTML += `<li class="pagination-list"><button data-page="1">First</button></li>`;
  }

  // page range
  if (currentPage > 3) {
    console.log("...>3");
    paginationContainer.innerHTML += `<li class="pagination-list">...</li>`;
  }

  for (
    let i = Math.max(1, currentPage - 2);
    i <= Math.min(totalPages, currentPage + 2);
    i++
  ) {
    paginationContainer.innerHTML += `
      <li class="pagination-list ${i === currentPage ? "active" : ""}">
        <button data-page="${i}">${i}</button>
      </li>
    `;
  }

  //  page range
  if (currentPage < totalPages - 2) {
    paginationContainer.innerHTML += `<li class="pagination-list">...</li>`;
  }

  // Last page
  if (currentPage < totalPages) {
    paginationContainer.innerHTML += `<li class="pagination-list"><button data-page="${totalPages}">Last</button></li>`;
  }

  if (next) {
    const nextPage = currentPage + 1;
    paginationContainer.innerHTML += `<li class="pagination-list"><button data-page="${nextPage}">Next</button></li>`;
  }
}

paginationContainer.addEventListener("click", (event) => {
  if (event.target.tagName === "BUTTON") {
    const page = parseInt(event.target.getAttribute("data-page"), 10);
    if (!isNaN(page)) {
      goToPage(page);
    }
  }
});

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Initial load
loadInitialBooks();

async function loadInitialBooks() {
  const searchQueryValueInit = getQueryParam("search") || "";
  const topicFilterValueInit = getQueryParam("topic") || "";
  const pageInit = parseInt(getQueryParam("page")) || 1;
  currentPage = pageInit;
  await handleFetchBooks(searchQueryValueInit, topicFilterValueInit, pageInit);
}

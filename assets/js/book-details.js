const bookId = new URLSearchParams(location.search).get("ids");
console.log(bookId);
const API_URL = "https://gutendex.com/books/";
const bookDetailsContainer = document.querySelector(".book-detail");

async function fetchBookDetails(bookId) {
  showSkeleton();
  try {
    const response = await fetch(`${API_URL}${bookId}`);
    const book = await response.json();
    hideSkeleton();
    displayBookDetails(book);
  } catch (error) {
    hideSkeleton();
    console.error("Error fetching book details:", error);
  }
}

function showSkeleton() {
  const skeletonHtml = `
      <div class="skeleton-book">
        <div class="skeleton-cover skeleton"></div>
        <div class="skeleton-content">
          <div class="skeleton-title skeleton"></div>
          <div class="skeleton-title skeleton"></div>
          <div class="skeleton-title skeleton"></div>
          <div class="skeleton-title skeleton"></div>
        </div>
      </div>
    `;
  bookDetailsContainer.innerHTML = skeletonHtml;
}

function hideSkeleton() {
  bookDetailsContainer.innerHTML = "";
}

function displayBookDetails(book) {
  const {
    title,
    authors,
    formats,
    subjects,
    languages,
    copyright,
    download_count,
  } = book;
  const coverImage = formats["image/jpeg"];
  const authorsModify = authors
    .map((author) => {
      const vl = author.name.split(",");
      [vl[0], vl[1]] = [vl[1], vl[0]];
      return `<div>
      <h2>Name${vl.join(" ")}<h2>
      <h3>Born : ${author.birth_year}</h3>
       <h3>Death : ${author.death_year}</h3>
    </div>`;
    })
    .join("");

  const subjectsModify = subjects
    .map((subject) => `<li>${subject}</li>`)
    .join("");

  if (Object.keys(book).length === 0) {
    bookDetailsContainer.innerHTML = `
      <div class="no-books-found">
        <p>No book details found.</p>
      </div>
    `;
    return;
  }

  const bookHtml = `
       <div class="book-detail-img">
              <img
                src=${coverImage}
                alt="book detail" />
            </div>
            <h2 class="book-detail-title">${title}</h2>
            <div class="author-detail book-detai-common">
            <h2>Authors</h2>
              ${authorsModify}
            </div>
            <div class="author-detail-genre book-detai-common">
              <h3>Subjects :</h3>
              <ul>
              ${subjectsModify}
              <ul>
            </div>
            <div class="book-detai-common">
              <h3>languages: ${languages[0]}</h3>
            </div>
            <div class="book-detai-common">
              <h3>Copy right :${copyright}</h3>
            </div>
            <div class="book-detai-common">
              <h3>Total Download : ${download_count}</h3>
            </div>
    `;

  bookDetailsContainer.innerHTML = bookHtml;
}

fetchBookDetails(bookId);

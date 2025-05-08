let params = new URLSearchParams(window.location.search);
let title = params.get('title');
sessionStorage.setItem('title', title);
let titletag = document.getElementById("title");
titletag.innerText = title;

const userid = localStorage.getItem('userid');
if (!title) {
  window.location.href = `user.html?student_id=${userid}`;
}

console.log("Selected Title:", title);
if (title === "english") {
  console.log("ok");
}

/* URLs */
const cardDataUrl = "https://script.google.com/macros/s/AKfycbzBbckyzRaeuzs3PM_5Izvf5xXO3wRpu4Oi4cT6doEwilNkXMLhJ3kGyJt-ufWKDvKZ/exec";
const checkExistanceUrl = "https://script.google.com/macros/s/AKfycbwHlnCOURvtxNMqx_hpz7A2rWzS13C9RTDILdotBCB9Dbw84HCgvGb4dcnOk9P2OWjLwg/exec";

let cardData = [];
let test_names = [];

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    document.getElementById('loading-screen').style.display = 'none';
    document.querySelector('.card-container').style.display = 'grid';
    document.querySelector('.pagination-controls').style.display = 'block';
  }, 3000);
});

/* Fetching data and then render */
Promise.all([
  fetch(cardDataUrl + "?action=get_titles")
    .then(res => res.ok ? res.json() : Promise.reject("Card fetch failed"))
    .then(data => {
      cardData = Object.entries(data).map(([key, value]) => ({
        title: key,
        title_url: value
      }));
    }),
  fetch(checkExistanceUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'check',
      userid: userid,
      exam: title
    })
  })
    .then(res => res.ok ? res.json() : Promise.reject("Check fetch failed"))
    .then(data => {
      test_names = data;
    })
])
.then(() => {
  renderCards(test_names);
})
.catch(error => {
  console.error("Error during data fetch:", error);
});

/* Pagination & Rendering */
let currentPage = 1;
let cardsPerPage = getCardsPerPage();

function getCardsPerPage() {
  return window.innerWidth <= 768 ? 6 : 8;
}

function renderCards(writtenTests) {
  const container = document.querySelector('.card-container');
  container.innerHTML = '';

  cardsPerPage = getCardsPerPage();
  const totalPages = Math.ceil(cardData.length / cardsPerPage);
  const start = (currentPage - 1) * cardsPerPage;
  const end = start + cardsPerPage;
  const cardsToDisplay = cardData.slice(start, end);

  cardsToDisplay.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'l_card';

    const isWritten = writtenTests.includes(card.title);

    cardEl.innerHTML = `
      <h2>${card.title}</h2>
      <img class="course_img" src="${card.title_url}">
      <button class="take-btn" ${isWritten ? 'disabled' : ''}>
        ${isWritten ? 'Completed' : 'Take'}
      </button>
    `;
    container.appendChild(cardEl);

    if (!isWritten) {
      const takeBtn = cardEl.querySelector('.take-btn');
      takeBtn.addEventListener('click', () => {
        sessionStorage.setItem('selectedTitle', card.title);
        window.location.href = 'eapcetexam.html';
      });
    }
  });

  document.getElementById('page-indicator').textContent = `Page ${currentPage} of ${totalPages}`;
}

function nextPage() {
  const totalPages = Math.ceil(cardData.length / cardsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderCards(test_names);
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderCards(test_names);
  }
}

window.addEventListener('resize', () => {
  const newCardsPerPage = getCardsPerPage();
  if (newCardsPerPage !== cardsPerPage) {
    currentPage = 1;
    cardsPerPage = newCardsPerPage;
    renderCards(test_names);
  }
});

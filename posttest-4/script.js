let trendingPage = 1;
let seasonPage = 1;
let upcomingPage = 1;
let searchPage = 1;
let isLoading = false;
let hasNext = true;
let hasNextSeason = true;
let hasNextUpcoming = true;
let hasNextSearch = true;
let currentSearchQuery = '';
let sliderInterval = null; 

// Mode Malam - Terang
const themeToggleButton = document.getElementById('theme-toggle');
const body = document.body;

function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light-theme');
    if (themeToggleButton) themeToggleButton.textContent = '☀️';
  } else {
    body.classList.remove('light-theme');
    if (themeToggleButton) themeToggleButton.textContent = '🌙';
  }
}

if (themeToggleButton) {
  themeToggleButton.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    if (body.classList.contains('light-theme')) {
      localStorage.setItem('theme', 'light');
      themeToggleButton.textContent = '☀️';
    } else {
      localStorage.setItem('theme', 'dark');
      themeToggleButton.textContent = '🌙';
    }
  });
}

// Search logic anime
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');
    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `index.php#search/${encodeURIComponent(query)}`;
            searchInput.value = '';
        }
    };
    if (searchButton && searchInput) {
      searchButton.addEventListener('click', performSearch);
      searchInput.addEventListener('keyup', (event) => {
          if (event.key === 'Enter') performSearch();
      });
    }
}

// User Menu
function setupUserMenu() {
    const userMenuButton = document.querySelector('.user-icon-button');
    const userPopup = document.getElementById('user-popup');
    if (userMenuButton && userPopup) {
      userMenuButton.addEventListener('click', (event) => {
          event.stopPropagation();
          userPopup.classList.toggle('show');
      });
      window.addEventListener('click', (event) => {
          if (!userPopup.contains(event.target) && !userMenuButton.contains(event.target)) {
              userPopup.classList.remove('show');
          }
      });
    }
}

// Fungsi untuk menangani logout
function setupLogout() {
  const logoutLinks = document.querySelectorAll('.logout-link');
  logoutLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showToast('You have been logged out.');
      setTimeout(() => {
        window.location.href = link.href;
      }, 1500);
    });
  });
}

// Fungsi untuk notifikasi Toast
function showToast(message) {
  const oldToast = document.querySelector('.toast-notification');
  if (oldToast) oldToast.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.add('show'); }, 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => { toast.remove(); }, 500);
  }, 3000);
}

// Fungsi untuk menangani klik favorit
async function handleFavoriteClick(event) {
  const icon = event.currentTarget;
  const isLoggedIn = document.body.dataset.loggedIn === 'true';

  if (!isLoggedIn) {
    showToast('Silahkan login terlebih dahulu');
    return;
  }

  const animeId = icon.dataset.animeId;
  const isFavorited = icon.classList.contains('favorited');
  const action = isFavorited ? 'remove_bookmark' : 'save_bookmark';
  
  try {
    const response = await fetch(`dashboard.php?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anime_id: animeId })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      if (isFavorited) {
        icon.classList.remove('favorited');
        showToast('Removed from saved');
      } else {
        icon.classList.add('favorited');
        showToast('Saved');
      }
    } else {
      showToast(result.message || 'An error occurred.');
    }
  } catch (error) {
    showToast('Failed to update favorites.');
  }
}

// Fungsi untuk mereset event scroll
function resetScroll() { window.onscroll = null; }
function stopBannerSlider() { if (sliderInterval) clearInterval(sliderInterval); sliderInterval = null; }

function startBannerSlider() {
  stopBannerSlider();
  let currentSlide = 1;
  const totalSlides = 3;
  sliderInterval = setInterval(() => {
    currentSlide = (currentSlide % totalSlides) + 1;
    const radio = document.getElementById(`slide${currentSlide}`);
    if (radio) radio.checked = true;
  }, 5000);
}

function createAnimeCard(anime) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
    <p>${anime.title}</p>
  `;
  card.addEventListener('click', () => showAnimeDetails(anime.mal_id));
  return card;
}

// Fungsi untuk menampilkan modal detail anime
async function showAnimeDetails(animeId) {
  try {
    // Ambil data anime dan status favorit secara bersamaan
    const [animeRes, favRes] = await Promise.all([
      fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`),
      fetch('dashboard.php?action=get_bookmarks')
    ]);

    const { data: anime } = await animeRes.json();
    const favorites = await favRes.json();

    const modalOverlay = document.createElement('div');
    modalOverlay.classList.add('modal-overlay');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const genres = anime.genres.map(g => g.name).join(', ');
    const studios = anime.studios.map(s => s.name).join(', ');
    const isFavorited = favorites.includes(anime.mal_id);

    let trailerHTML = '';
    if (anime.trailer && anime.trailer.youtube_id) {
      trailerHTML = `<div class="modal-trailer"><iframe src="https://www.youtube.com/embed/${anime.trailer.youtube_id}" frameborder="0" allowfullscreen></iframe></div>`;
    }

    modalContent.innerHTML = `
      <button class="modal-close-btn">&times;</button>
      <div class="modal-body">
        <div class="modal-poster">
          <button class="modal-bookmark-icon ${isFavorited ? 'favorited' : ''}" data-anime-id="${anime.mal_id}">
            <svg viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </button>
          <img src="${anime.images.jpg.large_image_url || anime.images.jpg.image_url}" alt="${anime.title}">
          ${trailerHTML}
        </div>
        <div class="modal-details">
          <h2>${anime.title_english || anime.title}</h2>
          <p class="title-japanese">${anime.title_japanese}</p>
          <div class="meta-info">
            <span>⭐ ${anime.score || 'N/A'}</span>
            <span>#${anime.rank || 'N/A'}</span>
            <span>🎬 ${anime.type}</span>
            <span>${anime.episodes ? `${anime.episodes} episodes` : ''}</span>
          </div>
          <div class="genres"><strong>Genres:</strong> ${genres || 'N/A'}</div>
          <p class="synopsis">${anime.synopsis ? anime.synopsis.replace(/\n/g, '<br>') : 'No synopsis available.'}</p>
          <div class="extra-info">
            <p><strong>Aired:</strong> ${anime.aired.string || 'N/A'}</p>
            <p><strong>Studio:</strong> ${studios || 'N/A'}</p>
            <p><strong>Rating:</strong> ${anime.rating || 'N/A'}</p>
          </div>
        </div>
      </div>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    document.body.style.overflow = 'hidden';

    modalOverlay.querySelector('.modal-bookmark-icon').addEventListener('click', handleFavoriteClick);
    const closeModal = () => {
      document.body.removeChild(modalOverlay);
      document.body.style.overflow = 'auto';
    };
    modalOverlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

  } catch (err) {
    console.error("Error showing details:", err);
    showToast("Failed to load anime details.");
  }
}

// Router SPA
async function router() {
  const pageLoader = document.getElementById('page-loader');
  if (pageLoader) pageLoader.classList.remove('hidden');

  const app = document.getElementById("app");
  const route = window.location.hash || "#home";
  
  if (!app) return;
  app.innerHTML = '';

  resetScroll();
  stopBannerSlider();

  const loaderHTML = `<div class="loader-container" style="display: none;"><div class="loader"></div></div>`;

  if (route.startsWith('#search/')) {
    currentSearchQuery = decodeURIComponent(route.substring(8));
    app.innerHTML = `
      <section class="top-shows">
        <div class="section-header">
          <h2>Search results for: "${currentSearchQuery}"</h2>
          <a href="#home" class="see-all">← Back to Home</a>
        </div>
        <div class="shows-grid" id="search-full"></div>
        <div id="loading-search">${loaderHTML}</div>
      </section>
    `;
    searchPage = 1; hasNextSearch = true;
    document.getElementById("search-full").innerHTML = "";
    await loadSearchResults(searchPage);
    window.onscroll = async () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading && hasNextSearch) {
        searchPage++; await loadSearchResults(searchPage);
      }
    };
  } else if (route === "#home") {
    app.innerHTML = `
      <section class="hero slider">
        <input type="radio" name="slide" id="slide1" checked><input type="radio" name="slide" id="slide2"><input type="radio" name="slide" id="slide3">
        <div class="slides">
          <div class="slide"><img class="banners" src="https://images.justwatch.com/backdrop/333384494/s1920/demon-slayer-kimetsu-no-yaiba-infinity-castle.avif" alt="Banner1"><div class="show-name">Demon Slayer: Kimetsu no Yaiba Infinity Castle</div></div>
          <div class="slide"><img class="banners" src="https://images.justwatch.com/backdrop/324676050/s1920/sakamoto-days.avif" alt="Banner2"><div class="show-name">Sakamoto Days</div></div>
          <div class="slide"><img class="banners" src="https://images.justwatch.com/backdrop/323437328/s1920/dan-da-dan.avif" alt="Banner3"><div class="show-name">Dan Da Dan</div></div>
        </div>
        <div class="navigation"><label for="slide1" class="nav-btn"></label><label for="slide2" class="nav-btn"></label><label for="slide3" class="nav-btn"></label></div>
      </section>
      <div class="scroll-container"><section class="top-shows"><div class="section-header"><h2>Trending</h2><a href="#trending" class="see-all">See All</a></div><div class="shows-grid" id="trending-preview"></div></section></div>
      <div class="scroll-container"><section class="top-shows"><div class="section-header"><h2>Popular This Season</h2><a href="#season" class="see-all">See All</a></div><div class="shows-grid" id="season-preview"></div></section></div>
      <div class="scroll-container"><section class="top-shows"><div class="section-header"><h2>Upcoming Next Season</h2><a href="#upcoming" class="see-all">See All</a></div><div class="shows-grid" id="upcoming-preview"></div></section></div>
    `;
    await Promise.all([loadTrendingPreview(), loadSeasonPreview(), loadUpcomingPreview()]);
    startBannerSlider();
  } else if (route === "#trending") {
    app.innerHTML = `<section class="top-shows"><div class="section-header"><h2>All Trending Anime</h2><a href="#home" class="see-all">← Back to Home</a></div><div class="shows-grid" id="trending-full"></div><div id="loading">${loaderHTML}</div></section>`;
    trendingPage = 1; hasNext = true;
    document.getElementById("trending-full").innerHTML = "";
    await loadTrendingPage(trendingPage);
    window.onscroll = async () => { if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading && hasNext) { trendingPage++; await loadTrendingPage(trendingPage); } };
  } else if (route === "#season") {
    app.innerHTML = `<section class="top-shows"><div class="section-header"><h2>Popular This Season</h2><a href="#home" class="see-all">← Back to Home</a></div><div class="shows-grid" id="season-full"></div><div id="loading-season">${loaderHTML}</div></section>`;
    seasonPage = 1; hasNextSeason = true;
    document.getElementById("season-full").innerHTML = "";
    await loadSeasonPage(seasonPage);
    window.onscroll = async () => { if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading && hasNextSeason) { seasonPage++; await loadSeasonPage(seasonPage); } };
  } else if (route === "#upcoming") {
    app.innerHTML = `<section class="top-shows"><div class="section-header"><h2>Upcoming Next Season</h2><a href="#home" class="see-all">← Back to Home</a></div><div class="shows-grid" id="upcoming-full"></div><div id="loading-upcoming">${loaderHTML}</div></section>`;
    upcomingPage = 1; hasNextUpcoming = true;
    document.getElementById("upcoming-full").innerHTML = "";
    await loadUpcomingPage(upcomingPage);
    window.onscroll = async () => { if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !isLoading && hasNextUpcoming) { upcomingPage++; await loadUpcomingPage(upcomingPage); } };
  }
  
  if (pageLoader) pageLoader.classList.add('hidden');
}

function toggleInfiniteLoader(loaderId, show) {
    const loaderEl = document.querySelector(`#${loaderId} .loader-container`);
    if (loaderEl) loaderEl.style.display = show ? 'flex' : 'none';
}

async function fetchData(url, gridId, limit) {
  try {
    const res = await fetch(url + (limit ? `&limit=${limit}` : ''));
    const data = await res.json();
    const grid = document.getElementById(gridId);
    if (!grid) return null;
    grid.innerHTML = '';
    data.data.forEach(anime => grid.appendChild(createAnimeCard(anime)));
    return data;
  } catch (err) { console.error(err); return null; }
}

async function loadTrendingPreview() { await fetchData("https://api.jikan.moe/v4/top/anime?sfw&page=1", "trending-preview", 7); }
async function loadSeasonPreview() { await fetchData("https://api.jikan.moe/v4/seasons/now?sfw&page=1", "season-preview", 7); }
async function loadUpcomingPreview() { await fetchData("https://api.jikan.moe/v4/seasons/upcoming?sfw&page=1", "upcoming-preview", 7); }

async function loadPagedData(endpoint, page, gridId, hasNextVar) {
  isLoading = true; toggleInfiniteLoader(`loading-${gridId.split('-')[0]}`, true);
  const res = await fetch(`${endpoint}&page=${page}`);
  const data = await res.json();
  const grid = document.getElementById(gridId);
  data.data.forEach(anime => grid.appendChild(createAnimeCard(anime)));
  hasNextVar = data.pagination.has_next_page;
  isLoading = false; toggleInfiniteLoader(`loading-${gridId.split('-')[0]}`, false);
}

async function loadTrendingPage(page) { await loadPagedData('https://api.jikan.moe/v4/top/anime?sfw', page, 'trending-full', hasNext); }
async function loadSeasonPage(page) { await loadPagedData('https://api.jikan.moe/v4/seasons/now?sfw', page, 'season-full', hasNextSeason); }
async function loadUpcomingPage(page) { await loadPagedData('https://api.jikan.moe/v4/seasons/upcoming?sfw', page, 'upcoming-full', hasNextUpcoming); }
async function loadSearchResults(page) {
    isLoading = true; toggleInfiniteLoader('loading-search', true);
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${currentSearchQuery}&sfw&page=${page}`);
    const data = await res.json();
    const grid = document.getElementById("search-full");
    if (page === 1 && data.data.length === 0) grid.innerHTML = '<p style="text-align: center; width: 100%;">No results found.</p>';
    else data.data.forEach(anime => grid.appendChild(createAnimeCard(anime)));
    hasNextSearch = data.pagination.has_next_page;
    isLoading = false; toggleInfiniteLoader('loading-search', false);
}

// Fungsi untuk memuat anime yang di-bookmark
async function loadBookmarkedAnime() {
  const grid = document.getElementById("bookmark-full");
  if (!grid) return;

  toggleInfiniteLoader('loading-bookmark', true);
  grid.innerHTML = '';
  
  try {
    const res = await fetch('dashboard.php?action=get_bookmarks');
    const favoriteIds = await res.json();
    
    if (favoriteIds.length === 0) {
      grid.innerHTML = '<p style="text-align: center; width: 100%;">You have no saved anime.</p>';
      toggleInfiniteLoader('loading-bookmark', false);
      return;
    }
    
    const animeDataPromises = favoriteIds.map(id => fetch(`https://api.jikan.moe/v4/anime/${id}`).then(res => res.json()));
    const animeResponses = await Promise.all(animeDataPromises);

    animeResponses.forEach(response => {
      if (response.data) grid.appendChild(createAnimeCard(response.data));
    });

  } catch (err) {
    grid.innerHTML = '<p style="text-align: center; width: 100%;">Failed to load bookmarks.</p>';
  } finally {
    toggleInfiniteLoader('loading-bookmark', false);
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    applySavedTheme();
    setupSearch();
    setupUserMenu();
    setupLogout();
    // Hanya jalankan router jika kita berada di halaman utama (index.php)
    if (document.getElementById('app')) {
        window.addEventListener("hashchange", router);
        router();
    }
});
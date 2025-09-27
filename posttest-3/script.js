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

// Fungsi untuk menerapkan tema berdasarkan preferensi yang tersimpan
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light-theme');
    themeToggleButton.textContent = '☀️';
  } else {
    body.classList.remove('light-theme');
    themeToggleButton.textContent = '🌙';
  }
}

// Event listener untuk tombol tema
themeToggleButton.addEventListener('click', () => {
  body.classList.toggle('light-theme');
  
  // Simpan preferensi tema dan ganti ikon
  if (body.classList.contains('light-theme')) {
    localStorage.setItem('theme', 'light');
    themeToggleButton.textContent = '☀️';
  } else {
    localStorage.setItem('theme', 'dark');
    themeToggleButton.textContent = '🌙';
  }
});
// -----------------------------------------------------------------


// Search logic anime
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (query) {
            
            window.location.hash = `#search/${encodeURIComponent(query)}`;
            searchInput.value = ''; // Kosongkan input setelah search
        }
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}

// User Menu
function setupUserMenu() {
    const userMenuButton = document.querySelector('.user-icon-button');
    const userPopup = document.getElementById('user-popup');

    userMenuButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Mencegah window click event terpicu
        userPopup.classList.toggle('show');
    });

    // Menutup popup jika user mengklik di luar area popup
    window.addEventListener('click', (event) => {
        if (!userPopup.contains(event.target) && !userMenuButton.contains(event.target)) {
            userPopup.classList.remove('show');
        }
    });
}

// Fungsi untuk mereset event scroll
function resetScroll() {
  window.onscroll = null;
}

function stopBannerSlider() {
  if (sliderInterval) {
    clearInterval(sliderInterval);
    sliderInterval = null;
  }
}

//Fungsi untuk memulai slider banner otomatis
function startBannerSlider() {
  stopBannerSlider(); // Hentikan dulu jika ada yang berjalan

  let currentSlide = 1;
  const totalSlides = 3; // Jumlah total slide di banner

  sliderInterval = setInterval(() => {
    currentSlide++;
    if (currentSlide > totalSlides) {
      currentSlide = 1; // Kembali ke slide pertama (looping)
    }
    const radio = document.getElementById(`slide${currentSlide}`);
    if (radio) {
      radio.checked = true;
    }
  }, 5000); // Ganti slide setiap 5000 milidetik (5 detik)
}


//Fungsi untuk membuat card anime dan menambahkan event listener
function createAnimeCard(anime) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
    <p>${anime.title}</p>
  `;
  // Tambahkan event listener untuk menampilkan detail saat di-klik
  card.addEventListener('click', () => showAnimeDetails(anime));
  return card;
}

//Fungsi untuk menampilkan modal detail anime
function showAnimeDetails(anime) {
  // Buat elemen modal
  const modalOverlay = document.createElement('div');
  modalOverlay.classList.add('modal-overlay');

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');

  // Format genres agar lebih rapi
  const genres = anime.genres.map(g => g.name).join(', ');
  const studios = anime.studios.map(s => s.name).join(', ');

  // Buat HTML untuk trailer jika tersedia
  let trailerHTML = '';
  if (anime.trailer && anime.trailer.youtube_id) {
    trailerHTML = `
      <div class="modal-trailer">
        <iframe 
          src="https://www.youtube.com/embed/${anime.trailer.youtube_id}" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `;
  }

  modalContent.innerHTML = `
    <button class="modal-close-btn">&times;</button>
    <div class="modal-body">
      <div class="modal-poster">
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
        <div class="genres">
          <strong>Genres:</strong> ${genres || 'N/A'}
        </div>
        <p class="synopsis">${anime.synopsis ? anime.synopsis.replace(/\n/g, '<br>') : 'Deskripsi untuk anime ini belum tersedia.'}</p>
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

  // Fungsi untuk menutup modal
  const closeModal = () => {
    document.body.removeChild(modalOverlay);
    document.body.style.overflow = 'auto'; // Kembalikan scroll
  };

  // Tambahkan event listener untuk tombol close dan overlay
  modalOverlay.querySelector('.modal-close-btn').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Hentikan scroll di background
  document.body.style.overflow = 'hidden';
}


// Router SPA
async function router() {
  const pageLoader = document.getElementById('page-loader');
  pageLoader.classList.remove('hidden'); // Tampilkan page loader

  const app = document.getElementById("app");
  const route = window.location.hash || "#home";
  
  // Kosongkan konten app saat routing dimulai
  app.innerHTML = '';

  // Selalu reset listener saat rute berubah
  resetScroll();
  stopBannerSlider(); // Hentikan slider setiap kali rute berganti

  // Template untuk loader infinite scroll
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
    searchPage = 1;
    hasNextSearch = true;
    document.getElementById("search-full").innerHTML = "";
    await loadSearchResults(searchPage);

    // Infinite scroll untuk search
    window.onscroll = async () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !isLoading &&
        hasNextSearch
      ) {
        searchPage++;
        await loadSearchResults(searchPage);
      }
    };
  } else if (route === "#home") {
    app.innerHTML = `
      <!-- Banner Slider -->
      <section class="hero slider">
        <input type="radio" name="slide" id="slide1" checked>
        <input type="radio" name="slide" id="slide2">
        <input type="radio" name="slide" id="slide3">

        <div class="slides">
          <div class="slide">
            <img class="banners" src="https://images.justwatch.com/backdrop/333384494/s1920/demon-slayer-kimetsu-no-yaiba-infinity-castle.avif" alt="Banner1">
            <div class="show-name">Demon Slayer: Kimetsu no Yaiba Infinity Castle</div>
          </div>
          <div class="slide">
            <img class="banners" src="https://images.justwatch.com/backdrop/324676050/s1920/sakamoto-days.avif" alt="Banner2">
            <div class="show-name">Sakamoto Days</div>
          </div>
          <div class="slide">
            <img class="banners" src="https://images.justwatch.com/backdrop/323437328/s1920/dan-da-dan.avif" alt="Banner3">
            <div class="show-name">Dan Da Dan</div>
          </div>
        </div>

        <div class="navigation">
          <label for="slide1" class="nav-btn"></label>
          <label for="slide2" class="nav-btn"></label>
          <label for="slide3" class="nav-btn"></label>
        </div>
      </section>

      <!-- Trending Preview -->
      <div class="scroll-container">
        <section class="top-shows">
          <div class="section-header">
            <h2>Trending</h2>
            <a href="#trending" class="see-all">See All</a>
          </div>
          <div class="shows-grid" id="trending-preview"></div>
        </section>
      </div>

      <!-- Popular This Season -->
      <div class="scroll-container">
        <section class="top-shows">
          <div class="section-header">
            <h2>Popular This Season</h2>
            <a href="#season" class="see-all">See All</a>
          </div>
          <div class="shows-grid" id="season-preview"></div>
        </section>
      </div>
      
      <!-- Upcoming Next Season -->
      <div class="scroll-container">
        <section class="top-shows">
          <div class="section-header">
            <h2>Upcoming Next Season</h2>
            <a href="#upcoming" class="see-all">See All</a>
          </div>
          <div class="shows-grid" id="upcoming-preview"></div>
        </section>
      </div>
    `;
    // Load semua preview secara paralel
    await Promise.all([
        loadTrendingPreview(),
        loadSeasonPreview(),
        loadUpcomingPreview()
    ]);
    startBannerSlider(); // Mulai slider saat halaman utama dimuat
  } else if (route === "#trending") {
    app.innerHTML = `
      <section class="top-shows">
        <div class="section-header">
          <h2>All Trending Anime</h2>
          <a href="#home" class="see-all">← Back to Home</a>
        </div>
        <div class="shows-grid" id="trending-full"></div>
        <div id="loading">${loaderHTML}</div>
      </section>
    `;
    trendingPage = 1;
    hasNext = true;
    document.getElementById("trending-full").innerHTML = "";
    await loadTrendingPage(trendingPage);

    // Infinite scroll
    window.onscroll = async () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !isLoading &&
        hasNext
      ) {
        trendingPage++;
        await loadTrendingPage(trendingPage);
      }
    };
  } else if (route === "#season") {
    app.innerHTML = `
      <section class="top-shows">
        <div class="section-header">
          <h2>Popular This Season</h2>
          <a href="#home" class="see-all">← Back to Home</a>
        </div>
        <div class="shows-grid" id="season-full"></div>
        <div id="loading-season">${loaderHTML}</div>
      </section>
    `;
    seasonPage = 1;
    hasNextSeason = true;
    document.getElementById("season-full").innerHTML = "";
    await loadSeasonPage(seasonPage);

    // Infinite scroll
    window.onscroll = async () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !isLoading &&
        hasNextSeason
      ) {
        seasonPage++;
        await loadSeasonPage(seasonPage);
      }
    };
  } else if (route === "#upcoming") {
    app.innerHTML = `
      <section class="top-shows">
        <div class="section-header">
          <h2>Upcoming Next Season</h2>
          <a href="#home" class="see-all">← Back to Home</a>
        </div>
        <div class="shows-grid" id="upcoming-full"></div>
        <div id="loading-upcoming">${loaderHTML}</div>
      </section>
    `;
    upcomingPage = 1;
    hasNextUpcoming = true;
    document.getElementById("upcoming-full").innerHTML = "";
    await loadUpcomingPage(upcomingPage);

    // Infinite scroll
    window.onscroll = async () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !isLoading &&
        hasNextUpcoming
      ) {
        upcomingPage++;
        await loadUpcomingPage(upcomingPage);
      }
    };
  }
  
  pageLoader.classList.add('hidden'); // Sembunyikan page loader setelah konten siap
}

// Generic function to show/hide loader
function toggleInfiniteLoader(loaderId, show) {
    const loaderEl = document.querySelector(`#${loaderId} .loader-container`);
    if (loaderEl) {
        loaderEl.style.display = show ? 'block' : 'none';
    }
}

// 🔹 Fetch 7 anime untuk trending preview
async function loadTrendingPreview() {
  try {
    const res = await fetch("https://api.jikan.moe/v4/top/anime?sfw&page=1&limit=7");
    const data = await res.json();
    const grid = document.getElementById("trending-preview");
    if (!grid) return;
    grid.innerHTML = '';

    data.data.forEach(anime => {
      const card = createAnimeCard(anime);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// 🔹 Fetch 7 anime untuk season preview
async function loadSeasonPreview() {
  try {
    const res = await fetch("https://api.jikan.moe/v4/seasons/now?sfw&page=1&limit=7");
    const data = await res.json();
    const grid = document.getElementById("season-preview");
    if (!grid) return;
    grid.innerHTML = '';

    data.data.forEach(anime => {
      const card = createAnimeCard(anime);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

//Fetch 7 anime untuk upcoming preview
async function loadUpcomingPreview() {
  try {
    const res = await fetch("https://api.jikan.moe/v4/seasons/upcoming?sfw&page=1&limit=7");
    const data = await res.json();
    const grid = document.getElementById("upcoming-preview");
    if (!grid) return;
    grid.innerHTML = '';

    data.data.forEach(anime => {
      const card = createAnimeCard(anime);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

//Fetch full trending anime (infinite scroll)
async function loadTrendingPage(page) {
  try {
    isLoading = true;
    toggleInfiniteLoader('loading', true);

    const res = await fetch(`https://api.jikan.moe/v4/top/anime?sfw&page=${page}`);
    const data = await res.json();
    const grid = document.getElementById("trending-full");
    if (!grid) return;

    data.data.forEach(anime => {
      const card = createAnimeCard(anime);
      grid.appendChild(card);
    });

    hasNext = data.pagination.has_next_page;
    toggleInfiniteLoader('loading', false);
    isLoading = false;
  } catch (err) {
    console.error(err);
    isLoading = false;
  }
}

//Fetch full season anime (infinite scroll)
async function loadSeasonPage(page) {
  try {
    isLoading = true;
    toggleInfiniteLoader('loading-season', true);

    const res = await fetch(`https://api.jikan.moe/v4/seasons/now?sfw&page=${page}`);
    const data = await res.json();
    const grid = document.getElementById("season-full");
    if (!grid) return;

    data.data.forEach(anime => {
      const card = createAnimeCard(anime);
      grid.appendChild(card);
    });

    hasNextSeason = data.pagination.has_next_page;
    toggleInfiniteLoader('loading-season', false);
    isLoading = false;
  } catch (err) {
    console.error(err);
    isLoading = false;
  }
}

//Fetch full upcoming anime (infinite scroll)
async function loadUpcomingPage(page) {
  try {
    isLoading = true;
    toggleInfiniteLoader('loading-upcoming', true);

    const res = await fetch(`https://api.jikan.moe/v4/seasons/upcoming?sfw&page=${page}`);
    const data = await res.json();
    const grid = document.getElementById("upcoming-full");
    if (!grid) return;

    data.data.forEach(anime => {
      const card = createAnimeCard(anime);
      grid.appendChild(card);
    });

    hasNextUpcoming = data.pagination.has_next_page;
    toggleInfiniteLoader('loading-upcoming', false);
    isLoading = false;
  } catch (err)
 {
    console.error(err);
    isLoading = false;
  }
}

//Fetch search results (infinite scroll)
async function loadSearchResults(page) {
  try {
    isLoading = true;
    toggleInfiniteLoader('loading-search', true);

    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${currentSearchQuery}&sfw&page=${page}`);
    const data = await res.json();
    const grid = document.getElementById("search-full");
    if (!grid) return;

    if (page === 1 && data.data.length === 0) {
        grid.innerHTML = '<p style="text-align: center; width: 100%;">No results found.</p>';
    } else {
        data.data.forEach(anime => {
          const card = createAnimeCard(anime);
          grid.appendChild(card);
        });
    }

    hasNextSearch = data.pagination.has_next_page;
    toggleInfiniteLoader('loading-search', false);
    isLoading = false;
  } catch (err) {
    console.error(err);
    isLoading = false;
  }
}


// Init SPA
window.addEventListener("hashchange", router);
window.addEventListener("load", () => {
  applySavedTheme(); // Terapkan tema saat halaman dimuat
  setupSearch(); // Siapkan event listener untuk search bar
  setupUserMenu(); // Siapkan event listener untuk menu user
  router();
});
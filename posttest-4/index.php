<?php
// Mulai session di baris paling atas
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AnimeList</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body data-logged-in="<?php echo isset($_SESSION['username']) ? 'true' : 'false'; ?>">
  <!-- Full Page Loader -->
  <div id="page-loader" class="page-loader-overlay">
    <div class="loader"></div>
  </div>

  <!-- Header -->
  <header>
    <div class="header-content">
      <div class="logo">AnimeList</div>
      <div class="search-bar">
        <input type="text" placeholder="Search for something..." />
        <button>🔍</button>
      </div>
      <nav>
        <a href="#home">Home</a>
        <!-- Tombol Tema Mode Gelap/Terang -->
        <button id="theme-toggle" class="theme-button">🌙</button>
        <!-- Menu Pengguna -->
        <div class="user-menu">
          <button class="user-icon-button">👤</button>
          <div id="user-popup" class="popup-menu">
            <?php if (isset($_SESSION['username'])): ?>
              <!-- Tampilan jika sudah login -->
              <h4>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h4>
              <ul>
                <li><a href="dashboard.php">My Bookmark</a></li>
                <li><a href="logout.php" class="logout-link">Logout</a></li>
              </ul>
            <?php else: ?>
              <!-- Tampilan jika belum login -->
              <ul>
                <li><a href="login.php">Login</a></li>
              </ul>
            <?php endif; ?>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <div id="app-container">
    <!-- App container -->
    <main id="app">
      <!-- Konten diganti via script.js -->
    </main>
  </div>

  <!-- Footer -->
  <footer>
    <div class="footer-content">
      <p>© 2025 AnimeList. All Rights Reserved.</p>
      <div class="footer-links">
        <a href="#">About</a>
        <a href="#">Contact</a>
        <a href="https://anilist.co/">Reference</a>
      </div>
    </div>
  </footer>

  <!-- Script -->
  <script src="script.js"></script>
</body>
</html>
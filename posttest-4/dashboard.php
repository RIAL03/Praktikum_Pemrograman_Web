<?php
session_start();

// Bagian API: Kode ini akan berjalan jika ada parameter 'action' di URL
if (isset($_REQUEST['action'])) {
    header('Content-Type: application/json');

    //lindungi aksi yang mengubah data (menyimpan/menghapus)
    $action = $_REQUEST['action'];
    $isWriteAction = ($action === 'save_bookmark' || $action === 'remove_bookmark');

    if ($isWriteAction && !isset($_SESSION['username'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'You must be logged in to save bookmarks.']);
        exit();
    }

    // Persiapan path file
    $userDir = 'userdata';
    if (!is_dir($userDir)) {
        mkdir($userDir, 0755, true);
    }
    
    // Inisialisasi variabel
    $username = $_SESSION['username'] ?? null;
    $filePath = $username ? $userDir . '/' . $username . '.json' : null;
    $favorites = [];

    // Baca data favorit hanya jika pengguna login dan file ada
    if ($filePath && file_exists($filePath)) {
        $favorites = json_decode(file_get_contents($filePath), true) ?: [];
    }

    switch ($action) {
        case 'get_bookmarks':
            // Kembalikan data yang sudah dibaca (akan menjadi array kosong jika tidak login)
            echo json_encode(array_values($favorites));
            break;

        case 'save_bookmark':
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['anime_id'])) {
                $animeId = $data['anime_id'];
                $favorites[$animeId] = $animeId;
                file_put_contents($filePath, json_encode($favorites, JSON_PRETTY_PRINT));
                echo json_encode(['success' => true]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Anime ID is required']);
            }
            break;

        case 'remove_bookmark':
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($data['anime_id']) && isset($favorites[$data['anime_id']])) {
                unset($favorites[$data['anime_id']]);
                file_put_contents($filePath, json_encode($favorites, JSON_PRETTY_PRINT));
                echo json_encode(['success' => true]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Anime ID not found']);
            }
            break;
    }
    exit(); // Hentikan script setelah merespons API
}


// Bagian Tampilan Halaman (UI)
if (!isset($_SESSION['username'])) {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Bookmark - AnimeList</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body data-logged-in="true">
  <!-- Header -->
  <header>
    <div class="header-content">
      <div class="logo"><a href="index.php" style="text-decoration: none; color: inherit;">AnimeList</a></div>
      <div class="search-bar">
        <input type="text" placeholder="Search for something..." />
        <button>🔍</button>
      </div>
      <nav>
        <a href="index.php">Home</a>
        <button id="theme-toggle" class="theme-button">🌙</button>
        <!-- Menu Pengguna -->
        <div class="user-menu">
          <button class="user-icon-button">👤</button>
          <div id="user-popup" class="popup-menu">
            <h4>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h4>
            <ul>
              <li><a href="dashboard.php">My Bookmark</a></li>
              <li><a href="logout.php" class="logout-link">Logout</a></li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  </header>

  <div id="app-container">
    <main id="dashboard-content">
      <section class="top-shows">
        <div class="section-header">
          <h2>My Saved Anime</h2>
          <a href="index.php" class="see-all">← Back to Home</a>
        </div>
        <div class="shows-grid" id="bookmark-full">
          <!-- Konten diisi oleh script.js -->
        </div>
        <div id="loading-bookmark"><div class="loader-container" style="display: none;"><div class="loader"></div></div></div>
      </section>
    </main>
  </div>

  <!-- Footer -->
  <footer>
    <div class="footer-content">
      <p>© 2025 AnimeList. All Rights Reserved.</p>
    </div>
  </footer>

  <!-- Script -->
  <script src="script.js"></script>
  <script>
    // Panggil fungsi spesifik untuk memuat bookmark saat halaman dashboard dimuat
    document.addEventListener('DOMContentLoaded', () => {
      loadBookmarkedAnime();
    });
  </script>
</body>
</html>
<?php
// Mulai session
session_start();

// Cek apakah pengguna sudah login, jika ya, arahkan ke halaman utama
if (isset($_SESSION['username'])) {
    header("Location: index.php");
    exit();
}

$error_message = '';

// Cek jika form telah disubmit
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Hardcode username dan password
    $correct_username = 'admin';
    $correct_password = 'admin123';

    $username = $_POST['username'];
    $password = $_POST['password'];

    // Validasi
    if ($username === $correct_username && $password === $correct_password) {
        // Jika login berhasil, simpan username di session
        $_SESSION['username'] = $username;
        
        // Arahkan ke halaman utama (index.php)
        header("Location: index.php");
        exit(); // Pastikan script berhenti setelah redirect
    } else {
        // Jika login gagal
        $error_message = 'Username atau password salah!';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - AnimeList</title>
    <link rel="stylesheet" href="style.css">
    <!-- style taruh sini biar .css ga penuh -->
    <style>
        
        .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 250px);
            padding: 20px;
        }
        .login-form {
            background: var(--bg-secondary);
            padding: 40px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        .login-form h2 {
            margin-bottom: 25px;
            color: var(--text-primary);
        }
        .input-group {
            margin-bottom: 20px;
            text-align: left;
        }
        .input-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-secondary);
        }
        .input-group input {
            width: 100%;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--bg-interactive);
            color: var(--text-primary);
            font-size: 1rem;
        }
        .login-button {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 8px;
            background: var(--bg-interactive-hover);
            color: var(--text-primary);
            font-size: 1.1rem;
            cursor: pointer;
            transition: background 0.3s;
        }
        .login-button:hover {
            background: #555;
        }
        .error-message {
            color: #ff4d4d;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <header>
      <div class="header-content">
        <div class="logo"><a href="index.php" style="text-decoration: none; color: inherit;">AnimeList</a></div>
        <nav>
          <a href="index.php">Home</a>
        </nav>
      </div>
    </header>

    <div class="login-container">
        <form class="login-form" method="POST" action="login.php">
            <h2>Login</h2>
            <?php if ($error_message): ?>
                <p class="error-message"><?php echo $error_message; ?></p>
            <?php endif; ?>
            <div class="input-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="login-button">Login</button>
        </form>
    </div>

    <footer>
      <div class="footer-content">
        <p>© 2025 AnimeList. All Rights Reserved.</p>
      </div>
    </footer>
    
    <script>
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
      }
    </script>
</body>
</html>
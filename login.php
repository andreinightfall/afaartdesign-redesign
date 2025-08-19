<?php
// /public_html/login.php
declare(strict_types=1);
session_start();

$passwdFile = '/cphome/rh794/.htpasswds/shop/passwd'; // user:hash per line

// Logout support
if (isset($_GET['logout'])) {
  $_SESSION = [];
  if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time()-42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
  }
  session_destroy();
  header('Location: /shop-wip.html');
  exit;
}

// If already logged in, go to shop
if (!empty($_SESSION['shop_auth'])) {
  header('Location: /shop/'); // gate.php will serve index.html
  exit;
}

function loadUsers(string $file): array {
  if (!is_file($file)) return [];
  $users = [];
  foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    [$u, $h] = array_map('trim', explode(':', $line, 2));
    if ($u !== '' && $h !== '') $users[$u] = $h;
  }
  return $users;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $user = trim($_POST['user'] ?? '');
  $pass = $_POST['pass'] ?? '';
  $users = loadUsers($passwdFile);

  if (isset($users[$user]) && password_verify($pass, $users[$user])) {
    session_regenerate_id(true);
    $_SESSION['shop_auth'] = $user;
    header('Location: /shop/');
    exit;
  }
  header('Location: /shop-wip.html?err=1'); // show "Date incorecte."
  exit;
}

// If accessed via GET, send back to WIP (the form lives there)
header('Location: /shop-wip.html');

<?php
// /public_html/shop/gate.php
declare(strict_types=1);

// 1) Require login via PHP session
session_start();
if (empty($_SESSION['shop_auth'])) {
  header('Location: /shop-wip.html');
  exit;
}

// 2) Security / indexing hints
header('X-Robots-Tag: noindex, noarchive', true);
header('X-Content-Type-Options: nosniff');

// 3) Get requested path (as in the URL)
$root = __DIR__;                   // /public_html/shop
$uri  = $_SERVER['REQUEST_URI'] ?? '/shop/';
$path = parse_url($uri, PHP_URL_PATH) ?? '/shop/';

// Strip leading "/shop" (with or without trailing slash)
$rel  = preg_replace('#^/shop/?#', '', $path);

// Canonical redirects (hide .html and index.html)
if ($rel !== '' && substr($rel, -1) !== '/') {
  if (preg_match('~(?:^|/)(index)\.html$~i', $rel)) {
    // /shop/index.html  ->  /shop/
    $to = '/shop/' . preg_replace('~(^|/)index\.html$~i', '$1', $rel);
    if (substr($to, -1) !== '/') $to .= '/';
    header('Location: ' . $to, true, 301);
    exit;
  }
  if (preg_match('~\.html$~i', $rel)) {
    // /shop/page.html  ->  /shop/page
    $to = '/shop/' . preg_replace('~\.html$~i', '', $rel);
    header('Location: ' . $to, true, 301);
    exit;
  }
}

// 4) Resolve the real file to serve
$rel = rawurldecode($rel);             // decode %20 etc.
$rel = str_replace('\\', '/', $rel);   // normalize slashes

// Default to index.html when requesting /shop or any folder
if ($rel === '' || substr($rel, -1) === '/') {
  $rel .= 'index.html';
}

// If no extension is present, try ".html" implicitly
if (strpos(basename($rel), '.') === false) {
  if (is_file($root . '/' . $rel . '.html')) {
    $rel .= '.html';
  }
}

$target = $root . '/' . $rel;
$real   = realpath($target);

// Block traversal and require an existing file
if ($real === false || strpos($real, $root) !== 0 || !is_file($real)) {
  http_response_code(404);
  header('Content-Type: text/plain; charset=utf-8');
  echo 'Not found';
  exit;
}

// 5) Content type map
$ext = strtolower(pathinfo($real, PATHINFO_EXTENSION));
$types = [
  'html'=>'text/html; charset=utf-8',
  'css'=>'text/css',
  'js'=>'application/javascript', 'mjs'=>'application/javascript',
  'json'=>'application/json',
  'png'=>'image/png', 'jpg'=>'image/jpeg', 'jpeg'=>'image/jpeg',
  'webp'=>'image/webp', 'svg'=>'image/svg+xml', 'gif'=>'image/gif',
  'ico'=>'image/x-icon',
  'woff2'=>'font/woff2', 'woff'=>'font/woff', 'ttf'=>'font/ttf', 'otf'=>'font/otf',
  'mp4'=>'video/mp4', 'mp3'=>'audio/mpeg', 'wav'=>'audio/wav',
  'map'=>'application/json'
];

header('Content-Type: ' . ($types[$ext] ?? 'application/octet-stream'));
header('Cache-Control: private, no-store');

$size = filesize($real);
if ($size !== false) {
  header('Content-Length: ' . $size);
}

readfile($real);

<?php
// Past Enlighten admin & API.
// The backend code, database and uploaded photos are kept outside public_html
// (in ../pe-api-src and ../pe-data) so website deploys from GitHub never touch them.
$pe_src = dirname(__DIR__, 2) . '/pe-api-src/index.php';
if (!is_file($pe_src)) {
    http_response_code(503);
    header('Content-Type: application/json');
    header('Cache-Control: no-store');
    echo '{"ok":false,"error":"Backend not installed"}';
    exit;
}
require $pe_src;

<?php

//header('Content-Disposition: attachment; filename="filetodownload.jpg"');
//ob_start();
if (isset($_GET['filename'])) {
  $filename = urldecode($_GET['filename']);
  $file = basename($filename);

  if (file_exists($file . '.json')) {
    $info = json_decode(file_get_contents($file . '.json'));
    if (is_string($info)) {
      $info = json_decode($info);
    }
    $item = $info->items[0];
    $snippet = $item->snippet;
    $title = $snippet->title;
    if ($title) {
      header('Content-Description: File Transfer');
      header('Content-Type: application/octet-stream');
      //header('Content-Type: ' . mime_content_type($file . '.mp3'));
      header('Content-Transfer-Encoding: Binary');
      header('Content-Disposition: attachment; filename=' . $title . '.mp3');
      header('Expires: 0');
      header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
      header('Pragma: public');
      header('Content-Length: ' . filesize($file . '.mp3'));
      ob_clean();
      flush();
      @readfile($file);
    }
    exit;
  }
}

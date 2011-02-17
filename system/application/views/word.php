<?

header("Content-Type: application/vnd.ms-word");
header("Expires: 0");
header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
header("content-disposition: attachment;filename=".$fileName);

echo '<html><body>';
echo $html;
echo '</body></html>';
?>
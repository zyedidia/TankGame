<?php
if(!empty($_POST['data'])){
	$data = $_POST['data'];
	$fname = $_POST['filename'];

	$file = fopen("../game/" . $fname, 'w');
	fwrite($file, $data);
	fclose($file);
}
?>

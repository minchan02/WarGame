<?php
// seed length is 32
$seed = file_get_contents("/seed.txt");

if(isset($_GET['pos'])){
    $pos = $_GET['pos'];
    if ($pos < 1 || $pos > 32) {
        echo "Invalid Value!";
        exit;
    }
    
    $character = $seed[$pos - 1];
    
    if (ctype_alpha($character)) {
        echo "Alpha";
    } elseif (ctype_digit($character)) {
        echo "Digit";
    }
}

?>
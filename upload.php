<?php

set_error_handler(function($errno, $errstr) {
    http_response_code(500);
    echo "Error: ".$errstr;
    exit;
});

move_uploaded_file($_FILES["file"]["tmp_name"],"/tmp/".$_POST["resumableIdentifier"]."_".$_POST["resumableChunkNumber"]);

$merge = true;
for ( $i = 1; $i <= $_POST["resumableTotalChunks"]; $i++ ) {
    if ( file_exists( "/tmp/".$_POST["resumableIdentifier"]."_".$i ) == false) {
        $merge = false;
    }
}

if($merge){
    if(!file_exists("../upload/".$_POST["resumableRelativePath"])){
        mkdir("../upload/".$_POST["resumableRelativePath"]);
        chmod("../upload/".$_POST["resumableRelativePath"],0775);
    }
    for ($i = 1; $i <= $_POST["resumableTotalChunks"]; $i++) {
        $file = fopen("/tmp/".$_POST["resumableIdentifier"]."_".$i, 'rb');
        $buff = fread($file,$_POST["resumableChunkSize"]*2);
        fclose($file);
  
        $final = fopen("../upload/".$_POST["resumableRelativePath"]."/".$_POST["resumableFilename"], 'ab');
        $write = fwrite($final, $buff);
        fclose($final);

        unlink("/tmp/".$_POST["resumableIdentifier"]."_".$i);
    }
    chmod("../upload/".$_POST["resumableRelativePath"]."/".$_POST["resumableFilename"],0775);
}
http_response_code(200);

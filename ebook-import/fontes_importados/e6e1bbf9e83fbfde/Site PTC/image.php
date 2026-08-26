<?php 
/*************************************************************************** 
* 
* Filename : image.php 
* Began : 2005/04/04 
* Modified : 
* Copyright : (c) 2005 xkare.com 
* Version : 1.0 
* Written by : Mert ÖĞÜT in istanbul / TURKEY 
* 
* You are encouraged to redistribute and / or modify this program under the terms of 
* the GNU General Public License as published by the Free Software Foundation 
* (www.fsf.org); any version as from version 2 of the License. 
* 
***************************************************************************/ 
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

session_start(); 
function strrand($length) 
{ 
$str = ""; 

while(strlen($str)<$length){ 
$random=rand(48,122); 
if( ($random>47 && $random<58) ){ 
$str.=chr($random); 
} 

} 

return $str; 
} 

$text = $_SESSION['string']=strrand(6); 
$img_number = imagecreate(55,17); 
$backcolor = imagecolorallocate($img_number,244,244,244); 
$textcolor = imagecolorallocate($img_number,0,0,0); 

imagefill($img_number,0,0,$backcolor); 

imagestring($img_number,50,1,1,$text,$textcolor); 

header("Content-type: image/png"); 
imagejpeg($img_number); 
?>
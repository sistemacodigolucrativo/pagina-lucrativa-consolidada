<?php
error_reporting(0);
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

function limitatexto( $texto, $limite )
{
if( strlen($texto)>$limite )
{
$texto = substr( $texto,0,$limite );
}
return $texto;

}

function mostrarTemplate($tema, $variables)
{
//var_dump($variables);
extract($variables);
eval("?>".$tema."<?");
}

function parsearTags($mensaje)
{
$mensaje = str_replace("[citar]", "<blockquote><hr width='100%' size='2'>", $mensaje);
$mensaje = str_replace("[/citar]", "<hr width='100%' size='2'></blockquote>", $mensaje);
return $mensaje;
}

// funcion para validar email
function ValidaMail($pMail) {
if (ereg("^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@+([_a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]{2,200}\.[a-zA-Z]{2,6}$", $pMail ) ) {
return true;
} elseif ($_POST["email"]="NULL") {
echo "<h4 style=\"color:red;\"><b>Error</b> - The email field is Empety.</h4>";
} else {
echo "<h4 style=\"color:red;\"><b>Error</b> - Your email is invalid.</h4>";
}
}

// minimo de carateres
function minimo($contenido) {

// echo "Everything's fine ...";
return $contenido;
}


function minimopass($contenido) {
// echo "Everything's fine ...";
return $contenido;
}

// funcion para sanitizar variables
function limpiar($mensaje)
{
$mensaje = htmlentities(stripslashes(trim($mensaje)));
$mensaje = str_replace("'"," ",$mensaje);
$mensaje = str_replace(";"," ",$mensaje);
$mensaje = str_replace("$"," ",$mensaje);
return $mensaje;
}

function shout($nombre_usuario){
if (ereg("^[a-zA-Z0-9\-_]{3,20}$", $nombre_usuario)) {
// echo "The field $username is correct<br>";
return $nombre_usuario;
} else {
echo "<h4 style=\"color:red;\"><b>Error</b> - The field $nombre_usuario is using invalid characters.</h4>"; 
}
}

// universal cleaner function


function uc($mensaje)
{

if (ereg("^[a-zA-Z0-9\-_]{3,20}$", $mensaje)) {
// echo "El campo $mensaje es correcto<br>";
$mensaje = htmlentities(stripslashes(strtolower(trim($mensaje))));
$mensaje = str_replace("'"," ",$mensaje);
$mensaje = str_replace(";"," ",$mensaje);
$mensaje = str_replace("$"," ",$mensaje);
return $mensaje;
} else {
echo "<h4 style=\"color:red;\"><b>Error</b> - The field $nombre_usuario is using invalid characters.</h4>"; 

}

}

//funcion para añadir smylies

function caretos($texto,$ruta)
{
$i="<img src=\"$ruta/";
$i_="\" >";
$texto=str_replace(":)",$i."icon_smile.gif".$i_,$texto);
$texto=str_replace(":D",$i."icon_biggrin.gif".$i_,$texto);
$texto=str_replace("^^",$i."icon_cheesygrin.gif".$i_,$texto);

$texto=str_replace("xD",$i."icon_lol.gif".$i_,$texto);
$texto=str_replace("XD",$i."icon_lol.gif".$i_,$texto);

$texto=str_replace(":|",$i."icon_neutral.gif".$i_,$texto);
$texto=str_replace(":(",$i."icon_sad.gif".$i_,$texto);
$texto=str_replace(":&#039(",$i."icon_cry.gif".$i_,$texto);
$texto=str_replace(":O",$i."icon_surprised.gif".$i_,$texto);
$texto=str_replace("B)",$i."icon_cool.gif".$i_,$texto);
$texto=str_replace("8|",$i."icon_rolleyes.gif".$i_,$texto);
$texto=str_replace("O_O",$i."icon_eek.gif".$i_,$texto);
$texto=str_replace(":P",$i."icon_razz.gif".$i_,$texto);
$texto=str_replace(":?",$i."icon_confused.gif".$i_,$texto);
$texto=str_replace("^:@",$i."icon_evil.gif".$i_,$texto);
$texto=str_replace("^_-",$i."icon_frown.gif".$i_,$texto);
$texto=str_replace("!(",$i."icon_mad.gif".$i_,$texto);
$texto=str_replace("^)",$i."icon_twisted.gif".$i_,$texto);
$texto=str_replace(";)",$i."icon_wink.gif".$i_,$texto);
$texto=str_replace(":B",$i."drool.gif".$i_,$texto);
return $texto;
}

// ip real
function getRealIP()
{

if( $_SERVER['HTTP_X_FORWARDED_FOR'] != '' )
{
$client_ip =
( !empty($_SERVER['REMOTE_ADDR']) ) ?
$_SERVER['REMOTE_ADDR']
:
( ( !empty($_ENV['REMOTE_ADDR']) ) ?
$_ENV['REMOTE_ADDR']
:
"unknown" );


// Proxies are added at the end of this header
// Ip addresses that are "hiding". To locate the actual IP
// User begins to look for the beginning to find
// Ip address range that is not private. If not
// Found none is taken as the value REMOTE_ADDR

$entries = split('[, ]', $_SERVER['HTTP_X_FORWARDED_FOR']);

reset($entries);
while (list(, $entry) = each($entries))
{
$entry = trim($entry);
if ( preg_match("/^([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/", $entry, $ip_list) )
{
// http://www.faqs.org/rfcs/rfc1918.html
$private_ip = array(
'/^0\./',
'/^127\.0\.0\.1/',
'/^192\.168\..*/',
'/^172\.((1[6-9])|(2[0-9])|(3[0-1]))\..*/',
'/^10\..*/');

$found_ip = preg_replace($private_ip, $client_ip, $ip_list[1]);

if ($client_ip != $found_ip)
{
$client_ip = $found_ip;
break;
}
}
}
}
else
{
$client_ip =
( !empty($_SERVER['REMOTE_ADDR']) ) ?
$_SERVER['REMOTE_ADDR']
:
( ( !empty($_ENV['REMOTE_ADDR']) ) ?
$_ENV['REMOTE_ADDR']
:
"unknown" );
}

return $client_ip;

}

?>
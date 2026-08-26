<?
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

if(isset($_COOKIE["usNick"]) && isset($_COOKIE["usPass"]))
{

$_COOKIE["usNick"] = "";
setcookie(usNick,"x",time() - 7776000);

$_COOKIE["usPass"] = "";
setcookie(usPass,"x",time() - 7776000);

$_COOKIE["visitas"] = "";
setcookie(visitas,"x",time() - 7776000);
}
header("Location: index.php");
?>


<?php
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

$dhost 			= "localhost"; //usually localhost, or ip
$dusername 		= "usuario"; // database user
$dpassword 		= "senha"; // database pass
$ddatabase 		= "banco_de_dados"; // database name
$pro_click		= "20"; 	// default 30 seconds, Premium member visit timer
$free_click		= "30";	 // default 45 seconds, Free member visit timer
$script_path	= "http://vaniabux.com"; // your script have isntalled, do not include "/" slash at the end


					//////////////////////////////////////////////
					//											//
					//											//
					//			Connect to MySQL server			//
					//		 Do not change anything bellow		//
					//											//
					//											//
					//////////////////////////////////////////////


//Connect to MySQL server///////////////////////////////////////////////////////////////
																					////
$con = mysql_connect($dhost, $dusername, $dpassword) or die("Cannot Connect"); 		////
mysql_select_db($ddatabase, $con);													////
																					////
if($_COOKIE["usNick"] and $_COOKIE["usPass"])										////
{																					////
$q = mysql_query("SELECT * FROM tb_users WHERE username='{$_COOKIE['usNick']}' AND	 password='{$_COOKIE['usPass']}'") or die(mysql_error());							////
if(mysql_num_rows($q) == 0)															////
{																					////
$_COOKIE['usNick'] = false;															////
$_COOKIE['usPass'] = false;															////
} else {																			////
$loggedin = 1;																		////
$r = mysql_fetch_array($q);															////
}																					////
}																					////
$da = date("j");																	////
																					////
$queryxx = "DELETE FROM ad_clicks WHERE day!='$da'";								////
mysql_query($queryxx);																////
																					////
$q2 = mysql_query("SELECT * FROM settings");										////
while($r2=mysql_fetch_array($q2))													////
{																					////
$set[$r2[setname]]=$r2["setvalue"];													////
}																					////
mysql_query("UPDATE settings SET setvalue='0', set_day='{$da}' WHERE set_day!='{$da}' AND set_day>'0'") or die(mysql_error());															////
$user=$_COOKIE['usNick'];															////
																					////
////////////////////////////////////////////////////////////////////////////////////////

?>

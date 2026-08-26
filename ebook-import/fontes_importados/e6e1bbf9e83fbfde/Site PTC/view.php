<?
session_start();
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

require('config.php');
global $c;
require('data.php');
global $config;
require('funciones.php');
$adse=securedata($_GET["ad"]);

if(isset($_GET['example']))
{
die("<body bgcolor='#FFFFFF'></body>");
}
if(!$_GET['ad'])
{
die("<b>Error</b> - You need the advertisement ID.");
}
if(!isset($_COOKIE["usNick"]) && !isset($_COOKIE["usPass"]))
{
      $sqlz = "SELECT * FROM ads WHERE ad_id='$adse'";
      $resultz = mysql_query($sqlz);        
      $myrowz = mysql_fetch_array($resultz);

  if(!$loggedin)
 {
 $numero=$myrowz["outside"];

      $sqlex = "UPDATE ads SET outside=outside +'1' WHERE ad_id='$adse'";
      $resultex = mysql_query($sqlex);
 }
}


$checkad = mysql_query("SELECT * FROM ads WHERE ad_id='$adse'");
$ad_exist = mysql_num_rows($checkad);

if ($ad_exist<1) {
echo "You can only click an ad once every 24 hours."; exit();
}

$ad = mysql_fetch_array($checkad);
?>
<html>
<head>
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="-1">
<title><?=$config["title"]?></title>

<script>
<?php 
if ($r["account"]=="premium") {
?>
var x = <?=$config['pro_click'] + 1; ?>;
<?php } else { ?>
var x = <?=$config['free_click'] + 1; ?>;
<?php } ?>
var y = 1;
function startClock() {
	if (x !== 'Done') {
		x = x-y;
		document.frm.clock.value = x;
		setTimeout("startClock()", 1000);

	}
	if (x == 0) {
		x = 'Done';
		document.frm.clock.value = x;
               var code = "<?php
if($loggedin==1)
{
$site_code = md5(time().sha1(microtime()));
} else {
$site_code = "Not Login";
}
$_SESSION["adcode"] = $site_code;
print($site_code);

?>";
               var ad= "<?=$_GET['ad']?>";
	success.location.href="success.php?ad="+ad+"&code="+code+"&verify=1";
	}
}
</script>

</head>
<body leftmargin="0" rightmargin="0" topmargin="0" bottommargin="0" onLoad="startClock()">
<form name="frm">
	<table border="0" cellpadding="0" cellspacing="0" width="100%">
		<tbody>
			  <tr> 
				<td class="maintopright" style=" background:url(images/adloading.gif) no-repeat 150px;border-bottom: 2px solid rgb(51, 51, 51); font-family: Verdana; font-size: 13px;" width="50%">
			  <div class="maintopright">&nbsp;&nbsp;<img src="images/top_small.jpg" align="middle" />&nbsp;&nbsp;&nbsp;&nbsp;
			  <input name="clock" size="3" readonly="readonly" style="border: medium none ; padding: 0pt; font-size: 25pt; font-family: Verdana; vertical-align: top;" type="text">
			  <iframe name="success" src="view.php?example" border="0" framespacing="0" marginheight="0" marginwidth="0" vspace="0" hspace="0" style="vertical-align: top;" frameborder="0" height="48" scrolling="no" width="48"></iframe>
			  </div>
			</td>
			<td style="border-bottom: 2px solid rgb(51, 51, 51); font-family: Verdana; font-size: 13px; " align="left" valign="middle" width="50%">
<strong>Por favor, tome o tempo para visitar o patrocinador abaixo.<br>
Mostre seu Website abaixo por apenas <a href="index.php?option=advertise" target="_blank">$<?=$rowz1["price"]?></a>!</strong>	 </td>
		</tr>
		  </tbody>
		 </table>
		 <iframe src="<?=$ad["ad_url"]?>" border="0" framspacing="0" marginheight="0" marginwidth="0" vspace="0" hspace="0" frameborder="0" height="100%" scrolling="yes" width="100%"></iframe>
		</form>
			</body>
</html>

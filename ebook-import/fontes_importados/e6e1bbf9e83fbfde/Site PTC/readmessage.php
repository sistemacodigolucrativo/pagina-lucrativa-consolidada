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

include "config.php";
global $c,$loggedin;
include "data.php";
global $config;
include "funciones.php";
?>
<? include "header2.php"; ?>

<!-- content begin here -->
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif" /></td>
<td class="mainbg" align="center" valign="top" bgcolor="#FFFFFF" >
<table width="95%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<?php

    if (file_exists(dirname($HTTP_SERVER_VARS) . '/install'))
	{
		if($loggedin == 1)
		{
			if($_COOKIE["usNick"]=="admin")
			{
				echo "<br /><br />";
				echo "<center><h1>Install directory is exist,<br /><br /><u>Please Remove or Delete Install Directory</u></h1></center>";
				echo "<br /><br />";
			} else {
				echo "<br /><br />";
				echo "<center><h1>Website is Undder Re-Constructions,<br /><br />Please Check Back Soon!</h1>";
				echo "<br /><h4>Please <a href=\"contact.php\"><b>Contact</b></a> The Administrator</h4>";
				echo "</center>";
			}
		} else {
				echo "<br /><br />";
				echo "<center><h1>Website is Undder Re-Constructions,<br /><br />Please Check Back Soon!</h1>";
				echo "<br /><h4>Please <a href=\"contact.php\"><b>Contact</b></a> The Administrator</h4>";
				echo "</center>";
		}
}
else { 
?>

<table width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td class="main" style="width: 95%; vertical-align: top;">
					<br />

<?
if(!isset($_COOKIE["usNick"]) && !isset($_COOKIE["usPass"]))
{
print "<h3>Member Area</h3>
<h4>You must be logged in to Access this area.</h4>
<h4><a href='register.php'>Sign up free</a></h4>
<h4><a href='login.php'>Login into your current account.</a></h4>";

} else {

 include('menum.php'); ?>
<br>
<h3>Ver Mensagens</h3>
<?
$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);
?>
<?
require('config.php');
$id=$_GET["id"];
$lole=$_COOKIE["usNick"];
$sql = "SELECT * FROM tb_messenger where id='$id' and sendto='$lole'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);
$query = "UPDATE tb_messenger SET status='read' where id='$id'"; mysql_query($query) or die(mysql_error());
mysql_close($con);
?>
<br>
<div align="center"><div id="form">

<form method="POST" action="replymessage.php?to=<?= $row["sendfrom"] ?>">
<table width="400" border="0" align="center">
  <tr>
    <td width="150" align="left"><label>Data</label></td>
    <td width="250" align="left"><? echo $row["date"]; ?></td>
  </tr>
  <tr>
    <td width="150" align="left"><label>Para</label></td>
	<td width="250" align="left"><? echo $row["sendfrom"]; ?></td>
  </tr>
  <tr>
    <td width="150" align="left"><label>Mensagem</label></td>
	<td width="250" align="left"><? echo $row["comments"]; ?></td>
  </tr>
  <tr>
    <td width="150" align="left">&nbsp;</td>
    <td width="250" align="right"><input type="submit" value="Responder" class="inputbox" tabindex="4" />
	</td>
  </tr>
</table>
</form>
</div></div>
<?php } ?>
				</td>
				</tr>
				</table>
<br />


<?php	} ?>				

</td>
</tr>
</table>
</td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
</table>
	<!-- content-wrap ends here -->	
<? include "footer.php"; ?>
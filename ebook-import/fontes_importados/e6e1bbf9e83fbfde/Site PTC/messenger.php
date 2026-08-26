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
print "<h3>Area de Membros</h3>
<h4>You must be logged in to Access this area.</h4>
<h4><a href='register.php'>Sign up free</a></h4>
<h4><a href='login.php'>Login into your current account.</a></h4>";

} else {

 include('menum.php'); ?>
<br>

<?
$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);
?>
<h3>Entre em contato com seus Indicados.</h3>
<br>

<?
 

if (isset($_GET["id"]))
{


$id=$_GET["id"];
$to=$_GET["to"];
$option=$_GET["option"];


?>


<? require "config.php";


if ($option=="delete"){
    //Todo parece correcto procedemos con la inserccion
    $queryz = "DELETE FROM tb_messenger WHERE id='$id' LIMIT 1";
    mysql_query($queryz) or die(mysql_error());
mysql_close($con);
    echo "<font color=\"#cc0000\"><b>Message has been deleted.</b></font><br><br>";
}

if ($option=="read"){


    echo "<font color=\"#cc0000\"><b>Message has been deleted.</b></font><br><br>";
}


}


$user=$_COOKIE["usNick"];

$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);

mysql_close($con);
if ($row['account'] =="premium"){
	echo"
		<p align='center'><a href=\"sendmessage.php\">Envie Mensagens para seus Indicados</a></p>
"; } else{
	echo"
		<p align='center'><a href=\"#\"><del>Envie Mensagens para seus Indicados</del></a>&nbsp;&nbsp;Somente membros Premium podem usar essa função</p>
"; }
?>

<table style="border:1px solid #000;" align="center" cellspacing="0" cellpadding="0" width="95%" align="center">
<tr>
<th style="border-bottom:1px solid #000;" class="top" width="35%">Data</th>
<th style="border-bottom:1px solid #000;" class="top" width="35%">Para</th>
<th style="border-bottom:1px solid #000;" class="top" width="15%">&nbsp;</th>
<th style="border-bottom:1px solid #000;" class="top" width="15%">&nbsp;</th>
</tr>
<? require "config.php";
$lole=$_COOKIE["usNick"];
$tabla = mysql_query("SELECT * FROM tb_messenger where sendto='$lole' ORDER BY id DESC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre
mysql_close($con);
while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen

if ( $registro["status"] == 'unread'){

echo "
<tr>
<td class='main'><font color='red'><strong>". $registro["date"] ."</strong></font></td>
<td class='main' align='center'><font color='red'><strong>". $registro["sendfrom"] ."</strong></font></td>
<td>";
} else{
echo "
<tr>
<td class='main' align='center'>". $registro["date"] ."</td>
<td class='main' align='center'>". $registro["sendfrom"] ."</td>
<td class='main' valign='middle' >";
}

?><div align="center">
<a href="readmessage.php?id=<?= $registro["id"] ?>&option=read" title="Read Message"><span class="iputbox">Ver</span></a>
</div>
</td>
<td class='main' valign="middle">
<div align="center">
<form method="post" action="messenger.php?id=<?= $registro["id"] ?>&option=delete">
<input type="submit" value="Delete" class="inputbox">
</form>
</div>
</td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>
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
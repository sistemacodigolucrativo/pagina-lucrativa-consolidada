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

include "../config.php";
$check_refs = mysql_query("SELECT * FROM tb_buyref");

$refs = mysql_num_rows($check_refs);

$check_messages = mysql_query("SELECT * FROM tb_contact");

$messages = mysql_num_rows($check_messages);

$check_payments = mysql_query("SELECT * FROM tb_payme");

$payments = mysql_num_rows($check_payments);

$check_upgrade = mysql_query("SELECT * FROM tb_upgrade WHERE status!='upgraded' ORDER BY id ASC");

$upgrader = mysql_num_rows($check_upgrade);

$check_ads = mysql_query("SELECT * FROM ads WHERE active='0' ORDER BY ad_id ASC");

$ads = mysql_num_rows($check_ads);
/*
$check_offers = mysql_query("SELECT * FROM offers");

$offers = mysql_num_rows($check_offers);

$check_lottery = mysql_query("SELECT * FROM lotterypurchases");

$lottery = mysql_num_rows($check_lottery);
*/
mysql_close($con);

global $loggedin;

if($_GET['r'])
{
$_SESSION['r'] = $_GET['r'];
}
$user = $_COOKIE['ucNick'];

if($loggedin == 1)
{
if($_COOKIE["usNick"]=="admin")
{

global $c,$loggedin;
include "data.php";
global $config;
include "../funciones.php";
?>

<?
if(!isset($_COOKIE["usNick"]) && !isset($_COOKIE["usPass"]))
{
exit();
}
/*
if($_COOKIE["usNick"]=="admin")
{
echo "<b><a href=\"admin.php\">Admin</a></b> - ";
}

include('menum.php');
*/

if($_COOKIE["usNick"]!="admin")
{
exit();
}

?>

<? include "header.php"; ?>

<div id="main2">				

<h1 align="center"><font color="red"><b>Welcome to the admin section</b></font></h1>
<?php
    if (file_exists(dirname($HTTP_SERVER_VARS) . '../install'))
	{
		echo "<br />";
		echo "<center><h3>Install directory is exist,<br /><br /><u>Please Remove or Delete Install Directory</u></h3></center>";
		echo "<br />";
	}
?>

<table width="99%" align="center" bgcolor="#eeeeee" style="border:1px #000 solid;">
<tr><td valign="top" style="border:1px solid #000; padding-top:5px; padding-bottom:5px;">
<b>Site Configuration</b><br>
- <a href="admin.php?op=15">Main config</a><br>
- <a href="admin.php?op=13">Advertisement prices</a><br>
- <a href="admin.php?op=16">Referal set prices</a><br>
- <a href="admin.php?op=14">User click earnings</a>
<br><br>
<b>Advertisers</b><br>
- <a href="admin.php?op=1">Approve or deny advertisers requests (<?php echo $ads ?>)</a><br>
- <a href="admin.php?op=2">Edit ADS</a>
<br><br>
<b>Contact</b><br>
- <a href="admin.php?op=3">Messages from contact section (<?php echo $messages ?>)</a>
</td><td valign="top" style="border:1px solid #000; padding-top:5px; padding-bottom:5px;">
<b>Payments</b><br>
- <a href="admin.php?op=4">Payments requests (<?php echo $payments ?>)</a>
<br><br>
<b>Sell referals</b><br>
- <a href="admin.php?op=5">Sell sets of referals </a><br>
- <a href="admin.php?op=6">Approve or deny purchase of referals requests (<?php echo $refs ?>)</a>
<br><br>
<b>Upgrade</b><br>
- <a href="admin.php?op=11">Approve or deny upgrade requests (<?php echo $upgrader ?>)</a>
<br><br>
<b>Users</b><br>
- <a href="admin.php?op=7">Edit or delete users</a><br>
- <a href="admin.php?op=12">Search users</a>
</b>
</font>
</td></tr></table>
<br>
<?

$op = $_GET["op"];
switch($op) {
case(1):

?>

<center><h1>Approve or deny advertisers requests</h1></center>

<?

if (isset($_GET["id"]))
{

$id=$_GET["id"];
$option=$_GET["option"];

if ($option=="approve"){


//Todo parece correcto procedemos con la inserccion
$query = "UPDATE ads SET active='1' WHERE ad_id='$id'";
mysql_query($query) or die(mysql_error());
mysql_query("UPDATE settings SET setvalue=setvalue+'1' WHERE setname='newadstoday'");
mysql_query("UPDATE settings SET setvalue=setvalue+'1' WHERE setname='totalads'");

echo "<font color=\"green\"><h2><center>Advertise request has been approved.</center></h2></font>";
}

if ($option=="deny"){

$queryz = "DELETE FROM ads WHERE ad_id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>Advertise request has been denied.</center></h2></font>";
}


}
?>

<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Alertpay Info
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
visits
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
URL
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
description
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Premium?
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Exchanged?
</b></font></td><td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Price
</b></font></td>
</tr>
<?

$tableq = mysql_query("SELECT * FROM ads WHERE active='0' ORDER BY ad_id ASC");


while ($ad = mysql_fetch_array($tableq)) {

$ad_plan = $ad['ad_plan'];
if($ad_plan == 1)
{
$visits=100;
$price=$rowz1["price"];
}
if($ad_plan == 2)
{
$visits=500;
$price=$rowz2["price"];
}
if($ad_plan == 3)
{
$visits=1000;
$price=$rowz3["price"];
}
if($ad_plan == 4)
{
$visits=2500;
$price=$rowz4["price"];
}
elseif($ad_plan == 5)
{
$visits=5000;
$price=$rowz5["price"];
}
elseif($ad_plan == 6)
{
$visits=10000;
$price=$rowz6["price"];
} elseif($ad_plan == 7)
{
$visits=50000;
$price=$rowz7["price"];
}
elseif($ad_plan == 8)
{
$visits=100000;
$price=$rowz8["price"];
}
elseif($ad_plan == 9)
{
$visits=500000;
$price=$rowz9["price"];
}
elseif($ad_plan == 10)
{
$visits=1000000;
$price=$rowz10["price"];
}


echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
Name:". $ad["ad_name"] ."<br />
Email: ".$ad["ad_email"]."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $visits ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $ad["ad_url"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $ad["ad_description"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $ad["premium"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $ad["ad_balance"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $price ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=1&amp;id=<?= $ad["ad_id"] ?>&amp;option=approve">
<input class="inputbox" type="submit" value="approve">
</form>

<form method="post" action="admin.php?op=1&amp;id=<?= $ad["ad_id"] ?>&amp;option=deny">
<input class="inputbox" type="submit" value="deny">
</form>

</font></td></td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>



<?
break;
case (2):

?>

<center><h1>Edit Ads</h1></center>

<?


if ($_POST)
{

$id=$_POST["ad_id"];
$clicksleft=$_POST["clicksleft"];
$ad_url=$_POST["ad_url"];
$ad_description=$_POST["ad_description"];
$premium=$_POST["premium"];

//Todo parece correcto procedemos con la inserccion
$query = "UPDATE ads SET ad_url='$ad_url', ad_description='$ad_description', clicksleft='$clicksleft', premium='$premium' where ad_id='$id'";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>Advertisement successfully edited.</center></h2></font>";


}

if (isset($_GET["id"]))
{

$id=$_GET["id"];
$option=$_GET["option"];
if ($option=="edit"){

?>


<?

$tablae = mysql_query("SELECT * FROM ads where ad_id='$id'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registroe = mysql_fetch_array($tablae)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


?>

<form method="post" action="admin.php?op=2">

Id: <input type="hidden" name="ad_id" value="<?= $registroe["ad_id"] ?>"><?= $registroe["ad_id"] ?><br>
Clicks Remaining: <input type="text" name="clicksleft" value="<?= $registroe["clicksleft"] ?>"><br>
URL: <input type="text" name="ad_url" value="<?= $registroe["ad_url"] ?>"><br>
Description: <input type="text" name="ad_description" value="<?= $registroe["ad_description"] ?>"><br>
Premium: <input type="text" name="premium" value="<?= $registroe["premium"] ?>" >
<br><br>

<input type="submit" value="Save" class="inputbox">

</form>
<br><br>
<?
}
?>

<?

}

if ($option=="delete"){

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM ads WHERE ad_id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>Advertisement has been deleted.</center></h2></font>";
}


}
?>

<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Id
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
URL
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Description
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Clicks Remaining
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Premium?
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>

</b></font></td>
</tr>
<?

$tabla = mysql_query("SELECT * FROM ads WHERE active='1' ORDER BY ad_id ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["ad_id"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["ad_url"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["ad_description"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["clicksleft"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["premium"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=2&amp;id=<?= $registro["ad_id"] ?>&amp;option=edit">
<input class="inputbox" type="submit" value="Edit">
</form>
</font>
</td>
<td bgcolor="#eeeeee">
<form method="post" action="admin.php?op=2&amp;id=<?= $registro["ad_id"] ?>&amp;option=delete">
<input class="inputbox" type="submit" value="Delete">
</form>
</td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>

<?

break;
case (3):

?>

<?

if (isset($_GET["id"]))
{
$id=$_GET["id"];
$option=$_GET["option"];

if ($option=="delete")
{

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_contact WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>Message has been deleted.</center></h2></font>";


}

}

?>
<center><h1>Messages</h1></center>

<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Id
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Name
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
E-mail
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Topic
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Subject
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Comments
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Ip
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>

</b></font></td>
</tr>
<?

$tabla = mysql_query("SELECT * FROM tb_contact ORDER BY id ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["id"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["name"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["email"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["topic"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["subject"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["comments"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["ip"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=3&amp;id=<?= $registro["id"] ?>&amp;option=delete">
<input class="inputbox" type="submit" value="Delete">
</form>

</font></td>
<tr>


<?


} // fin del bucle de ordenes

?>
</table>
<?
break;
case (4):

if (isset($_GET["id"]))
{

$username=$_POST["username"];
$id=$_GET["id"];
$option=$_GET["option"];

if ($option=="paid")
{


$username=$_POST["username"];



$tablae = mysql_query("SELECT * FROM tb_users where username='$username'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre
while ($registroe = mysql_fetch_array($tablae)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen

$lolze=$registroe["money"];
$lolza=$_POST["money"];

$moneye= $lolze - $lolza;

$lolzea=$registroe["paid"];
$moneyere= $lolzea + $lolza;

//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_users SET money='$moneye', paid='$moneyere' where username='$username'";
mysql_query($query) or die(mysql_error());

$eltiempo=time();
$lafecha=date("d M Y H:i",$eltiempo);

//Todo parece correcto procedemos con la inserccion
$query = "INSERT INTO tb_history (user, date, amount, method, status) VALUES('$username','$lafecha','$lolza','Alertpay','Payment Sent')";
mysql_query($query) or die(mysql_error());

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_payme WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());


echo "<font color=\"green\"><h2><center>User stats has been updated.</center></h2></font>";

}

}

}

?>
<center><h1>Payments requests</h1></center>
<center><h3>When you have made the payment via <a href="https://www.alertpay.com/?mGcJgFGBWT8cIeXb2Saomg==" target="_blank">Alertpay</a> push the buttom "Paid".</h3></center>

<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Account Type
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Date
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Username
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
E-mail
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Alertpay email
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Amount to pay
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Ip
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Account Status
</b></td>
</tr>

<?
$tabla = mysql_query("SELECT * FROM tb_payme ORDER BY id ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre
while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen
$multis = mysql_query("SELECT COUNT(*) AS cnt FROM tb_users WHERE ip LIKE ('%{$registro['ip']}%')");
$multis = mysql_fetch_array($multis);
$multis = $multis["cnt"];


echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["account"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["date"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["username"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["email"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["pemail"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["money"] ."
</font></td>

<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["ip"] ."
</font></td><td bgcolor=\"#eeeeee\">";
if($multis > 1)
{
print "<font size=\"1\" face=\"verdana\" color='red'>Cheater</font>";
} else {
print "<font size=\"1\" face=\"verdana\" color='green'>OK</font>";
}
print "</td><td>";

?>

<td bgcolor="#eeeeee">
<form method="post" action="admin.php?op=4&amp;id=<?= $registro["id"] ?>&amp;option=paid">
<input type="hidden" name="money" value="<?= $registro["money"] ?>">
<input type="hidden" name="username" value="<?= $registro["username"] ?>">
<input class="inputbox" type="submit" value="Paid">
</form>
</td>
</tr>

<?



} // fin del bucle de ordenes



?>
</table>
<?
break;
case (5):

if (isset($_POST["number"])) {


$number=$_POST["number"];

$tablea = mysql_query("SELECT * FROM tb_buyref where id='1'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registreo = mysql_fetch_array($tablea)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


$new=$_POST["number"];

//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_buyref SET sets='$new', id='1' where id='1' ";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>Updated.</center></h2></font>";

}

}
?>

<h3>Users without referer: <b style="background-color:#CCCCCC;"><?
$checkpemail = mysql_query("SELECT * FROM tb_users WHERE referer=''");
$pemail_exist = mysql_num_rows($checkpemail);

echo $pemail_exist;
?></b></h3>

<form method="post" action="admin.php?op=5">
<b>How many USERs do you want to sell (minimum 5):</b> <input type="text" size="6" name="number" value="<?php
$tablea = mysql_query("SELECT * FROM tb_buyref where id='1'");
$tb = mysql_fetch_array($tablea);
print $tb["sets"];
?>">
<br>
<input class="inputbox" type="submit" value="Submit Query">
</form>
<?
break;
case (6):
?>
<center><h1>Buy sets of referals requests</h1></center>

<?

if (isset($_GET["id"]))
{

$id=$_GET["id"];

if ($_GET["option"]=="approve")
{

if (isset($_POST["customer"]))
{

$customer=$_POST["customer"];
$referals=$_POST['referals'];


$checkpemaile = mysql_query("SELECT * FROM tb_users WHERE referer=''");
$pemail_existe = mysql_num_rows($checkpemaile);

if ($pemail_existe<5)
{

echo "<h2><center>Error. There are not at least 5 users without referer.</center></h2>";

}else{


$tablea = mysql_query("SELECT * FROM tb_users where referer='' and username != '$customer' limit $referals;"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registreo = mysql_fetch_array($tablea)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen

$lolsr=$registreo["username"];

$sqlexe = "UPDATE tb_users SET referer='$customer' WHERE username='$lolsr'";
$resultexe = mysql_query($sqlexe);

}

$queryb = "UPDATE tb_buyref SET sets=sets-'$referals' WHERE id='1'";
mysql_query($queryb) or die(mysql_error());


$sqlex = "UPDATE tb_users SET referals=referals+'$referals' WHERE username='$customer'";
$resultex = mysql_query($sqlex);

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_buyref WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());

}

}

}

if ($_GET["option"]=="deny")
{
//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_buyref WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());
}

}

?>
<h3>Users without referer: <b style="background-color:#CCCCCC;">
<?
$checkpemail = mysql_query("SELECT * FROM tb_users WHERE referer=''");
$pemail_exist = mysql_num_rows($checkpemail);
echo $pemail_exist;
?>
</b></h3>
<b><font size="2">When you push "Approve" it automatically put the referals asigned to the customer.</font></b>
<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
customer
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Alertpay email
</b></td>
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Users Purchased
</b></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>

</b></td>
</tr>

<?

$tabla = mysql_query("SELECT * FROM tb_buyref where id!='1' ORDER BY id ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["customer"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["pemail"] ."
</font></td>";
?>
<td bgcolor="#eeeeee"><font size="2" face="verdana">
<?=$registro["sets"];?> Users purchased
</td>
<td bgcolor="#eeeeee">
<form method="post" action="admin.php?op=6&amp;id=<?= $registro["id"] ?>&amp;option=approve">
<input type="hidden" name="customer" value="<?= $registro["customer"] ?>">
<input type="hidden" name="referals" value="<?= $registro["sets"] ?>">
<input class="inputbox" type="submit" value="Approve">
</form>

<form method="post" action="admin.php?op=6&amp;id=<?= $registro["id"] ?>&amp;option=deny">
<input class="inputbox" type="submit" value="Deny">
</form>
</td>
<tr>

<?

} // fin del bucle de ordenes



?>
</table>

<?
break;
case (7):

?>


<center><h1>Edit Users</h1></center>

<?


if (isset($_POST["id"]))
{

$id=$_POST["id"];
$username=$_POST["username"];
$password=$_POST["password"];
$referer=$_POST["referer"];
$email=$_POST["email"];
$pemail=$_POST["pemail"];
$country=$_POST["country"];
$vistis=$_POST["vistis"];
$referals=$_POST["referals"];
$referalvisits=$_POST["referalvisits"];
$money=$_POST["money"];
$account=$_POST["account"];

//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_users SET username='$username', password='$password', referer='$referer', email='$email', pemail='$pemail', country='$country', visits='$vistis', referals='$referals', referalvisits='$referalvisits', money='$money', account='$account' where id='$id'";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>User edited.</center></h2></font>";

}


if (isset($_GET["id"]))
{

$id=$_GET["id"];

if ($_GET["option"]=="edit")
{
?>

<?

$tablae = mysql_query("SELECT * FROM tb_users where id='$id'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre
while ($registroe = mysql_fetch_array($tablae)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


?>

<form method="post" action="admin.php?op=7">

Id: <input type="hidden" name="id" value="<?= $registroe["id"] ?>"><?= $registroe["id"] ?><br>
Username: <input type="text" name="username" value="<?= $registroe["username"] ?>"><br>
Password: <input type="text" name="password" value="<?= $registroe["password"] ?>"><br>
Referer: <input type="text" name="referer" value="<?= $registroe["referer"] ?>"><br>
E-mail: <input type="text" name="email" value="<?= $registroe["email"] ?>"><br>
Alertpay e-mail: <input type="text" name="pemail" value="<?= $registroe["pemail"] ?>"><br>
Country: <input type="text" name="country" value="<?= $registroe["country"] ?>"><br>
Visits: <input type="text" name="vistis" value="<?= $registroe["visits"] ?>"><br>
Referals: <input type="text" name="referals" value="<?= $registroe["referals"] ?>"><br>
Referals visits: <input type="text" name="referalvisits" value="<?= $registroe["referalvisits"] ?>"><br>
Money: $<input type="text" name="money" value="<?= $registroe["money"] ?>"><br>
Account Type: <input type="text" name="account" value="<?= $registroe["account"] ?>"><br>
Ip: <?= $registroe["ip"] ?><br>
Join date: <?=date("d M Y h:i A", $registroe["joindate"]) ?><br>
Last log date: <?=date("d M Y h:i A", $registroe["lastlogdate"]) ?><br>
Last ip log: <?= $registroe["lastiplog"] ?><br>

<input class="inputbox" type="submit" value="Save">

</fotm>

<?

}
?>


<?
}

if ($_GET["option"]=="delete")
{

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_users WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>User deleted.</center></h2></font>";
}

}

?>
<table width="99%" align="center">
<tr>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
Id
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
Username
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
ip
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
E-mail
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
Referer
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
Visits
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
Money
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
Multi?
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
Edit
</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>
Delete
</b></font></th>
</tr>

<?

//Limito la busqueda
$TAMANO_PAGINA = 50;

//examino la página a mostrar y el inicio del registro a mostrar
$pagina = limpiar($_GET["pagina"]);
if (!$pagina) {
$inicio = 0;
$pagina=1;
}
else {
$inicio = ($pagina - 1) * $TAMANO_PAGINA;
}

$tabla = mysql_query("SELECT * FROM tb_users ORDER BY id ASC limit $inicio,$TAMANO_PAGINA"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["id"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["username"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["ip"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["email"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["referer"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["visits"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["money"] ."
</font></td>";

$ip = $registro["ip"];

    $checkip = mysql_query("SELECT ip FROM tb_users WHERE ip='$ip'");
    $ip_exist = mysql_num_rows($checkip);

if ($ip_exist>1) {
?>
<td bgcolor="#eeeeee"><blink><font color='red' size="2" style="background-color:#FFFFFF"><b>Yes</b></font></blink></td>
<?
}else{
?>
<td bgcolor="#eeeeee"><font color='reen' size="2" style="background-color:#FFFFFF"><b>No</b></font></td>
<?
}
echo "</td><td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">";
?>

<form method="post" action="admin.php?op=7&amp;id=<?= $registro["id"] ?>&amp;option=edit">
<input class="inputbox" type="submit" value="Edit">
</form>
</font>
</td>
<td bgcolor="#eeeeee">
<form method="post" action="admin.php?op=7&amp;id=<?= $registro["id"] ?>&amp;option=delete">
<input class="inputbox" type="submit" value="Delete">
</form>
</td>
</tr>
<?

} // fin del bucle de ordenes

?>
</table>

<?
$uno = securedata($_GET["pagina"]);

if (empty($uno)){
$uno = 1;
$mos = $uno + 1;
$mis = $uno - 1;

echo "<p align='center'><a href='admin.php?op=7&pagina=$mis'><font face=\"verdana\" style=\"font-size:11px;\" color=\"#000000\"><b>Prev page</b></font></a> || <a href='admin.php?op=7&pagina=$mos'><font face=\"verdana\" style=\"font-size:11px;\" color=\"#000000\"><b>Next page</b></font></a></p>";
} else {

$mos = $uno + 1;
$mis = $uno - 1;

for ($z=$mos;$z<=$mos;$z++){
echo "<p align='center'><a href='admin.php?op=7&pagina=$mis'><font face=\"verdana\" style=\"font-size:11px;\" color=\"#000000\"><b>Prev page</b></font></a> || <a href='admin.php?op=7&pagina=$z'><font face=\"verdana\" style=\"font-size:11px;\" color=\"#000000\"><b>Next page</b></font></a></p>";

}



}
?>

<?
break;
case (8):

?>


<?

break;
case (9):




if (isset($_POST["click"]))
{

$click=$_POST["click"];
$referalclick=$_POST["referalclick"];
$payment=$_POST["payment"];
$premiumclick=$_POST["premiumclick"];
$premiumreferalc=$_POST["premiumreferalc"];
$hits1000=$_POST["hits1000"];
$hits2000=$_POST["hits2000"];
$hits3000=$_POST["hits3000"];
$hits5000=$_POST["hits5000"];
$hits10000=$_POST["hits10000"];

//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_config SET price='$click' where item='click' and howmany='1'";
mysql_query($query) or die(mysql_error());

$query = "UPDATE tb_config SET price='$referalclick' where item='referalclick' and howmany='1'";
mysql_query($query) or die(mysql_error());

$query = "UPDATE tb_config SET price='$premiumclick' where item='premiumclick' and howmany='1'";
mysql_query($query) or die(mysql_error());

$query = "UPDATE tb_config SET price='$premiumreferalc' where item='premiumreferalc' and howmany='1'";
mysql_query($query) or die(mysql_error());

$query = "UPDATE tb_config SET price='$payment' where item='payment' and howmany='1'";
mysql_query($query) or die(mysql_error());


$query = "UPDATE tb_config SET price='$hits1000' where item='hits' and howmany='1000'";
mysql_query($query) or die(mysql_error());

$query = "UPDATE tb_config SET price='$hits2000' where item='hits' and howmany='2000'";
mysql_query($query) or die(mysql_error());

$query = "UPDATE tb_config SET price='$hits3000' where item='hits' and howmany='3000'";
mysql_query($query) or die(mysql_error());

$query = "UPDATE tb_config SET price='$hits5000' where item='hits' and howmany='5000'";
mysql_query($query) or die(mysql_error());

$query = "UPDATE tb_config SET price='$hits10000' where item='hits' and howmany='10000'";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>Data edited.</center></h2></font>";


}


?>
<?

$sql = "SELECT * FROM tb_config WHERE item='click' and howmany='1'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);

?>
<form method="post" action="admin.php?op=9">
<b>Users configuration</b><br>
Each member click: $<input type="text" name="click" value="<? echo $row["price"]; ?>"><br>
Each referal click: $<input type="text" name="referalclick" value="<?

$sql = "SELECT * FROM tb_config WHERE item='referalclick' and howmany='1'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);

echo $row["price"]; ?>"><br>
Minimum payout: $<input type="text" name="payment" value="<?

$sql = "SELECT * FROM tb_config WHERE item='payment' and howmany='1'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);

echo $row["price"]; ?>"><br>
<br><br>
<?

$sql = "SELECT * FROM tb_config WHERE item='premiumclick' and howmany='1'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);

?>
<b>Premium users configuration</b><br>
Each premium member click: $<input type="text" name="premiumclick" value="<? echo $row["price"]; ?>"><br>
Each premium referal click: $<input type="text" name="premiumreferalc" value="<?

$sql = "SELECT * FROM tb_config WHERE item='premiumreferalc' and howmany='1'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);

echo $row["price"]; ?>"><br>
<br><br>
<center><h1>Advertisers configuration</h1></center><br>
Advertiser purchase 50 clicks: $<input type="text" name="hits1000" value="<?

$sqla = "SELECT * FROM tb_config WHERE item='hits' and howmany='50'";
$resulta = mysql_query($sqla);
$rowa = mysql_fetch_array($resulta);

echo $rowa["price"];

?>"><br>
Advertiser purchase 100 clicks: $<input type="text" name="hits2000" value="<?

$sqled = "SELECT * FROM tb_config WHERE item='hits' and howmany='100'";
$resulted = mysql_query($sqled);
$rowed= mysql_fetch_array($resulted);

echo $rowed["price"];

?>"><br>
Advertiser purchase 150 clicks: $<input type="text" name="hits3000" value="<?

$sqli = "SELECT * FROM tb_config WHERE item='hits' and howmany='150'";
$resulti = mysql_query($sqli);
$rowi = mysql_fetch_array($resulti);

echo $rowi["price"];

?>"><br>
Advertiser purchase 200 clicks: $<input type="text" name="hits5000" value="<?

$sqlo = "SELECT * FROM tb_config WHERE item='hits' and howmany='200'";
$resulto = mysql_query($sqlo);
$rowo = mysql_fetch_array($resulto);

echo $rowo["price"];

?>"><br>
Advertiser purchase 300 clicks: $<input type="text" name="hits10000" value="<?

$sqlu = "SELECT * FROM tb_config WHERE item='hits' and howmany='300'";
$resultu = mysql_query($sqlu);
$rowu = mysql_fetch_array($resultu);

echo $rowu["price"];

?>">
<br><br>

<input class="inputbox" type="submit" value="Save changes">

</form>
<?
break;


case(10):

?>


<center><h1>Approve or deny advertisers requests</h1></center>

<?

if (isset($_GET["id"]))
{

$id=$_GET["id"];
$option=$_GET["option"];
$pemail=$_POST["pemail"];
$plan=$_POST["plan"];
$url=$_POST["url"];
$description=$_POST["description"];
$ip=$_POST["ip"];
$fechainicia=time();

if ($option=="approve"){


//Todo parece correcto procedemos con la inserccion
$query = "INSERT INTO tb_ads (fechainicia, Alertpayemail, plan, url, description, tipo) VALUES('$fechainicia','$pemail','$plan','$url','$description','ads')";
mysql_query($query) or die(mysql_error());

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_advertisers WHERE id='$id' and tipo='convert'";
mysql_query($queryz) or die(mysql_error());


$sqlue = "SELECT * FROM tb_users WHERE username='$pemail'";
$resultue = mysql_query($sqlue);
$rowue = mysql_fetch_array($resultue);

$sqlz = "SELECT * FROM tb_config WHERE item='hits' and howmany='1000'";
$resultz = mysql_query($sqlz);
$rowz = mysql_fetch_array($resultz);

$wootz=$rowue["money"] - $rowz["price"];



//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_users SET money='$wootz' where username='$pemail'";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>Avertise request has been approved.</center></h2></font>";
}



}
?>



<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Id
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
User
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Money
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Plan
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
URL
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Description
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Ip
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>

</b></font></td>
</tr>
<?

$tabla = mysql_query("SELECT * FROM tb_advertisers where tipo='convert' ORDER BY id ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["id"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["pemail"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
$". $registro["money"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["plan"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["url"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["description"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["ip"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=10&amp;id=<?= $registro["id"] ?>&amp;option=approve">
<input type="hidden" name="pemail" value="<?= $registro["pemail"] ?>">
<input type="hidden" name="plan" value="<?= $registro["plan"] ?>">
<input type="hidden" name="url" value="<?= $registro["url"] ?>">
<input type="hidden" name="description" value="<?= $registro["description"] ?>">
<input type="hidden" name="ip" value="<?= $registro["ip"] ?>">
<input class="inputbox" type="submit" value="approve">
</form>

<form method="post" action="admin.php?op=10&amp;id=<?= $registro["id"] ?>&amp;option=deny">
<input class="inputbox" type="submit" value="deny">
</form>

</font></td></td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>



<?
break;

case(11):

?>


<center><h1>Approve or deny advertisers requests</h1></center>

<?

if (isset($_GET["id"]))
{

$id=$_GET["id"];
$option=$_GET["option"];
$username=$_POST["username"];

$laip = getRealIP();

$fechainicia=time();

if ($option=="approve"){


//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_users SET account='premium' where username='$username'";
mysql_query($query) or die(mysql_error());



$sqlex = "UPDATE tb_upgrade SET status='upgraded', date='$fechainicia', ip='$laip' WHERE username='$username'";
mysql_query($sqlex) or die(mysql_error());


echo "<font color=\"green\"><h2><center>Upgrade request has been approved.</center></h2></font>";
}

if ($option=="deny"){

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_upgrade WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>Upgrade request has been denied.</center></h2></font>";
}


}
?>



<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Id
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
User
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Alertpay E-mail
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Email
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Ip
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Approve
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Deny
</b></font></td>
</tr>
<?

$tabla = mysql_query("SELECT * FROM tb_upgrade WHERE status!='upgraded' ORDER BY id ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["id"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["username"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["pemail"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">
". $registro["email"] ."
</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=11&amp;id=<?= $registro["id"] ?>&amp;option=approve">
<input type="hidden" name="username" value="<?= $registro["username"] ?>">
<input class="inputbox" type="submit" value="approve">
</form>

<form method="post" action="admin.php?op=11&amp;id=<?= $registro["id"] ?>&amp;option=deny">
<input class="inputbox" type="submit" value="deny">
</form>

</font></td></td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>
<?
break;
case (12):

?>
<center><h1>Search Users</h1></center>

<?


if (isset($_POST["id"]))
{

$id=$_POST["id"];
$username=$_POST["username"];
$password=$_POST["password"];
$referer=$_POST["referer"];
$email=$_POST["email"];
$pemail=$_POST["pemail"];
$country=$_POST["country"];
$vistis=$_POST["vistis"];
$referals=$_POST["referals"];
$referalvisits=$_POST["referalvisits"];
$money=$_POST["money"];
$account=$_POST["account"];


    //Todo parece correcto procedemos con la inserccion
    $query = "UPDATE tb_users SET username='$username', password='$password', referer='$referer', email='$email', pemail='$pemail', country='$country', visits='$vistis', referals='$referals', referalvisits='$referalvisits', money='$money', account='$account' where id='$id'";
    mysql_query($query) or die(mysql_error());

    echo "<font color=\"green\"><h2><center>User</font> ".$username." <font color=\"green\">edited.</center></h2></font>";

}


if (isset($_GET["id"]))
{

$id=$_GET["id"];

if ($_GET["option"]=="edit")
{
?>

<?

$tablae = mysql_query("SELECT * FROM tb_users where id='$id'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registroe = mysql_fetch_array($tablae)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


?>

<form method="post" action="admin.php?op=12">

Id: <input type="hidden" name="id" value="<?= $registroe["id"] ?>"><?= $registroe["id"] ?><br>
Username: <input type="text" name="username" value="<?= $registroe["username"] ?>"><br>
Password: <input type="text" name="password" value="<?= $registroe["password"] ?>"><br>
Referer: <input type="text" name="referer" value="<?= $registroe["referer"] ?>"><br>
E-mail: <input type="text" name="email" value="<?= $registroe["email"] ?>"><br>
Alertpay e-mail: <input type="text" name="pemail" value="<?= $registroe["pemail"] ?>"><br>
Country: <input type="text" name="country" value="<?= $registroe["country"] ?>"><br>
Visits: <input type="text" name="vistis" value="<?= $registroe["visits"] ?>"><br>
Referals: <input type="text" name="referals" value="<?= $registroe["referals"] ?>"><br>
Referals visits: <input type="text" name="referalvisits" value="<?= $registroe["referalvisits"] ?>"><br>
Money: $<input type="text" name="money" value="<?= $registroe["money"] ?>"><br>
Account:&nbsp; (<?= $registroe["account"] ?>)&nbsp;&nbsp;

<select name="account">

					<option value="<?= $registroe["account"] ?>"></option>
					<option value="premium">Admin</option>
					<option value="normal">User</option>
</select>
<br>


Ip: <?= $registroe["ip"] ?><br>
Join date: <?= $registroe["joindate"] ?><br>
Last log date: <?= $registroe["lastlogdate"] ?><br>
Last ip log: <?= $registroe["lastiplog"] ?><br>

<input type="submit" value="Save" class="inputbox">

</form>

<?

}
?>


<?
}

if ($_GET["option"]=="delete")
{

    //Todo parece correcto procedemos con la inserccion
    $queryz = "DELETE FROM tb_users WHERE id='$id'";
    mysql_query($queryz) or die(mysql_error());

    echo "<font color=\"#cc0000\"><h2><center>User deleted.</center></h2></font>";
}

}

?>


<br>



<?

$search=$_POST["search"];
$metode=$_POST["metode"];

if($_POST['search']){
    $resp = mysql_query("select * from tb_users where $metode LIKE '%$search%'") or die (mysql_error());
    if(mysql_num_rows($resp) == "0") {
     echo "The search did not yield any result .";
    } else {
            echo "<center><h3>SEARCH RESULTS</h3></center><br>";

			?>
			
<table width="99%" align="center">
<tr>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>Id</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>Username</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>Ip</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>E-mail</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>Referer</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>Visits</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>Money</b></font></th>
<th bgcolor="#cccccc"><font size="2" face="verdana"><b>Account Type</b></font></th>
<th bgcolor="#cccccc"></th>
<th bgcolor="#cccccc"></th>
</tr>
<?

 while($cat = mysql_fetch_array($resp)) {
		   
echo "
<tr>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">". $cat["id"] ."</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">". $cat["username"] ."</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">". $cat["ip"] ."</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">". $cat["email"] ."</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">". $cat["referer"] ."</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">". $cat["visits"] ."</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">". $cat["money"] ."</font></td>
<td bgcolor=\"#eeeeee\"><font size=\"1\" face=\"verdana\">". $cat["account"] ."</font></td>
<td bgcolor=\"#eeeeee\">";
?>
<form method="post" action="admin.php?op=12&amp;id=<?= $cat["id"] ?>&amp;option=edit">
<input type="submit" value="Edit" class="inputbox">
</form>
</td>
<td bgcolor="#eeeeee">
<form method="post" action="admin.php?op=12&amp;id=<?= $cat["id"] ?>&amp;option=delete">
<input type="submit" value="Delete" class="inputbox">
</form>
</td>
</tr>

<?

 }

	?>
</table>  
	
<?
}
}else{

	?>

<form action="" method="POST" name='form1'>

<table width="99%" align="center">
<tr>
<td width="150">Search User:</td>
<td><input type="text" size="25" maxlength="100" name="search" autocomplete="off" value="" id="search"></td></tr>
<tr>
<td width="150">By:</td>
<td><select name="metode">
					<option value="username">User Name</option>
					<option value="email">Email</option>
					<option value="pemail">Alertpay Email</option>
					<option value="referer">Referer</option>
					<option value="lastiplog">Last IP Logged From</option>
					<option value="ip">Register IP</option>
					<option value="id">ID</option>
					<option value="country">Country</option>

					
	</select>
					</td></tr>


<tr><td></td><td>
<input type="submit" value="Search" class="inputbox" name="Submit"></td></tr></table>

</form>
<br><br>


<?
}
?>

<?
break;
case (13):

?>
<?


if (isset($_POST["howmany"]))
{

$howmany=$_POST["howmany"];
$price=$_POST["price"];

//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_config SET howmany='$howmany', price='$price' where item='hits' AND howmany='$howmany'";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>Ad edited.</center></h2></font>";

}


if (isset($_GET["howmany"]))
{

$howmany=$_GET["howmany"];

if ($_GET["option"]=="edit")
{
?>

<?

$tablae = mysql_query("SELECT * FROM tb_config where item='hits' AND howmany='$howmany'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registroe = mysql_fetch_array($tablae)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


?>

<form method="post" action="admin.php?op=13">

How Many: <input type="hidden" name="howmany" value="<?= $registroe["howmany"] ?>"><?= $registroe["howmany"] ?><br>
Price: <input type="text" name="price" value="<?= $registroe["price"] ?>">
<br><br>

<input class="inputbox" type="submit" value="Save">

</form>

<?
}


?>

<?
}

if ($_GET["option"]=="delete")
{

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_users WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>User deleted.</center></h2></font>";
}

}

?>

<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
How Many
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Price
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>

</b></font></td>
</tr>
<?


$tabla = mysql_query("SELECT * FROM tb_config where item='hits' ORDER BY howmany ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">
". $registro["howmany"] ."
</font></td>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">
". $registro["price"] ."
</font></td>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=13&amp;howmany=<?= $registro["howmany"] ?>&amp;option=edit">
<input class="inputbox" type="submit" value="Edit">
</form>
</font>
</td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>

<?
break;
case (14):

?>
<?


if (isset($_POST["item"]))
{

$item=$_POST["item"];
$price=$_POST["price"];



//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_clicks SET item='$item', price='$price' where item='$item'";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>Item edited.</center></h2></font>";

}


if (isset($_GET["item"]))
{

$item=$_GET["item"];

if ($_GET["option"]=="edit")
{
?>

<?

$tablae = mysql_query("SELECT * FROM tb_clicks where item='$item'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registroe = mysql_fetch_array($tablae)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


?>

<form method="post" action="admin.php?op=14">

Item: <input type="hidden" name="item" value="<?= $registroe["item"] ?>"><?= $registroe["item"] ?><br>
Earning: <input type="text" name="price" value="<?= $registroe["price"] ?>">
<br><br>
<input class="inputbox" type="submit" value="Save">

</form>

<?
}


?>

<?
}

if ($_GET["option"]=="delete")
{

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_users WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>User deleted.</center></h2></font>";
}

}

?>

<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Item
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Earning
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>

</b></font></td>
</tr>
<?


$tabla = mysql_query("SELECT * FROM tb_clicks ORDER BY item ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">
". $registro["item"] ."
</font></td>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">
". $registro["price"] ."
</font></td>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=14&amp;item=<?= $registro["item"] ?>&amp;option=edit">
<input class="inputbox" type="submit" value="Edit">
</form>
</font>
</td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>

<?
break;
case (15):

?>
<?


if (isset($_POST["item"]))
{

$item=$_POST["item"];
$price=$_POST["price"];



//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_config SET item='$item', price='$price' where item='$item'";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>Item edited.</center></h2></font>";

}


if (isset($_GET["item"]))
{

$item=$_GET["item"];

if ($_GET["option"]=="edit")
{
?>

<?

$tablae = mysql_query("SELECT * FROM tb_config where item='$item'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registroe = mysql_fetch_array($tablae)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


?>

<form method="post" action="admin.php?op=15">

Item: <input type="hidden" name="item" value="<?= $registroe["item"] ?>"><?= $registroe["item"] ?><br>
Value: <input type="text" name="price" value="<?= $registroe["price"] ?>">
<br><br>
<input class="inputbox" type="submit" value="Save">

</form>

<?
}


?>

<?
}

if ($_GET["option"]=="delete")
{

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_users WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>User deleted.</center></h2></font>";
}

}

?>

<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Item
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
Value
</b></font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>

</b></font></td>
</tr>
<?


$tabla = mysql_query("SELECT * FROM tb_config where howmany='1' ORDER BY item ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">
". $registro["item"] ."
</font></td>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">
". $registro["price"] ."
</font></td>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=15&amp;item=<?= $registro["item"] ?>&amp;option=edit">
<input class="inputbox" type="submit" value="Edit">
</form>
</font>
</td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>

<?
break;
case (16):

?>
<?


if (isset($_POST["howmany"]))
{

$howmany=$_POST["howmany"];
$price=$_POST["price"];



//Todo parece correcto procedemos con la inserccion
$query = "UPDATE tb_config SET howmany='$howmany', price='$price' where item='referal' AND howmany='$howmany'";
mysql_query($query) or die(mysql_error());

echo "<font color=\"green\"><h2><center>Referal set edited.</center></h2></font>";

}


if (isset($_GET["howmany"]))
{

$howmany=$_GET["howmany"];

if ($_GET["option"]=="edit")
{
?>

<?

$tablae = mysql_query("SELECT * FROM tb_config where item='referal' AND howmany='$howmany'"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registroe = mysql_fetch_array($tablae)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


?>

<form method="post" action="admin.php?op=16">
Referal Set: <input type="hidden" name="howmany" value="<?= $registroe["howmany"] ?>"><?= $registroe["howmany"] ?><br>
Price: <input type="text" name="price" value="<?= $registroe["price"] ?>">
<br><br>
<input class="inputbox" type="submit" value="Save">
</form>

<?
}


?>

<?
}

if ($_GET["option"]=="delete")
{

//Todo parece correcto procedemos con la inserccion
$queryz = "DELETE FROM tb_users WHERE id='$id'";
mysql_query($queryz) or die(mysql_error());

echo "<font color=\"#cc0000\"><h2><center>User deleted.</center></h2></font>";
}

}

?>

<table width="99%" align="center">
<tr>
<td bgcolor="#cccccc"><font size="2" face="verdana">
<b>Referal Set</b>
</font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana">
<b>Price</b>
</font></td>
<td bgcolor="#cccccc"><font size="2" face="verdana"><b>
</b></font></td>
</tr>
<?


$tabla = mysql_query("SELECT * FROM tb_config where item='referal' ORDER BY howmany ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($registro = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen


echo "
<tr>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">
". $registro["howmany"] ."
</font></td>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">
". $registro["price"] ."
</font></td>
<td bgcolor=\"\"><font size=\"1\" face=\"verdana\">";
?>
<form method="post" action="admin.php?op=16&amp;howmany=<?= $registro["howmany"] ?>&amp;option=edit">
<input class="inputbox" type="submit" value="Edit">
</form>
</font>
</td>
</tr>

<?

} // fin del bucle de ordenes



?>
</table>

<?
break;

}
?>
</div>

<?
showFooter();
?>

<?php

} else {
header("Location: ../index.php");

exit;
}
} else {
header("Location: ../index.php");

exit;
}
?>
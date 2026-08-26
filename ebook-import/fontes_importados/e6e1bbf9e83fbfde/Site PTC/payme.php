<?
session_start();
/**********************************************************************************************************************************************
	SecureBux Version 2.00
	This Script has been created and coded by Gabrola and sold by Hamza.
	If you find any bugs in the script report at ygabrola@gmail.com or contact Hamza.
	Copywrite Gabrola 2008;
	script was edited by hassan ahmady =>> http://thealternatif.info
************************************************************************************************************************************************/
include "config.php";
global $c,$loggedin;
include "data.php";
global $config;
include "funciones.php";

$sql = "SELECT * FROM tb_config WHERE item='Amount_Payouts' and howmany='1'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);
mysql_close($con);

include "header2.php";
?>

<!-- content begin here -->
<style type="text/css">
<!--
.style1 {
	color: #006400;
	font-weight: bold;
}
-->
</style>

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
<br /><br />
<h3>Soli&ccedil;itar Pagamento</h3>

<a href="payme.php?convert=ads"><b>Converter para Anuncios</b></a><br>
Anuncie no
<?=$config["site_name"];?>. Voc&ecirc; deve ganhar pelo menos $1.99.<br>
<br>
<a href="payme.php?convert=cash"><strong>Converter para Dinheiro via   Pagseguro</strong></a><br>
Receba seu <span class="style1">Dinheiro</span> via Pagseguro. Voc&ecirc; deve   ter pelo menos  $<? echo $row["price"]; ?> para efetuar o resgaste. <br>
<br>
<?

if ($_GET["convert"]=="cash")
{

$user=uc($_COOKIE["usNick"]);

$root=$r["money"];

if ($root<10){

echo "<font color=\"#660000\"><strong>Whoops, you only have \$$root You must earn at least \$".$row["price"]." $ resgatar seu dinheiro via PagSeguro.</strong></font><br />";

} else {

echo "<b>Após solicitação do seu pagamento será feita uma auditoria para saber se você respeitou os Termos do Serviço.</b><br /><br />";

$username=$r["username"];

$checkuser = mysql_query("SELECT username FROM tb_payme WHERE username='$username'");
$username_exist = mysql_num_rows($checkuser);

if ($username_exist>0) {

echo "<br><b>Your payment is being proccessed. Payments take upto 30 working days, but should take no longer than 5 working days.</b><br />";

} else {

if ($_POST) {

if($_POST['code']!=$_SESSION['string']){ 
$error = 1;
$errormsg .= "<b>Error</b> - You enter the captcha incorrectly<br />";
}
if ($_POST["amount"]<$row["price"]){
$error = 1;
$errormsg .= "<b>Error</b> - You must enter a Amount at least $".$row["price"].".<br />";
}

 if($error == 1)
{
print $errormsg;
} else {
 
require('config.php');
$amount=securedata($_POST["amount"]);
$password=$r["password"];
$email=$r["email"];
$pemail=$r["pemail"];
$country=$r["country"];
$money=$r["money"];
$account=$r["account"];
$laip=getRealIP();
$amountr=($money - $amount);

$eltiempo=time();
$lafecha=date("d M Y H:m:s",$eltiempo);

$query = "INSERT INTO `tb_payme` (username, pasword, email, pemail, country, money, ip, date, account) VALUES('$username','$password','$email','$pemail','$country','$amount','$laip','$lafecha','$account')";
mysql_query($query); 

$query = "INSERT INTO tb_history (user, date, amount, method, status) VALUES('$username','$lafecha','$amountr','Alertpay','Pending Audit')";
mysql_query("UPDATE tb_users SET money=money-'$amount' WHERE id='{$r['id']}'");
mysql_query($query) or die(mysql_error());
echo "<font color=\"#336699\"><strong>Payment Requested!<br />
You must wait upto 30 working days according to our TOS.</strong></font><br />";
}
}
?>
<br />
<form method="post" action="payme.php?convert=cash">
<table>
<tr>
  <td class="main">* Seu Dinheiro:</td>
  <td class="main">$<input type="text" name="amount" class="form" value="<?=$_POST["amount"];?>" size="5" maxlength="100">&nbsp;<span style="font-size:10px; color:red;">Enter amount how many we'll pay, <b>at least is $10.00! <u>And You must enter with maximum amounts is $<?=$r["money"]; ?></u></b></span>
</td></tr>
<tr>
  <td class="main">* <span class="midinfo1">Codigo de Seguran&ccedil;a</span>:</td>
  <td class="main">( <img src="image.php" onclick="this.src='image.php?newtime=' + (new Date()).getTime();" align="bottom"> )&nbsp;<input type="text" name="code" class="form" size="5" maxlength="">&nbsp;<span style="font-size:10px; color:red;">Enter security code shown, <b>click image to reload</b></span>
</td></tr>
</table>
<br /><br />
&nbsp;&nbsp;&nbsp;&nbsp;<input class="inputbox" type="submit" value="Processar Pagamento">
</form>

<?php
}
}
}

if ($_GET["convert"]=="ads")
{

$user=uc($_COOKIE["usNick"]);

$root=$r["money"];


$pricee='1.99'; 

if ($root<$pricee){
echo "<font color=\"#660000\"><strong>Whoops, you only have \$$root You must earn at least \$1.99 USD to convert to ads.</strong></font><br />";
} else {

echo "<b>After you request for Convert to Ads your account will be audited to make sure you aren't violating the TOS.</b><br /><br />";

$username=$r["username"];

$checkuser = mysql_query("SELECT username FROM tb_payme WHERE username='$username'");
$username_exist = mysql_num_rows($checkuser);

if ($username_exist>0) {

echo "<br><b>Your payment is being proccessed. Payments take upto 30 working days, but should take no longer than 5 working days.</b>";

} else {

$email=$r["email"];

if ($_POST) {
  
require('config.php');

if($_POST['code']!=$_SESSION['string']){ 
$error = 1;
$errormsg .= "<b>Error</b> - You enter the captcha incorrectly<br />";
}

$url=securedata($_POST["url"]);
$description=securedata($_POST["description"]);

if ($url==""){
$error = 1;
$errormsg .= "<b>Error</b> - You must enter a URL.<br />";
}
if ($description==""){$error = 1;
$errormsg .= "<b>Error</b> - You must enter a description.<br />";}

if (!$_POST['cat']){$error = 1;
$errormsg .= "<b>Error</b> - You must pick a catagory.<br />";}

$laip = getRealIP();

$user=$_COOKIE["usNick"];

$money=$r["money"];

if($error == 1)
{
print $errormsg;
} else {

$query = "INSERT INTO `ads` (
`ad_id` ,
`ad_name` ,
`ad_email` ,
`ad_plan` ,
`ad_url` ,
`ad_description` ,
`cat` ,
`premium` ,
`active` ,
`clicks` ,
`outside`,
`clicksleft`,
`ad_balance`
)
VALUES (
'', '{$r['username']}', '{$r['email']}', '1', '{$url}', '{$description}', '{$_POST['cat']}', '0', '0', '0', '0', '50', '1'
);";
mysql_query($query);
mysql_query("UPDATE tb_users SET money=money-'1.99' WHERE id='{$r['id']}'");
echo "<br><b>Your advertisement is being proccesed.</b>";
?>

	</td>
		</tr>
			</table>
<br />

</td>
</tr>
</table>
</td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
</table>
	<!-- content-wrap ends here -->	
<? 
include "footer.php";
exit();
}
}

?>
<h3>Por favor, preencha os dados abaixo.</h3>

<form method="post" action="payme.php?convert=ads">
<table>
<tr>
<td class="midinfo1">
* Descri&ccedil;&atilde;o:
</td>
<td class="midinfo1">
<input type="text" name="description" class="form" value="<?=$_POST["description"];?>" size="25" maxlength="100">
</td>
</tr>
<tr>
<td width="35%" align="left" valign="middle" class="midinfo1">*  Categoria Site:</td>
<td width="65%" align="left" valign="bottom" class="midinfo1">
<select name="cat" class="form">
<option value="none">--- Select Category ---</option>
<option value=1>Arts & Entertainment (videos, music, games, etc)</option><option value=2>Business & Money (GPT, finance, jobs, etc)</option><option value=3>Computers & Internet (software, webmasters, services, cool sites, etc)</option><option value=4>Health & Recreation (fitness, medicine, sports, outdoors, etc)</option><option value=5>Reference & Education (searching, knowledge, information)</option><option value=6>Shopping & Spending (deals, auctions, online stores)</option><option value=8>Travel & Accommodation (booking, flights, hotels, car rental)</option><option value=9>Charity & Nonprofit (charity, help care, nonprofit, society)</option> </select>

</td>
</tr>
<tr>
<td class="midinfo1">
* Url Site(incluindo http://):
</td>
<td class="midinfo1">
<input type="text" name="url" class="form" value="<?=$_POST["url"];?>" size="25" maxlength="150">
</td>
</tr>
<tr>
<td class="midinfo1">
* Plano:
</td>
<td class="midinfo1">

<b>100  visitas de membros @ $2.99</b>
</td>
</tr>
<tr>
<td class="midinfo1">
* Codigo de Seguran&ccedil;a:
</td>
<td class="midinfo1">
<img src="image.php" onclick="this.src='image.php?newtime=' + (new Date()).getTime();"><br /><span style="font-size:10px;">(Click to reload)</span><br />
<input type="text" name="code" class="form" size="5" maxlength="">
</td>
</tr>
</table>
<input class="inputbox" type="submit" value="Processar Pagamento">
</form>

<?
}
}// final post
echo "";
}

}
	
	?>

<br />
	</td>
		</tr>
			</table>

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
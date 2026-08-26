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
global $c;
include "data.php";
global $config;
require('funciones.php');

if ($_POST['username']) {

//Comprobacion del envio del nombre de usuario y password

$username=uc($_POST['username']);
$password=uc($_POST['password']);

if ($password==NULL) {
header("Location: login.php?error=2");
}else{
if($_POST['code']!=$_SESSION['string']){
header("Location: login.php?error=1");
}else{
$query = mysql_query("SELECT username,password FROM tb_users WHERE username = '$username'") or die(mysql_error());
if(mysql_num_rows($query) == 0)
{
header("Location: login.php?error=3");
} else {
$data = mysql_fetch_array($query);
if($data['password'] != $password) {
header("Location: login.php?error=4");
}else{
$query = mysql_query("SELECT username,password FROM tb_users WHERE username = '$username'") or die(mysql_error());
$row = mysql_fetch_array($query);

$nicke=$row['username'];
$passe=$row['password'];

//90 dias dura la cookie
setcookie("usNick",$nicke,time()+7776000);
setcookie("usPass",$passe,time()+7776000);


$lastlogdate=time();
$lastip = getRealIP();

$querybt = "UPDATE tb_users SET lastlogdate='$lastlogdate', lastiplog='$lastip' WHERE username='$nicke'";
mysql_query($querybt) or die(mysql_error());

header("Location: index.php");
// echo "Has sido logueado correctamente ".$_SESSION['s_username']." y puedes acceder al index.php.";
// echo "<script>location.href='index.php';</script>";
?>

<META HTTP-EQUIV="REFRESH" CONTENT="0;URL=index.php">

<?
}
}
}
}
}
?>
<? include "header2.php"; ?>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif" /></td>
<td class="mainbg" align="center" valign="top" bgcolor="#FFFFFF" >
<table width="95%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="center">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
	<td class="main" style="width: 80%; vertical-align: top;">
		<br />

<?php
$option = $_GET["option"];
switch($option) {
case(loged):
default:
?>

<h3>Fa&ccedil;a se Login</h3>
<?
if($_GET['error'] == 1)
{
print "<h4 style=\"color:red;\"><b>Error</b> - Wrong Captcha Code</h4><br /><br/>";
}
if($_GET['error'] == 2)
{
print "<h4 style=\"color:red;\"><b>Error</b> - Please supply a password</h4><br /><br/>";
}
if($_GET['error'] == 3)
{
print "<h4 style=\"color:red;\"><b>Error</b> - Invalid Username</h4><br><br>";
}
if($_GET['error'] == 4)
{
print "<h4 style=\"color:red;\"><b>Error</b> - Invalid Password</h4><br /><br />";
}
?>
<font size="2"> <a href="register.php">Cadastre-se Gr&aacute;tis!</a><br />
<a href="login.php?option=forgot">Esqueceu seu Usu&aacute;rio e Senha?</a> </font><br />
 <br />
<div style="padding-left:25px;">
<form action="login.php" method="post">
		<table>
			<tr>
			  <td class="midtext">Usu&aacute;rio:</td>
			  <td><input type="text" name="username" size="25" class="form" autocomplete="off"></td></tr>
                    <tr>
                      <td class="midtext">Senha:</td>
                      <td><input type="password" name="password" size="25" class="form" autocomplete="off"></td></tr>
 			<tr>
 			  <td class="midtext" valign="top">C&oacute;digo Seguran&ccedil;a:</td>
 			  <td class="midtext"><img src="image.php" onclick="this.src='image.php?newtime=' + (new Date()).getTime();"><br /><span style="font-size:10px;">(Click to reload)</span><br /><input type="text" name="code" size="17" maxlength="" autocomplete="off" class="form"></td></tr>
			<tr><td></td><td align="right"><input type="submit" value="Entrar" name="loginsubmit" class="inputbox"></td></tr>
			</table>
	</form>
	</div>

<?php
break;
case(forgot):

include "funtions/recover.php";

}
?>	
</td>
</tr></table>
<br />
</td>
</tr>
</table>
</td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
</table>
	<!-- content-wrap ends here -->	
<? include "footer.php"; ?>
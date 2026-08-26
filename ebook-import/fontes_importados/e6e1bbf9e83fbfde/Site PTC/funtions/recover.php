<?
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

?>

<h3>Recupera&ccedil;&atilde;o de Senha</h3>
<?php
if($_POST)
{
$code = $_POST["code"];
$email = $_POST["email"];
$emailx = mysql_query("SELECT COUNT(*) AS cnt FROM tb_users WHERE email='{$_POST['email']}'");
$emailx = mysql_fetch_array($emailx);
$emailx = $emailx["cnt"];
$errormsg = false;
if($_SESSION['string'] != $code)
{
$error = 1;
$errormsg .= "<b>Error -</b> The captcha was entered incorrectly.<br />";
}
if(!$code)
{
$error = 1;
$errormsg .= "<b>Error -</b> The captcha was entered incorrectly.<br />";
}
if(!$email)
{
$error = 1;
$errormsg .= "<b>Error -</b> The email was not supplied.<br />";
}
if(!$emailx)
{
$error = 1;
$errormsg .= "<b>Error -</b> No account was found with that email address.<br />";
}
if($_SESSION['next_reseptsend'] != 0)
{
$error = 1;
$errormsg .= "<b>Error -</b> You have already made a password retrieval within the last 15 minutes.<br />";
}
$_SESSION['string'] = false;
if($error)
{
print $errormsg."<br><br>";
} else {
$s = mysql_query("SELECT * FROM tb_users WHERE email='{$_POST['email']}'");
$x = mysql_fetch_array($s);
$_SESSION['next_reseptsend'] = 1;
$message = "Hello {$x['username']},
You requested to resend your account password a while ago.

Account Username: {$x['username']}
Account Password: {$x['password']}

We hope you can have a good time earning your money again,

Thanks,
{$config['site_name']}";
mail($x["email"],"Password Retrieval - ".$config["site_name"],$message,"From: mail@".$_SERVER['HTTP_HOST']);
print "<b>Password Sent!</b><br />
We have dispatched your password to your email address.<br />
You can only make another account retrieval again in 15 minutes.<br />";
}
}
?>

<div style="padding-left:25px;">
<form action="<?=$config["site_path"]?>/login.php?option=forgot" method="post" name="resend">
<table>
<tr>
  <td class="midtext">Email:</td>
  <td><input type="text" name="email" size="25" class="form" autocomplete="off" value="<?=$_POST['email']?>"></td></tr>
<tr>
  <td class="midtext" valign="top">C&oacute;digo de Seguran&ccedil;a:</td>
  <td class="midtext"><img src="image.php" onclick="this.src='image.php?newtime=' + (new Date()).getTime();"><br /><span style="font-size:10px;">(Click to reload)</span><br /><input type="text" name="code" size="17" maxlength="" autocomplete="off" class="form"></td></tr>
<tr><td></td><td align="right"><input type="submit" value="Execultar" name="loginsubmit"  class="inputbox"></td></tr>
</table>
</form>
</div>

<?php

?>
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
		<h3>Fale Conosco</h3>

        <?

if ($_POST) {

$name=securedata($_POST["name"]);
$email=securedata($_POST["email"]);
$topic=securedata($_POST["topic"]);
$subject=securedata($_POST["subject"]);
$comments=securedata($_POST["comments"]);

if($_POST['code']!=$_SESSION['string']){ 
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error - </b>The captcha code was entered incorrectly!</h4><br />";
}
if ($name==""){
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error - </b>You must supply your name!</h4><br />";
}
if ($email==""){
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error - </b>You must supply your email!</h4><br />";
}
if ($topic==""){
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error - </b>You must pick a topic!</h4><br />";
}
if ($subject==""){
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error - </b>You must pick a subject!</h4><br />";
}
if ($comments==""){
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error - </b>You must enter comments/description!</h4><br />";
}
$gp = mysql_query("SELECT COUNT(*) AS cnt FROM tb_contact WHERE ip='{$_SERVER['REMOTE_ADDR']}'");
$gp = mysql_fetch_array($gp);
$gp = $gp['cnt'];
if($gp > 1)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error - </b>You can only send one support ticket in at a time!</h4><br />";
}
$errormsg .= "<br />";
if($error == 1)
{
print $errormsg;
} else {

$laip = getRealIP();

$query = "INSERT INTO tb_contact (name, email, topic, subject, comments, ip) VALUES('$name','$email','$topic','$subject','$comments','$laip')";
mysql_query($query) or die(mysql_error());

echo "<center>Your message has been sent correctly.<br />
You cannot send any more support tickets until your current ticket has been responded.</center>";
?>

<br />
	</td>
		</tr>
			</table>


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
Use o formul&aacute;rio abaixo para entrar em contato com a
<?=$config["site_name"];?>. Voc&ecirc; ter&aacute; uma resposta em no m&aacute;ximo 48 horas.
<br>
<br>
<div style="padding-left:25px;">
<form method="post" action="contact.php" name="form">
<font color="9c1515">*</font> Seu Nome:<br />
<input type="text" name="name" size="25" maxlength="100" class="form" autocomplete="off"><br />
<font color="9c1515">*</font> Seu  E-mail:<br />
<input type="text" name="email" size="25" maxlength="100" class="form" autocomplete="off"><br />
<font color="9c1515">*</font> Topico:<br/>
<select name="topic" class="form" autocomplete="off">
<option value="">Selecione o Tópico</option>
<option value="General Non-Member Inquiry">General Non-Member Inquiry</option>
<option value="Member Comment/Question/Feedback">Member Comment/Question/Feedback</option>
<option value="Advertising Inquiry">Advertising	Inquiry</option>
<option value="Media/Press/Blog">Media/Press/Blog</option>
<option value="Spam Issue">Spam Issue</option>
<option value="Other">Other</option>
</select><br />
<font color="9c1515">*</font> Assunto:<br />
<input type="text" class="form" autocomplete="off" name="subject" size="25" maxlength="100"><br />

<font color="9c1515">*</font> Coment&aacute;rios:<br/>
<textarea name="comments" class="form" autocomplete="off" cols="45" rows="4" maxlength="100" onKeyUp="ismaxlength(this);"></textarea><br />

<font color="9c1515">*</font> C&oacute;digo de Seguran&ccedil;a:<br/>
<img src="image.php" onclick="this.src='image.php?newtime=' + (new Date()).getTime();"><br /><span style="font-size:10px;">(Click to reload)</span><br />
<input type="text" name="code" class="form" autocomplete="off" size="5"><br />
<br /><br />
<input class="inputbox" type="submit" value="Enviar">

</form>
</div>
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
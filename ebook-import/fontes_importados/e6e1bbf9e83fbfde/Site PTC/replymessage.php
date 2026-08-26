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
<h3>Responder Mensagens</h3>
<?
$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);
?>
<script type="text/javascript">

/***********************************************
* Textarea Maxlength script- © Dynamic Drive (www.dynamicdrive.com)
* This notice must stay intact for legal use.
* Visit http://www.dynamicdrive.com/ for full source code
***********************************************/

function ismaxlength(obj){
var mlength=obj.getAttribute? parseInt(obj.getAttribute("maxlength")) : ""
if (obj.getAttribute && obj.value.length>mlength)
obj.value=obj.value.substring(0,mlength)
}

</script>


<?

if (isset($_POST["sendto"])) {
require('config.php');



$sendfrom=$_COOKIE["usNick"];
$sendto=limpiar($_POST["sendto"]);
$comments=limpiar($_POST["comments"]);

if ($sendto==""){echo "Something Wrong so get <b>Error</b><br /><br /><div style='display:block;'><a class='inputbox' href='javascript: history.go(-1);' title='Back to previous page'>Back</a></div>";

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
if ($comments==""){echo "Something Wrong so get <b>Error</b><br /><br /><div style='display:block;'><a class='inputbox' href='javascript: history.go(-1);' title='Back to previous page'>Back</a></div>";
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

$eltiempo=time();
$lafecha=date("d-m-y H:i",$eltiempo);

$query = "INSERT INTO tb_messenger (sendfrom, sendto, date, comments) VALUES('$sendfrom','$sendto','$lafecha','$comments')";
mysql_query($query) or die(mysql_error());

echo "<h4 align=\"center\">Your message has ben sent correctly.</h4>";
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
?>
<br>
<div align="center">
<div id="form"><b>Todos os seus Indicados</b><br />
  <br />

<form method="POST" action="replymessage.php">

<? 
require('config.php');
$sendfrom=$_COOKIE["usNick"];

$to=$_GET["to"];

?>

<input type="hidden" name="sendto" autocomplete="off" value="<? echo $to; ?>" />
<label>Comentarios</label>
<br />
<textarea name="comments" rows="5" cols="50" maxlength="500" onkeyup="return ismaxlength(this)" tabindex="1"></textarea><br />
<input type="submit" value="Enviar" class="inputbox" tabindex="3" />
</form>
</div>
</div>
<?php } ?>
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
<? include "footer.php"; ?>
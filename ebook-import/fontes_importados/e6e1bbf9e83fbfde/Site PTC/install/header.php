<?
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta 1
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

///// get local version number ///////
if (file_exists("../version.txt")) {
$fp = fopen("../version.txt", "r");
$VERNO = fread($fp, filesize("../version.txt"));
fclose($fp);
}

?>
<html>
<!--[if lte IE 6]>
<style type="text/css">
.clearfix {	height: 1%;}
fieldset { width: 500px; display: block;}
</style>
<![endif]-->

<!--[if gte IE 7.0]>
<style type="text/css">
.clearfix {	display: inline-block;}
fieldset { width: 500px; display: block;}
</style>
<![endif]-->

<!--[if gte IE 8.0]>
<style type="text/css">
.clearfix {	display: inline-block;}
fieldset { width: 500px; display: block;}
</style>
<![endif]-->
<head>
<title>ScriptBux <?=$VERNO?> :: Installation</title>
<link rel="stylesheet" type="text/css" href="../images/style.css">
</head>
<body style="text-align:center">

<script language=JavaScript>
<!--
function ismaxlength(obj){
var mlength=obj.getAttribute? parseInt(obj.getAttribute("maxlength")) : ""
if (obj.getAttribute && obj.value.length>mlength)
obj.value=obj.value.substring(0,mlength)
}
//-->
</script>
<!-- wrap starts here -->
<table width="778" border="0" cellspacing="0" cellpadding="0" align="center">
<tr>
<td>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="10" height="9" background="../images/b_01.png"><img  src="../images/spacer.gif" width="1" height="1"></td>
<td height="9" background="../images/b_02.png"><img src="../images/spacer.gif"  width="1" height="1"></td>
<td width="16" height="9" background="../images/b_04.png"><img  src="../images/spacer.gif" width="1" height="1"></td>
</tr>
</table>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="3" background="../images/b_07.png"><img src="../images/spacer.gif" /></td>
<td background="../images/bg_green_white.gif">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr><td>
<a href="index.php" title="ScriptBux <?=$VERNO?>"><img border="0" src="../images/logo.jpg" title="ScriptBux <?=$VERNO?> - Logo" /></a>
</td>
<td>
<img title="ScriptBux <?=$VERNO?> - header" src="../images/default.jpg" width="513" height="185" alt="ScriptBux <?=$VERNO?> - header">
</td></tr>
</table>
</td>
<td width="9" background="../images/b_10.png"><img src="../images/spacer.gif" /></td>
</tr>
<tr>
<td width="3" background="../images/b_07.png"><img src="../images/spacer.gif"></td>
<td align="center" id="menu" height="30" width="766" style="background:url(../images/bg-nav.jpg) repeat-x"><h3>ScriptBux <?=$VERNO?> :: Installation</h3></td>
<td width="9" background="../images/b_10.png"><img src="../images/spacer.gif"></td>
</tr>
</table>

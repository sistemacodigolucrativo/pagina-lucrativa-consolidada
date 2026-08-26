<?
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta 1
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

?>
<html>
<!--[if lte IE 6]>
<style type="text/css">
.clearfix {	height: 1%;}
</style>
<![endif]-->

<!--[if gte IE 7.0]>
<style type="text/css">
.clearfix {	display: inline-block;}
</style>
<![endif]-->

<!--[if gte IE 8.0]>
<style type="text/css">
.clearfix {	display: inline-block;}
</style>
<![endif]-->
<script type="text/javascript">
var persistclose=0 //set to 0 or 1. 1 means once the bar is manually closed, it will remain closed for browser session
var startX = 0 //set x offset of bar in pixels
var startY = 0 //set y offset of bar in pixels
var verticalpos="fromtop" //enter "fromtop" or "frombottom"

function iecompattest(){
return (document.compatMode && document.compatMode!="BackCompat")? document.documentElement : document.body
}

function get_cookie(Name) {
var search = Name + "="
var returnvalue = "";
if (document.cookie.length > 0) {
offset = document.cookie.indexOf(search)
if (offset != -1) {
offset += search.length
end = document.cookie.indexOf(";", offset);
if (end == -1) end = document.cookie.length;
returnvalue=unescape(document.cookie.substring(offset, end))
}
}
return returnvalue;
}
function closebar(){
if (persistclose)
document.cookie="remainclosed=1"
document.getElementById("topbar").style.visibility="hidden"
}

function staticbar(){
	barheight=document.getElementById("topbar").offsetHeight
	var ns = (navigator.appName.indexOf("Netscape") != -1) || window.opera;
	var d = document;
	function ml(id){
		var el=d.getElementById(id);
		if (!persistclose || persistclose && get_cookie("remainclosed")=="")
		el.style.visibility="visible"
		if(d.layers)el.style=el;
		el.sP=function(x,y){this.style.left=x+"px";this.style.top=y+"px";};
		el.x = startX;
		if (verticalpos=="fromtop")
		el.y = startY;
		else{
		el.y = ns ? pageYOffset + innerHeight : iecompattest().scrollTop + iecompattest().clientHeight;
		el.y -= startY;
		}
		return el;
	}
	window.stayTopLeft=function(){
		if (verticalpos=="fromtop"){
		var pY = ns ? pageYOffset : iecompattest().scrollTop;
		ftlObj.y += (pY + startY - ftlObj.y)/8;
		}
		else{
		var pY = ns ? pageYOffset + innerHeight - barheight: iecompattest().scrollTop + iecompattest().clientHeight - barheight;
		ftlObj.y += (pY - startY - ftlObj.y)/8;
		}
		ftlObj.sP(ftlObj.x, ftlObj.y);
		setTimeout("stayTopLeft()", 10);
	}
	ftlObj = ml("topbar");
	stayTopLeft();
}

if (window.addEventListener)
window.addEventListener("load", staticbar, false)
else if (window.attachEvent)
window.attachEvent("onload", staticbar)
else if (document.getElementById)
window.onload=staticbar
</script>
<head>
<?php if($loggedin == 1) { ?>
<title><?=$config["title"];?> :: <?=$r['username']?></title>
<?php } else { ?>
<title><?=$config["title"];?></title>
<?php } ?>

<link rel="stylesheet" type="text/css" href="images/style.css">
</head>
<body style="text-align:center">
<div id="topbar">
<?php if ($r["account"]=="premium")
	{ ?>
<a href="#top">Sua conta &eacute; <strong>Membro Premium</strong>,  obrigado por adquiri-la, &oacute;timos lucros pra voc&ecirc;!</a>
<?php } else { 
if($loggedin == 1) { ?>
<a href="user.php?option=upgrade">Voc&ecirc; &eacute; um  <b>Membro  Gr&aacute;tis</b>, Por Favor fa&ccedil;a o upgrade para membro Premium!</a>
<?php } else { ?>
<a href="login.php">Voc&ecirc; n&atilde;o est&aacute; logado, Por Favor fa&ccedil;a seu <b>login</b> ou <b>Cadastre-se</b> gratuitamente!</a>
<?php } } ?>
</div>
<br />
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
<td width="10" height="9" background="images/b_01.png"><img  src="images/spacer.gif" width="1" height="1"></td>
<td height="9" background="images/b_02.png"><img src="images/spacer.gif"  width="1" height="1"></td>
<td width="16" height="9" background="images/b_04.png"><img  src="images/spacer.gif" width="1" height="1"></td>
</tr>
</table>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif" /></td>
<td style="height: 3px; background-color: #BCD735;"></td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif" /></td>
<td align="" style="background: url('images/nav_bar_bg.gif') repeat top left;">
				<div style="text-align: center;" id="navbar">
				<ul>
	        <?php
            if($loggedin == 1)
            {
            
            if ($r["account"]=="premium")
            {
            $upgrade = "(Membro Premium)";
            } else {
            $upgrade = "(Mude para Premium <a href=\"user.php?option=upgrade\">Upgrade</a>)";
            }
            print "<li>Você está logado como {$r['username']} {$upgrade} [<a href=\"index.php?action=logout\">Sair</a>]</li>";
            } else {
            print "<li>Faça seu Login [<a href=\"login.php\">Login</a> | <a href=\"register.php\">Cadastre-se</a>]</li>";
            }
            ?>
				</ul>
				</div>
</td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif" /></td>
<td style="height: 3px; background-color: #BCD735;"></td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif" /></td>
<td background="images/bg_green_white.gif">
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr><td>
<a href="index.php" title="<?=$config["title"];?>"><img border="0" src="images/logo.jpg" title="<?=$config["title"];?> - Logo" /></a>
</td>
<td>
<?php
if ($_GET["option"]=="surf")
{ ?>
<img title="<?=$config["title"];?> - header" src="images/surf.jpg" width="513" height="185" alt="<?=$config["title"];?> - header">
<?php } elseif ($_GET["option"]=="stats") { ?>
<img title="<?=$config["title"];?> - header" src="images/stats.jpg" width="513" height="185" alt="<?=$config["title"];?> - header">
<?php } else { ?>
<img title="<?=$config["title"];?> - header" src="images/default.jpg" width="513" height="185" alt="<?=$config["title"];?> - header">
<?php } ?>
</td></tr>
</table>
</td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif"></td>
<td id="menu" height="39" width="766" style="background:url(images/bg-nav.jpg) repeat-x">
<div id="menu_left">
		<ul>
        <?=$config["menu"];?>
		</ul>
</div>
</td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif"></td>
</tr>
</table>

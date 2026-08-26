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

<html>
<head>
<title><?=$config["title"];?></title>
<link rel="stylesheet" type="text/css" href="css.css">
</head>
<body leftmargin="0" topmargin="0">

<script language=JavaScript>
<!--
function ismaxlength(obj){
var mlength=obj.getAttribute? parseInt(obj.getAttribute("maxlength")) : ""
if (obj.getAttribute && obj.value.length>mlength)
obj.value=obj.value.substring(0,mlength)
}
//-->
</script><br />
<!-- wrap starts here -->
<div id="wrap">

	<!--header -->	
	<div id="header">
       <h1 id="logo-text"><a href="../index.php"><?=$config['site_name'];?></a></h1>
		<div id="header-links">
	        <?php
            if($loggedin == 1)
            {
            
            if ($r["account"]=="premium")
            {
            $upgrade = "(Upgraded Member)";
            } else {
            $upgrade = "(Standard Member <a href=\"../upgrade.php\">Upgrade</a>)";
            }
            print "Logged in as {$r['username']} {$upgrade} [<a href=\"../index.php?action=logout\">Logout</a>]";
            } else {
            print "Guest [<a href=\"../login.php\">Login</a> | <a href=\"../register.php\">Register</a>]";
            }
            ?>
		</div>		
	</div>
	
	<!-- navigation -->		
	<div id="menu">
		<ul>
        <?=$config["menu"];?>
		</ul>
	</div>	

	<!-- content-wrap starts here -->
	<div id="content-wrap">
		
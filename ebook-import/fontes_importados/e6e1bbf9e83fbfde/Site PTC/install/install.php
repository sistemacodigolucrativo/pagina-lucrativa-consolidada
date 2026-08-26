<?php

/**********************************************************************************************************************************************
	ScriptBux Version 2.5 beta 1
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

error_reporting(E_ERROR | E_WARNING | E_PARSE);

include "config.php";

function check_table_exist($table) {
return mysql_num_rows(mysql_query("SHOW TABLES LIKE '".$table."'"));
}
include "header.php";

?>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="3" background="../images/b_07.png"><img src="../images/spacer.gif" /></td>
<td class="mainbg" align="center" valign="top" bgcolor="#FFFFFF" >
<table width="95%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="center">
<br>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr><td>
<?php
if ($_GET["action"]=="intro")
{ ?>
<p><font size="3">Installation Proccess &raquo; <font size="+1" color="#FF0000"><u><b>Introductions</b></u></font> &raquo; Checkin database &raquo; Final Installation</font></p><p>&nbsp;</p>
<?php } elseif ($_GET["action"]=="checkin") { ?>
<p><font size="3">Installation Proccess &raquo; Introductions &raquo; <font size="+1" color="#FF0000"><u><b>Checkin database</b></u></font> &raquo; Final Installation</font></p><p>&nbsp;</p>
<?php } else { ?>
<p><font size="3">Installation Proccess &raquo; Introductions &raquo; Checkin database &raquo; <font size="+1" color="#FF0000"><u><b>Final Installation</b></u></font></font></p><p>&nbsp;</p>
<?php } ?>

</td></tr>
</table>

<?php
$action = $_GET["action"];
switch($action) {
case(intro):
default:
?>

<table align="center" width="100%">
<tr><td style="font-size:14px; font-weight:bold; font-family:Georgia;">
<p>Welcome to the <b>ScriptBux (Ver. <?=$VERNO?>) Setup Program</b>. You are preparing to either install <B>OR</B> upgrade the web's leading PHP/MYSQL Clicker management system on your website. Before you do however, we need to run a few test to ensure this program can successfully install/upgrade ScriptBux for you. Should you require support, please <a href="mailto:support@thealternatif.info">Contact Us</a>.</p>
<p>This will install ScripctBux script on your server, Please Follow until Finish</p>
<p>&nbsp;</p>
<form action="install.php?action=checkin" method="POST">

<center><input type="submit" value="Next" class="inputbox"></center>

</form>
</td></tr>
</table>
<?php
break;
case(checkin):
?>
<tr><td>
<p><strong>Running pre-install configuration test...</strong></strong></p>
<p align="left">
<?
$failed = false;
$phpver = explode(".", phpversion());
if($phpver[0] <= 3){
$failed = 1;
echo "<b>1.</b> Testing for PHP 4 or higher..... <strong>Failed!</strong> (Version ". phpversion() ." installed)<br>"; }
else {
echo "<b>1.</b> Testing for PHP 4 or higher..... Passed! (Version " . phpversion() ." installed)<br>";
}
if (function_exists('MYSQL_CONNECT')) {
$error = FALSE;
echo "<b>2.</b> Attempting to connect to MYSQL server ...";
@MYSQL_CONNECT("$dhost", "$dusername", "$dpassword") OR $sqlerror = mysql_error();

if ($sqlerror) {
$failed = 1;
if ((preg_match("/Can't connect to local MySQL server through socket/i", "$sqlerror")) || (preg_match("/Unknown MySQL server host /i", "$sqlerror"))) {
echo "<strong>FAILED!</strong><br>Could not find MYSQL server. The database does not seem to be installed at <strong>$dhost</strong>.To resolve, verify correct HOSTNAME with your web host provider and try again.<br>";
} elseif (preg_match("/Client does not support authentication protocol requested by server/i", "$sqlerror")) {
echo "<strong>FAILED!</strong><br>The version of the PHP mysql client library is older than the MySQL server. Contact your web host and ask them to reinstall the correct versions.<br>";
} else {
echo "<strong>FAILED!</strong><br>Could not connect to MYSQL using the username and/or password provided. To resolve, verify Username and password with your web host provider and try again.<br>";
}
} else { echo "Passed!<br>"; }

// if test above passed, try to connect to database
if ($failed == false) {
echo "<b>3.</b> Attempting to connect to MYSQL database ...";
@mysql_select_db("$ddatabase") OR $sqldberror = mysql_error();

if ($sqldberror) {
$failed = 1;
echo "<strong>FAILED!</strong><br>Could not connect to database. Verify you have typed the correct database name and that is EXIST and try again.";
} else { echo "Passed!<br>"; }
}
} else {
$failed = 1;
echo "<b>6.</b> Verifying mySQL server installed ..... <strong>FAILED!</strong><hr noshade color=\"#FF0000\" size=\"1\">mySQL is not properly enabled or configured.<br><br><strong>To correct this problem, contact your web host to enable mysql with PHP on $dhost</strong><hr noshade color=\"#FF0000\" size=\"1\"><br>";
}
@MYSQL_CLOSE();

if (!($failed)) {
?>
<hr align="left" width="75%" />

<b>Your Database Details</b>
<table width="98%" align="center">
<tr><td width="25%">
<strong>MYSQL Host:</strong>
</td><td align="left">
<?=$dhost ?>
</td></tr>
<tr><td width="25%">
<strong>MYSQL Username:</strong>
</td><td align="left">
<?=$dusername ?>
</td></tr>
<tr><td>
<strong>MYSQL Password:</strong>
</td><td align="left">
(not shown for security)
</td></tr>
<tr><td>
<strong>MYSQL Database:</strong>
</td><td align="left">
<?=$ddatabase ?>
</td></tr>
</table>
<?php
} else {
echo "<center><h1>All above test must PASS to continue setup.</h1></center>";
}

?>
<p><center><font size="3" color="red"><u><strong>BE CAREFUL!! WILL DELETE PREVIOUS DATABASE</strong></u></font></center>
</p>
<form action="install.php?action=install" method="POST">

<center><input type="submit" value="Begin Installation" class="inputbox"></center>

</form>

</p>

<?php
break;
case(install):

if ($_GET["action"]=="install")
{

@MYSQL_CONNECT("$dhost", "$dusername", "$dpassword") OR die(mysql_error());
@mysql_select_db("$ddatabase") OR die(mysql_error());    

/// connect to database /////

$query = 'DROP TABLE IF EXISTS `ads`';
$result = mysql_query($query) or die("Could not drop ads table.");

$query = "
CREATE TABLE `ads` (
  `ad_id` int(11) NOT NULL auto_increment,
  `ad_name` varchar(75) NOT NULL,
  `ad_email` varchar(75) NOT NULL,
  `ad_plan` int(2) NOT NULL,
  `ad_url` varchar(75) NOT NULL,
  `ad_description` varchar(255) NOT NULL,
  `cat` int(3) NOT NULL,
  `premium` int(2) NOT NULL,
  `active` int(2) NOT NULL,
  `clicks` int(11) NOT NULL,
  `outside` int(11) NOT NULL,
  `clicksleft` int(11) NOT NULL,
  `ad_balance` int(11) NOT NULL default '0',
  PRIMARY KEY  (`ad_id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create ads table."));

$query =("INSERT INTO `ads` VALUES(1, 'Alertpay Name', 'Alertpay Address', 1, 'http://thealternatif.info', 'Test Your Ads', 1, 0, 1, 0, 0, 100000, 0)");
$result = MYSQL_QUERY($query);

$query = 'DROP TABLE IF EXISTS `ad_clicks`';
$result = mysql_query($query) or die("Could not drop ad_clicks table.");

$query = "
CREATE TABLE `ad_clicks` (
  `user` int(11) NOT NULL,
  `ad` int(11) NOT NULL,
  `day` int(11) NOT NULL
)";
$result = mysql_query($query) or die(mysql_error("Could not create ad_clicks table."));

$query = 'DROP TABLE IF EXISTS `settings`';
$result = mysql_query($query) or die(mysql_error("Could not drop settings table."));

$query = "
CREATE TABLE `settings` (
  `setname` varchar(255) NOT NULL,
  `setvalue` text NOT NULL,
  `set_day` int(11) NOT NULL
)";
$result = mysql_query($query) or die(mysql_error("Could not create settings table."));

$query =("INSERT INTO `settings` VALUES('newadstoday', '0', 31)");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `settings` VALUES('totalads', '5', 0)");
$result = MYSQL_QUERY($query);

$query = 'DROP TABLE IF EXISTS `tb_buyref`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_buyref table."));

$query = "
CREATE TABLE `tb_buyref` (
  `id` int(11) NOT NULL auto_increment,
  `sets` varchar(150) NOT NULL default '',
  `customer` varchar(150) NOT NULL default '',
  `amount` varchar(150) NOT NULL default '',
  `pemail` varchar(150) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  KEY `id` (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_buyref table."));

$query =("INSERT INTO `tb_buyref` VALUES(1, '0', 'admin', '', '', '')");
$result = MYSQL_QUERY($query);

$query = 'DROP TABLE IF EXISTS `tb_contact`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_contact table."));

$query = "
CREATE TABLE `tb_contact` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(150) NOT NULL default '',
  `email` varchar(150) NOT NULL default '',
  `topic` varchar(150) NOT NULL default '',
  `subject` varchar(150) NOT NULL default '',
  `comments` varchar(200) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  KEY `id` (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_contact table."));

$query = 'DROP TABLE IF EXISTS `tb_history`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_history table."));

$query = "
CREATE TABLE `tb_history` (
  `id` int(11) NOT NULL auto_increment,
  `user` varchar(150) NOT NULL default '',
  `date` varchar(150) NOT NULL default '',
  `amount` varchar(150) NOT NULL default '',
  `method` varchar(150) NOT NULL default '',
  `status` varchar(150) NOT NULL default '',
  KEY `id` (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_history table."));

$query = 'DROP TABLE IF EXISTS `tb_payme`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_payme table."));

$query = "
CREATE TABLE `tb_payme` (
  `id` int(11) NOT NULL auto_increment,
  `username` varchar(150) NOT NULL default '',
  `pasword` varchar(150) NOT NULL default '',
  `email` varchar(150) NOT NULL default '',
  `pemail` varchar(150) NOT NULL default '',
  `country` varchar(150) NOT NULL default '',
  `money` varchar(150) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  `date` varchar(150) NOT NULL default '',
  `account` varchar(150) NOT NULL default '',
  KEY `id` (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_payme table."));

$query = 'DROP TABLE IF EXISTS `tb_upgrade`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_upgrade table."));

$query = "
CREATE TABLE `tb_upgrade` (
  `id` int(11) NOT NULL auto_increment,
  `username` varchar(150) NOT NULL default '',
  `pemail` varchar(150) NOT NULL default '',
  `email` varchar(150) NOT NULL default '',
  `status` varchar(150) NOT NULL default '',
  `date` varchar(150) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  KEY `id` (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_upgrade table."));

$query = 'DROP TABLE IF EXISTS `tb_users`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_users table."));


$query = "
CREATE TABLE `tb_users` (
  `id` int(11) NOT NULL auto_increment,
  `username` varchar(15) NOT NULL default '',
  `password` varchar(15) NOT NULL default '',
  `ip` varchar(15) NOT NULL default '',
  `email` varchar(150) NOT NULL default '',
  `pemail` varchar(150) NOT NULL default '',
  `referer` varchar(15) NOT NULL default '',
  `country` varchar(150) NOT NULL default '',
  `visits` varchar(150) NOT NULL default '0',
  `referals` varchar(150) NOT NULL default '0',
  `referalvisits` varchar(150) NOT NULL default '0',
  `money` varchar(150) NOT NULL default '0.00',
  `paid` varchar(150) NOT NULL default '0.00',
  `joindate` varchar(150) NOT NULL default '',
  `lastlogdate` varchar(150) NOT NULL default '',
  `lastiplog` varchar(150) NOT NULL default '',
  `account` varchar(150) NOT NULL default '',
  `adcode` text NOT NULL,
  KEY `id` (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_users table."));

$query =("INSERT INTO `tb_users` VALUES(1, 'admin', 'admin', '127.0.0.1', 'admin@thealternatif.info', 'dgha@telkom.net', ' ', 'Indonesia', '0', '0', '0', '990.05', '10.00', '1184512264', '1199134421', '172.213.71.18', 'premium', '')");
$result = MYSQL_QUERY($query);

$query = 'DROP TABLE IF EXISTS `tb_config`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_config table."));

$query = "
CREATE TABLE `tb_config` (
  `id` int(11) NOT NULL auto_increment,
  `item` varchar(15) collate latin1_general_ci NOT NULL,
  `howmany` varchar(15) collate latin1_general_ci NOT NULL,
  `price` varchar(150) collate latin1_general_ci NOT NULL,
  KEY `id` (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_config table."));

$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '100', '1.50')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '500', '7.50')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '1000', '15')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '2500', '37.50')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '5000', '74')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '10000', '140')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '50000', '740')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '100000', '1470')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '500000', '7300')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'hits', '1000000', '15999')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'Site_Name', '1', 'SriptBux')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'Admin_Alertpay_Email', '1', 'dgha@telkom.net')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'Upgrade_Price', '1', '56')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'Forum_URL', '1', 'http://thealternatif.info')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'Site_Title', '1', 'ScriptBux | The Best PTC Script')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'Amount_Payouts', '1', '10.00')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'referal', '5', '6.95')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'referal', '35', '34.65')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'referal', '100', '89.95')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'referal', '500', '429.00')");
$result = MYSQL_QUERY($query);
/*$query =("INSERT INTO `tb_config` VALUES (1, 'Pro_Click', '1', '30')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_config` VALUES (1, 'Free_Click', '1', '45')");
$result = MYSQL_QUERY($query);
*/
$query = 'DROP TABLE IF EXISTS `tb_clicks`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_clicks table."));

$query = "
CREATE TABLE `tb_clicks` (
  `id` int(11) NOT NULL auto_increment,
  `item` varchar(15) collate latin1_general_ci NOT NULL,
  `howmany` varchar(15) collate latin1_general_ci NOT NULL,
  `price` varchar(150) collate latin1_general_ci NOT NULL,
  KEY `id` (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_clicks table."));

$query =("INSERT INTO `tb_clicks` VALUES (1, 'click', '1', '0.01')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_clicks` VALUES (1, 'referalclick', '1', '0.01')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_clicks` VALUES (1, 'pclick', '1', '0.0125')");
$result = MYSQL_QUERY($query);
$query =("INSERT INTO `tb_clicks` VALUES (1, 'preferalclick', '1', '0.0125')");
$result = MYSQL_QUERY($query);

$query = 'DROP TABLE IF EXISTS `tb_messenger`';
$result = mysql_query($query) or die(mysql_error("Could not drop tb_messenger table."));
$query = "
CREATE TABLE `tb_messenger` (
  `id` int(11) NOT NULL auto_increment,
  `sendfrom` varchar(11) collate latin1_general_ci NOT NULL,
  `sendto` varchar(11) collate latin1_general_ci NOT NULL,
  `date` varchar(35) collate latin1_general_ci NOT NULL,
  `comments` varchar(150) collate latin1_general_ci NOT NULL,
  `status` varchar(11) collate latin1_general_ci NOT NULL default 'unread',
  PRIMARY KEY  (`id`)
)";
$result = mysql_query($query) or die(mysql_error("Could not create tb_messenger table."));

$query =("INSERT INTO `tb_messenger` VALUES (1, 'tester', 'admin', '09-01-08 03:24', 'This is a test message', 'read')");
$result = MYSQL_QUERY($query);

// close mysql
?>
<p align="left"><font color="#FF0000"><strong><big><big></big></big></strong></font><center><font color="#FF0000"><strong><big>Congratulations! ScriptBux version <?=$VERNO?> has been successfully installed on your server.<br>
Please delete <u>INSTALL</u> directory and all files above from your server!!!
</big></strong></font>
</center><font color="#FF0000"><strong><br>Now you can login and customize your ScriptBux Setting, First detail (<b>Username and Password</b>) for login is <big>ADMIN</big><br>Login at: <a href="../login.php">LOGIN</a><br></strong></font></p>
<?php
MYSQL_CLOSE();
}
break;
}
?>

</td></tr>
</table>

<br>
</td>
<td width="9" background="../images/b_10.png"><img src="../images/spacer.gif" /></td>
</tr>
</table>
<? include "footer.php"; ?>
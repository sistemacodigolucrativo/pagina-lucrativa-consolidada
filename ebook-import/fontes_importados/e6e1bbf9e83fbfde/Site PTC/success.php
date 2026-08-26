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

include('data.php');
require('config.php');
global $loggedin,$r;
require('funciones.php');
if(!$_GET['verify']){ 
echo "<img src='images/error.png'><!-- 1 -->";
exit();
}
if($_GET['code'] != $_SESSION["adcode"])
{
echo "<img src='images/error.png'><!-- 3 -->";
exit();
}
if($loggedin==1)
{
$checkvisit = mysql_query("SELECT * FROM ad_clicks WHERE user='{$r['id']}' and ad='{$_GET['ad']}'");
$referer_visit = mysql_num_rows($checkvisit);
}
if($referer_visit > 0 and $loggedin == 1)
{
echo "<img src='images/error.png'><!-- 4 -->";
exit();
}

if($loggedin == 1)
{

$user=uc($_COOKIE["usNick"]);
$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);
$wask = uc($_COOKIE["usNick"]);
$wesk = $row['username'];
if("$wesk" != "$wask") {
echo "Login incorrect.";
exit();
}
$wazk = uc($_COOKIE["usPass"]);
$wezk = $row['password'];
if("$wezk" != "$wazk") {
echo "Cannot login.";
exit();
}
$usere=uc($_COOKIE["usNick"]);
$adse=securedata($_GET["ad"]);
$querye = mysql_query("SELECT * FROM ads WHERE ad_id='{$adse}' AND active='1' AND clicksleft>'0'") or die(mysql_error());
if(mysql_num_rows($querye) == 0)
{
print "<b>Error</b> - Advertisement does not exist.";
exit();
}
$rowe = mysql_fetch_array($querye);

      $click1 = "SELECT * FROM tb_clicks WHERE item='click' and howmany='1'";
      $click2 = mysql_query($click1);
      $click3 = mysql_fetch_array($click2);

	  $pclick1 = "SELECT * FROM tb_clicks WHERE item='pclick' and howmany='1'";
      $pclick2 = mysql_query($pclick1);
      $pclick3 = mysql_fetch_array($pclick2);

$click4 = $click3["price"];
$pclick4 = $pclick3["price"];

if ($r["account"]=="premium")
{
      
	  $sqlexzz = "UPDATE tb_users SET visits=visits+1, money=money+'$pclick4' WHERE username='$usere'";
      $resultexzz = mysql_query($sqlexzz);
  
} else {
	  
	  $sqlexzz = "UPDATE tb_users SET visits=visits+1, money=money+'$click4' WHERE username='$usere'";
      $resultexzz = mysql_query($sqlexzz);
}

    $queryzz = "INSERT INTO ad_clicks (user,ad,day) VALUES ('{$r['id']}', '{$_GET['ad']}', '{$da}');";
    mysql_query($queryzz) or die(mysql_error());

//referals visits
      $sqlzd = "SELECT * FROM tb_users WHERE username='$user'";
      $resultzd = mysql_query($sqlzd);        
      $myrowzd = mysql_fetch_array($resultzd);
$juaz=$myrowzd["referer"];

if ($juaz!="") {
$sqlzde = "SELECT * FROM tb_users WHERE username='$juaz'";
$resultzde = mysql_query($sqlzde);        
$myrowzde = mysql_fetch_array($resultzde);
$juaze=$myrowzde["referalvisits"];
$billetes=$myrowzde["money"];

$sqle = "SELECT * FROM tb_upgrade WHERE username='$juaz'";
$resulte = mysql_query($sqle);        
$rowe = mysql_fetch_array($resulte);

      $referalclick1 = "SELECT * FROM tb_clicks WHERE item='referalclick' and howmany='1'";
      $referalclick2 = mysql_query($referalclick1);
      $referalclick3 = mysql_fetch_array($referalclick2);

      $preferalclick1 = "SELECT * FROM tb_clicks WHERE item='preferalclick' and howmany='1'";
      $preferalclick2 = mysql_query($preferalclick1);
      $preferalclick3 = mysql_fetch_array($preferalclick2);

$referalclick4 = $referalclick3["price"];
$preferalclick4 = $preferalclick3["price"];

if ($myrowzde["account"]=="premium")
{
      $sqlexd = "UPDATE tb_users SET referalvisits=referalvisits+1, money=money+'$preferalclick4' WHERE username='$juaz'";
      $resultexd = mysql_query($sqlexd);
} else {
      $sqlexd = "UPDATE tb_users SET referalvisits=referalvisits+1, money=money+'$referalclick4' WHERE username='$juaz'";
      $resultexd = mysql_query($sqlexd);
}

}

    $sqlex = "UPDATE ads SET clicks=clicks+'1', clicksleft=clicksleft-'1' WHERE ad_id='$adse'";
    $resultex = mysql_query($sqlex);

echo "<img src='images/ok.png'> ";
exit();



} else {

      $sqlex = "UPDATE ads SET outside=outside+'1' WHERE ad_id='$adse'";
      $resultex = mysql_query($sqlex);

echo "<img src='images/notlogged.gif'>";
exit();

}

?>

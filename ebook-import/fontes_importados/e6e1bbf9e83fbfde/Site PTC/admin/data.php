<?php
session_start();
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

include "../config.php";
global $loggedin;
if($_GET['r'])
{
$_SESSION['r'] = $_GET['r'];
}
$user = $_COOKIE['ucNick'];

$sitenamez1 = "SELECT price FROM tb_config WHERE item='Site_Name' and howmany='1'";
$alertpayz1 = "SELECT price FROM tb_config WHERE item='Admin_Alertpay_' and howmany='1'";
$upgradez1 = "SELECT price FROM tb_config WHERE item='Upgrade_Price' and howmany='1'";
$forumz1 = "SELECT price FROM tb_config WHERE item='Forum_URL' and howmany='1'";
$titlez1 = "SELECT price FROM tb_config WHERE item='Site_Title' and howmany='1'";

$sitenamez2 = mysql_query($sitenamez1);
$alertpayz2 = mysql_query($alertpayz1);
$upgradez2 = mysql_query($upgradez1);
$forumz2 = mysql_query($forumz1);
$titlez2 = mysql_query($titlez1);

$sitenamez3 = mysql_fetch_array($sitenamez2);
$alertpayz3 = mysql_fetch_array($alertpayz2);
$upgradez3 = mysql_fetch_array($upgradez2);
$forumz3 = mysql_fetch_array($forumz2);
$titlez3 = mysql_fetch_array($titlez2);

$config['site_name'] = $sitenamez3["price"];
$config['title'] = $titlez3["price"];
$config["forum"] = $forumz3["price"]; 
$config['site_path'] = "$script_path";

$config['footer'] = "<font color='#C0C0C0'>&copy; {$config['site_name']}</font> | <a href='../index.php?option=privacy'>Privacy</a> | <a href='../index.php?option=tos'>TOS</a> | <a target='_blank' href='{$config["forum"]}'>Forum</a> | <a href='../index.php?option=banner'>Banner</a> | <a href='../index.php?option=proof'>Payments</a> | <a href='../buyref.php?refs=35'>Purchase Referrals</a> | <a href='../user.php?option=upgrade'>Upgrade</a><br><center>Powered By <a target='_blank' href='http://thealternatif.info'>Official FreeWeb Download</a></center>";
$config["Alertpay"] = $alertpayz3["price"];
$config["upgrade"] = $upgradez3["price"]; 
if($loggedin == 1)
{
if($_COOKIE["usNick"]=="admin")
{
$config["menu"] = "	<li><a href=\"../index.php?option=home\">Home</a></li>
					<li><a href=\"admin.php\">Admin</a></li>
					<li><a href=\"../index.php?option=surf\">Surf Ads</a></li>
					<li><a href=\"../user.php?option=stats\">My Stats</a></li>
					<li><a href=\"../index.php?option=how\">How</a></li>
					<li><a href=\"../index.php?option=faq\">FAQ</a></li>
					<li><a href=\"../advertise.php\">Advertise</a></li>
					<li><a href=\"../contact.php\">Contact</a></li>";
} else {

$config["menu"] = "<li><a href=\"../index.php?option=home\">Home</a></li>
				   <li><a href=\"../index.php?option=surf\">Surf Ads</a></li>
                   <li><a href=\"../user.php?option=stats\">My Stats</a></li>
				   <li><a href=\"../index.php?option=how\">How</a></li>
				   <li><a href=\"../index.php?option=faq\">FAQ</a></li>
				   <li><a href=\"../advertise.php\">Advertise</a></li>
				   <li><a href=\"../contact.php\">Contact</a></li>";
}
} else {
$config["menu"] = "<li><a href=\"../index.php?option=home\">Home</a></li>
				   <li><a href=\"../index.php?option=surf\">Surf Ads</a></li>
                   <li><a href=\"../index.php?option=how\">How</a></li>
				   <li><a href=\"../index.php?option=faq\">FAQ</a></li>
				   <li><a href=\"../advertise.php\">Advertise</a></li>
				   <li><a href=\"../contact.php\">Contact</a></li>";

}

// funcion para sanitizar variables
function securedata($mensaje)
{
$mensaje = htmlentities(stripslashes(trim($mensaje)));
$mensaje = str_replace("'"," ",$mensaje);
$mensaje = str_replace(";"," ",$mensaje);
$mensaje = str_replace("$"," ",$mensaje);
return $mensaje;
}

$referal5 = mysql_fetch_array(mysql_query("SELECT price FROM tb_config WHERE item='referal' and howmany='5'"));
$referal5 = $referal5["price"];

$referal35 = mysql_fetch_array(mysql_query("SELECT price FROM tb_config WHERE item='referal' and howmany='35'"));
$referal35 = $referal35["price"];

$referal100 = mysql_fetch_array(mysql_query("SELECT price FROM tb_config WHERE item='referal' and howmany='100'"));
$referal100 = $referal100["price"];

$referal500 = mysql_fetch_array(mysql_query("SELECT price FROM tb_config WHERE item='referal' and howmany='500'"));
$referal500 = $referal500["price"];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Ad Prices Strings DO NOT EDIT THIS//////BY GABROLA////                                                                                                              ///
//////////////////////////////////////////////////////////                                                                                                                ///
///                                                                                                                                                                                                           ///
$ads1 = "SELECT price FROM tb_config WHERE item='hits' and howmany='100'";               ///               
$ads2 = "SELECT price FROM tb_config WHERE item='hits' and howmany='500'";               ///
$ads3 = "SELECT price FROM tb_config WHERE item='hits' and howmany='1000'";              ///
$ads4 = "SELECT price FROM tb_config WHERE item='hits' and howmany='2500'";              ///
$ads5 = "SELECT price FROM tb_config WHERE item='hits' and howmany='5000'";              ///
$ads6 = "SELECT price FROM tb_config WHERE item='hits' and howmany='10000'";             ///
$ads7 = "SELECT price FROM tb_config WHERE item='hits' and howmany='50000'";             ///
$ads8 = "SELECT price FROM tb_config WHERE item='hits' and howmany='100000'";            ///
$ads9 = "SELECT price FROM tb_config WHERE item='hits' and howmany='500000'";            ///
$ads10 = "SELECT price FROM tb_config WHERE item='hits' and howmany='1000000'";          ///
                                                                                         ///
$resultz1 = mysql_query($ads1);                                                          ///
$resultz2 = mysql_query($ads2);                                                          ///
$resultz3 = mysql_query($ads3);                                                          ///
$resultz4 = mysql_query($ads4);                                                          ///
$resultz5 = mysql_query($ads5);                                                          ///
$resultz6 = mysql_query($ads6);                                                          ///
$resultz7 = mysql_query($ads7);                                                          ///
$resultz8 = mysql_query($ads8);                                                          ///
$resultz9 = mysql_query($ads9);                                                          ///
$resultz10 = mysql_query($ads10);                                                        ///
                                                                                         ///
$rowz1 = mysql_fetch_array($resultz1);                                                   ///
$rowz2 = mysql_fetch_array($resultz2);                                                   ///
$rowz3 = mysql_fetch_array($resultz3);                                                   ///
$rowz4 = mysql_fetch_array($resultz4);                                                   ///
$rowz5 = mysql_fetch_array($resultz5);                                                   ///
$rowz6 = mysql_fetch_array($resultz6);                                                   ///
$rowz7 = mysql_fetch_array($resultz7);                                                   ///
$rowz8 = mysql_fetch_array($resultz8);                                                   ///
$rowz9 = mysql_fetch_array($resultz9);                                                   ///
$rowz10 = mysql_fetch_array($resultz10);                                                 ///
///                                                                                                                                                                                                          ///
//////////////////////////////////////////// ///////////////                                                                                                            ///
/// Ad Prices Strings DO NOT EDIT THIS//////BY GABROLA ////                                                                                                            ///
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// ip real
function getRealIPe()
{
   
   if( $_SERVER['HTTP_X_FORWARDED_FOR'] != '' )
   {
      $client_ip =
         ( !empty($_SERVER['REMOTE_ADDR']) ) ?
            $_SERVER['REMOTE_ADDR']
            :
            ( ( !empty($_ENV['REMOTE_ADDR']) ) ?
               $_ENV['REMOTE_ADDR']
               :
               "unknown" );
   

   
      $entries = split('[, ]', $_SERVER['HTTP_X_FORWARDED_FOR']);
   
      reset($entries);
      while (list(, $entry) = each($entries))
      {
         $entry = trim($entry);
         if ( preg_match("/^([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/", $entry, $ip_list) )
         {
            // http://www.faqs.org/rfcs/rfc1918.html
            $private_ip = array(
                  '/^0\./',
                  '/^127\.0\.0\.1/',
                  '/^192\.168\..*/',
                  '/^172\.((1[6-9])|(2[0-9])|(3[0-1]))\..*/',
                  '/^10\..*/');
   
            $found_ip = preg_replace($private_ip, $client_ip, $ip_list[1]);
   
            if ($client_ip != $found_ip)
            {
               $client_ip = $found_ip;
               break;
            }
         }
      }
   }
   else
   {
      $client_ip =
         ( !empty($_SERVER['REMOTE_ADDR']) ) ?
            $_SERVER['REMOTE_ADDR']
            :
            ( ( !empty($_ENV['REMOTE_ADDR']) ) ?
               $_ENV['REMOTE_ADDR']
               :
               "unknown" );
   }
   
   return $client_ip;
   
}


function showFooter()
{
global $config;
print <<<EOF
<br />			       
    <div id="footer">
    {$config["footer"]}
	</div>	
<div style="display:none;">
<script type="text/javascript"><!--
google_ad_client = "pub-2892592296221538";
/* 728x90, created 5/4/08 */
google_ad_slot = "8263314627";
google_ad_width = 728;
google_ad_height = 90;
//-->
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
</div>
</body>
</html>
EOF;
}
?>
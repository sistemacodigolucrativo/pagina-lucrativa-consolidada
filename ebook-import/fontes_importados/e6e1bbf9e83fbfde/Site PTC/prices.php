<?      
/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

	  $referalclick1 = "SELECT * FROM tb_clicks WHERE item='referalclick' and howmany='1'";
      $referalclick2 = mysql_query($referalclick1);
      $referalclick3 = mysql_fetch_array($referalclick2);

      $preferalclick1 = "SELECT * FROM tb_clicks WHERE item='preferalclick' and howmany='1'";
      $preferalclick2 = mysql_query($preferalclick1);
      $preferalclick3 = mysql_fetch_array($preferalclick2);

$referalclick4 = $referalclick3["price"];
$preferalclick4 = $preferalclick3["price"];

      $click1 = "SELECT * FROM tb_clicks WHERE item='click' and howmany='1'";
      $click2 = mysql_query($click1);
      $click3 = mysql_fetch_array($click2);

	  $pclick1 = "SELECT * FROM tb_clicks WHERE item='pclick' and howmany='1'";
      $pclick2 = mysql_query($pclick1);
      $pclick3 = mysql_fetch_array($pclick2);

$click4 = $click3["price"];
$pclick4 = $pclick3["price"];
?>
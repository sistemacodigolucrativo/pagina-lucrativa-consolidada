<?php

/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/

?>

<table width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td class="main" style="width: 80%; vertical-align: top;">
<?
if($loggedin == 1){
echo"<br />";
include('menum.php');
echo"<br />";
}
?>

<br />
<h3>Noticias Recentes</h3>
<div>
<? include('news.html'); ?>
</div>


</td>
			</tr>
			</table>

<?php 

?>				

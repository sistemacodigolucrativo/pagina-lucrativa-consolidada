<?
session_start();
/**********************************************************************************************************************************************
	SecureBux Version 2.00
	This Script has been created and coded by Gabrola and sold by Hamza.
	If you find any bugs in the script report at ygabrola@gmail.com or contact Hamza.
	Copywrite Gabrola 2008;
	script was edited by hassan ahmady =>> http://thealternatif.info
************************************************************************************************************************************************/

$buxtos = file_get_contents("tos.txt");
$buxtos = str_replace("SecureBux", $config["site_name"], $buxtos);
$buxtos = str_replace("PayPal", Alertpay, $buxtos);
if($_GET['tos'] == "only")
{
die($buxtos);
}
?>

<table width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td class="main" style="width: 95%; vertical-align: top;">
					<br />
<h3>Termos de Servi&ccedil;o</h3>
<br />
<textarea cols="88" rows="20" readonly>
<?=$buxtos?></textarea>

<br />

			</td>
			</tr>
			</table>

<?php  ?>				
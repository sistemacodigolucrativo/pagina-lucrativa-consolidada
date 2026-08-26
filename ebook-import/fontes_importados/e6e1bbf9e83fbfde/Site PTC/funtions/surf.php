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
					<br />
		<h3>Visitar An&uacute;ncios - Visitar Websites</h3>
		<p>
		
		<script type="text/javascript"><!--
google_ad_client = "pub-1276177610874549";
/* 728x90, criado 2 29/10/08 */
google_ad_slot = "6206865980";
google_ad_width = 728;
google_ad_height = 90;
//-->
</script>
<script type="text/javascript"
src="http://pagead2.googlesyndication.com/pagead/show_ads.js">
</script>
		
		&nbsp;</p>
		<div align=center>An&uacute;ncios Atuais:<strong><?php
$currentads = ($loggedin == 1 and $r["account"]=="premium") ? "" : " AND premium=0";
$currentads = mysql_query("SELECT COUNT(*) AS cnt FROM ads WHERE clicksleft>'0' AND active='1'".$currentads);
$currentads = mysql_fetch_array($currentads);
$currentads = $currentads["cnt"];
print $currentads;
?>
</strong>
&nbsp;&nbsp;&nbsp;&nbsp;Novos An&uacute;ncios Hoje: <strong>
<?=$set["newadstoday"];?></strong>
&nbsp;&nbsp;&nbsp;&nbsp;Total de An&uacute;ncios: <strong>
<?=$set["totalads"];?></strong><br>
<br></div>
<?php

$cats = array(  "1"  => "Artes e Entretenimento",
"2" => "Negócios e Dinheiro",
"3" => "Computadores e Internet",
"4" => "Saúde e Recreação",
"5" => "Referência e Educação",
"6" => "Compras e Gastos",
"8" => "Viagens e Alojamentos",
"9" => "Caridade e Sem Fins Lucrativos" );

foreach($cats as $k=>$v)
{
print '<table width="99%" border="0" align="center" cellpadding="0" cellspacing="0">
        <tr> 
        <td width="70%" class="class2" style="FONT-FAMILY: Verdana; FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999;"><span style="margin-left: 3px;"><strong>
						 '.$v.'</strong></span></td>

        <td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none;"><span style="margin-left: 3px;"><strong>Membros</strong></span></td>
        <td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none;"><span style="margin-left: 3px;"><strong>Visitantes</strong></span></td>
        <td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none;"><span style="margin-left: 3px;"><strong>Total</strong></span></td>
        </tr>';
$premium = ($loggedin == 1 and $r["account"]=="premium") ? "" : " AND premium=0";
$ads = mysql_query("SELECT COUNT(*) AS cnt FROM ads WHERE clicksleft>'0' AND active='1' AND cat='$k'".$premium);
$ads = mysql_fetch_array($ads);
$ads = $ads['cnt'];

if($ads == 0)
{
print '<tr> 
	   <td colspan="4" class="class2" style="FONT-FAMILY: Verdana; FONT-SIZE: 11px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-top:none;"><span style="margin-left: 3px;">
		Não a anuncios nessa categoria</span></td>

		</tr>';
} else {
$premium = ($loggedin == 1 and $r["account"]=="premium") ? "" : " AND premium=0";
$quer = mysql_query("SELECT * FROM ads WHERE clicksleft>'0' AND active='1' AND cat='$k'".$premium);
while($ad = mysql_fetch_array($quer))
{
if($loggedin==1)
{
$checkvisit = mysql_query("SELECT COUNT(*) AS cnt FROM ad_clicks WHERE user='{$r['id']}' AND ad='{$ad['ad_id']}'") or die(mysql_error());
$checkvisit = mysql_fetch_array($checkvisit);
$checkvisit = $checkvisit["cnt"];
}
if($checkvisit > 0 and $loggedin ==1)
{

print '															
		<tr> 
		<td width="70%" class="class2" style="FONT-FAMILY: Verdana; FONT-SIZE: 11px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-top:none;"><span style="margin-left: 3px; text-decoration:none; color: #787878;"><font color=#660000><strike>'.$ad['ad_description'].'</strike></font> 								  
		</span></td>
		<td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none; border-top:none;"><span style="margin-left: 3px;">
		'.$ad['clicks'].'</span></td>
		<td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none; border-top:none;"><span style="margin-left: 3px;">
		'.$ad['outside'].'</span></td>
		 <td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none; border-top:none;"><span style="margin-left: 3px;">
		'.($ad['outside']+$ad['clicks']).'</span></td>
		</tr>
	';

} else {

print '															
		<tr> 
		<td width="70%" class="class2" style="FONT-FAMILY: Verdana; FONT-SIZE: 11px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-top:none;"><span style="margin-left: 3px; text-decoration:none; color: #787878;">
		<a href=view.php?ad='.$ad['ad_id'].' target=_blank style="text-decoration:none; color: #FB9233;">'.$ad['ad_description'].'</a> 								  
		</span></td>
		<td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none; border-top:none;"><span style="margin-left: 3px;">
		'.$ad['clicks'].'</span></td>
		<td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none; border-top:none;"><span style="margin-left: 3px;">
		'.$ad['outside'].'</span></td>
		<td align="center" width="10%" style="FONT-FAMILY: Verdana;FONT-SIZE: 13px; BACKGROUND-COLOR: #ffffff; border:solid 1px #999999; border-left:none; border-top:none;"><span style="margin-left: 3px;">
		'.($ad['outside']+$ad['clicks']).'</span></td>
		</tr>
';
}

}

}
print "</table><br />";
}

?>

			</td>
			</tr>
			</table>

<?php 

?>				

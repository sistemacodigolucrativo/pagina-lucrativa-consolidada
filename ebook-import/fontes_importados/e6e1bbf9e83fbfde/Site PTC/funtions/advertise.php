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
<h3>Anuncie no
  <?=$config["site_name"];?></h3>
<div align="left">
  <?

if ($_POST)
{

$pname=securedata($_POST["ad_name"]);
$pemail=securedata($_POST["ad_email"]);
$plan=securedata($_POST["ad_plan"]);
$url=securedata($_POST["ad_url"]);
$cat=securedata($_POST["cat"]);
$premium=securedata($_POST["premium"]);
$description=securedata($_POST["ad_desc"]);

$premium = ($_POST["premium"] != 0) ? 1 : 0;
$errormsg = false;
if(empty($pemail))
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error</b> - You must supply a Alertpay email</h4>";
}

if(empty($url))
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error</b> - You must supply a URL</h4>";
}

if(empty($description))
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error</b> - You must supply a description</h4>";
}

if($_POST['verify']!=$_SESSION['string'])
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error</b> - Captcha was entered incorrectly.</h4>";
}

if(!$_POST["ad_plan"] or $_POST["ad_plan"] == "none")
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error</b> - You must select a plan.</h4>";
}

$_SESSION['string'] = false;
$laip = getRealIP();



if($error == 1)
{
print $errormsg;
} else {

$ad_plan = $_POST['ad_plan'];

if($ad_plan == 1)
{
$visits=100;
$price= $rowz1["price"];
$descriptionz="{$config['site_name']} - 100 Clicks";
}

if($ad_plan == 2)
{
$visits=500;
$price= $rowz2["price"];
$descriptionz="{$config['site_name']} - 500 Clicks";
}

if($ad_plan == 3)
{
$visits=1000;
$price= $rowz3["price"];
$descriptionz="{$config['site_name']} - 1,000 Clicks";
}

if($ad_plan == 4)
{
$visits=2500;
$price= $rowz4["price"];
$descriptionz="{$config['site_name']} - 2,500 Clicks";
}

elseif($ad_plan == 5)
{
$visits=5000;
$price= $rowz5["price"];
$descriptionz="{$config['site_name']} - 5,000 Clicks";
}

elseif($ad_plan == 6)
{
$visits=10000;
$price= $rowz6["price"];
$descriptionz="{$config['site_name']} - 10,000 Clicks";
}

else
if($ad_plan == 7)
{
$visits=50000;
$price= $rowz7["price"];
$descriptionz="{$config['site_name']} - 50,000 Clicks";
}
elseif($ad_plan == 8)
{
$visits=100000;
$price= $rowz8["price"];
$descriptionz="{$config['site_name']} - 100,000 Clicks";
}
elseif($ad_plan == 9)
{
$visits=500000;
$price= $rowz9["price"];
$descriptionz="{$config['site_name']} - 500,000 Clicks";
}
elseif($ad_plan == 10)
{
$visits=1000000;
$price= $rowz10["price"];
$descriptionz="{$config['site_name']} - 1,000,000 Clicks";
}

//$visits = How many visits they purchased
//$price = They must pay this much
//$pname = Alertpay Name
//$pemail = Alertpay address
//$ad_plan = The ad plan
//$url = The ad url.
//$cat = The ad catagory.
//$description = The ad description.

$query = "INSERT INTO `ads` (
`ad_id` ,
`ad_name` ,
`ad_email` ,
`ad_plan` ,
`ad_url` ,
`ad_description` ,
`cat` ,
`premium` ,
`active` ,
`clicks` ,
`outside`,
`clicksleft`
)
VALUES (
'', '{$pname}', '{$pemail}', '{$ad_plan}', '{$url}', '{$description}', '{$cat}', '{$premium}', '0', '0', '0', '$visits'
);";
mysql_query($query);
?>
  Seu pedido foi realizado com sucesso! Por&eacute;m, antes de n&oacute;s aprovarmos seu  an&uacute;ncio, voc&ecirc; dever&aacute; efetuar o pagamento de $<span class="main" style="width: 80%; vertical-align: top;"><strong>
    <?=$price?>
    </strong></span>via PagSeguro clicando no bot&atilde;o abaixo.
  <!-- BOTAO PAGSEGURO -->
  </p>
</div>
<form target="pagseguro" action="https://pagseguro.uol.com.br/security/webpagamentos/webpagto.aspx" method="post">
          <input type="hidden" name="email_cobranca" value="<?= $config["Alertpay"]; ?>" />
          <input type="hidden" name="tipo" value="CBR" />
          <input type="hidden" name="moeda" value="BRL" />
          <input type="hidden" name="item_id" value="5" />
          <input type="hidden" name="item_descr" value="<?= $descriptionz ?>" />
          <input type="hidden" name="item_quant" value="1" />
          <input type="hidden" name="item_valor" value="<?= $price ?>" />
          <input type="hidden" name="frete" value="0" />
          <input type="hidden" name="peso" value="0" />
          <input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" name="submit" alt="Pague com PagSeguro - é rápido, grátis e seguro!" />
  </form>
      <!-- FIM DO BOTAO PAGSEGURO -->			</td>
			</tr>
</table>

<br />
</td>
</tr>
</table>
</td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
</table>
	<!-- content-wrap ends here -->	
<?php
include "footer.php";
exit();
}
}
?>
<p>Anunciar no  
  <?=$config["site_name"];?>
  &eacute; bem simples e r&aacute;pido. N&oacute;s cobramos $
  <?=$rowz1["price"];?>
   por cada   100 visitas que os nossos membros fazem no seu site. Nossos an&uacute;ncios duram 30   segundos. As visitas exteriores s&atilde;o ilimitadas e inclu&iacute;das dentro do pre&ccedil;o.   Quanto maior for o seu plano de an&uacute;ncio mais desconto voc&ecirc; ter&aacute;. Para anunciar   conosco Voc&ecirc; s&oacute; tem que completar simplesmente o formul&aacute;rio e pagar a taxa. N&oacute;s   analizaremos seu an&uacute;ncio e o ter&aacute; ativo dentro de 24 horas. N&oacute;s n&atilde;o aceitaremos   os an&uacute;ncios que promovem o &iacute;ndice ou a atividade ilegal ou sites adultos que   usam disjuntores de frame. Isso n&atilde;o faz parte da nossa pol&iacute;tica; porque est&aacute;   dispon&iacute;vel para ser visitado por todos os membros. Al&eacute;m disso, um dos grandes   benef&iacute;cios do an&uacute;ncio com 
   <?=$config["site_name"];?> &eacute; que seu an&uacute;ncio permanece ativo por   um tempo suficientemente longo, ele ser&aacute; encontrado pelos motores da busca como   Google e dar&aacute; a seu site um Rank extremamente elevado, porque voc&ecirc; &eacute; ligado em   um site de elevado do tr&aacute;fego!<br />
  <br />
  <br />
  <strong>Por favor, s&oacute; preencha o formul&aacute;rio se tiver certeza de que vai anunciar   conosco.</strong></p>
<form name="ad" action="index.php?option=advertise" method="POST">
<table width="96%" border="0" cellspacing="0" cellpadding="5">
<tr>
<td width="35%" align="left" valign="middle" class="midtext">Seu Nome no PagSeguro:</td>
<td width="65%" align="left" valign="bottom" class="midtext"><input type="text" name="ad_name" size="25" class="form" value="<?=$_POST["ad_name"]?>"></td>
</tr>

<tr>
<td width="35%" align="left" valign="middle" class="midtext">E-mail do PagSeguro:</td>
<td width="65%" align="left" valign="bottom" class="midtext"><input type="text" name="ad_email" size="25" class="form" value="<?=$_POST["ad_email"]?>"></td>
</tr>
<tr>
<td width="35%" align="left" valign="middle" class="midtext">Escolha o Plano:</td>
<td width="65%" align="left" valign="bottom" class="midtext">
<select name="ad_plan" class="form">
<option value="none">--- Selecione o Plano ---</option>

<option value=1>100 Visitas de Membros @ $<?=$rowz1["price"]?></option>
<option value=2>500 Visitas de Membros @ $<?=$rowz2["price"]?></option>
<option value=3>1,000 Visitas de Membros @ $<?=$rowz3["price"]?></option>
<option value=4>2,500 Visitas de Membros @ $<?=$rowz4["price"]?></option>
<option value=5>5,000 Visitas de Membros @ $<?=$rowz5["price"]?></option>
<option value=6>10,000 Visitas de Membros @ $<?=$rowz6["price"]?></option>
<option value=7>50,000 Visitas de Membros @ $<?=$rowz7["price"]?></option>
<option value=8>100,000 Visitas de Membros @ $<?=$rowz8["price"]?></option>
<option value=9>500,000 Visitas de Membross @ $<?=$rowz9["price"]?></option>
<option value=10>1,000,000 Visitas de Membros @ $<?=$rowz10["price"]?></option>
</select>
</td>
</tr>

<tr>
<td width="35%" align="left" valign="middle" class="midtext">Site URL (incluindo http://):</td>
<td width="65%" align="left" valign="bottom" class="midtext">
<input type="text" name="ad_url" size="25" class="form" value="<?=$_POST["ad_url"]?>"></td>
</tr>
<tr>
<td width="35%" align="left" valign="middle" class="midtext">T&iacute;tulo do Site/Descri&ccedil;&atilde;o (80 chars max): </td>
<td width="65%" align="left" valign="bottom" class="midtext"><textarea name="ad_desc" cols="35" rows="2" class="form" onChange="check_length(this.form);" onKeyPress="check_length(this.form);" onKeyDown="check_length(this.form);" onKeyUp="check_length(this.form);"><?=$_POST["ad_desc"]?></textarea></td>

</tr>
<tr>
<td width="35%" align="left" valign="middle" class="midtext">Categoria do Site:</td>
<td width="65%" align="left" valign="bottom" class="midtext">
<select name="cat" class="form">
<option value="none">--- Selecione uma Categoria ---</option>
<option value=1>Artes e Entreterimento (videos, musicas, games, etc)</option><option value=2>Negocios e Dinheiro (GPT, finanças, trabalhos, etc)</option><option value=3>Computadores e Internet (software, webmasters, serviços, ferramentas sites, etc)</option><option value=4>Saúde e Recreação (brinquedos, medicina, esportes, etc)</option><option value=5>Referencia & Educação (pesquisas, informação, etc)</option><option value=6>Compras e Gastos (compras e vendas on-line)</option><option value=8>Viajens e Alojamentos (hospedagens, hoteis, etc)</option><option value=9>Caridade e Sem fins lucrativos (ajuda, sociedade, caridade, etc)</option> </select>

</td>
</tr>
<tr>
<td align="left" valign="middle" class="midtext">An&uacute;ncios Premium:</td>
<td align="left" valign="bottom" class="midtext"><input name="premium" type="checkbox" id="premium" value="1" <? if($_POST["premium"]) { print "checked
"; }?>>
  Marque aqui caso queira que seu an&uacute;ncio seja somente para Membros Premium.</td>
</tr>
<tr>
<td width="35%" align="left" valign="middle" class="midtext">C&oacute;digo de Seguran&ccedil;a:<br />
  <br /></td>

<td width="65%" align="left" valign="bottom" class="midtext"><img src="image.php" onclick="this.src='image.php?newtime=' + (new Date()).getTime();"><br /><span style="font-size:10px;">(Click to reload)</span><br />
<input type="text" name="verify" size="17" maxlength="" autocomplete="off" class="form"></td>
</tr>
<tr>
<td width="35%">&nbsp;</td>
<td width="65%" align="left" valign="bottom" class="midtext">
<img src="http://carpediem.ilhaweb.net/ptc/images/pagseguro.jpg" width="150" height="40" align="absbottom"><br />
<input type="submit" value="Pagar Agora" name="submit" class="inputbox">
</td>
</tr>

</table>
</form>

			</td>
			</tr>
			</table>

<?php 

?>				

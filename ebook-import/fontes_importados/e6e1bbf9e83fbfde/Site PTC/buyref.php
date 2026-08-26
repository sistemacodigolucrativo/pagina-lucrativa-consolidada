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

include "config.php";
global $c,$loggedin;
include "data.php";
global $config;
include "funciones.php";
include "prices.php";
?>
<? include "header2.php"; ?>

<!-- content begin here -->
<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif" /></td>
<td class="mainbg" align="center" valign="top" bgcolor="#FFFFFF" >
<table width="95%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<?php

    if (file_exists(dirname($HTTP_SERVER_VARS) . '/install'))
	{
		if($loggedin == 1)
		{
			if($_COOKIE["usNick"]=="admin")
			{
				echo "<br /><br />";
				echo "<center><h1>Install directory is exist,<br /><br /><u>Please Remove or Delete Install Directory</u></h1></center>";
				echo "<br /><br />";
			} else {
				echo "<br /><br />";
				echo "<center><h1>Website is Undder Re-Constructions,<br /><br />Please Check Back Soon!</h1>";
				echo "<br /><h4>Please <a href=\"contact.php\"><b>Contact</b></a> The Administrator</h4>";
				echo "</center>";
			}
		} else {
				echo "<br /><br />";
				echo "<center><h1>Website is Undder Re-Constructions,<br /><br />Please Check Back Soon!</h1>";
				echo "<br /><h4>Please <a href=\"contact.php\"><b>Contact</b></a> The Administrator</h4>";
				echo "</center>";
		}
}
else { 
?>

<table width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td class="main" style="width: 80%; vertical-align: top;">
					<br />

<?
if(!isset($_COOKIE["usNick"]) && !isset($_COOKIE["usPass"]))
{
print "<h3>Purchase Referrals</h3>
<h4>You must be logged in to Purchase Referrals.</h4>
<h4><a href='register.php'>Sign up free</a></h4>
<h4><a href='login.php'>Login into your current account.</a></h4>";
} else {

 include('menum.php'); ?>
<br>
<br>

<?php
$refs = $_GET["refs"];
switch($refs) {
case(5):
default:

if (isset($_POST["customer"]))
{

$queryx = mysql_query("SELECT sets FROM tb_buyref WHERE id='1'") or die(mysql_error());
$rowx = mysql_fetch_array($queryx);

if ($rowx["sets"]=="0")
{
echo "<font color=\"red\">Sorry there is no sets available at now.</font><br><br>";
}else{


// Si todo parece correcto procedemos con la inserccion

$customer=securedata($_POST["customer"]);
$pemail=securedata($_POST["pemail"]);
$laip = getRealIP();
//5 is how many refs they want
//Todo parece correcto procedemos con la inserccion
$queryzz = "INSERT INTO tb_buyref (customer, sets, amount, pemail, ip) VALUES('$customer', '5','1','$pemail','$laip')";
mysql_query($queryzz) or die(mysql_error());


?>
<h3>Comprar Referidos</h3>
<p>Sua ordem foi submetida! Por&eacute;m, antes de n&oacute;s aprovarmos sua  compra, voc&ecirc; dever&aacute; efetuar o pagamento de $<?=$referal5?> via PagSeguro.</p> 

<!-- BOTAO PAGSEGURO -->
        </p>
  <form target="pagseguro" action="https://pagseguro.uol.com.br/security/webpagamentos/webpagto.aspx" method="post">
          <input type="hidden" name="email_cobranca" value="<?= $config["Alertpay"]; ?>" />
          <input type="hidden" name="tipo" value="CBR" />
          <input type="hidden" name="moeda" value="BRL" />
          <input type="hidden" name="item_id" value="5" />
          <input type="hidden" name="item_descr" value="5 Referidos - <?=$config["site_name"];?>" />
          <input type="hidden" name="item_quant" value="1" />
          <input type="hidden" name="item_valor" value="<?=$referal5?>" />
          <input type="hidden" name="frete" value="0" />
          <input type="hidden" name="peso" value="0" />
          <input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" name="submit" alt="Pague com PagSeguro - é rápido, grátis e seguro!" />
  </form>
      <!-- FIM DO BOTAO PAGSEGURO -->

<br>

<?
	}
} else {
?>
<h3>Comprar 5 Referidos</h3>
<p>Por que n&atilde;o  nos deixe fazer o se referindo para voc&ecirc;? N&oacute;s sabemos como dif&iacute;cil e tempo consumindo se referindo  outros podem ser, especialmente quando voc&ecirc; n&atilde;o tem o tempo simplesmente. Na  realidade, n&oacute;s temos j&aacute; adquiriu s&oacute;cios recentemente registrados que uniram sem  um referrer que n&oacute;s podemos colocar automaticamente em baixo de voc&ecirc; e podemos  o deixar colhem as recompensas! <br><br>
  Voc&ecirc;  pode comprar
  <?=$config["site_name"];?>
   destes s&oacute;cios un-se  referidos para um pre&ccedil;o de  $
   <?=$referal5?>
   . Este &eacute; um  extremamente baixo pre&ccedil;o para pagar quando voc&ecirc; se sentar atr&aacute;s e imagina seus  lucros. Na realidade, baseado em m&eacute;dias, 5 indica&ccedil;&otilde;es ativas podem o trazer.</p>
<p><font color="#b2cc80">»</font> 5 indica&ccedil;&otilde;es clicam  10 an&uacute;ncios por dia  = $
  <?=$referalclick3["price"] * 10 * 5;?><br>
<font color="#b2cc80">»</font> Seus ganhos mensais  = $
<?=($referalclick3["price"] * 10 * 5) * 30;?><br>
<font color="#b2cc80">»</font> Seus ganhos anuais  = <u><b>$<?=($referalclick3["price"] * 10 * 5) * 30 * 12;?></b></u></p>
<p>embora, n&oacute;s n&atilde;o podemos garantir que voc&ecirc; ganhar&aacute; tal lucro.</p>
<p>Tempo processando: 2-5 dias de funcionamento. <br />
Disponibilidade: Limitado. Primeiro venha, primeiro saque.</p>
<p><?=$config["site_name"];?>
   - Pacote de s&oacute;cio  l $
   <?=$referal5?></p>

<?

$sqld = "SELECT * FROM tb_buyref WHERE customer='admin'";
$resultd = mysql_query($sqld);        
$rowd = mysql_fetch_array($resultd);

if($rowd["sets"] < 5)
{
?>
<p><strong>Pacotes de S&oacute;cios Un-se referidos s&atilde;o atualmente  indispon&iacute;veis. </strong></p>
<?php
} else {
$user=uc($_COOKIE["usNick"]);

$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);

?>
<form method="post" action="buyref.php?refs=5">
<input type="hidden" value="<?= $row["username"] ?>" name="customer">
<input type="hidden" value="<?= $row["pemail"] ?>" name="pemail">
<input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" border="0" name="submit" alt="Pagamentos processados via PagSeguro.">
</form>
<?php
	}
?>
Pacotes adicionais:<br>

<a href="user.php?option=upgrade">Upgrade Membro Premium</a><br>
<a href="buyref.php?refs=35">Clique Aqui para comprar 35 referidos $<?=$referal35?></a><br>
<a href="buyref.php?refs=100">Clique aqui para compra100 referidos $<?=$referal100?></a><br>
<a href="buyref.php?refs=500">Clique aqui para comprar  500 referidos $<?=$referal500?></a><br>
</p>

<?php
 }
break;
case(35):
if (isset($_POST["customer"]))
{

$queryx = mysql_query("SELECT sets FROM tb_buyref WHERE id='1'") or die(mysql_error());
$rowx = mysql_fetch_array($queryx);

if ($rowx["sets"]<35)
{
echo "<font color=\"red\">Sorry there is no sets available at now.</font><br><br>";
} else {

// Si todo parece correcto procedemos con la inserccion

$customer=securedata($_POST["customer"]);
$pemail=securedata($_POST["pemail"]);
$laip = getRealIP();
//5 is how many refs they want
//Todo parece correcto procedemos con la inserccion
$queryzz = "INSERT INTO tb_buyref (customer, sets, amount, pemail, ip) VALUES('$customer', '35','1','$pemail','$laip')";
mysql_query($queryzz) or die(mysql_error());

?>
<h3>Comprar Referidos</h3>
Sua ordem foi submetida! Por&eacute;m, antes de n&oacute;s aprovarmos sua  compra, voc&ecirc; dever&aacute; efetuar o pagamento de $<span class="main" style="width: 80%; vertical-align: top;"><?=$referal35?>
</span>

via PagSeguro.

<!-- BOTAO PAGSEGURO -->
        </p>
  <form target="pagseguro" action="https://pagseguro.uol.com.br/security/webpagamentos/webpagto.aspx" method="post">
          <input type="hidden" name="email_cobranca" value="<?= $config["Alertpay"]; ?>" />
          <input type="hidden" name="tipo" value="CBR" />
          <input type="hidden" name="moeda" value="BRL" />
          <input type="hidden" name="item_id" value="5" />
          <input type="hidden" name="item_descr" value="35 Referidos - <?=$config["site_name"];?>" />
          <input type="hidden" name="item_quant" value="1" />
          <input type="hidden" name="item_valor" value="<?=$referal35?>" />
          <input type="hidden" name="frete" value="0" />
          <input type="hidden" name="peso" value="0" />
          <input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" name="submit" alt="Pague com PagSeguro - é rápido, grátis e seguro!" />
  </form>
      <!-- FIM DO BOTAO PAGSEGURO -->

<br>

<?
	}
} else {
?>

<h3>Comprar 35 Referidos</h3>
<p>Por que n&atilde;o nos deixe fazer o se referindo para voc&ecirc;? N&oacute;s  sabemos como dif&iacute;cil e tempo consumindo se referindo outros podem ser,  especialmente quando voc&ecirc; n&atilde;o tem o tempo simplesmente. Na realidade, n&oacute;s temos  j&aacute; adquiriu s&oacute;cios recentemente registrados que uniram sem um referrer que n&oacute;s  podemos colocar automaticamente em baixo de voc&ecirc; e podemos o deixar colhem as  recompensas! <br>
<br>
Voc&ecirc; s&oacute; pode comprar 35 destes s&oacute;cios un-se  referidos para um pre&ccedil;o de  $
<?=$referal35?>
. Este &eacute; um extremamente baixo pre&ccedil;o para pagar  quando voc&ecirc; se sentar atr&aacute;s e imagina seus lucros. Na realidade, baseado em  m&eacute;dias, 35 indica&ccedil;&otilde;es ativas podem o trazer </p>
<p>
<font color="#b2cc80">»</font> 35 indica&ccedil;&otilde;es clicam 10 an&uacute;ncios por dia  = $
<?=$referalclick3["price"] * 10 * 35;?><br>
<font color="#b2cc80">»</font> Seus ganhos mensais  = $
<?=($referalclick3["price"] * 10 * 35) * 30;?><br>
<font color="#b2cc80">»</font> Seus ganhos anuais  = <u><b>$<?=($referalclick3["price"] * 10 * 35) * 30 * 12;?></b></u></p>
 <p>embora, n&oacute;s n&atilde;o podemos garantir que voc&ecirc; ganhar&aacute; tal um  lucro. </p>
<p>Tempo processando: 2-5 dias de funcionamento. <br />
Disponibilidade: Limitado. Primeiro venha, primeiro saque.</p>
<p><?=$config["site_name"];?>
   - Pacote de s&oacute;cio l $
   <?=$referal35?></p>

<?

$sqld = "SELECT * FROM tb_buyref WHERE customer='admin'";
$resultd = mysql_query($sqld);
$rowd = mysql_fetch_array($resultd);

if($rowd["sets"] < 35)
{
?>
<p><strong>Pacotes de S&oacute;cios Un-se referidos s&atilde;o atualmente  indispon&iacute;veis. </strong></p>
<?php
} else {
$user=uc($_COOKIE["usNick"]);

$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);

?>

<form method="post" action="buyref.php?refs=35">
<input type="hidden" value="<?= $row["username"] ?>" name="customer">
<input type="hidden" value="<?= $row["pemail"] ?>" name="pemail">
<input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" border="0" name="submit" alt="Pagamentos processados via PagSeguro.">
</form>
<?php
}
?>
<p>Pacotes adicionais:<br>
<a href="user.php?option=upgrade">Upgrade Membro Premium</a><br>
<a href="buyref.php?refs=5">Clique aqui para comprar 5 referidos $<?=$referal5?></a><br>
<a href="buyref.php?refs=100">Clique aqui para comprar 100 referidos $<?=$referal100?></a><br>
<a href="buyref.php?refs=500">Clique aqui para comprar 500 referidos $<?=$referal500?></a><br>
</p>

<?php
}
break;
case(100):
if (isset($_POST["customer"]))
{

$queryx = mysql_query("SELECT sets FROM tb_buyref WHERE id='1'") or die(mysql_error());
$rowx = mysql_fetch_array($queryx);

if ($rowx["sets"]<100)
{
echo "<font color=\"red\">Sorry there is no sets available at now.</font><br><br>";
}else{

// Si todo parece correcto procedemos con la inserccion

$customer=securedata($_POST["customer"]);
$pemail=securedata($_POST["pemail"]);
$laip = getRealIP();
//5 is how many refs they want
//Todo parece correcto procedemos con la inserccion
$queryzz = "INSERT INTO tb_buyref (customer, sets, amount, pemail, ip) VALUES('$customer', '100','1','$pemail','$laip')";
mysql_query($queryzz) or die(mysql_error());

?>
<h3>Comprar Referidos</h3>
<span class="main" style="width: 80%; vertical-align: top;">Sua ordem foi submetida! Por&eacute;m, antes de n&oacute;s aprovarmos sua  compra, voc&ecirc; dever&aacute; efetuar o pagamento de $<span class="main" style="width: 80%; vertical-align: top;">
<?=$referal100?>
</span>via PagSeguro.</span>

<!-- BOTAO PAGSEGURO -->
        </p>
  <form target="pagseguro" action="https://pagseguro.uol.com.br/security/webpagamentos/webpagto.aspx" method="post">
          <input type="hidden" name="email_cobranca" value="<?= $config["Alertpay"]; ?>" />
          <input type="hidden" name="tipo" value="CBR" />
          <input type="hidden" name="moeda" value="BRL" />
          <input type="hidden" name="item_id" value="5" />
          <input type="hidden" name="item_descr" value="100 Referidos - <?=$config["site_name"];?>" />
          <input type="hidden" name="item_quant" value="1" />
          <input type="hidden" name="item_valor" value="<?=$referal35?>" />
          <input type="hidden" name="frete" value="0" />
          <input type="hidden" name="peso" value="0" />
          <input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" name="submit" alt="Pague com PagSeguro - é rápido, grátis e seguro!" />
  </form>
      <!-- FIM DO BOTAO PAGSEGURO -->
<br>

<?
	}

} else {
 
?>

<h3>Comprar 100 Referidos</h3>
<p>Por que n&atilde;o nos deixe fazer o se referindo para  voc&ecirc;? N&oacute;s sabemos como dif&iacute;cil e tempo consumindo se referindo outros podem  ser, especialmente quando voc&ecirc; n&atilde;o tem o tempo simplesmente. Na realidade, n&oacute;s  temos j&aacute; adquiriu s&oacute;cios recentemente registrados que uniram sem um referrer  que n&oacute;s podemos colocar automaticamente em baixo de voc&ecirc; e podemos o deixar  colhem as recompensas! <br><br>
Voc&ecirc; s&oacute; pode comprar 100 destes s&oacute;cios un-se  referidos para um pre&ccedil;o de  $
<?=$referal100?>
. Este &eacute; um extremamente baixo pre&ccedil;o para pagar  quando voc&ecirc; se sentar atr&aacute;s e imagina seus lucros. Na realidade, baseado em  m&eacute;dias, 100 indica&ccedil;&otilde;es ativas podem o trazer</p>
<p><font color="#b2cc80">»</font> 100 indica&ccedil;&otilde;es clicam 10 an&uacute;ncios por dia  = $
  <?=$referalclick3["price"] * 10 * 100;?><br>
<font color="#b2cc80">»</font> Seus ganhos mensais  = $
<?=($referalclick3["price"] * 10 * 100) * 30;?><br>
<font color="#b2cc80">»</font> Seus ganhos anuais  = <u><b>$<?=($referalclick3["price"] * 10 * 100) * 30 * 12;?></b></u></p>
<p>embora, n&oacute;s n&atilde;o podemos garantir que voc&ecirc; ganhar&aacute; tal um  lucro. </p>
<p>Tempo processando: 2-5 dias de funcionamento. <br />
Disponibilidade: Limitado. Primeiro venha, primeiro saque. </p>
<p><?=$config["site_name"];?>
   - Pacote de s&oacute;cio l $
   <?=$referal100?></p>

<?

$sqld = "SELECT * FROM tb_buyref WHERE customer='admin'";
$resultd = mysql_query($sqld);        
$rowd = mysql_fetch_array($resultd);

if($rowd["sets"] < 100)
{
?>
<p><strong>Pacotes de S&oacute;cios  referidos s&atilde;o atualmente  indispon&iacute;veis. </strong></p>
<?php
} else {
$user=uc($_COOKIE["usNick"]);

$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);

?>

<form method="post" action="buyref.php?refs=100">
<input type="hidden" value="<?= $row["username"] ?>" name="customer">
<input type="hidden" value="<?= $row["pemail"] ?>" name="pemail">
<input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" border="0" name="submit" alt="Pagamentos processados via PagSeguro.">
</form>
<?php
}
?>
                                                
<p>Pacotes adicionais:<br>
<a href="user.php?option=upgrade">Upgrade Membro Premium</a><br>
<a href="buyref.php?refs=5">Clique aqui para comprar 5 referidos $<?=$referal5?></a><br>
<a href="buyref.php?refs=35">Clique aqui para comprar 35 referidos $<?=$referal35?></a><br>
<a href="buyref.php?refs=500">Clique aqui para comprar 500 referidos $<?=$referal500?></a><br>
</p>

<?php
}
break;
case(500):

if (isset($_POST["customer"]))
{

$queryx = mysql_query("SELECT sets FROM tb_buyref WHERE id='1'") or die(mysql_error());
$rowx = mysql_fetch_array($queryx);

if ($rowx["sets"]<500)
{
echo "<font color=\"red\">Sorry there is no sets available at now.</font><br><br>";
} else {

// Si todo parece correcto procedemos con la inserccion

$customer=securedata($_POST["customer"]);
$pemail=securedata($_POST["pemail"]);
$laip = getRealIP();
//5 is how many refs they want
//Todo parece correcto procedemos con la inserccion
$queryzz = "INSERT INTO tb_buyref (customer, sets, amount, pemail, ip) VALUES('$customer', '500','1','$pemail','$laip')";
mysql_query($queryzz) or die(mysql_error());
?>
<h3>Comprar Referidos</h3>
<p><span class="main" style="width: 80%; vertical-align: top;">Sua ordem foi submetida! Por&eacute;m, antes de n&oacute;s aprovarmos sua  compra, voc&ecirc; dever&aacute; efetuar o pagamento de $<span class="main" style="width: 80%; vertical-align: top;">
  <?=$referal500?>
</span>via PagSeguro.</span></p> 

<!-- BOTAO PAGSEGURO -->
        </p>
  <form target="pagseguro" action="https://pagseguro.uol.com.br/security/webpagamentos/webpagto.aspx" method="post">
          <input type="hidden" name="email_cobranca" value="<?= $config["Alertpay"]; ?>" />
          <input type="hidden" name="tipo" value="CBR" />
          <input type="hidden" name="moeda" value="BRL" />
          <input type="hidden" name="item_id" value="5" />
          <input type="hidden" name="item_descr" value="500 Referidos - <?=$config["site_name"];?>" />
          <input type="hidden" name="item_quant" value="1" />
          <input type="hidden" name="item_valor" value="<?=$referal500?>" />
          <input type="hidden" name="frete" value="0" />
          <input type="hidden" name="peso" value="0" />
          <input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" name="submit" alt="Pague com PagSeguro - é rápido, grátis e seguro!" />
  </form>
      <!-- FIM DO BOTAO PAGSEGURO -->

<br>

<?

}

}else{
?>

<h3>Comprar 500 Referidos</h3>
<p>Por que n&atilde;o nos deixe fazer o se referindo para voc&ecirc;? N&oacute;s  sabemos como dif&iacute;cil e tempo consumindo se referindo outros podem ser,  especialmente quando voc&ecirc; n&atilde;o tem o tempo simplesmente. Na realidade, n&oacute;s temos  j&aacute; adquiriu s&oacute;cios recentemente registrados que uniram sem um referrer que n&oacute;s  podemos colocar automaticamente em baixo de voc&ecirc; e podemos o deixar colhem as  recompensas! <br><br>
Voc&ecirc; s&oacute; pode comprar 500 destes s&oacute;cios un-se  referidos para um pre&ccedil;o de  $
<?=$referal500?>
. Este &eacute; um extremamente baixo pre&ccedil;o para pagar  quando voc&ecirc; se sentar atr&aacute;s e imagina seus lucros. Na realidade, baseado em  m&eacute;dias, 100 indica&ccedil;&otilde;es ativas podem o trazer</p>
<p><font color="#b2cc80">»</font> 500 indica&ccedil;&otilde;es clicam 10 an&uacute;ncios por dia  = $
  <?=$referalclick3["price"] * 10 * 500;?><br>
<font color="#b2cc80">»</font> Seus ganhos mensais  = $
<?=($referalclick3["price"] * 10 * 500) * 30;?><br>
<font color="#b2cc80">»</font> Seus ganhos anuais  = <u><b>$<?=($referalclick3["price"] * 10 * 500) * 30 * 12;?></b></u></p>
<p>embora, n&oacute;s n&atilde;o podemos garantir que voc&ecirc; ganhar&aacute; tal um  lucro.</p>
<p>Tempo processando: 2-5 dias de funcionamento. <br />
Disponibilidade: Limitado. Primeiro venha, primeiro saque.</p>
<p><?=$config["site_name"];?>
   - Pacote de s&oacute;cio  l $
   <?=$referal500?></p>

<?

$sqld = "SELECT * FROM tb_buyref WHERE customer='admin'";
$resultd = mysql_query($sqld);        
$rowd = mysql_fetch_array($resultd);

if($rowd["sets"] < 500)
{
?>
 <p><strong>Pacotes de S&oacute;cios  referidos s&atilde;o atualmente  indispon&iacute;veis. </strong></p>
<?php
} else {
$user=uc($_COOKIE["usNick"]);

$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);

?>
<form method="post" action="buyref.php?refs=500">
<input type="hidden" value="<?= $row["username"] ?>" name="customer">
<input type="hidden" value="<?= $row["pemail"] ?>" name="pemail">
<input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" border="0" name="submit" alt="Pagamentos processados via PagSeguro.">
</form>
<?php
}

?>

<p>Pacotes adicionais:<br>

<a href="user.php?option=upgrade">Upgrade Membro Premium</a><br>
<a href="buyref.php?refs=5">Clique aqui para comprar 5 referidos $<?=$referal5?></a><br>
<a href="buyref.php?refs=35">Clique aqui para comprar 35 referidos $<?=$referal35?></a><br>
<a href="buyref.php?refs=100">Clique aqui para comprar 100 referidos $<?=$referal100?></a><br>
</p>

<?php
}

?>
	<!-- content-wrap ends here -->	
<?
}
}
?>			</td>
			</tr>
			</table>

<?php
}

?>				

<br />
</td>
</tr>
</table>
</td>
<td width="9" background="images/b_10.png"><img src="images/spacer.gif" /></td>
</tr>
</table>
	<!-- content-wrap ends here -->	
<? include "footer.php"; ?>
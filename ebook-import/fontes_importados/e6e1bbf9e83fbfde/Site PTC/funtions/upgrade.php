<?

/**********************************************************************************************************************************************
	ScriptBux Version 2.50 beta
	This Script has been created and coded by Gabrola and edited by hassan ahmady.
	If you find any bugs in the script report at support@thealternatif.info or contact hassan ahmady.
	Copywrite ScriptBux 2008;
	Please make donations if you use this sript for commercial use
	to My paypal account "bisnis-usd@plasa.com"
************************************************************************************************************************************************/
include "prices.php";

?>

<table width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td class="main" style="width: 80%; vertical-align: top;">
					<br />


<?
 if (($r["account"]=="premium") && ($_COOKIE["usNick"]!="admin")) {

 ?>
<h3>Upgrade para Premium</h3>

<h3>Error: Users can't upgrade twice.<br />Or you'll banned from our website if you spamer!</h3>


<? 
} else {
 
if(isset($_POST["user"]))
{

$user=securedata($_POST["user"]);
$pemail=securedata($_POST["pemail"]);
$email=securedata($_POST["email"]);

$laip = getRealIP();

$sqle = "SELECT * FROM tb_upgrade WHERE username='$user'";
$resulte = mysql_query($sqle);        
$rowe = mysql_fetch_array($resulte);

$query = "INSERT INTO tb_upgrade (username, pemail, email, ip) VALUES('$user','$pemail','$email','$laip')";
mysql_query($query) or die(mysql_error());

?>
<h3>Upgrade para Premium</h3>

 <span class="main" style="width: 80%; vertical-align: top;">Seu pedido foi realizado com sucesso! Por&eacute;m, antes de n&oacute;s aprovarmos seu  an&uacute;ncio, voc&ecirc; dever&aacute; efetuar o pagamento de $<span class="main" style="width: 80%; vertical-align: top;">
 <?

echo $config["upgrade"];

?>
 </span>via PagSeguro clicando no bot&atilde;o abaixo. </span><br />


<!-- BOTAO PAGSEGURO -->
        </p>
        <form target="pagseguro" action="https://pagseguro.uol.com.br/security/webpagamentos/webpagto.aspx" method="post">
          <input type="hidden" name="email_cobranca" value="<?= $config["Alertpay"]; ?>" />
          <input type="hidden" name="tipo" value="CBR" />
          <input type="hidden" name="moeda" value="BRL" />
          <input type="hidden" name="item_id" value="5" />
          <input type="hidden" name="item_descr" value="Premium Membership - <?=$config["site_name"]?>" />
          <input type="hidden" name="item_quant" value="1" />
          <input type="hidden" name="item_valor" value="<?= $config["upgrade"] ?>" />
          <input type="hidden" name="frete" value="0" />
          <input type="hidden" name="peso" value="0" />
          <input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" name="submit" alt="Pague com PagSeguro - é rápido, grátis e seguro!" />
  </form>
      <!-- FIM DO BOTAO PAGSEGURO -->	


</font>

<p><font size="2" face="verdana">

  <?

} else {

?>
<h3>Upgrade para Premium</h3>
<p>Fa&ccedil;a Upgrade de sua Conta e ganhe muito mais no
<?=$config["site_name"];?>.</p><p>O Pacote Premium vem com as seguintes caracter&iacute;sticas:</p>
<p>
<font color="#b2cc80">»</font>Mais An&uacute;ncios para voc&ecirc; clicar todo dia!<br>
<font color="#b2cc80">»</font>O tempo para ver os an&uacute;ncios abaixa para
<?=$config['pro_click'];?> segundos.<br />
<font color="#b2cc80">»</font> Ganhe $
<?=$pclick3["price"];?>
 por cada clique e $
 <?=$preferalclick3["price"];?>
por cada clique de seu indicado.<br />
<font color="#b2cc80">»</font> Ganhe 5 Indicados.<br /><font color="#b2cc80">&raquo;</font>Prioridade de Pagamento. </p>
<p><strong>Exemplo de Ganhos</strong><br />
  <font color="#b2cc80">»</font> Voc&ecirc; clica em 20 an&uacute;ncios por dia  = $
  <?=$pclick3["price"] * 20;?>
  <br>
  <font color="#b2cc80">»</font> 25 premium indicados clicam em 20 an&uacute;ncios por dia  = $
  <?=$preferalclick3["price"] * 20 * 25;?>
  <br>
  <font color="#b2cc80">»</font> Seus ganhos Mensais  = $
  <?=($pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 25) * 30;?>
  <br>
  <font color="#b2cc80">»</font> Total ganho em Um Ano  = <b>$
  <?=($pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 25) * 30 * 12;?>
  </b></p>
</font>
<p><font size="2" face="verdana">Tempo de processamento: m&aacute;ximo de 2 dias &uacute;lteis.</font></p>
<font size="2" face="verdana"><p><br>
<?=$config["site_name"];?>
 - Pacote Premium por 1 Ano l $
 <?=$config["upgrade"];?>
</p>
					
<?

$elus=$_COOKIE["usNick"];

$sql = "SELECT * FROM tb_users WHERE username='$elus'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);

$dep1=$row["username"];
$dep2=$row["pemail"];
$dep3=$row["email"];
$dep4=$row["lastiplog"];

?>
  </font></p>
<font size="2" face="verdana">&nbsp;
</font><form method="post" action="user.php?option=upgrade">
  <font size="2" face="verdana"><input type="hidden" name="user" value="<?= $dep1 ?>">
  <input type="hidden" name="pemail" value="<?= $dep2 ?>">
  <input type="hidden" name="email" value="<?= $dep3 ?>">
  <input type="hidden" name="ip" value="<?= $dep4 ?>">
  <input type="image" src="https://pagseguro.uol.com.br/Security/Imagens/btnComprarBR.jpg" border="0" name="submit" alt="Make payments with Alertpay - it's fast, free and secure!">
</font><font size="2"></font>
<p><font size="2" face="verdana">
Pacote Adicional:<br>
<a href="buyref.php?refs=5">Clique aqui para comprar 5 indicados $<?=$referal5?></a><br>
<a href="buyref.php?refs=35">Cli</a><a href="buyref.php?refs=35">que aqui para comprar 35 indicados</a><a href="buyref.php?refs=35"> $
<?=$referal35?>
</a><br>
<a href="buyref.php?refs=100">Cli</a><a href="buyref.php?refs=100">que aqui para comprar 100 indicados</a><a href="buyref.php?refs=100"> $
<?=$referal100?>
</a><br>
<a href="buyref.php?refs=500">que aqui para comprar 500 indicados</a><a href="buyref.php?refs=500"> $<?=$referal500?></a><br>
</font></p>
</form>

	<!-- content-wrap ends here -->	
<?
}
}
?>			</td>
			</tr>
			</table>
<?

?>

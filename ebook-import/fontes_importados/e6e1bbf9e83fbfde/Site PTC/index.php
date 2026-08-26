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

if ($_GET["action"]=="logout") {

if(isset($_COOKIE["usNick"]) && isset($_COOKIE["usPass"]))
{

$HTTP_COOKIE_VARS["usNick"] = "";
setcookie(usNick,"x",time() - 7776000);

$HTTP_COOKIE_VARS["usPass"] = "";
setcookie(usPass,"x",time() - 7776000);

header("Location: index.php");

exit();

}

}

include "config.php";
global $c,$loggedin;
include "data.php";
global $config;
include "funciones.php";
include "prices.php";
?>
<? include "header2.php"; ?>
<html>
<head>
<meta name="description" content="Ganhe dinheiro clicando em anuncios. Você ganha até R$ 0,03 por clique. Cadastre-se agora mesmo! Script Auto Surf e PTC. Chega de dar lucro aos outros, Tenha agora mesmo seu próprio site AutoSurf e PTC, é isso mesmo, você não precisa ficar entrando mais clicar em anuncios para ganhar miseros centavos por dia. Com esse Script Você terá seu site Auto Surf e ainda PTC onde os usuários iram entrar e clicar em anuncios para ganhar dinheiro. E o que você ganha com isso? Muito simples, pessoas irão pagar para você por o anuncio do site delas no seu site. Porque adquirir? Um site como esse pode fazer de você um milhionário, desde que você use as ferramentas certas, e trabalhe com honestidade e disponha de um atendimento rápido e com respostas claras a seus clientes. Por exemplo: você é dono de um site como o nosso autosurf (http://www.carpediem.ilhaweb.net), nele se cadastram no minimo 100 pessoas por dia, dessas 100, 5% pagaram para ser usuário Premium, ou seja, 5 pessoas x R$ 18,90(usuário premium) = R$ 94,00 por dia. Mas é claro que para termos 100 usuários se cadastrando em nosso site por dia teremos que usar varias formas de divulgação. Por isso lhe enviaremos de Brinde o e-book 7 Segredos para um Tráfego Ilimitado. Além dessa forma de ganhar dinheiro, tem varias outras formas como divulgação de sites. Pessoas compram 1000 visitas em seus sites por R$ 10,00, ou 10.000 por R$ 50,00 enfim, as maneiras de ganhar dinheiro com esse script são infinitas. Além de poder revende-lo. É isso mesmo, você receberá o total DIREITO DE REVENDA.Você terá também a area Cadastre e Ganhe, dentro desse modulo terão diversos links para os usuários se cadastrarem e ganharam um prêmio por isso(pode ser em pontos ou dinheiro). Esses links serão links de indicação de sites bux ou de autosurf que você se cadastrará. Pois esses sites pagam por indicação e ainda pagam uma comisão de todo o dinheiro arrecadado pelo seu indicado. Saiba mais... 

COMPRE ESSE SCRIPT DE R$ 69,90 POR APENAS R$39,90 e leve de graça 7 Segredos para um Tráfego Ilimitado + Como criar mini sites arrazadores que vendem como loucos  + Formulário de contato Auto Responder Profissional . APROVEITE ESSA PROMOÇÃO POIS É POR TEMPO LIMITADO. Como Criar Mini Sites Arrasadores que Vendem Como loucos (E- book). Você sabe a fórmula secreta para criar mini sites arrasadores que fazem com que seus visitantes desejem desesperadamente comprar o seu produto? É exatamente isso que você irá aprender com este fantástico manual eletrônico. Um roteiro completo de como criar uma carta de vendas poderosa, super lições para obter 100% de êxito com seu website e muito mais. Você vai receber gratuitamente e com todos os diretos de Revenda e distribuição. 

COMPRE ESSE E-BOOK DE R$ 29,90 POR APENAS R$10,90 e leve de graça o e-book Dominando os Sites de Busca. Formulário de Contato com Autoresponder Profissional. Muito fácil de instalar em seu site. Um formulário com os campos: Nome; E-mail e Mensagem. Após preencher o formulário e enviar uma mensagem, seu visitante pode receber uma resposta automática de boas vindas e agradecimento pelo contato. Você poderá programar a resposta automática que quiser. COMPRE ESSE SCRIPT FORMULÁRIO DE R$ 35,00 POR APENAS R$14,90 e leve de graça o e-book Dominando os Sites de Busca. 7 Segredos para um Tráfego Ilimitado (E-book). Este novíssimo relatório mostrará a você exatamente as mesmas técnicas que os experts em marketing na Internet utilizam para criar fluxo de tráfego auto-multiplicável, que simplesmente farão seus negócios explodirem. Com este ebook você ganha o direito de revender este pacote e utilizar para começar imediatamente o seu negócio na internet, ou simplesmente expandir ainda mais o que já possui, apenas colocando na prática os conceitos apresentados para aumentar cada vez mais o índice de respostas das suas páginas.

COMPRE ESSE E-BOOK DE R$ 29,90 POR APENAS R$14,90 e leve de graça o e-book Dominando os Sites de Busca. Sistema de Afiliados Global Affiliated (script). Esse script php trará lucros e mais lucros a você, pois ele possue um sofisticado sistema de afiliados onde você pode implata-lo em seu site para pessoas se cadastrarem e divulgarem os seus produtos atravéz de um link personalizado ganhando comissões sobre as vendas. Nosso site que você está agora é a prova de que o sistema realmente funciona. 

COMPRE O GLOBAL AFFILIATED DE R$ 59,90 POR APENAS R$29,90 e leve de graça o e-book Dominando os Sites de Busca. Um Curso completo de reabilitação de crédito. Com esse sensacional material você vai aprender como tirar seu nome do SERASA e SPC antes de ter que pagar suas dividas. E o melhor disso tudo é que está dentro da da lei. Após seguir todos os passos descritos no curso dentro de 10 dias seu nome estará limpo e você já poderá voltar a comprar em qualquer lugar sem o medo de ser constrangido por verificarem que seu nome está Sujo. Com o material que estamos lhe oferecendo você poderá limpar o seu nome, o nome de seus amigos, parentes e conhecidos podendo até se tornar um Consultor de Créditos, é isso mesmo, você poderá abrir seu próprio escritório de consultoria de créditos onde as pessoas te procuraram para você limpar o nome delas e você irá cobrar uma porcentagem sobre o valor que elas devem. Essa é uma ótima idéia pra você ganhar dinheiro muito fácil. Depois de adquirir esse material você vai ver que é muito fácil limpar seu nome. Então não perca tempo, adquira agora mesmo! 

COMPRE ESSE CURSO DE R$ 30,90 POR APENAS R$11,90 e leve de graça o e-book Dominando os Sites de Busca. E ainda tem mais, mesmo se você não comprar nenhum de nossos produtos ainda pode se tornar um de nossos afiliados e divulgar nossos produtos e obter 50% de lucro, é isso mesmo, cada pessoa que você indicar a nosso site e ela efetuar uma compra você vai receber metade do dinheiro que ela nos pagar. Como funciona?

Muito simples: Quando você se torna um afiliado você receberá em seu email um login e senha. Com esses dados você irá acessar a area de membros, e la terá tudo que você precisa para divulgar nossos produtos com seu link de indicação assim quando um visitante entrar em nosso website saberemos que foi você que o indicou. Saiba mais... ">
<meta name="keywords" content="Ganhe dinheiro clicando em anuncios. Você ganha até R$ 0,03 por clique. Cadastre-se agora mesmo! Script Auto Surf e PTC. Chega de dar lucro aos outros, Tenha agora mesmo seu próprio site AutoSurf e PTC, é isso mesmo, você não precisa ficar entrando mais clicar em anuncios para ganhar miseros centavos por dia. Com esse Script Você terá seu site Auto Surf e ainda PTC onde os usuários iram entrar e clicar em anuncios para ganhar dinheiro. E o que você ganha com isso? Muito simples, pessoas irão pagar para você por o anuncio do site delas no seu site. Porque adquirir? Um site como esse pode fazer de você um milhionário, desde que você use as ferramentas certas, e trabalhe com honestidade e disponha de um atendimento rápido e com respostas claras a seus clientes. Por exemplo: você é dono de um site como o nosso autosurf (http://www.carpediem.ilhaweb.net), nele se cadastram no minimo 100 pessoas por dia, dessas 100, 5% pagaram para ser usuário Premium, ou seja, 5 pessoas x R$ 18,90(usuário premium) = R$ 94,00 por dia. Mas é claro que para termos 100 usuários se cadastrando em nosso site por dia teremos que usar varias formas de divulgação. Por isso lhe enviaremos de Brinde o e-book 7 Segredos para um Tráfego Ilimitado. Além dessa forma de ganhar dinheiro, tem varias outras formas como divulgação de sites. Pessoas compram 1000 visitas em seus sites por R$ 10,00, ou 10.000 por R$ 50,00 enfim, as maneiras de ganhar dinheiro com esse script são infinitas. Além de poder revende-lo. É isso mesmo, você receberá o total DIREITO DE REVENDA.Você terá também a area Cadastre e Ganhe, dentro desse modulo terão diversos links para os usuários se cadastrarem e ganharam um prêmio por isso(pode ser em pontos ou dinheiro). Esses links serão links de indicação de sites bux ou de autosurf que você se cadastrará. Pois esses sites pagam por indicação e ainda pagam uma comisão de todo o dinheiro arrecadado pelo seu indicado. Saiba mais... 

COMPRE ESSE SCRIPT DE R$ 69,90 POR APENAS R$39,90 e leve de graça 7 Segredos para um Tráfego Ilimitado + Como criar mini sites arrazadores que vendem como loucos  + Formulário de contato Auto Responder Profissional . APROVEITE ESSA PROMOÇÃO POIS É POR TEMPO LIMITADO. Como Criar Mini Sites Arrasadores que Vendem Como loucos (E- book). Você sabe a fórmula secreta para criar mini sites arrasadores que fazem com que seus visitantes desejem desesperadamente comprar o seu produto? É exatamente isso que você irá aprender com este fantástico manual eletrônico. Um roteiro completo de como criar uma carta de vendas poderosa, super lições para obter 100% de êxito com seu website e muito mais. Você vai receber gratuitamente e com todos os diretos de Revenda e distribuição. 

COMPRE ESSE E-BOOK DE R$ 29,90 POR APENAS R$10,90 e leve de graça o e-book Dominando os Sites de Busca. Formulário de Contato com Autoresponder Profissional. Muito fácil de instalar em seu site. Um formulário com os campos: Nome; E-mail e Mensagem. Após preencher o formulário e enviar uma mensagem, seu visitante pode receber uma resposta automática de boas vindas e agradecimento pelo contato. Você poderá programar a resposta automática que quiser. COMPRE ESSE SCRIPT FORMULÁRIO DE R$ 35,00 POR APENAS R$14,90 e leve de graça o e-book Dominando os Sites de Busca. 7 Segredos para um Tráfego Ilimitado (E-book). Este novíssimo relatório mostrará a você exatamente as mesmas técnicas que os experts em marketing na Internet utilizam para criar fluxo de tráfego auto-multiplicável, que simplesmente farão seus negócios explodirem. Com este ebook você ganha o direito de revender este pacote e utilizar para começar imediatamente o seu negócio na internet, ou simplesmente expandir ainda mais o que já possui, apenas colocando na prática os conceitos apresentados para aumentar cada vez mais o índice de respostas das suas páginas.

COMPRE ESSE E-BOOK DE R$ 29,90 POR APENAS R$14,90 e leve de graça o e-book Dominando os Sites de Busca. Sistema de Afiliados Global Affiliated (script). Esse script php trará lucros e mais lucros a você, pois ele possue um sofisticado sistema de afiliados onde você pode implata-lo em seu site para pessoas se cadastrarem e divulgarem os seus produtos atravéz de um link personalizado ganhando comissões sobre as vendas. Nosso site que você está agora é a prova de que o sistema realmente funciona. 

COMPRE O GLOBAL AFFILIATED DE R$ 59,90 POR APENAS R$29,90 e leve de graça o e-book Dominando os Sites de Busca. Um Curso completo de reabilitação de crédito. Com esse sensacional material você vai aprender como tirar seu nome do SERASA e SPC antes de ter que pagar suas dividas. E o melhor disso tudo é que está dentro da da lei. Após seguir todos os passos descritos no curso dentro de 10 dias seu nome estará limpo e você já poderá voltar a comprar em qualquer lugar sem o medo de ser constrangido por verificarem que seu nome está Sujo. Com o material que estamos lhe oferecendo você poderá limpar o seu nome, o nome de seus amigos, parentes e conhecidos podendo até se tornar um Consultor de Créditos, é isso mesmo, você poderá abrir seu próprio escritório de consultoria de créditos onde as pessoas te procuraram para você limpar o nome delas e você irá cobrar uma porcentagem sobre o valor que elas devem. Essa é uma ótima idéia pra você ganhar dinheiro muito fácil. Depois de adquirir esse material você vai ver que é muito fácil limpar seu nome. Então não perca tempo, adquira agora mesmo! 

COMPRE ESSE CURSO DE R$ 30,90 POR APENAS R$11,90 e leve de graça o e-book Dominando os Sites de Busca. E ainda tem mais, mesmo se você não comprar nenhum de nossos produtos ainda pode se tornar um de nossos afiliados e divulgar nossos produtos e obter 50% de lucro, é isso mesmo, cada pessoa que você indicar a nosso site e ela efetuar uma compra você vai receber metade do dinheiro que ela nos pagar. Como funciona?

Muito simples: Quando você se torna um afiliado você receberá em seu email um login e senha. Com esses dados você irá acessar a area de membros, e la terá tudo que você precisa para divulgar nossos produtos com seu link de indicação assim quando um visitante entrar em nosso website saberemos que foi você que o indicou. Saiba mais... ">
<!-- content begin here -->
<style type="text/css">
<!--
.style3 {
	font-size: 12px;
	font-weight: bold;
	font-family: Arial, Helvetica, sans-serif;
}
.style4 {
	color: #FF6600;
	font-weight: bold;
	font-family: Arial, Helvetica, sans-serif;
	font-size: 12px;
}
-->
</style>

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

$option = $_GET["option"];
switch($option) {
case(home):
default:

$sql = "SELECT * FROM tb_config WHERE item='Amount_Payouts' and howmany='1'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);
mysql_close($con);
?>


<table width="100%" cellpadding="0" cellspacing="0">
				<tr>
					<td class="main" style="width: 80%; vertical-align: top;">
					<br />
						<p class="txt_green">
						<?php
			            if($loggedin == 1)
						{ print "Olá <u><a href='user.php?option=profile'>".$r['username']."</a></u>";
						} else {
						  print "Olá <u><a href='register.php'>Visitante</a></u>";
						} ?> Bem vindo ao <?=$config["site_name"]?>!</p>
		              <p>No <?=$config["site_name"]?>
			              , voc&ecirc; &eacute; pago para clicar em an&uacute;ncios e visitar websites.
			              <br />
		                O processo &eacute; muito f&aacute;cil. Voc&ecirc; simplesmente clica em um link e v&ecirc; o website por <strong><?php if ($r["account"]=="premium") { ?> <?=$config['pro_click'];?><?php } else { ?> <?=$config['free_click'];?><? } ?></strong>segundos para ganhar o dinheiro. Voc&ecirc; pode ganhar Indicando amigos. Voc&ecirc; ser&aacute;   pago <b>$<?php if ($r["account"]=="premium") { ?><?=$pclick3["price"];?><?php } else { ?><?=$click3["price"];?><? } ?></b> por cada website visto e <b>$0,01</b> por cada website visto por seus Indicados. O Pagamento &eacute; feito atrav&eacute;s do <a href="https://pagseguro.uol.com.br/?ind=1578788" target="_blank">PagSeguro</a>. O pagamento m&iacute;nimo &eacute; de  <b>$<? echo $row["price"]; ?></b>.</p>
                        <p><strong>Exemplos de ganhos</strong><br>
            <font color="#B2CC80">»</font>Voc&ecirc; clica em
<?php if ($r["account"]=="premium") { ?>20<?php } else { ?>10<? } ?> an&uacute;ncios por dia  = 
			$
<?php if ($r["account"]=="premium") { ?><?=$pclick3["price"] * 20;?><?php } else { ?><?=$click3["price"] * 10;?><? } ?><br>
            <font color="#B2CC80">»</font> 20 indicados seus clicam em 10 an&uacute;ncios por dia  = $
            <?php if ($r["account"]=="premium") { ?><?=$preferalclick3["price"] * 20 * 20;?><?php } else { ?><?=$referalclick3["price"] * 10 * 20;?><? } ?><br>
            <font color="#B2CC80">»</font> Seus ganhos di&aacute;rios  = $
            <?php if ($r["account"]=="premium") { ?><?=$pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 20 * 1;?><?php } else { ?><?=($click3["price"] * 10 + $referalclick3["price"] * 10 * 20) * 1;?><? } ?><br>
            <font color="#B2CC80">»</font> Seus ganhos semanais  = $
            <?php if ($r["account"]=="premium") { ?><?=$pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 20 * 7;?><?php } else { ?><?=($click3["price"] * 10 + $referalclick3["price"] * 10 * 20) * 7;?><? } ?><br>
            <font color="#B2CC80">»</font> Seus ganhos mensais =
			<u><b>$<?php if ($r["account"]=="premium") { ?><?=$pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 20 * 30;?><?php } else { ?><?=($click3["price"] * 10 + $referalclick3["price"] * 10 * 20) * 30;?><? } ?></b></u><br />
			 <font color="#B2CC80">»</font> Total ganho anualmente  =
			<u><b>$<?php if ($r["account"]=="premium") { ?><?=$pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 20 * 30 * 12;?><?php } else { ?><?=($click3["price"] * 10 + $referalclick3["price"] * 10 * 20) * 30 * 12;?><? } ?></b></u></p>
			<p>O exemplo acima &eacute; baseado apenas em 20 indicados e 10 cliques di&aacute;rios. Alguns   dias voc&ecirc; ter&aacute; mais cliques dispon&iacute;veis, outros dias voc&ecirc; ter&aacute; menos. E se voc&ecirc;   tivesse mais indicados? E se tivesse mais an&uacute;ncios dispon&iacute;veis?</p>
			<?php
			if($loggedin == 0)
				{
				?>
			<p>
			<a href="register.php"><img src="images/join_now.gif" alt="Join now and receive $0.05" style="width: 198px; height: 50px; border: 0px;" /></a></p>
			<?php } ?>
			<p>V&aacute;rios membros est&atilde;o satisfeitos e j&aacute; receberam seus pagamentos.<br />
			  <a href="index.php?option=proof">Prova 
			de Pagamentos</a>.
			<span class="style4">PARTICIPEM DA NOSSA COMUNIDADE. <a href="http://www.orkut.com.br/Main#Community.aspx?cmm=56648922">CLIQUE AQUI!</a> </span>
			<p>
			<div id="seph"></div>
			<div style="width:420; height:50; border:1px solid;">
			<A HREF="https://pagseguro.uol.com.br/?ind=1578788" target="_blank"><img src="images/btnPreferenciaCartoesBR.gif" width="418" height="74" border="0" /></A>			</div>
			</td>
			<td width="20%" style="vertical-align: top;">
			
			<!-- Breaking news begin here -->
			<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>
			<td align="center"><img id="breaking_news" src="images/breaking_news.gif" alt="Breaking news" /></td>
			</tr><tr>
			<td height="18" valign="bottom" background="images/rounded1_top.gif" class="border_top">
			</td>
			</tr></table>
			<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>
			<td height="auto" background="images/rounded1_bg.gif" valign="top" class="newsbar_bg">
			<!-- Breking news side here -->
			<div id="newsbar">
			<!-- start Breking news -->
			<? include "news.html"; ?>
			<!-- end Breking news -->
			<br />
			<p align="right"><a href="index.php?option=news"><img src="images/readmore.png" title="ReadMore" border="0" /></a></p></div>
			<!-- Breking news side here -->
			</td>
			</tr></table>
			<table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>
			<td height="18" background="images/rounded1_bottom.gif" valign="top" class="border_bottom">
			</td>
			</tr></table>
			<!-- Breaking news begin here -->
			
			</td>
			</tr>
			</table>
			
			<table>
				<tr>
				<td>
				<?php
	            if ($r["account"]=="premium")
	            { ?>
				<a href="<?=$config["forum"];?>" title="Go to our forum to read success stories" target="_blank">
				<img src="images/members_testimonial.gif" border="0" style="width: 251px; height: 103px;" alt="upgrade your account" /></a>
				<?php	} else {
				 if($loggedin == 1) {
				 	?>
				<a href="user.php?option=upgrade" title="Upgrade your account now">
				<?php } else { ?>
				<a href="register.php" title="Please register">
				<?php } ?><img src="images/upgrade_your_account.gif" border="0 " style="width: 251px; height: 103px;" alt="upgrade your account" /></a>
				<?php } ?>
				</td>
				<td class="main" style="vertical-align: top; width: 480px; height: 103px;">
				<table cellpadding="0" cellspacing="0">
				<tr>
				<td valign="middle" style="background: url('images/rounded2_left.gif') no-repeat; padding-left: 20px; width: 21px height: 103px;"></td>
				<td valign="middle" style="background: url('images/rounded2_bg.gif') repeat-x; width: 480px; height: 103px;">
				<p style="margin: 10px 0px;">
				
				<table>
				<tr>
				<td valign="middle" class="main" style="width: 140px;">Ganhe muito mais comprando referidos ou convertendo sua conta para Premium. Veja valores ao lado. </td>
				<td style="padding-left: 20px; width: 200px;">
				<table width="198" cellpadding="0" cellspacing="0">
				<?php
				if (($r["account"]=="premium") && ($_COOKIE["usNick"]!="admin"))
	            { ?>
				<tr>
				<td width="108" valign="middle" class="main" style="width: 108px;"><strong>You're Premium</strong></td>
				<td width="88" valign="middle" class="main" style="width: 78px">&raquo; <strong>1 Year</strong></td>
				</tr>
				<?php } else { ?>
				<tr>
				<td valign="middle" class="txt_white" style="width: 108px;"><a href="user.php?option=upgrade" class="rollover_green">Upgrade Premium</a></td>
				<td valign="middle" style="width: 78px" class="main">&raquo; $<?= $config["upgrade"]; ?></td>
				</tr>
				<?php } ?>
				<tr>
				<td valign="middle" class="txt_white"><a href="buyref.php?refs=5" class="rollover_green"> 5 Referidos por</a></td>
				<td valign="middle" class="main">&raquo; $<?=$referal5?></td>
				</tr>
				<tr>
				<td valign="middle" class="txt_white"><a href="buyref.php?refs=35" class="rollover_green">35 Referidos por </a></td>
				<td valign="middle" class="main">&raquo; $<?=$referal35?></td>
				</tr>
				<tr>
				<td valign="middle" class="txt_white"><a href="buyref.php?refs=100" class="rollover_green">100 Referidos por</a></td>
				<td valign="middle" class="main">&raquo; $<?=$referal100?></td>
				</tr>
				<tr>
				<td valign="middle" class="txt_white"><a href="buyref.php?refs=500" class="rollover_green">500 Referidos por</a></td>
				<td valign="middle" class="main">&raquo; $<?=$referal500?></td>
				</tr>
				</table>
								
				</td>
				<td valign="middle" style="width: 90px;">
				<img src="images/cc_logo.jpg" alt="alertpay logo, master card logo, visa logo" style="width: 83px; height: 50px;" />
				</td>
				</tr>
				</table>
				</p>
				</td>
				<td valign="middle" style="background: url('images/rounded2_right.gif') no-repeat; width: 21px; height: 103px;"></td>
				</tr>
				</table>
				</td>
				</tr>
			</table>


            <span class="style3"> | 
<? include("total.php"); ?> membros.</span> 
            <?php

break;
case(privacy):

include "funtions/privacy.php";

break;
case(tos):

include "funtions/tos.php";

break;
case(banner):

include "funtions/banner.php";

break;
case(proof):

include "funtions/proof_of_payments.php";

break;
case(advertise):

include "funtions/advertise.php";

break;
case(how):

include "funtions/how.php";

break;
case(faq):

include "funtions/faq.php";

break;
case(surf):

include "funtions/surf.php";

break;
case(news):

include "funtions/news.php";

break;
}
?>


<?php	} ?>				
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
<html>
<head>
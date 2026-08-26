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
					<h3>Como o <?=$config["site_name"];?> Trabalha.</h3>
                      <?=$config["site_name"];?>
                      <strong><U>n&atilde;o</U></strong> &eacute; um Autosurf, Marketing Multin&iacute;vel, Pyramid, Ponzi, Matrix or   &quot;Get Rich Quick&quot; scheme.
                      <p><?=$config["site_name"];?> 
                      &eacute; uma inova&ccedil;&atilde;o, baseada no servi&ccedil;o de anunciantes, onde eles podem aumentar sua   pot&ecirc;ncia de clientes atrav&eacute;s de exibi&ccedil;&otilde;es de an&uacute;ncios em nossa p&aacute;gina de &quot;Ver   An&uacute;ncios&quot;. Um c&aacute;lculo exato de todas as receitas publicit&aacute;rias percentual &eacute; pago   aos nossos membros. 
                      <?=$config["site_name"];?>
                       ganha dinheiro atrav&eacute;s de publicidades e   atrav&eacute;s de patroc&iacute;nio direto de outros membro do 
                       <?=$config["site_name"];?>.</p>
                      <p><strong>Como voc&ecirc; ganha dinheiro</strong>.<br />
                        Voc&ecirc; v&ecirc; os an&uacute;ncios da p&aacute;gina &quot;Ver An&uacute;ncios&quot;. Depois que o tempo termina, voc&ecirc;   ver&aacute; um sinal verde ou um vermelho com um 'X'. O sinal verde significa que voc&ecirc;   ganhou $0.01 ou $0.015(premium member) e o 'X' significa que voc&ecirc; n&atilde;o ganhou   dinheiro pela visita. Voc&ecirc; ver&aacute; o 'X' quando estiver com mais de um an&uacute;ncio do   &quot;Ver An&uacute;ncios&quot; aberto.<br />
                        <br />
                        Um valioso benef&iacute;cios tanto para os membros quanto   para os anunciantes &eacute; a repeti&ccedil;&atilde;o da exposi&ccedil;&atilde;o que do anunciante. Sempre que   voc&ecirc; clicar e ver um site, voc&ecirc; poder&aacute; visita-lo novamente <em><strong>em 24   horas</strong></em>, desde de que n&atilde;o seja alcan&ccedil;ada o n&uacute;mero m&aacute;ximo de visitas   do an&uacute;ncio. &Eacute; isso mesmo! Ap&oacute;s 24 horas voc&ecirc; poder&aacute; clicar e visualizar os sites   novamente. Isto d&aacute; ao anunciante uma exposi&ccedil;&atilde;o a utilizar &quot;repetindo a   publicidade&quot; e aumenta as chances dos membros de ganharem mais dinheiro.<br />
                        <br>
                        <strong>Exemplos de ganhos</strong><br />
                        <font color="#B2CC80">&raquo;</font>Voc&ecirc; clica em
                        <?php if ($r["account"]=="premium") { ?>
                        20
                        <?php } else { ?>
                        10
                        <? } ?>
an&uacute;ncios por dia  = 
			$
<?php if ($r["account"]=="premium") { ?>
<?=$pclick3["price"] * 20;?>
<?php } else { ?>
<?=$click3["price"] * 10;?>
<? } ?>
<br />
<font color="#B2CC80">&raquo;</font> 20 indicados seus clicam em 10 an&uacute;ncios por dia  = $
<?php if ($r["account"]=="premium") { ?>
<?=$preferalclick3["price"] * 20 * 20;?>
<?php } else { ?>
<?=$referalclick3["price"] * 10 * 20;?>
<? } ?>
<br />
<font color="#B2CC80">&raquo;</font> Seus ganhos di&aacute;rios  = $
<?php if ($r["account"]=="premium") { ?>
<?=$pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 20 * 1;?>
<?php } else { ?>
<?=($click3["price"] * 10 + $referalclick3["price"] * 10 * 20) * 1;?>
<? } ?>
<br />
<font color="#B2CC80">&raquo;</font> Seus ganhos semanais  = $
<?php if ($r["account"]=="premium") { ?>
<?=$pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 20 * 7;?>
<?php } else { ?>
<?=($click3["price"] * 10 + $referalclick3["price"] * 10 * 20) * 7;?>
<? } ?>
<br />
<font color="#B2CC80">&raquo;</font> Seus ganhos mensais = <u><b>$
<?php if ($r["account"]=="premium") { ?>
<?=$pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 20 * 30;?>
<?php } else { ?>
<?=($click3["price"] * 10 + $referalclick3["price"] * 10 * 20) * 30;?>
<? } ?>
</b></u><br />
<font color="#B2CC80">&raquo;</font> Total ganho anualmente  = <u><b>$
<?php if ($r["account"]=="premium") { ?>
<?=$pclick3["price"] * 20 + $preferalclick3["price"] * 20 * 20 * 30 * 12;?>
<?php } else { ?>
<?=($click3["price"] * 10 + $referalclick3["price"] * 10 * 20) * 30 * 12;?>
<? } ?>
</b></u><br>
                      </p>
                      <p>Enquanto n&atilde;o temos nenhuma maneira de saber quantos an&uacute;ncios estaram dispon&iacute;veis   em uma base de uma semana, n&oacute;s sabemos que, o 
                        <?=$config["site_name"];?>
                  est&aacute; crescendo   rapidamente e os anunciantes est&atilde;o descobrindo o verdadeiro potencial de nosso   servi&ccedil;o. N&oacute;s apenas come&ccedil;amos, portanto &eacute; preciso ter paci&ecirc;ncia! Ao longo dos   pr&oacute;ximos meses voc&ecirc; ir&aacute; ver um aumento dos an&uacute;ncios que s&oacute; ir&aacute; aumentar seus   ganhos! Isto n&atilde;o &eacute; um get-rich-scheme ou scam, mas ele pode colocar alguns   extras em seu bolso!</p></td>
			</tr>
			</table>

<?php 

?>				

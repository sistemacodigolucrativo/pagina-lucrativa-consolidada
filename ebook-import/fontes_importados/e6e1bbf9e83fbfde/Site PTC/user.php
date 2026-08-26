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
					<td class="main" style="width: 96%; vertical-align: top;">
					<br />
<?
if(!isset($_COOKIE["usNick"]) && !isset($_COOKIE["usPass"]))
{
print "<h3>Area de Membros</h3>
<h4>Escolha uma das opções abaixo.</h4>
<h4><a href='register.php'>Cadastre-se Grátis</a></h4>
<h4><a href='login.php'>Ou caso ja seja um membro faça seu Login.</a></h4>";

} else {

 include('menum.php'); ?>
<br />
<br />
<?php
$option = $_GET["option"];
switch($option) {
case(stats):
default:
?>

<h3>Minhas Estat&iacute;sticas</h3>
<?
$sql = "SELECT * FROM tb_users WHERE username='$user'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);
?>
Para Indicar outras pessoas, use este link: <b><?=$config["site_path"]?>/?r=<? echo $r["username"]; ?></b>
<br>
<iframe id="datamain" src="banners.htm" width="469" height="23%" marginwidth="0" marginheight="0" hspace="0" vspace="3" frameborder="0" scrolling="No"> </iframe>
<br>
Para ver as &uacute;ltimas not&iacute;cias clique <a href="index.php?option=news"><b>Aqui</b></a><br>
<br>
<table cellpadding="0" cellspacing="0" style="border:1px #000000 solid;" width="75%">
<tr>
<th style="padding-top:3px; padding-bottom:3px;" colspan="2">Suas Estat&iacute;sticas</th>
</tr>
<tr>
<td width="75%" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:1px #000 solid;border-bottom:1px #000 solid;">
<b># <strong>de Website Visitados</strong> </b></td>
<td align="center" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:0px #000 solid;border-bottom:1px #000 solid;">
<b><?=$r['visits'];?></b>
</td>
</tr>
</table>

<table cellpadding="0" cellspacing="0" style="border:1px #000000 solid;" width="75%">
<tr>
<th style="padding-top:3px; padding-bottom:3px;" colspan="2">Estat&iacute;sticas de seus Indicados</th>
</tr>
<tr>
<td width="75%" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:1px #000 solid;border-bottom:1px #000 solid;">
<b># de Indicados  (<a href="user.php?option=viewrefs" title="View Your Referrals!"><font color="#B2CC80">Ver</font></a>)</b></td>
<td align="center" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:0px #000 solid;border-bottom:1px #000 solid;">
<b><? $lolez = $_COOKIE["usNick"];
 $referals1 = mysql_query("SELECT COUNT(*) AS cnt FROM tb_users where referer='$lolez'");
  $referals1 = mysql_fetch_array($referals1);
   $referals1 = $referals1["cnt"];
  print $referals1; ?></b>
</td>
</tr>
<tr>
<td width="75%" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:1px #000 solid;border-bottom:1px #000 solid;">
<b># de Website Visitados pelos Indicados</b></td>
<td align="center" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:0px #000 solid;border-bottom:1px #000 solid;">
<b><? echo $r["referalvisits"]; ?></b>
</td>
</tr>
</table>

<table cellpadding="0" cellspacing="0" style="border:1px #000000 solid;" width="75%">
<tr>
<th style="padding-top:3px; padding-bottom:3px;" colspan="2">Estat&iacute;sticas B&ocirc;nus</th>
</tr>
<tr>
<td width="75%" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:1px #000 solid;border-bottom:1px #000 solid;">
<b># de B&ocirc;nus  (<a href="user.php?option=viewbons" title="View Your Bonus!"><font color="#B2CC80">Ver</font></a>)</b></td>
<td align="center" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:0px #000 solid;border-bottom:1px #000 solid;">
<b>0.05</b>
</td>
</tr>
</table>

<table cellpadding="0" cellspacing="0" style="border:1px #000000 solid;" width="75%">
<tr>
<th style="padding-top:3px; padding-bottom:3px;" colspan="2">Informa&ccedil;&atilde;o de Ganhos</th>
</tr>
<tr>
<td width="75%" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:1px #000 solid;border-bottom:1px #000 solid;">
<b><strong>Ganhos com a Conta </strong> (<a href="user.php?option=withdraw" title="Cashout or Convert!"><font color="#B2CC80">Retirar</font></a>)</b></td>
<td align="center" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:0px #000 solid;border-bottom:1px #000 solid;">
<b>$<? echo $r["money"]; ?></b>
</td>
</tr>
<tr>
<td width="75%" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:1px #000 solid;border-bottom:1px #000 solid;"><strong>Total Pago</strong></td>
<td align="center" bgcolor="#eeeeee" style="font-size:12px;padding:1px;border-right:0px #000 solid;border-bottom:1px #000 solid;">
<b>$<? echo $r["paid"]; ?></b>
</td>
</tr>
</table>

<?php

break;
case(upgrade):

include "funtions/upgrade.php";

break;
case(profile):

?>

<h3>Atualizar Meu Perfil</h3>
<?php

// incluimos archivos necesarios

if ($_POST) {
 

if($_POST['code']!=$_SESSION['string']){ 
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error</b> - The captcha was entered incorrectly</h4><br />";
}

// Declaramos las variables
$password = $_POST["password"];
$cpassword = $_POST["cpassword"];
$email = $_POST["email"];
$pemail = $_POST["pemail"];
$country = $_POST["country"];

// comprobamos que no haya campos en blanco

if($password==NULL|$cpassword==NULL|$email==NULL|$pemail==NULL|$country==NULL) {
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error</b> - Please fill in all required fields</h4><br />";
}

$password = uc($password);
$cpassword = uc($cpassword);
$email = securedata($email);
$pemail = securedata($pemail);
$country = securedata($country);

$password=limitatexto($password,15);
$cpassword=limitatexto($cpassword,15);
$email=limitatexto($email,100);
$pemail=limitatexto($pemail,100);
$country=limitatexto($country,15);

minimopass($password);

if($password!=$cpassword) {
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error</b> - The new passwords did not match</h4><br />";
}

ValidaMail($email);
ValidaMail($pemail);
$laip = getRealIP();

if($error == 1)
{
print $errormsg."<br /><br />";

} else {

$trok=uc($_COOKIE["usNick"]);

// Si todo parece correcto procedemos con la inserccion

$queryb = "UPDATE tb_users SET password='$password', ip='$laip', email='$email', pemail='$pemail', country='$country' WHERE username='$trok'";
mysql_query($queryb) or die(mysql_error());

echo "<b>Profile Updated</b><br />
You need to re-login now to confirm your changes.<br />";

?>
<META HTTP-EQUIV="REFRESH" CONTENT="1;URL=logoutp.php">


	</td>
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
<? 
include "footer.php";
exit();

}
}

$uzer=uc($_COOKIE["usNick"]);
$pazz=uc($_COOKIE["usPass"]);

$sql = "SELECT * FROM tb_users WHERE username='$uzer'";
$result = mysql_query($sql);        
$row = mysql_fetch_array($result);

if ($pazz != $row["password"]){ exit(); }

?>
<form action="user.php?option=profile" method="POST">

<font color="#9c1515">*</font>Senha (m&iacute;nimo de 6 caracteres):<br>
<input type="password" size="25" class="form" autocomplete="off" maxlength="15" name="password" value="<? echo $row["password"]; ?>">
<br>
<br>

<font color="#9c1515">*</font>Confirme a Senha:<br>
<input type="password" class="form" autocomplete="off" size="25" maxlength="15" name="cpassword" value="<? echo $row["password"]; ?>">
<br><br>

<font color="#9c1515">*</font> Email:<br>
<input type="text" class="form" autocomplete="off" size="25" maxlength="100" name="email" value="<? echo $row["email"]; ?>">
<br><br>

<font color="#9c1515">*</font>E-mail do Pagseguro para Pagamentos:<br>
<input type="text" class="form" autocomplete="off" size="25" maxlength="100" name="pemail" value="<? echo $row["pemail"]; ?>">
<br><br>

<font color="#9c1515">*</font>Seu Pa&iacute;s:<br>
<select name="country" class="form" autocomplete="off">
<option value="<? echo $row["country"]; ?>"><? echo $row["country"]; ?></option>
<option value="1">United States</option>
<option value="2">Albania</option>
<option value="3">Algeria</option>
<option value="4">Andorra</option>
<option value="5">Angola</option>
<option value="6">Anguilla</option>
<option value="7">Antigua and Barbuda</option>
<option value="8">Argentina</option>
<option value="9">Armenia</option>
<option value="10">Aruba</option>
<option value="11">Australia</option>
<option value="12">Austria</option>
<option value="13">Azerbaijan Republic</option>
<option value="14">Bahamas</option>
<option value="15">Bahrain</option>
<option value="16">Barbados</option>
<option value="17">Belgium</option>
<option value="18">Belize</option>
<option value="19">Benin</option>
<option value="20">Bermuda</option>
<option value="21">Bhutan</option>
<option value="22">Bolivia</option>
<option value="23">Bosnia and Herzegovina</option>
<option value="24">Botswana</option>
<option value="25">Brazil</option>
<option value="26">British Virgin Islands</option>
<option value="27">Brunei</option>
<option value="28">Bulgaria</option>
<option value="29">Burkina Faso</option>
<option value="30">Burundi</option>
<option value="31">Cambodia</option>
<option value="32">Canada</option>
<option value="33">Cape Verde</option>
<option value="34">Cayman Islands</option>
<option value="35">Chad</option>
<option value="36">Chile</option>
<option value="37">China Worldwide</option>
<option value="38">Colombia</option>
<option value="39">Comoros</option>
<option value="40">Cook Islands</option>
<option value="41">Costa Rica</option>
<option value="42">Croatia</option>
<option value="43">Cyprus</option>
<option value="44">Czech Republic</option>
<option value="45">Democratic Republic of the Congo</option>
<option value="46">Denmark</option>
<option value="47">Djibouti</option>
<option value="48">Dominica</option>
<option value="49">Dominican Republic</option>
<option value="50">Ecuador</option>
<option value="51">El Salvador</option>
<option value="52">Eritrea</option>
<option value="53">Estonia</option>
<option value="54">Ethiopia</option>
<option value="55">Falkland Islands</option>
<option value="56">Faroe Islands</option>
<option value="57">Federated States of Micronesia</option>
<option value="58">Fiji</option>
<option value="59">Finland</option>
<option value="60">France</option>
<option value="61">French Guiana</option>
<option value="62">French Polynesia</option>
<option value="63">Gabon Republic</option>
<option value="64">Gambia</option>
<option value="65">Germany</option>
<option value="66">Gibraltar</option>
<option value="67">Greece</option>
<option value="68">Greenland</option>
<option value="69">Grenada</option>
<option value="70">Guadeloupe</option>
<option value="71">Guatemala</option>
<option value="72">Guinea</option>
<option value="73">Guinea Bissau</option>
<option value="74">Guyana</option>
<option value="75">Honduras</option>
<option value="76">Hong Kong</option>
<option value="77">Hungary</option>
<option value="78">Iceland</option>
<option value="79">India</option>
<option value="80">Indonesia</option>
<option value="81">Ireland</option>
<option value="82">Israel</option>
<option value="83">Italy</option>
<option value="84">Jamaica</option>
<option value="85">Japan</option>
<option value="86">Jordan</option>
<option value="87">Kazakhstan</option>
<option value="88">Kenya</option>
<option value="89">Kiribati</option>
<option value="90">Kuwait</option>
<option value="91">Kyrgyzstan</option>
<option value="92">Laos</option>
<option value="93">Latvia</option>
<option value="94">Lesotho</option>
<option value="95">Liechtenstein</option>
<option value="96">Lithuania</option>
<option value="97">Luxembourg</option>
<option value="98">Madagascar</option>
<option value="99">Malawi</option>
<option value="100">Malaysia</option>
<option value="101">Maldives</option>
<option value="102">Mali</option>
<option value="103">Malta</option>
<option value="104">Marshall Islands</option>
<option value="105">Martinique</option>
<option value="106">Mauritania</option>
<option value="107">Mauritius</option>
<option value="108">Mayotte</option>
<option value="109">Mexico</option>
<option value="110">Mongolia</option>
<option value="111">Montserrat</option>
<option value="112">Morocco</option>
<option value="113">Mozambique</option>
<option value="114">Namibia</option>
<option value="115">Nauru</option>
<option value="116">Nepal</option>
<option value="117">Netherlands</option>
<option value="118">Netherlands Antilles</option>
<option value="119">New Caledonia</option>
<option value="120">New Zealand</option>
<option value="121">Nicaragua</option>
<option value="122">Niger</option>
<option value="123">Niue</option>
<option value="124">Norfolk Island</option>
<option value="125">Norway</option>
<option value="126">Oman</option>
<option value="127">Palau</option>
<option value="128">Panama</option>
<option value="129">Papua New Guinea</option>
<option value="130">Peru</option>
<option value="131">Philippines</option>
<option value="132">Pitcairn Islands</option>
<option value="133">Poland</option>
<option value="134">Portugal</option>
<option value="135">Qatar</option>
<option value="136">Republic of the Congo</option>
<option value="137">Reunion</option>
<option value="138">Romania</option>
<option value="139">Russia</option>
<option value="140">Rwanda</option>
<option value="141">Saint Vincent and the Grenadines</option>
<option value="142">Samoa</option>
<option value="143">San Marino</option>
<option value="144">São Tomé and Príncipe</option>
<option value="145">Saudi Arabia</option>
<option value="146">Senegal</option>
<option value="147">Seychelles</option>
<option value="148">Sierra Leone</option>
<option value="149">Singapore</option>
<option value="150">Slovakia</option>
<option value="151">Slovenia</option>
<option value="152">Solomon Islands</option>
<option value="153">Somalia</option>
<option value="154">South Africa</option>
<option value="155">South Korea</option>
<option value="156">Spain</option>
<option value="157">Sri Lanka</option>
<option value="158">St. Helena</option>
<option value="159">St. Kitts and Nevis</option>
<option value="160">St. Lucia</option>
<option value="161">St. Pierre and Miquelon</option>
<option value="162">Suriname</option>
<option value="163">Svalbard and Jan Mayen Islands</option>
<option value="164">Swaziland</option>
<option value="165">Sweden</option>
<option value="166">Switzerland</option>
<option value="167">Taiwan</option>
<option value="168">Tajikistan</option>
<option value="169">Tanzania</option>
<option value="170">Thailand</option>
<option value="171">Togo</option>
<option value="172">Tonga</option>
<option value="173">Trinidad and Tobago</option>
<option value="174">Tunisia</option>
<option value="175">Turkey</option>
<option value="176">Turkmenistan</option>
<option value="177">Turks and Caicos Islands</option>
<option value="178">Tuvalu</option>
<option value="179">Uganda</option>
<option value="180">Ukraine</option>
<option value="181">United Arab Emirates</option>
<option value="182">United Kingdom</option>
<option value="183">Uruguay</option>
<option value="184">Vanuatu</option>
<option value="185">Vatican City State</option>
<option value="186">Venezuela</option>
<option value="187">Vietnam</option>
<option value="188">Wallis and Futuna Islands</option>
<option value="189">Yemen</option>
<option value="190">Zambia</option>
<option value="191">Timor Leste</option>
</select>
<br><br>

<font color="#9c1515">*</font>C&oacute;digo de Seguran&ccedil;a:<br>
<img src="image.php" onclick="this.src='image.php?newtime=' + (new Date()).getTime();"><br /><span style="font-size:10px;">(Click to reload)</span><br />
<input type="text" size="5" class="inputbox" autocomplete="off" maxlength="" name="code">
<br><br>

<input type="submit" value="Editar" class="inputbox">

</form>

<?php

break;
case(history):

?>

<h3>Seu Hist&oacute;rico</h3>
<strong>Aguardando Auditoria:</strong> Depois de pedir seu pagamento, sua conta ser&aacute;   verificada para ter certeza de que voc&ecirc; n&atilde;o esteja violando o   TOS.<br />
<strong>Pagamento Enviado:</strong> Seu pagamento foi enviado atrav&eacute;s do m&eacute;todo de   pagamento escolhido.<br>
<br>

<table align="center" cellpadding="0" cellspacing="0" style="border:1px #000000 solid;" width="98%">
<tr>
<td align="center" bgcolor="#eeeeee" style="padding:2px;border-right:1px #000 solid;border-bottom:1px #000 solid;"><font size="2" face="verdana">
<b>Data</b>
</font></td>
<td align="center" bgcolor="#eeeeee" style="padding:2px;border-right:1px #000 solid;border-bottom:1px #000 solid;"><font size="2" face="verdana">
<b>Valor</b>
</font></td>
<td align="center" bgcolor="#eeeeee" style="padding:2px;border-right:1px #000 solid;border-bottom:1px #000 solid;"><font size="2" face="verdana">
<b>Metodo</b>
</font></td>
<td align="center" bgcolor="#eeeeee" style="padding:2px;border-bottom:1px #000 solid;">
<font size="2" face="verdana">
<b>Status</b>
</font></td>
</tr>

<?

$lole=$_COOKIE["usNick"];

$tabla = mysql_query("SELECT * FROM tb_history where user='$lole' ORDER BY id ASC"); // selecciono todos los registros de la tabla usuarios, ordenado por nombre

while ($row = mysql_fetch_array($tabla)) { // comienza un bucle que leera todos los registros y ejecutara las ordenes que siguen

echo "<tr><td align=\"center\" style=\"border:solid #000 1px;\"><font size=\"2\" face=\"verdana\">";

echo $row["date"];

echo "</font></td><td align=\"center\" style=\"border:solid #000 1px;\"><font size=\"2\" face=\"verdana\">";

echo $row["amount"];

echo "</font></td><td align=\"center\" style=\"border:solid #000 1px;\"><font size=\"2\" face=\"verdana\">";

echo $row["method"];

echo "</font></td><td align=\"center\" style=\"border:solid #000 1px;\"><font size=\"2\" face=\"verdana\">";

echo $row["status"];

echo "</font></td></tr>";

}

echo "</table>";
echo "";
break;
case(viewrefs):

?>
<h3>View My Referrals</h3>
<p>If you've purchased referrals, members Past earnings are hidden and they are not included in your account. Only From the Date of Purchase, the clicks generated by the members will be transferred to your account.</p>
	<table align="center" border="0" cellpadding="0" cellspacing="0" width="99%">
    <tbody><tr> 
     <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background:url(images/th-bg.jpg) repeat-x top; color:#00FFFF;" class="paymentbox" width="30%"><span style="margin-left: 3px;"><strong>Username</strong></span></td>
     <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background:url(images/th-bg.jpg) repeat-x top; color:#00FFFF;" class="paymentbox" width="30%"><span style="margin-left: 3px;"><strong>Joined</strong></span></td>
     <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background:url(images/th-bg.jpg) repeat-x top; color:#00FFFF;" width="15%"><span style="margin-left: 3px;"><strong>Visits</strong></span></td>
     <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background:url(images/th-bg.jpg) repeat-x top; color:#00FFFF;" width="25%"><span style="margin-left: 3px;"><strong>Last Visit</strong></span></td>

       </tr>
		<tr> 
           <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" class="paymentbox" width="30%"><span style="margin-left: 3px;"><strong></strong></span></td>
          <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" class="paymentbox" width="30%"><span style="margin-left: 3px;"><strong></strong></span></td>
           <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" width="15%"><span style="margin-left: 3px;"><strong></strong></span></td>
           <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" width="25%"><span style="margin-left: 3px;"><strong></strong></span></td>
      </tr>


<?

$lole=$_COOKIE["usNick"];

$tabla = mysql_query("SELECT * FROM tb_users where referer='$lole' ORDER BY id DESC");

while ($row = mysql_fetch_array($tabla)) { 

?>

<tr>
<td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" class="paymentbox" width="30%"><span style="margin-left: 3px;"><strong>

<?=$row["username"];?>

</strong></span></td><td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" class="paymentbox" width="30%"><span style="margin-left: 3px;"><strong>

<?=date("d M Y h:i A",$row['joindate']);?>

</strong></span></td><td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" class="paymentbox" width="15%"><span style="margin-left: 3px;"><strong>

<?=$row["visits"];?>

</strong></span></td><td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" class="paymentbox" width="25%"><span style="margin-left: 3px;"><strong>

<?=date("d M Y h:i A",$row["lastlogdate"]);?>

</strong></span></td></tr>

<?php

}

?>
</tbody></table>

<?php

break;
case(viewbons):

 ?>
 
<h3>View My Bonuses</h3>
<p>Details of Your Bonuses. If you've purchased referrals, members Bonus are hidden and they are not included in your account.</p>
<table align="center" border="0" cellpadding="0" cellspacing="0" width="95%">
 <tbody><tr> 
   <td  style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" width="40%"><span style="margin-left: 3px;"><strong>Bonus Name</strong></span></td>
         <td  style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" width="43%"><span style="margin-left: 3px;"><strong>Date</strong></span></td>
          <td style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" width="17%"><span style="margin-left: 3px;"><strong>Amount</strong></span></td>
</tr>
	<tr> 
      <td  style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" width="40%"><span style="margin-left: 3px;"><strong>Sign-up Bonus</strong></span></td>
       <td  style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" width="43%"><span style="margin-left: 3px;"><strong>
	 <?php
print date("d M Y h:i A",$r['joindate']);
?></strong></span></td>
     <td  style="border: 1px solid rgb(153, 153, 153); font-size: 13px; background-color: rgb(235, 235, 235);" width="17%"><span style="margin-left: 3px;"><strong>0.0500</strong></span></td>
    </tr>
	</tbody>
</table>

<?php

break;
case(withdraw):
$sql = "SELECT * FROM tb_config WHERE item='Amount_Payouts' and howmany='1'";
$result = mysql_query($sql);
$row = mysql_fetch_array($result);
mysql_close($con);

 ?>
 
<h3>Request Payment</h3>

<a href="payme.php?convert=ads"><b>Converter Dinheiro em Anuncioss</b></a><br>
Anuncie no <?=$config["site_name"];?>. Você precisa ter no minimo $1.99.
<br>
<br>
<a href="payme.php?convert=cash"><b>Enviar dinheiro para conta PagSeguro</b></a><br>
Receba seu <font color=darkgreen><b>DINHEIRO</b></font> via Pagseguro. Você deve ganhar pelo menos $<? echo $row["price"]; ?>.


<?php
break;
}
	}
?>

<br />
	</td>
		</tr>
		<tr><td style="font-size:11px;"><div style="display:block;"><a class="inputbox" href="javascript: history.go(-1);" title="Back to previous page" style="text-decoration:none;">Back</a></div></td></tr>
</table>


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
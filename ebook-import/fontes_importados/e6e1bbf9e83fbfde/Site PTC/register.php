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
if($_GET['r'] and !$_SESSION['r']) { $_SESSION['r'] = $_GET['r']; }
if(($_SESSION['r'] and !$_GET['r']) or (($_SESSION['r'] and $_GET['r']) and $_GET['r'] != $_SESSION['r'])) { $_GET['r'] = $_SESSION['r']; }
include "config.php";
global $c;
include "data.php";
global $config;

?>

<? include "header2.php"; ?>

<!-- content begin here -->
<style type="text/css">
<!--
.style1 {color: #FFFFFF}
-->
</style>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
<tr>
<td width="3" background="images/b_07.png"><img src="images/spacer.gif" /></td>
<td class="mainbg" align="center" valign="top" bgcolor="#FFFFFF" >
<table align="center" width="90%" border="0" cellspacing="0" cellpadding="0">
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
<h3>Registro</h3>
<br>

<?

if(isset($_COOKIE["usNick"]) && isset($_COOKIE["usPass"]))
{

?>

<center>
  <b><a href="#" onClick="window.location.reload()">Ser&atilde;o aceitos somente uma conta por IP. O usu&aacute;rio que n&atilde;o respeitar os Termos ser&aacute; banido do sistema.</a> <br />
    <br />
    <span class="style1">( this has been logged &amp; will be verified soon by the staff ) </span><br />
    <br />
    <a href="index.php?action=logout">Clique aqui para sair.</a><br />
    <br />
    <br />
    </b>
</center>
	</td>
		</tr>
			</table>
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
?>

<?
require('funciones.php');

if ($_POST) {

//round 1
$username = $_POST["username"];
$password = $_POST["password"];
$cpassword = $_POST["cpassword"];
$email = $_POST["email"];
$cemail = $_POST["cemail"];
$pemail = $_POST["pemail"];
$country = $_POST["country"];

//round 2
$username = uc($username);
$password = uc($password);
$cpassword = uc($cpassword);
$email = securedata($email);
$cemail = securedata($cemail);
$pemail = securedata($pemail);
$country = securedata($country);

//round 3
$laip = getRealIP();
$username=limitatexto($username,15);
$password=limitatexto($password,15);
$cpassword=limitatexto($cpassword,15);
$email=limitatexto($email,100);
$cemail=limitatexto($cemail,100);
$pemail=limitatexto($pemail,100);
$country=limitatexto($country,15);

    $checkip = mysql_query("SELECT ip FROM tb_users WHERE ip='$laip'");
    $ip_exist = mysql_num_rows($checkip);

minimo($username);
minimopass($password);

ValidaMail($email);

ValidaMail($pemail);

$checkuser = mysql_query("SELECT username FROM tb_users WHERE username='$username'");
$username_exist = mysql_num_rows($checkuser);

$checkemail = mysql_query("SELECT email FROM tb_users WHERE email='$email'");
$email_exist = mysql_num_rows($checkemail);

$checkpemail = mysql_query("SELECT pemail FROM tb_users WHERE pemail='$pemail'");
$pemail_exist = mysql_num_rows($checkpemail);

$referer = securedata($_SESSION["r"]);
$referer=limitatexto($referer,15);
$checkref = mysql_query("SELECT username FROM tb_users WHERE username='$referer'");
$referer_exist = mysql_num_rows($checkref);

if(!$username)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- Please supply a username.</h4>";
}

if(!$password)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- Please supply a password.</h4>";
}

if(!$_POST['tos'])
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- You must agree to the TOS to sign up.</h4>";
}

if(strlen($password) < 6)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- Your password must be over 6 characters.</h4>";
}


if(!$cpassword)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- Please supply a confirm password.</h4>";
}

if(!$email)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- Please supply a email.</h4>";
}

if(!$cemail)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- Please supply a confirmation email.</h4>";
}

if(!$pemail)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- Please supply an Alertpay email.</h4>";
}

if(!$country)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- Please supply a country.</h4>";
}


if ($referer_exist<1 and $_POST['referer'] != "") 
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- That referrer does not exist, Please leave it blank if you cannot find a referer.</h4>";
$_SESSION['r'] = false;
$_GET['r'] = false;
}

if ($pemail_exist>0) {
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Erro: </b>- Email PagSeguro já está em uso.</h4>";
}

if($password!=$cpassword) {
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Erro: </b>- Sua senha não é válida.</h4>";
}

if($email!=$cemail) {
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Erro: </b>- Emails inválidos.</h4>";
}

if($_POST['code']!=$_SESSION['string']){ 
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Erro: </b>- Código de Segurança não confere.</h4>";
$_SESSION['string'] = false;
}

if($laip=="127.0.0.1")
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- The IP 127.0.0.1 is disabled to use.</h4>";
}

if ($ip_exist>0)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Error </b>- You already have one account</h4>";
}

if ($email_exist>0)
{
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Erro: </b>- Email ja está em uso.</h4>";
}

if($username_exist>0) {
$error = 1;
$errormsg .= "<h4 style=\"color:red;\"><b>Erro: </b>- Nome de usuário ja está em uso.</h4>";
}


if($error == 1)
{
print $errormsg;
} else {



// If it has introduced a referer see that there

if ($_POST["referer"] != "") {

// Sanitizamos la variable

$referer = securedata($_SESSION["r"]);
$referer=limitatexto($referer,15);

$checkref = mysql_query("SELECT username FROM tb_users WHERE username='$referer'");
$referer_exist = mysql_num_rows($checkref);


if ($referer_exist>0) {
// If everything seems fine proceed with the insertion
      $sqlz = "SELECT * FROM tb_users WHERE username='$referer'";
      $resultz = mysql_query($sqlz);        
      $myrowz = mysql_fetch_array($resultz);

$numero=$myrowz["referals"];

      $sqlex = "UPDATE tb_users SET referals='$numero'+1 WHERE username='$referer'";
      $resultex = mysql_query($sqlex);
}

}


// Si todo parece correcto procedemos con la inserccion

$joindate=time();

$query = "INSERT INTO tb_users (username, password, ip, email, pemail, referer, country, joindate, money,visits) VALUES('$username','$password','$laip','$email','$pemail','$referer','$country','$joindate', '0.05', '0')";
mysql_query($query) or die(mysql_error());

echo "Seu cadastro foi efetuado com sucesso <b>$username</b>. Faça seu login <a href=\"login.php\">Aqui.</a>.";
?>

<br />
	</td>
		</tr>
			</table>


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

?>
<form action="register.php" method="POST">

<div style="padding-left:20px; float:left;">

<font color="9c1515">*</font>Usu&aacute;rio (3 - 15 caracters):<br>
<input type="text" size="25" maxlength="15" name="username" class="form" autocomplete="off" value="<?=$_POST["username"];?>">
<br><br>

<font color="9c1515">*</font>Senha (Minimo de 6 caracters):<br>
<input type="password" size="25" maxlength="15" name="password" class="form" autocomplete="off">
<br><br>

<font color="9c1515">*</font>Confirma Senha:<br>
<input type="password" size="25" maxlength="15" name="cpassword" class="form" autocomplete="off">
<br><br>

<font color="9c1515">*</font>Email:<br>
<input type="text" size="25" maxlength="100" name="email" class="form" autocomplete="off" value="<?=$_POST["email"];?>">
<br><br>

<font color="9c1515">*</font>Confirma Email:<br>
<input type="text" size="25" maxlength="100" name="cemail" class="form" autocomplete="off" value="<?=$_POST["cemail"];?>">
<br><br>

<font color="9c1515">*</font><a href="https://pagseguro.uol.com.br/?ind=1578788" target="_blank"><strong>PagSeguro</strong></a> E-mail para  Pagamentos:<br>
<input type="text" size="25" maxlength="100" name="pemail" class="form" autocomplete="off" value="<?=$_POST["pemail"];?>">
<br><br>
<font color="9c1515">*</font>Seu Pa&iacute;s:<br>
<select name="country" class="form" autocomplete="off">
<option value=""></option>
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

</div>

<div style="padding-left:15px; float:left;">

Indicado por:<br>
<input type="text" size="25" maxlength="15" name="referer" class="form" autocomplete="off" value="<? if($_POST["referer"]) { print $_POST["referer"]; } else { echo securedata($_GET["r"]); } if($_POST['referer'] or $_GET['r']) { print "\" readonly disabled"; } ?>">
<br><br>

Termos do Servi&ccedil;o<br>
<textarea cols="40" rows="9" readonly class="form" autocomplete="off"><?php
$buxtos = file_get_contents("tos.txt");
$buxtos = str_replace("SecureBux", $config["site_name"], $buxtos);
$buxtos = str_replace("PayPal", Alertpay, $buxtos);
print $buxtos;
?></textarea>

<br><br>

<input type='checkbox' name='tos' value='1' class="form" autocomplete="off" <? if($_POST["tos"]) { print "checked"; } ?>>
<strong> Estou de acordo com os Termos.</strong>

<br>
<br>

<font color="9c1515">*</font> C&oacute;digo de Seguran&ccedil;a:<br>
<img src="image.php" onclick="this.src='image.php?newtime=' + (new Date()).getTime();"><br /><span style="font-size:10px;">(Click to reload)</span><br />
<input type="text" size="5" maxlength="" name="code" class="form" autocomplete="off" value="">

<br /><br />

</div>

<p>&nbsp;</p>

<p align="center"><input class="inputbox" type="submit" value="Registrar">
</p>

</form>
			</td>
			</tr>
			</table>

<?php }

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
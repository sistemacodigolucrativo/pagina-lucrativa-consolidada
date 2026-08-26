<?php   
//conecta blablabla 
include("config.php");
$result = mysql_query("SELECT COUNT(*) as Regs FROM tb_users");   
$num = mysql_fetch_array($result);   
echo "Já Somos no total de " . $num['Regs'];   
//  CERTO ::: echo "Já Somos no total de 2" . $num['Regs'];  
?>



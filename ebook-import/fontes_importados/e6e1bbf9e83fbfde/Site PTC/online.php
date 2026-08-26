<? 
  $db_host = "localhost"; // Endereço do servidor mySQL 
  $db_user = "vaniabux_lima"; // Seu Login no mySQL 
  $db_pass = "qvzc.I>,-B9-"; // Sua Senha no mySQL 
  $db_bdad = "vaniabux_online"; // Nome do Banco de Dados 

  mysql_pconnect($db_host, $db_user, $db_pass) or die (mysql_error()); 
  $timestamp=time(); 
  $timeout=time()-300; // valor em segundos 
  $result=mysql_db_query($db_bdad, "INSERT INTO useronline VALUES ('$timestamp','$REMOTE_ADDR','$PHP_SELF')");
  $result=mysql_db_query($db_bdad, "DELETE FROM useronline WHERE timestamp<$timeout"); 
  $result=mysql_db_query($db_bdad, "SELECT DISTINCT ip FROM useronline") or die(mysql_error()); 
  $usuarios=mysql_num_rows($result); 
  mysql_close(); 

  echo"$usuarios"; 

?> 

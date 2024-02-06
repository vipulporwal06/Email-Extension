<?php
error_reporting(E_ERROR | E_PARSE);
include "../database/config.php";

 session_start();
$url = $_SERVER['REQUEST_URI'];
$val = explode("?", $url);
$emailAddress =  $val[1];
$emailid = explode("=",$emailAddress);

  $email = $_POST['email'];
  $isactive = '0';
if( $emailid[1] == ""){
   header("Location:  https://qa.dotvik.com/Dotvik_Flyer/typeEmail.html");
}else{


   $sql = "select email_id from email_unsubscribe_data where email_id = ?";
   //$user = $mysqli->execute_query($sql, [$email]);
 
   if ($stmt1 = $mysqli->prepare($sql)) {
   
       $stmt1->bind_param('s', $email);
   
       $stmt1->execute();
        $stmt1->bind_result($email);
        $user =  $stmt1->fetch();
   
       //echo "$user \n";
   
       $stmt1->close();
       
   }
 
   if($user == ""){
 
    $stmt = $mysqli->prepare("insert into email_unsubscribe_data(email_id, isactive) values (?, ?)");
    $stmt->bind_param('ss', $email, $isactive);
    
    echo "SUCCESS INSERT";
    header("Location:  https://qa.dotvik.com/Dotvik_Flyer/unsubscribe.html");
   }else{
    $stmt = $mysqli->prepare("UPDATE email_unsubscribe_data SET isactive=? WHERE email_id=?");
    $stmt->bind_param('ss', $isactive,$email );
 
   echo "SUCCESS UPDATE";
   header("Location:  https://qa.dotvik.com/Dotvik_Flyer/unsubscribe.html");
    }
    $stmt->execute();
    $mysqli -> close();
}

   

?>

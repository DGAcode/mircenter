<?php
$error="";
if (isset($_POST['Send'])){
	
	if (checkdate ( $_POST["departureDateMonth"] , $_POST["departureDateDay"] ,  $_POST["departureDateYear"] )){
	$DepartureDate=$_POST["departureDateDay"]."/".$_POST["departureDateMonth"]."/". $_POST["departureDateYear"];
} else { 
	$error.="Error in the departure date<br>";
}
if (($_POST["Destination"]=="") || ($_POST["DepartureAirport"]=="") || ($_POST["LastName"]=="") || ($_POST["FirstName"]=="") || ($_POST["MailingAddress"]=="") || ($_POST["City"]=="")|| ($_POST["State"]=="")|| ($_POST["Zip"]=="")|| ($_POST["Country"]=="")){
	$error.="Some Fields are required<br>";
}
$Destination=$_POST["Destination"];
$DepartureAirport=$_POST["DepartureAirport"];
$LastName=$_POST["LastName"];
$FirstName=$_POST["FirstName"];
if (checkdate ( $_POST["BirthMonth"] , $_POST["BirthDay"] ,  $_POST["departureDateYear"] )){
	$Birth=$_POST["BirthDay"]."/".$_POST["BirthMonth"]."/". $_POST["BirthYear"];
} else { 
	$error.="Error in date of birth<br>";
}
if (($_POST["Gender"]=="Male") || ($_POST["Gender"]=="Female")){
	$Gender=$_POST["Gender"];
} else {
		$error.="Select a gender<br>";
}
  
if (($_POST["SingleRoom"]=="Yes") || ($_POST["SingleRoom"]=="No")){
	$SingleRoom=$_POST["SingleRoom"];
} else {
		$error.="Indicate if a single room<br>";
}

$Rooming=$_POST["Rooming"];
$MailingAddress=$_POST["MailingAddress"];
$City=$_POST["City"];
$State=$_POST["State"];
$Zip=$_POST["Zip"];
if (filter_var($_POST["MailAddress"], FILTER_VALIDATE_EMAIL)) {
  $MailAddress=$_POST["MailAddress"];
} else {
  $error.="$email is not a valid email address";
}
$HomePhone=$_POST["HomePhone"];
$MobilePhone=$_POST["MobilePhone"];
$Emergency=$_POST["Emergency"];
$Country=$_POST["Country"];
if (checkdate ( $_POST["ExpirationMonth"] , $_POST["ExpirationDay"] ,  $_POST["ExpirationYear"] )){
	$Expiration= $_POST["ExpirationDay"]."/".$_POST["ExpirationMonth"]."/".$_POST["ExpirationYear"];
} else { 
	$error.="Error in the passport expiration date<br>";
}

$Notes=$_POST["Notes"];

if ($_POST["Agree"]!='1'){
	$error.="You must read and agree to the Terms and Conditions for this pilgrimage<br>";
}

if ($error==""){
	$header = "Mime-Version: 1.0 \r\n";
	$header .= "Content-Type: text/html; charset=iso-8859-1";

	$mensaje = "DEPARTURE DATE: " . $DepartureDate . "<br>DESTINATION: ". $Destination . "<br>DEPARTURE AIRPORT: ".$DepartureAirport;
	$mensaje .= "<br>LAST NAME: " . $LastName . "<br>FIRST &amp; MIDDLE NAMES: ". $FirstName. "<br>DATE OF BIRTH: ". $Birth;
	$mensaje .= "<br>GENDER: " . $Gender . "<br>SINGLE ROOM: ". $SingleRoom. "<br>ROOMING WITH: ". $Rooming;
	$mensaje .= "<br>MAILING ADDRESS: " . $MailingAddress . "<br>CITY: ". $City. "<br>STATE: ". $State;
	$mensaje .= "<br>ZIP: " . $Zip . "<br>E-mail address: ". $MailAddress. "<br>Home Phone: ". $HomePhone;
	$mensaje .= "<br>Mobile Phone: " . $MobilePhone . "<br>Emergency contact (name, phone, email): ". $Emergency;
	$mensaje .= "<br>OTHER INFORMATION: <br>Country that issued your passport: ". $Country. "<br>Passport expiration date: ". $Expiration;
	$mensaje .= "<br>NOTES or SPECIAL REQUESTS: " . $Notes . "<br><br>Did Read and agree to the Terms and Conditions for this pilgrimage";


	$para="croatia@mircenter.com";

	if (mail($para, "formulario" , utf8_decode($mensaje), $header)):
		$ok= "Message sent. We will contact you soon";
	else: 
		$error= "The message was not sent.";
	endif;	
} 
}
?>
<html>
<head>
</head>
<body>
<?php if (strlen($error)>0){ ?>
	<div id="mostrarError"><?php echo $error; ?></div>
<?php }
if (strlen($ok)>0){ ?>
	<div id="mostrarGracias"><?php echo $ok; ?></div>
<?php exit(); } ?>
<p id="titulo">REGISTRATION FORM</p>
<form name="formulario" method="post" action="">
  <p>DEPARTURE DATE: 
    <select name="departureDateDay" id="departureDateDay">
      <option value="-">Day</option>
      <?php for ($i=1; $i<32; $i++){ ?>
		  <option value="<?php echo $i; ?>"><?php echo ($i<10)? '0'.$i: $i; ?></option>
	 <?php } ?>
    </select>
    <select name="departureDateMonth" id="departureDateMonth">
      <option value="-">Month</option>
      <?php for ($i=1; $i<13; $i++){ ?>
		  <option value="<?php echo $i; ?>"><?php echo ($i<10)? '0'.$i: $i; ?></option>
	 <?php } ?>
    </select>
    <select name="departureDateYear" id="departureDateYear">
      <option value="-">Year</option>
      <?php for ($i=date("Y"); $i<date("Y")+2; $i++){ ?>
		  <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
	 <?php } ?>
    </select>
  </p>
  <p>DESTINATION: 
    <input type="text" name="Destination" id="Destination">
  </p>
  <p>DEPARTURE AIRPORT: 
    <input type="text" name="DepartureAirport" id="DepartureAirport" >
  </p>
  <p>LAST NAME (as per passport): 
    <input type="text" name="LastName" id="LastName">
  </p>
  <p>FIRST &amp; MIDDLE NAMES (as per passport):
    <input type="text" name="FirstName" id="FirstName">
  </p>
  <p>DATE OF BIRTH:
        <select name="BirthDay" id="BirthDay">
      <option value="-">Day</option>
      <?php for ($i=1; $i<32; $i++){ ?>
		  <option value="<?php echo $i; ?>"><?php echo ($i<10)? '0'.$i: $i; ?></option>
	 <?php } ?>
    </select>
    <select name="BirthMonth" id="BirthMonth">
      <option value="-">Month</option>
      <?php for ($i=1; $i<13; $i++){ ?>
		  <option value="<?php echo $i; ?>"><?php echo ($i<10)? '0'.$i: $i; ?></option>
	 <?php } ?>
    </select>
        <select name="BirthYear" id="BirthYear">
      <option value="-">Year</option>
      <?php for ($i=date("Y"); $i>date("Y")-100; $i--){ ?>
		  <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
	 <?php } ?>
    </select>

  </p>
  <p>
    <label>GENDER:
      <input type="radio" name="Gender" value="Male" id="Gender_0">
      Male</label>
    
    <label>
      <input type="radio" name="Gender" value="Female" id="Gender_1">
      Female</label>
    (circle one)
  </p>
   <p>
    <label>SINGLE ROOM:
      <input type="radio" name="SingleRoom" value="Yes" id="SingleRoom_0">
      Yes</label>
    
    <label>
      <input type="radio" name="SingleRoom" value="No" id="SingleRoom_1">
      No</label>
    (circle one)
  </p> 
  <p>ROOMING WITH:
    <input name="Rooming" type="text" id="Rooming" >
  </p>  
  <p>MAILING ADDRESS:
    <input name="MailingAddress" type="text" id="MailingAddress" >
  </p> 
  <p>CITY:
    <input name="City" type="text" id="City" >
  </p>   
  <p>STATE:
    <input name="State" type="text" id="State" >
  </p>
  <p>ZIP:
    <input name="Zip" type="text" id="Zip" >
  </p>  

  <p>E-mail address:
    <input name="MailAddress" type="text" id="MailAddress" >
  </p>  
  <p>Home Phone:
    <input name="HomePhone" type="text" id="HomePhone" >
  </p>  
  <p>Mobile Phone:
    <input name="MobilePhone" type="text" id="MobilePhone" >
  </p>  
  <p>Emergency contact (name, phone, email):
    <input name="Emergency" type="text" id="Emergency" >
  </p>  
  <p>OTHER INFORMATION:</p>
  <p>Country that issued your passport:
    <input name="Country" type="text" id="Country" >
  </p>  
  <p>Passport expiration date:
           <select name="ExpirationDay" id="ExpirationDay">
      <option value="-">Day</option>
      <?php for ($i=1; $i<32; $i++){ ?>
		  <option value="<?php echo $i; ?>"><?php echo ($i<10)? '0'.$i: $i; ?></option>
	 <?php } ?>
    </select>
    <select name="ExpirationMonth" id="ExpirationMonth">
      <option value="-">Month</option>
      <?php for ($i=1; $i<13; $i++){ ?>
		  <option value="<?php echo $i; ?>"><?php echo ($i<10)? '0'.$i: $i; ?></option>
	 <?php } ?>
    </select>
        <select name="ExpirationYear" id="ExpirationYear">
      <option value="-">Year</option>
      <?php for ($i=date("Y"); $i<date("Y")+30; $i++){ ?>
		  <option value="<?php echo $i; ?>"><?php echo $i; ?></option>
	 <?php } ?>
    </select>
  </p>  
   <p>NOTES or SPECIAL REQUESTS:
     <textarea name="Notes" id="Notes"></textarea>
  </p>
  <p>
    <label>
      <input type="checkbox" name="Agree" id="Agree" value="1">
      Click here if you have read and agree to the Terms and Conditions for this pilgrimage.
    </label>
  </p>
  <p>Upon receipt of your registration form, a reservation will be made and a confirmation emailed to you, at which point a deposit of $500.00 per person
  will be due. The balance is due 60 days prior to departure. Payments can be made by check or credit card by calling our office at 1-800-220-7729.</p>
  <p>TRAVEL INSURANCE IS RECOMMENDED. PLEASE VISIT travelguard.com FOR MORE INFORMATION.</p> 
  <input type="submit" name="Send" id="Send" value="Send">
</form>
</body>
</html>
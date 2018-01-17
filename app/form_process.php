<?php
$error="";
$ok=true;
if (isset($_POST['submit'])){
	if ((trim($_POST["message"])=="") || (trim($_POST["City"])=="") || (trim($_POST["Phone"])=="") || (trim($_POST["sender"])=="") || (trim($_POST["name"])=="")){
		$error.="All fields are required<br>";
		$ok=false;
	}
	if (filter_var($_POST["sender"], FILTER_VALIDATE_EMAIL)) {
  		$sender=$_POST["sender"];
	} else {
  		$error.="Your email isn't a valid email address<br><br>";
		$ok=false;
	}
	if ($ok) {
		$header = 'From: ' . $_POST['sender'] . " \r\n";
		$header .= "Mime-Version: 1.0 \r\n";
		$header .= "Content-Type: text/html; charset=iso-8859-1";

		$mensaje = "Name and last name: " . $_POST['name'] ;
		$mensaje .= "<br>Email: " . $_POST['sender'] ;
		$mensaje .= "<br>Phone: " . $_POST['Phone'];
		$mensaje .= "<br>City of residence: " . $_POST['City'];
		$mensaje .= "<br>Message: " . $_POST['message'];


		$para="croatia@mircenter.com";

		if (mail($para, "Contact Form" , utf8_decode($mensaje), $header)):
			$message= "Message sent, we will contact you soon<br><br>";
		else: 
			$error= "The message was not sent.<br><br>";
			$ok=false;
		endif;	
	}
	
}
?>
<!doctype html>
<html class="no-js" lang="en">

<head>
  <meta charset="utf-8">
  <meta name="Croatian Mir Center" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Croatian Mir Center</title>

  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <!-- Place favicon.ico in the root directory -->

  <!-- build:css styles/vendor.css -->
  <!-- bower:css -->
  <!-- endbower -->
  <!-- endbuild -->

  <!-- build:css styles/main.css -->
  <link rel="stylesheet" href="styles/reset.css">
  <link rel="stylesheet" href="styles/nav.css">
  <link rel="stylesheet" href="styles/main-slider.css">
  <link rel="stylesheet" href="styles/main.css">
  <!-- endbuild -->

  <!-- build:js scripts/vendor/modernizr.js -->
  <script src="/bower_components/modernizr/modernizr.js"></script>
  <!-- endbuild -->
</head>

<body>
  <!--[if IE]>
      <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.</p>
    <![endif]-->
  <div class="wrapper">
    <section class="navigation">
      <div class="nav-container">
        <div class="brand">
          <a href="index.html">
            <img class="logo-mir" src="images/cmc-logo.png">
          </a>
        </div>
        <nav>
          <div class="nav-mobile">
            <a id="nav-toggle" href="#!">
              <span></span>
            </a>
          </div>
          <ul class="nav-list">
            <li>
              <a href="index.html">Home</a>
            </li>
            <li>
              <a href="about.html">About Us</a>
            </li>
            <li>
              <a href="pilgrimages.html">Scheduled Pilgrimages</a>
            </li>
            <li>
              <a href="itineraries.html">Sample Itineraries</a>
            </li>
            <li>
              <a href="contact.html">Contact Us</a>
            </li>
            <li>
              <a href="ayuda.html">Ayuda en espaÑol</a>
            </li>
          </ul>
        </nav>
      </div>
    </section>


    <div class=" title-style">
      <h3 class="title">Contact us</h3>
      <h2 class="subtitle text-centering">We love to hear from you</h2>
    </div>
    <section>
      <div class="row">

        <div class="text">
         <?php echo ($ok)? $message : $error . " Try again. <a href='javascript: window.history.back();'>Clik here</a><br><br>" ; ?>
         </div>
     </div>
    </section>

    <div class="push"></div>		  
  </div>
  <footer class="footer">© Copyright 2018 Croatian Mir</footer>
  <!-- build:js scripts/vendor.js -->
  <!-- bower:js -->
  <script src="/bower_components/jquery/dist/jquery.js"></script>
  <script src="/bower_components/modernizr/modernizr.js"></script>
  <!-- endbower -->
  <!-- endbuild -->

  <!-- build:js scripts/main.js -->
  <script src="scripts/main.js"></script>
  <!-- endbuild -->
</body>

</html>
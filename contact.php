<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name    = htmlspecialchars(trim($_POST['name']));
    $email   = htmlspecialchars(trim($_POST['email']));
    $message = htmlspecialchars(trim($_POST['message']));

    $to      = "danalee.seattle@gmail.com";
    $subject = "New message from hellodanalee.com";
    $body    = "Name: $name\nEmail: $email\n\nMessage:\n$message";
    $headers = "From: noreply@hellodanalee.com\r\nReply-To: $email";

    if (mail($to, $subject, $body, $headers)) {
        header("Location: contact.html?status=success");
    } else {
        header("Location: contact.html?status=error");
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
</head>
<body>
    <h2>Can you login with admin ID ????😄😄😄😄</h2>
    <form method="post" action="">
        <label for="id">ID:</label><br>
        <input type="text" id="id" name="id" required><br><br>
        
        <label for="password">Password:</label><br>
        <input type="password" id="password" name="password" required><br><br>
        
        <input type="submit" value="Login">
    </form>
</body>
</html>

<?php
$flag = file_get_contents("/flag.txt");
$seed = file_get_contents("/seed.txt");

mt_srand($seed);
$randomValue = mt_rand();
$adminPassword = hash('sha256', $randomValue);

$users = [
    "admin" => $adminPassword,
    "guest" => "guest",
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $password = $_POST['password'];

    if (isset($users[$id]) && $password === $users[$id]) {
        if ($id === "admin") {
            echo "Great! $flag";
        }
        else{
            echo "Hello, Guest!";
        }
    } 
    else{
        echo "Invalid ID or Password!";
    }
}

?>
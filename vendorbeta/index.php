<!DOCTYPE html>
<html>
<head>

    <!-- CSS (load bootstrap) -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <style>
        .navbar { border-radius:0; }
    </style>

    <!-- JS (load angular, ui-router, and our custom js file) -->
    <script src="http://code.angularjs.org/1.2.13/angular.js"></script>
    <script src="vendorbeta/js/angular-ui-router.min.js"></script>
    <script src="vendorbeta/js/ng-file-upload.min.js"></script>
    <script src="vendorbeta/js/app/app.js"></script>
</head>

<!-- apply our angular app to our site -->
<body ng-app="routerApp">

<!-- NAVIGATION -->
<nav class="navbar navbar-inverse" role="navigation">
    <!-- <div class="navbar-header">
        <a class="navbar-brand" ui-sref="#">AngularUI Router</a>
    </div> -->
    <ul class="nav navbar-nav">
        <li><a ui-sref="home">Import CSV</a></li>
        <li><a ui-sref="FieldMap">Map Field</a></li>
        <li><a ui-sref="Detail">Product Details</a></li>
    </ul>
</nav>

<!-- MAIN CONTENT -->
<div class="container">

    <!-- THIS IS WHERE WE WILL INJECT OUR CONTENT ============================== -->
    <div ui-view></div>

</div>

</body>
</html>

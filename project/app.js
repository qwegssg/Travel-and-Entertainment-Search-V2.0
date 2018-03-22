// define an angular module named myApp
var myApp = angular.module("myApp", []);
// create a controller for the module named mainController
myApp.controller("mainController", ["$scope", "$timeout", function($scope, $timeout) {
    $scope.name = "girlfriend";
    $timeout(function() {
        $scope.name = "my wife";
    }, 3000);
    $scope.answer1 = '';
    // $scope.lowercasehandle = 
}]);
// define an angular module named myApp
var myApp = angular.module("myApp", []);
// create a controller for the module
myApp.controller("formController", ["$scope", function($scope) {
    $scope.keyword = "";
}]);
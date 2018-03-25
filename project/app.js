// define an angular module named myApp
var myApp = angular.module("myApp", []);
// create a controller for the module
myApp.controller("formController", ["$scope", "$http", function($scope, $http) {
    $scope.keyword = undefined;
    $scope.otherLocation = "";
    $scope.isDisabled = true;

    $http.get("http://ip-api.com/json")
        .then(function(result) {
            $scope.lat = result.data.lat;
            $scope.lon = result.data.lon;
        });

    $scope.enableHere = function() {
        $scope.isDisabled = true;
    };

    $scope.enableOther = function() {
        $scope.isDisabled = false;
    };

    // reset the form, need to be implemented
    // $scope.clear = function() {
    //     $scope.searchForm.$setUntouched();
    //     $scope.searchForm.$setPristine();
    // }
}]);
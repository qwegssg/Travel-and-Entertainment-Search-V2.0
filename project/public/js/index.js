// define an angular module named myApp
var myApp = angular.module("myApp", []);
// create a controller for the module
myApp.controller("appController", ["$scope", "$http", function($scope, $http) {
    $scope.keyword = undefined;
    $scope.otherLocation = undefined;
    $scope.showTable = false;
    $scope.warnAlert = false;
    $scope.previousButton = false;
    $scope.nextButton = false;
    $scope.isDisabled = true;
    // the search button is disabled before the user location is fetched
    $scope.isNotFetched = true;
    $scope.categories = [
        {name: "Default", value: "default"},
        {name: "Airport", value: "airport"},
        {name: "Amusement Park", value: "amusement_park"},
        {name: "Aquarium", value: "aquarium"},
        {name: "Art Gallery", value: "art_gallery"},
        {name: "Bakery", value: "bakery"},
        {name: "Bar", value: "bar"},
        {name: "Beauty Salon", value: "beauty_salon"},
        {name: "Bowling Alley", value: "bowling_alley"},
        {name: "Bus Station", value: "bus_station"},
        {name: "Cafe", value: "cafe"},
        {name: "Campground", value: "campground"},
        {name: "Car Rental", value: "car_rental"},
        {name: "Casino", value: "casino"},
        {name: "Movie Theater", value: "movie_theater"},
        {name: "Museum", value: "museum"},
        {name: "Night Club", value: "night_club"},
        {name: "Night Club", value: "night_club"},
        {name: "Park", value: "park"},
        {name: "Parking", value: "parking"},
        {name: "Restaurant", value: "restaurant"},
        {name: "Shopping Mall", value: "shopping_mall"},
        {name: "Stadium", value: "stadium"},
        {name: "Subway Station", value: "subway_station"},
        {name: "Taxi Stand", value: "taxi_stand"},
        {name: "Train Station", value: "train_station"},
        {name: "Transit Station", value: "transit_station"},
        {name: "Travel Agency", value: "travel_agency"},
        {name: "Zoo", value: "zoo"}
    ];
    // set the default category value
    $scope.selectedType = $scope.categories[0];

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



    // call the ip-api at the client side????
    $http.get("http://ip-api.com/json")
        .then(function(result) {
            $scope.location = result.data.lat + "," + result.data.lon;
            $scope.isNotFetched = false;
    });
    


    var next_page_token = "";
    // store the result list on the page
    var firstPagePlace = "";
    var secondPagePlace = "";
    var thirdPagePlace = "";

    $scope.submitForm = function() {
        next_page_token = "";
        firstPagePlace = "";
        secondPagePlace = "";
        thirdPagePlace = "";
        // show the progress bar and hide the others
        $scope.progressing = true;
        $scope.warnAlert = false;
        $scope.showTable = false;
        $scope.previousButton = false;
        $scope.nextButton = false;

        if($scope.distance == undefined) {
           $scope.distance = 10; 
        }
        var url = "/search?keyword=" + $scope.keyword + "&category=" + $scope.selectedType.value 
                    + "&distance=" + $scope.distance + "&geoLocation=" + $scope.location
                    + "&otherLocation=" + encodeURI($scope.otherLocation);
        // console.log(url);
        $http.get(url)
        .then(function(result) {
            var result = result.data;
            if(result.status == "ZERO_RESULTS") {
                $scope.progressing = false;
                $scope.warnAlert = true;
            // geoLocation is fetched
            } else if(result.lat != undefined && result.lng != undefined) {
                var geoLocation = result.lat + "," + result.lng;

                // ??
                var otherLocation = undefined;


                url = "/search?keyword=" + $scope.keyword + "&category=" + $scope.selectedType.value 
                    + "&distance=" + $scope.distance + "&geoLocation=" + geoLocation
                    + "&otherLocation=" + otherLocation;
                $http.get(url)
                .then(function(result) {
                    $scope.progressing = false;
                    $scope.showTable = true;
                    result = result.data;
                    // console.log(result);
                    $scope.places = result.results;
                    firstPagePlace = $scope.places;
                    next_page_token = result.next_page_token;
                    nextPageCheck(next_page_token);                
                });
            } 
            else {
                $scope.progressing = false;
                $scope.showTable = true;
                $scope.places = result.results;
                firstPagePlace = $scope.places;
                next_page_token = result.next_page_token;
                nextPageCheck(next_page_token);
            }
        });
    };

    function nextPageCheck(next_page_token) {
        if(next_page_token != undefined) {
            $scope.nextButton = true;
        }
        if($scope.places == thirdPagePlace) {
            $scope.previousButton = true;
        } 
        else if($scope.places == secondPagePlace) {
            $scope.previousButton = true;
            if(next_page_token != undefined || thirdPagePlace != "") {
                $scope.nextButton = true;
            }
        }
        else if($scope.places == firstPagePlace) {
            $scope.previousButton = false;
            if(next_page_token != undefined || secondPagePlace != "") {
                $scope.nextButton = true;                
            }

        }
    }

    $scope.showNextPage = function() {
        // if second page's result has not been fetched
        if(secondPagePlace == "") {
            var nextPageUrl = "/next?next_page_token=" + next_page_token;
            $http.get(nextPageUrl)
            .then(function(result) {
                $scope.nextButton = false;
                result = result.data;
                $scope.places = result.results;
                secondPagePlace = $scope.places;
                next_page_token = result.next_page_token;
                nextPageCheck(next_page_token);
            });
        }
        else if($scope.places == firstPagePlace) {
            $scope.nextButton = false;
            $scope.places = secondPagePlace;
            nextPageCheck(next_page_token);
        } 
        // if third page's result has not been fetched
        else if (thirdPagePlace == "") {
            var nextPageUrl = "/next?next_page_token=" + next_page_token;
            $http.get(nextPageUrl)
            .then(function(result) {
                $scope.nextButton = false;
                result = result.data;
                $scope.places = result.results;
                thirdPagePlace = $scope.places;
                next_page_token = result.next_page_token;
                nextPageCheck(next_page_token);
            });
        }
        else if($scope.places == secondPagePlace) {
            $scope.nextButton = false;
            $scope.places = thirdPagePlace;
            nextPageCheck(next_page_token);
        }    
    };

    $scope.showPreviousPage = function() {
        $scope.previousButton = false;
        if($scope.places == thirdPagePlace) {
            $scope.places = secondPagePlace;
            nextPageCheck(next_page_token);
        } 
        else if($scope.places == secondPagePlace) {
            $scope.places = firstPagePlace;
            nextPageCheck(next_page_token);
        }

    };



}]);





myApp.directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: ["address"]
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
            // When choose an autocomplete location, replace the field value with the location
            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    model.$setViewValue(element.val());                
                });
            });
        }
    };
});

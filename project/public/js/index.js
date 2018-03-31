// define an angular module named myApp
var myApp = angular.module("myApp", []);
// create a controller for the module
myApp.controller("appController", ["$scope", "$http", "$showMap", function($scope, $http, $showMap) {
    $scope.keyword = undefined;
    $scope.otherLocation = undefined;
    $scope.isDisabled = true;
    $scope.checkHere = true;
    $scope.checkOther = false;
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
        $scope.checkOther = false;
        $scope.checkHere = true;
        $scope.isDisabled = true;
    };

    $scope.enableOther = function() {
        $scope.checkOther = true;
        $scope.checkHere = false;
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
        var otherLocation = $scope.otherLocation;
        if($scope.checkOther == false) {
            otherLocation = undefined;
        }
        var url = "/search?keyword=" + $scope.keyword + "&category=" + $scope.selectedType.value 
                    + "&distance=" + $scope.distance + "&geoLocation=" + $scope.location
                    + "&otherLocation=" + encodeURI(otherLocation);
        console.log(url);
        $http.get(url)
        .then(function(result) {
            var result = result.data;
            if(result.status == "ZERO_RESULTS") {
                $scope.progressing = false;
                $scope.warnAlert = true;
            // geoLocation is fetched, use the geoLocation to conduct nearby search
            } else if(result.lat != undefined && result.lng != undefined) {
                var geoLocation = result.lat + "," + result.lng;
                var otherLocation = undefined;
                url = "/search?keyword=" + $scope.keyword + "&category=" + $scope.selectedType.value 
                    + "&distance=" + $scope.distance + "&geoLocation=" + geoLocation
                    + "&otherLocation=" + otherLocation;
                $http.get(url)
                .then(function(result) {
                    $scope.progressing = false;
                    $scope.showTable = true;
                    result = result.data;
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
                // console.log($scope.places);
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

    $scope.showDetail = function(place_id, location) {
        // console.log(location);
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: location.lat, lng: location.lng},
            zoom: 15
        });
        var marker = new google.maps.Marker({
            map: map,
            position: {lat: location.lat, lng: location.lng}
        });
        $showMap.fetchDetail(place_id, map)
            .then(
                function(res) {
                    console.log(res);
                    $scope.detailName = res.name;
                    $scope.address = res.formatted_address;
                    $scope.phoneNumber = res.international_phone_number;
                    $scope.priceLevel = "";
                    for(var i = 0; i < res.price_level; i++) {
                        $scope.priceLevel += "$";
                    }
                    $scope.rating = res.rating;
                    $scope.starWidth = Math.round($scope.rating / 5.0 * 100) + "%";
                    console.log($scope.starWidth);
                    $scope.googlePage = res.url;
                    $scope.website = res.website;

                    $scope.hours = "need to be implemented!";
                    $scope.selectInfo = true;
                    $scope.mapToLocation = res.name + ", " + res.formatted_address;
                });
    };

    $scope.showInfo = function() {
        $scope.selectInfo = true;
        $scope.selectPhotos = false;
        $scope.selectMap = false;
        $scope.selectReviews = false;
    }

    $scope.showPhotos = function() {
        $scope.selectPhotos = true;
        $scope.selectInfo = false;
        $scope.selectMap = false;
        $scope.selectReviews = false;
    };

    $scope.showMap = function() {
        $scope.selectMap = true;
        $scope.selectPhotos = false;
        $scope.selectInfo = false;
        $scope.selectReviews = false;
    };

    $scope.showReviews = function() {
        $scope.selectReviews = true;
        $scope.selectMap = false;
        $scope.selectPhotos = false;
        $scope.selectInfo = false;
    };

}]);

myApp.service("$showMap", function($q) {

    // this.initMap = function(lat, lng) {
    //     this.map = new google.maps.Map(document.getElementById('map'), {
    //         center: {lat: lat, lng: lng},
    //         zoom: 15
    //     });      
    // }

    this.fetchDetail = function(place_id, map) {
        var defer = $q.defer();
        var service = new google.maps.places.PlacesService(map);
        var request = {
            placeId: place_id
        };  
        service.getDetails(request, function(placeDetail, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                defer.resolve(placeDetail);
            } else {
                defer.reject(status);
            }
        });   
        return defer.promise;       
    }
});

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

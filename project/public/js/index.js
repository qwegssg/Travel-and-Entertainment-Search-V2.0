// define an angular module named myApp
var myApp = angular.module("myApp", ["ngAnimate"]);
// create a controller for the module
myApp.controller("appController", ["$scope", "$http", "$showMap", "$showDirection", 
                                    function($scope, $http, $showMap, $showDirection) {
    $scope.keyword = undefined;
    $scope.otherLocation = undefined;
    $scope.isDisabled = true;
    $scope.checkHere = true;
    $scope.checkOther = false;
    $scope.requireKeyword = true;
    $scope.isNotTriggered = true;
    // for animation
    $scope.switchDetails = false;
    // geoLocation without space
    var geoLat = 0.0;
    var geolon = 0.0;
    var otherGeoLat = 0.0;
    var otherGeoLng = 0.0;

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
            geoLat = result.data.lat;
            geoLon = result.data.lon;
            $scope.isNotFetched = false;
    });
    


    var next_page_token = "";
    // store the result list on the page
    var firstPagePlace = "";
    var secondPagePlace = "";
    var thirdPagePlace = "";

    var warnAlertPhotos = false;
    var warnAlertReviews = false;
    var warnAlertReviewsGoogle = false;
    var warnAlertReviewsYelp = false;

    var mapToGeoLoc = "";

    function resetValue() {
        // reset place table: show the progress bar and hide the others
        $scope.progressing = true;
        $scope.warnAlert = false;
        $scope.warnAlertPhotos = false;
        warnAlertPhotos = false;

        $scope.warnAlertReviews = false;
        warnAlertReviews = false;
        $scope.warnAlertReviewsGoogle = false;
        warnAlertReviewsGoogle = false;
        $scope.warnAlertReviewsYelp = false;
        warnAlertReviewsYelp = false;

        $scope.showTable = false;
        $scope.previousButton = false;
        $scope.nextButton = false;
        next_page_token = "";
        firstPagePlace = "";
        secondPagePlace = "";
        thirdPagePlace = "";
        // reset detail button
        $scope.isNotTriggered = true;
        // for animation
        $scope.switchDetails = false;
        // reset tabs
        $scope.selectInfo = false;
        $scope.selectPhotos = false;
        $scope.selectMap = false;
        $scope.selectReviews = false;
        $scope.isWarnAlertMap = false;
        mapToGeoLoc = "";
    }

    $scope.submitForm = function() {

        resetValue();
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
        // console.log(url);
        $http.get(url)
        .then(function(result) {
            var result = result.data;
            if(result.status == "ZERO_RESULTS") {
                $scope.progressing = false;
                $scope.warnAlert = true;
            // geoLocation is fetched, use the geoLocation to conduct nearby search
            } else if(result.lat != undefined && result.lng != undefined) {
                var geoLocation = result.lat + "," + result.lng;
                otherGeoLat = result.lat;
                otherGeoLng = result.lng;
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

    var directionsDisplay = new google.maps.DirectionsRenderer;
    var marker = "";

    $scope.showDetail = function(place_id, location) {
        // console.log(location);

        // reset the details table
        $scope.showGoogleReview = false;
        $scope.showYelpReview = false;

        // for animation
        $scope.showTable = false;
        $scope.switchDetails = true;
        // enable detail button
        $scope.isNotTriggered = false;
        // set map
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: location.lat, lng: location.lng},
            zoom: 15
        });
        // set marker
        marker = new google.maps.Marker({
            map: map,
            position: {lat: location.lat, lng: location.lng}
        });
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById('directionsPanel'));
        $scope.isHideDirPanel = true;
        // set travel modes
        $scope.travelModes = [
            {name: "Driving", mode: "DRIVING"},
            {name: "Bicycling", mode: "BICYCLING"},
            {name: "Transit", mode: "TRANSIT"},
            {name: "Walking", mode: "WALKING"}
        ];
        $scope.selectedModes = $scope.travelModes[0];
        // set street view
        var mapForStreetView = new google.maps.Map(document.getElementById('mapForStreetView'), {
            center: {lat: location.lat, lng: location.lng},
            zoom: 15
        });
        var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), {
              position: {lat: location.lat, lng: location.lng},
              pov: {
                heading: 34,
                pitch: 10
              }
        });
        mapForStreetView.setStreetView(panorama);
        $scope.streetViewIcon = "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png";

        $showMap.fetchDetail(place_id, map)
            .then(
                function(res) {
                    console.log(res);
                    // fetch data for the info tab
                    $scope.selectInfo = true;
                    $scope.detailName = res.name;
                    $scope.address = res.formatted_address;
                    $scope.phoneNumber = res.international_phone_number;
                    $scope.priceLevel = "";
                    for(var i = 0; i < res.price_level; i++) {
                        $scope.priceLevel += "$";
                    }
                    $scope.rating = res.rating;
                    $scope.starWidth = Math.round($scope.rating / 5.0 * 100) + "%";
                    // console.log($scope.starWidth);
                    $scope.googlePage = res.url;
                    $scope.website = res.website;

                    $scope.hours = "need to be implemented!";
                    // fetch data for the photos tab
                    $scope.photoUrl = [];
                    // if there is no photo
                    if(res.photos == undefined) {
                        warnAlertPhotos = true;
                    } else {
                        for(var j = 0; j < res.photos.length; j++) {
                            $scope.photoUrl[j] = res.photos[j].getUrl({'maxWidth': 250, 'maxHeight': 250});
                        }                         
                    }
                    $scope.mapToLocation = res.name + ", " + res.formatted_address;
                    mapToGeoLoc = res.geometry.location;
                    // Fetch data for the reviews tab
                    var reviews = "";
                    $scope.reviews = "";
                    reviews = res.reviews;
                    // console.log(reviews);
                    if(reviews == undefined) {
                        warnAlertReviews = true;
                        warnAlertReviewsGoogle = true;
                    } else {
                        for(var k = 0; k < reviews.length; k++) {
                            var ratingStar = "";
                            for(var l = 0; l < reviews[k].rating; l++) {
                                ratingStar += "★";
                            }
                            // add rating star notation into reviews object
                            reviews[k]["ratingStar"] = ratingStar;
                        }
                        // add time
                        for(var m = 0; m < reviews.length; m++) {
                            var date = new Date(reviews[m].time * 1000);
                            var hour = "0" + date.getHours();
                            var minute = "0" + date.getMinutes();
                            var second = "0" + date.getSeconds();
                            var year = date.getFullYear();
                            // Returns the month (from 0-11)
                            var month = date.getMonth() + 1;
                            month = "0" + month;
                            var date = "0" + date.getDate();
                            var formattedDate = year + "-" + month.substr(-2) + "-" + date.substr(-2);
                            var formattedTime = hour.substr(-2) + ":" + minute.substr(-2) + ":" + second.substr(-2);
                            var time = formattedDate + " " + formattedTime;
                            reviews[m]["date"] = time;
                            // add index in order to remember the default sort
                            reviews[m]["index"] = m;
                        }
                        console.log(reviews);
                        $scope.reviews = reviews;
                        $scope.showGoogleReview = true;
                        $scope.reviewButton = "Google Reviews";
                        $scope.sortButton = "Default Order";
                        $scope.reviewSortGoogle = "index";  
                    }
                    // fetch yelp reviews
                    console.log(res.formatted_address);
                    var yelpMatchUrl = "";
                    var cityName = "";
                    var address = "";
                    var stateName = "";
                    var stateEndIndex = res.formatted_address.lastIndexOf(",");
                    address = res.formatted_address.slice(0, stateEndIndex);
                    var cityEndIndex = address.lastIndexOf(",");
                    stateName = address.slice(cityEndIndex + 2);
                    // fetch state
                    stateName = stateName.slice(0, 2);
                    address = address.slice(0, cityEndIndex);
                    cityStartIndex = address.lastIndexOf(",");
                    // fetch city
                    cityName = address.slice(cityStartIndex + 2);
                    if(res.formatted_address.length > 64) {
                        yelpMatchUrl = "/yelpSearch?name=" + res.name + "&city=" + cityName 
                                + "&state=" + stateName + "&country=US";                        
                    } else {
                        yelpMatchUrl = "/yelpSearch?name=" + res.name + "&city=" + cityName 
                                + "&state=" + stateName + "&country=US&address1=" + res.formatted_address;                        
                    }
                    // console.log(yelpMatchUrl);
                    $http.get(yelpMatchUrl)
                        .then(function(result) {
                            if(result.data.businesses.length == 1) {
                                var yelpReviewUrl = "/yelpReview?id=" + result.data.businesses[0].id;
                                $http.get(yelpReviewUrl)
                                    .then(function(res) {
                                        console.log(res.data.reviews);
                                        var yelpReviews = "";
                                        $scope.yelpReviews = "";
                                        if(res.data.reviews != undefined) {
                                            yelpReviews = res.data.reviews;
                                            for(var i = 0; i < yelpReviews.length; i++) {
                                                var ratingStarYelp = "";
                                                // add index in order to remember the default sort
                                                yelpReviews[i]["index"] = i;
                                                for(var j = 0; j < yelpReviews[i].rating; j++) {
                                                    ratingStarYelp += "★"; 
                                                }
                                                yelpReviews[i]["ratingStar"] = ratingStarYelp;
                                            }
                                            $scope.yelpReviews = yelpReviews;
                                            $scope.reviewSortYelp = "index";  
                                        } else {
                                            console.log("No Best Match either!"); 
                                            warnAlertReviews = true;
                                            warnAlertReviewsYelp = true;
                                        }
                                    });
                            } else {
                                // no best match, which means no reviews
                                console.log("No Best Match!");
                                warnAlertReviews = true;
                                warnAlertReviewsYelp = true;
                            }
                        });

                });
    };

    $scope.showInfo = function() {
        $scope.selectInfo = true;
        $scope.selectPhotos = false;
        $scope.selectMap = false;
        $scope.selectReviews = false;
        $scope.warnAlertPhotos = false;
        $scope.warnAlertMap = false;
        $scope.showStreet = false;
        $scope.warnAlertReviews = false;
    };

    $scope.showPhotos = function() {
        $scope.selectPhotos = true;
        $scope.selectInfo = false;
        $scope.selectMap = false;
        $scope.selectReviews = false;
        if(warnAlertPhotos == true) {
            $scope.warnAlertPhotos = true;            
        }
        $scope.warnAlertMap = false;
        $scope.showStreet = false;
        $scope.warnAlertReviews = false;

    };

    $scope.showMap = function() {
        $scope.selectMap = true;
        $scope.selectPhotos = false;
        $scope.selectInfo = false;
        $scope.selectReviews = false;
        if($scope.checkHere == true) {
            $scope.mapFromLocation = "Your location";
        } else {
            $scope.mapFromLocation = $scope.otherLocation;
        }
        $scope.warnAlertPhotos = false;
        $scope.warnAlertMap = false;
        $scope.showStreet = false;
        $scope.isWarnAlertMap = false;
        $scope.warnAlertReviews = false;
    };

    $scope.getDirections = function() {
        $scope.warnAlertMap = false;
        $scope.isWarnAlertMap = false;
        $scope.showStreet = false;
        $scope.isHideDirPanel = false;
        var start = "";
        // input current location
        if($scope.mapFromLocation == "Your location" || $scope.mapFromLocation == "My location") {
            start = new google.maps.LatLng(geoLat, geoLon);
        } 
        // input other location that searched by the user in the beginning
        else if($scope.mapFromLocation == $scope.otherLocation) {
            start = new google.maps.LatLng(otherGeoLat, otherGeoLng);
        } 
        else {
            start = $scope.mapFromLocation;
        }
        var end = mapToGeoLoc;
        var mode = $scope.selectedModes.mode;

        $showDirection.initDirection(start, end, mode)
            .then(
                function(res) {
                    marker.setMap(null);
                    directionsDisplay.setDirections(res);
                },
                // if error occurs
                function(status) {
                    $scope.warnAlertMap = true;
                    // hide the map
                    $scope.isWarnAlertMap = true;  
                    $scope.isHideDirPanel = true;                   
                }
            );
    };

    $scope.showStreetView = function() {
        if($scope.streetViewIcon == "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png") {
            $scope.showStreet = true;
            // hide the map
            $scope.isWarnAlertMap = true;
            $scope.streetViewIcon = "http://cs-server.usc.edu:45678/hw/hw8/images/Map.png";        
        } else {
            $scope.showStreet = false;
            $scope.isWarnAlertMap = false;
            $scope.streetViewIcon = "http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png";
        }
    };


    $scope.showReviews = function() {
        $scope.selectReviews = true;
        $scope.selectMap = false;
        $scope.selectPhotos = false;
        $scope.selectInfo = false;
        $scope.warnAlertPhotos = false;
        $scope.warnAlertMap = false;
        $scope.showStreet = false;
        if(warnAlertReviews == true) {
            $scope.warnAlertReviews = true;
        }
    };

    $scope.switchYelpReview = function() {
        $scope.showYelpReview = true;
        $scope.showGoogleReview = false;
        $scope.reviewButton = "Yelp Reviews";  
        if(warnAlertReviewsYelp == true) {
            $scope.warnAlertReviewsYelp = true;    
        }
        $scope.warnAlertReviewsGoogle = false;

    };

    $scope.switchGoogleReview = function() {
        $scope.showYelpReview = false;
        $scope.showGoogleReview = true;
        $scope.reviewButton = "Google Reviews";
        if(warnAlertReviewsGoogle == true) {
            $scope.warnAlertReviewsGoogle = true;
        }        
        $scope.warnAlertReviewsYelp = false;
    };

    $scope.reviewOrder = function(order) {
        if(order == 1) {
            $scope.reviewSortGoogle = "index";
            $scope.reviewSortYelp = "index";
            $scope.sortButton = "Default Order";
        }
        if(order == 2) {
            $scope.reviewSortGoogle = "-rating";
            $scope.reviewSortYelp = "-rating";
            $scope.sortButton = "Highest Rating";
        }
        if(order == 3) {
            $scope.reviewSortGoogle = "rating";
            $scope.reviewSortYelp = "rating";            
            $scope.sortButton = "Lowest Rating";
        }
        if(order == 4) {
            $scope.reviewSortGoogle = "-date";
            $scope.reviewSortYelp = "-time_created";   
            $scope.sortButton = "Most Recent";              
        }
        if(order == 5) {
            $scope.reviewSortGoogle = "date";
            $scope.reviewSortYelp = "time_created";        
            $scope.sortButton = "Least Recent";         
        }
    };

}]);

myApp.service("$showMap", function($q) {
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

myApp.service("$showDirection", function($q) {
    this.initDirection = function(start, end, mode) {
        var defer = $q.defer();
        var request = {
            origin: start,
            destination: end,
            travelMode: mode,
            provideRouteAlternatives: true 
        };
        var directionsService = new google.maps.DirectionsService;
        directionsService.route(request, function(response, status) {
            if (status === 'OK') {
                defer.resolve(response);
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

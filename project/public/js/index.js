// define an angular module named myApp
var myApp = angular.module("myApp", ["ngAnimate"]);
// create a controller for the module
myApp.controller("appController", ["$scope", "$http", "$showMap", "$showDirection",
                                    function($scope, $http, $showMap, $showDirection) {
    
    // fetch the client side geolocation
    $http.get("http://ip-api.com/json")
        .then(function(result) {
            $scope.location = result.data.lat + "," + result.data.lon;
            geoLat = result.data.lat;
            geoLon = result.data.lon;
            $scope.isNotFetched = false;
    });

    initForm();
    initFavList();

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

    $scope.clear = function() {
        $scope.searchForm.$setUntouched();
        $scope.searchForm.$setPristine();
        $scope.keyword = undefined;
        $scope.distance = undefined;
        $scope.otherLocation = undefined;
        $scope.isDisabled = true;
        $scope.checkHere = true;
        $scope.checkOther = false;
        $scope.requireKeyword = true;
        // details button is disabled in the beginning
        $scope.isNotTriggered = true;
        // switch pills to place table
        $scope.placeActive = true;
        $scope.favActive = false;
        // empty the places info
        $scope.places = undefined;
        // set the default category value
        $scope.selectedType = $scope.categories[0];
        otherGeoLat = 0.0;
        otherGeoLng = 0.0;
        // global variable for map use
        mapToGeoLoc = "";
        // for animation
        $scope.showTable = false;
        $scope.showFavoriteTable = false;
        $scope.toDetail = false;
        document.getElementById("placeTable").classList.remove("my-switch-animation-reverse");
        document.getElementById("favoriteTable").classList.remove("my-switch-animation-reverse");
        $scope.warnAlert = false;
    };

    $scope.submitForm = function() {

        resetValue();
        // the value is for add favorite icon the places
        var addFavoritePlace ="";
        if($scope.distance == undefined) {
           $scope.distance = 10; 
        }
        var otherLocation = $scope.otherLocation;
        if($scope.checkOther == false) {
            otherLocation = undefined;
        }
        var url = "http://nodejsyutaoren.us-east-2.elasticbeanstalk.com/search?keyword=" + $scope.keyword + "&category=" + $scope.selectedType.value 
                    + "&distance=" + $scope.distance + "&geoLocation=" + $scope.location
                    + "&otherLocation=" + encodeURI(otherLocation);
        // console.log(url);
        $http.get(url)
        .then(function(result) {
            // console.log(result);
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
                url = "http://nodejsyutaoren.us-east-2.elasticbeanstalk.com/search?keyword=" + $scope.keyword + "&category=" + $scope.selectedType.value 
                    + "&distance=" + $scope.distance + "&geoLocation=" + geoLocation
                    + "&otherLocation=" + otherLocation;
                $http.get(url)
                .then(function(result) {
                    $scope.progressing = false;
                    result = result.data;
                    if(result.status == "ZERO_RESULTS") {
                        $scope.warnAlert = true;
                    } else {
                        $scope.showTable = true;
                        $scope.places = result.results;
                        firstPagePlace = $scope.places;
                        next_page_token = result.next_page_token;
                        nextPageCheck(next_page_token);                          
                    }   
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

    $scope.showNextPage = function() {
        // if second page's result has not been fetched
        if(secondPagePlace == "") {
            var nextPageUrl = "http://nodejsyutaoren.us-east-2.elasticbeanstalk.com/next?next_page_token=" + next_page_token;
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
            var nextPageUrl = "http://nodejsyutaoren.us-east-2.elasticbeanstalk.com/next?next_page_token=" + next_page_token;
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

        initDetail();

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
        $scope.streetViewIcon = "./assets/pegman.jpg";

        $showMap.fetchDetail(place_id, map)
            .then(
                function(res) {
                    // console.log(res);
                    $scope.placeDetailInfo = res;
                    $scope.progressing = false;
                    // set the background color of the selected row
                    var placeRows = document.getElementsByClassName("placeRow");
                    for(let placeItem of placeRows) {
                        placeItem.classList.remove("selectedPlaceRow");
                    }
                    // handle the case when search is not committed, pressing details button in the favorite list
                    if(document.getElementById(place_id) == null && document.getElementById(place_id + "fav") != null) {
                        document.getElementById(place_id + "fav").classList.add("selectedPlaceRow");                        
                    }
                    if(document.getElementById(place_id) != null) {
                        document.getElementById(place_id).classList.add("selectedPlaceRow");                        
                    }
                    // set the favorite button of favorites places
                    if($scope.localPlaces.length != 0) {
                        $scope.addToFavorite = false;
                        for(let place of $scope.localPlaces) {
                            if(place_id == place.place_id) {
                                $scope.addToFavorite = true;
                            }
                        }
                    } else {
                        $scope.addToFavorite = false;    
                    }
                    // set the twitter contents
                    $scope.twitterDisabled = false;
                    if(res.website == undefined) {
                        $scope.twitterSrc = "https://twitter.com/intent/tweet?text=Check out " 
                                                    + res.name + " located at " + res.formatted_address 
                                                    + ". Website:&url=" + res.url + "&hashtags=TravelAndEntertainmentSearch";    
                    } else {
                        $scope.twitterSrc = "https://twitter.com/intent/tweet?text=Check out " 
                                                    + res.name + " located at " + res.formatted_address 
                                                    + ". Website:&url=" + res.website + "&hashtags=TravelAndEntertainmentSearch";
                    }
                    // fetch data for the info tab
                    $scope.selectInfo = true;
                    $scope.detailName = res.name;
                    $scope.address = res.formatted_address;
                    $scope.phoneNumber = res.international_phone_number;
                    $scope.priceLevel = "";
                    for(var p = 0; p < res.price_level; p++) {
                        $scope.priceLevel += "$";
                    }
                    $scope.rating = res.rating;
                    $scope.starWidth = Math.round($scope.rating / 5.0 * 100) + "%";
                    $scope.googlePage = res.url;
                    $scope.website = res.website;
                    // implement opening hours
                    $scope.hours = res.opening_hours;
                    if($scope.hours != undefined) {
                        // calculate the local week day
                        var todayWeekIndex = -1;
                        if(res.utc_offset > 0 || res.utc_offset == 0 ) {
                            todayWeekIndex += moment().utc().add(res.utc_offset, "m").weekday();                            
                        } else {
                            todayWeekIndex += moment().utc().subtract(Math.abs(res.utc_offset), "m").weekday();
                        }
                        // corner case: if today is Sunday, then change to the currect index
                        if(todayWeekIndex == -1) {
                            todayWeekIndex = 6;
                        }
                        var openingArr = res.opening_hours.weekday_text;
                        var today = openingArr[todayWeekIndex];
                        $scope.todayWeek = today.slice(0, today.indexOf(":"));
                        $scope.todayHour = today.slice(today.indexOf(":") + 2);
                        $scope.otherDays = [];
                        var counter = 0;
                        for(var m = todayWeekIndex + 1; m < openingArr.length; m++) {
                            $scope.otherDays[counter] = {
                                                            "week": openingArr[m].slice(0, openingArr[m].indexOf(":")),
                                                            "hour": openingArr[m].slice(openingArr[m].indexOf(":") + 2)
                                                        };
                            counter++;
                        }
                        for(var n = 0; n < todayWeekIndex; n++) {
                            $scope.otherDays[counter] = {
                                                            "week": openingArr[n].slice(0, openingArr[n].indexOf(":")),
                                                            "hour": openingArr[n].slice(openingArr[n].indexOf(":") + 2)
                                                        };
                            counter++;
                        }
                        $scope.hours = "";
                        if(res.opening_hours.open_now == false) {
                            $scope.hours += "Closed";
                        } else {
                            $scope.hours += "Open now: ";
                            $scope.hours += openingArr[todayWeekIndex].slice(openingArr[todayWeekIndex].indexOf(":") + 2);
                        }                   
                    }
                    // fetch data for the photos tab
                    // for desktop side
                    $scope.photoUrlCol1 = [];       
                    $scope.photoUrlCol2 = [];       
                    $scope.photoUrlCol3 = [];       
                    $scope.photoUrlCol4 = [];
                    // for mobile side
                    $scope.photoUrl = [];
                    // if there is no photo
                    if(res.photos == undefined) {
                        warnAlertPhotos = true;
                    } else {        
                        var index1 = 0,
                            index2 = 0,
                            index3 = 0,
                            index4 = 0;
                        for(var j = 0; j < res.photos.length; j++) {
                            if(j == 0 || j == 4 || j == 8) {
                                $scope.photoUrlCol1[index1] = res.photos[j].getUrl({'maxWidth': 1200, 'maxHeight': 1200});
                                index1++;
                            }
                            if(j == 1 || j == 5 || j == 9) {
                                $scope.photoUrlCol2[index2] = res.photos[j].getUrl({'maxWidth': 1200, 'maxHeight': 1200});
                                index2++;
                            }
                            if(j == 2 || j == 6) {
                                $scope.photoUrlCol3[index3] = res.photos[j].getUrl({'maxWidth': 1200, 'maxHeight': 1200});
                                index3++;
                            }
                            if(j == 3 || j == 7) {
                                $scope.photoUrlCol4[index4] = res.photos[j].getUrl({'maxWidth': 1200, 'maxHeight': 1200});
                                index4++; 
                            }
                        }
                        for(var q = 0; q < res.photos.length; q++) {
                            $scope.photoUrl[q]  = res.photos[q].getUrl({'maxWidth': 1200, 'maxHeight': 1200});
                        }
                    }
                    $scope.mapToLocation = res.name + ", " + res.formatted_address;
                    mapToGeoLoc = res.geometry.location;
                    // Fetch data for the reviews tab
                    var reviews = "";
                    $scope.reviews = "";
                    reviews = res.reviews;
                    if(reviews == undefined) {
                        warnAlertReviews = true;
                        warnAlertReviewsGoogle = true;
                    } else {
                        for(let review of reviews) {
                            var ratingStar = "";
                            for(var l = 0; l < review.rating; l++) {
                                ratingStar += "★";
                            }
                            // add rating star notation into reviews object
                            review["ratingStar"] = ratingStar;
                        }
                        // add time
                        for(let review of reviews) {
                            var date = new Date(review.time * 1000),
                                hour = "0" + date.getHours(),
                                minute = "0" + date.getMinutes(),
                                second = "0" + date.getSeconds(),
                                year = date.getFullYear(),
                                // Returns the month (from 0-11)
                                month = date.getMonth() + 1;
                                month = "0" + month;
                            var date = "0" + date.getDate(),
                                formattedDate = year + "-" + month.substr(-2) + "-" + date.substr(-2),
                                formattedTime = hour.substr(-2) + ":" + minute.substr(-2) + ":" + second.substr(-2),
                                time = formattedDate + " " + formattedTime;
                            review["date"] = time;
                            // add index in order to remember the default sort
                            review["index"] = m;
                        }
                        $scope.reviews = reviews;
                        $scope.showGoogleReview = true;
                        $scope.reviewButton = "Google Reviews";
                        $scope.sortButton = "Default Order";
                        $scope.reviewSortGoogle = "index";  
                    }
                    // fetch yelp reviews
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
                        yelpMatchUrl = "http://nodejsyutaoren.us-east-2.elasticbeanstalk.com/yelpSearch?name=" + res.name + "&city=" + cityName 
                                + "&state=" + stateName + "&country=US";                        
                    } else {
                        yelpMatchUrl = "http://nodejsyutaoren.us-east-2.elasticbeanstalk.com/yelpSearch?name=" + res.name + "&city=" + cityName 
                                + "&state=" + stateName + "&country=US&address1=" + res.formatted_address;                        
                    }
                    $http.get(yelpMatchUrl)
                        .then(function(result) {
                            var yelpReviews = "";
                            $scope.yelpReviews = "";
                            // if no best match, which means no reviews
                            if(result.data.businesses == undefined || result.data.businesses.length == 0) {
                                warnAlertReviews = true;
                                warnAlertReviewsYelp = true;
                            } else {
                                var yelpReviewUrl = "http://nodejsyutaoren.us-east-2.elasticbeanstalk.com/yelpReview?id=" + result.data.businesses[0].id;
                                $http.get(yelpReviewUrl)
                                    .then(function(res) {
                                        if(res.data.reviews != undefined) {
                                            yelpReviews = res.data.reviews;
                                            for(let i = 0; i < yelpReviews.length; i++) {
                                                var ratingStarYelp = "";
                                                // add index in order to remember the default sort
                                                yelpReviews[i]["index"] = i;
                                                for(let j = 0; j < yelpReviews[i].rating; j++) {
                                                    ratingStarYelp += "★"; 
                                                }
                                                yelpReviews[i]["ratingStar"] = ratingStarYelp;
                                            }
                                            $scope.yelpReviews = yelpReviews;
                                            $scope.reviewSortYelp = "index";  
                                        } else {
                                            warnAlertReviews = true;
                                            warnAlertReviewsYelp = true;
                                        }
                                    }); 
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
        if($scope.streetViewIcon == "./assets/pegman.jpg") {
            $scope.showStreet = true;
            // hide the map
            $scope.isWarnAlertMap = true;
            $scope.streetViewIcon = "./assets/map.png";        
        } else {
            $scope.showStreet = false;
            $scope.isWarnAlertMap = false;
            $scope.streetViewIcon = "./assets/pegman.jpg";
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
        if(warnAlertReviewsGoogle == true) {
            $scope.warnAlertReviewsGoogle = true;
            $scope.reviewButton = "Google Reviews";
            $scope.sortButton = "Default Order";
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

    $scope.goToDetail = function() {
        $scope.showTable = false;
        $scope.showFavoriteTable = false;
        $scope.toDetail = true;
        if($scope.favList.indexOf($scope.placeDetailInfo.place_id) == -1) {
            $scope.addToFavorite = false;
        } else {
            $scope.addToFavorite = true;
        }
    };

    $scope.goToList = function() {
        $scope.toDetail = false;
        // go to place list
        if($scope.placeActive == true) {
            $scope.showTable = true;           
            document.getElementById("placeTable").classList.add("my-switch-animation-reverse");
        }
        // go to favorite list 
        else if($scope.favActive == true) {
            if($scope.localPlaces.length == 0) {
                $scope.warnAlert = true;
                document.getElementById("warnAlert").classList.add("my-switch-animation-reverse");
            } else {
                // for pagination
                if(favPageNum * 20 < $scope.localPlaces.length) {
                    $scope.nextButtonFav = true;
                }
                if(favPageNum > 1) {
                       $scope.previousButtonFav = true;
                }
                $scope.showFavoriteTable = true;
                document.getElementById("favoriteTable").classList.add("my-switch-animation-reverse");
                if($scope.placeDetailInfo != undefined && $scope.favList.indexOf($scope.placeDetailInfo.place_id) != -1) {
                    if($scope.localPlaces.length != 0) {
                        document.getElementById($scope.placeDetailInfo.place_id + "fav").classList.add("selectedPlaceRow");                  
                    }
                }
            }
        }
    };

    var favPageNum = 1;
    $scope.favStart = 0;
    
    $scope.showNextPageFav = function() {
        $scope.favStart += 20;
        favPageNum++;
        $scope.previousButtonFav = true;
        if(favPageNum * 20 > $scope.localPlaces.length || favPageNum * 20 == $scope.localPlaces.length) {
            $scope.nextButtonFav = false; 
        }
    };

    $scope.showPreviousPageFav = function() {
        $scope.favStart -= 20;
        favPageNum--;
        if(favPageNum == 1) {
           $scope.previousButtonFav = false; 
        }
        if(favPageNum * 20 < $scope.localPlaces.length) {
            $scope.nextButtonFav = true; 
        }
    };

    $scope.addToFav = function() {
        var placesAll = "";
        // if already added to favorite, delete it
        if($scope.addToFavorite == true) {
            $scope.addToFavorite = false;
            placesAll = localStorage.getItem("placesStorage");            
            placesAll = JSON.parse(placesAll);
            for(var i = 0; i < placesAll.length; i++) {
                if(placesAll[i].place_id == $scope.placeDetailInfo.place_id) {
                    placesAll.splice(i, 1);
                    $scope.localPlaces = placesAll;
                    placesAll = JSON.stringify(placesAll);
                    localStorage.setItem("placesStorage", placesAll); 
                }
            }
            // delete from favorite list 
            for(var j = 0; j < $scope.favList.length; j++) {
                if($scope.favList[j] == $scope.placeDetailInfo.place_id) {
                    $scope.favList.splice(j, 1);
                }
            }
        } else {
            $scope.addToFavorite = true;
            placesAll = localStorage.getItem("placesStorage");
            if($scope.localPlaces.length == 0) {
                placesAll = [];
                placesAll[0] = $scope.placeDetailInfo;
            } else {
                placesAll = JSON.parse(placesAll);
                placesAll[placesAll.length] = $scope.placeDetailInfo;
            }   
            $scope.localPlaces = placesAll;
            placesAll = JSON.stringify(placesAll);
            localStorage.setItem("placesStorage", placesAll); 
            // add to favorite list
            $scope.favList[$scope.favList.length] = $scope.placeDetailInfo.place_id;
        }        
    };

    $scope.deleteFav = function(the_place_id) {
        var placesAll = localStorage.getItem("placesStorage");            
        placesAll = JSON.parse(placesAll);
        for(var i = 0; i < placesAll.length; i++) {
            if(placesAll[i].place_id == the_place_id) {
                placesAll.splice(i, 1);
                $scope.localPlaces = placesAll;
                placesAll = JSON.stringify(placesAll);
                localStorage.setItem("placesStorage", placesAll); 
            }
        }
        // delete from favorite list
        for(var j = 0; j < $scope.favList.length; j++) {
            if($scope.favList[j] == the_place_id) {
                $scope.favList.splice(j, 1);
            }
        }
        if($scope.localPlaces.length == 0) {
            $scope.warnAlert = true;
            $scope.showFavoriteTable = false;
        } 
    };

    $scope.addToFavinList = function(placeInfo) {
        var placesAll = localStorage.getItem("placesStorage");
        // if the place is not in the favorite list
        if($scope.favList.indexOf(placeInfo.place_id) == -1) {
            $scope.favList[$scope.favList.length] = placeInfo.place_id;
            if($scope.localPlaces.length == 0) {
                placesAll = [];
                placesAll[0] = placeInfo;
            } else {
                placesAll = JSON.parse(placesAll);
                placesAll[placesAll.length] = placeInfo;
            }    
            $scope.localPlaces = placesAll;
            placesAll = JSON.stringify(placesAll);
            localStorage.setItem("placesStorage", placesAll); 
        }
        // if the place is already in the favorite list
        else {
            $scope.favList.splice($scope.favList.indexOf(placeInfo.place_id), 1);          
            placesAll = JSON.parse(placesAll);
            for(var i = 0; i < placesAll.length; i++) {
                if(placesAll[i].place_id == placeInfo.place_id) {
                    placesAll.splice(i, 1);
                    $scope.localPlaces = placesAll;
                    placesAll = JSON.stringify(placesAll);
                    localStorage.setItem("placesStorage", placesAll); 
                }
            }
        }
    };

    $scope.showFavorite = function() {
        if($scope.localPlaces == null || $scope.localPlaces.length == 0) {
            document.getElementById("warnAlert").classList.remove("my-switch-animation-reverse"); 
            $scope.warnAlert = true;
        } else {
            // for pagination
            if(favPageNum * 20 < $scope.localPlaces.length) {
                $scope.nextButtonFav = true;
            }
            if(favPageNum > 1) {
                   $scope.previousButtonFav = true;
            }
            if(favPageNum * 20 > $scope.localPlaces.length || favPageNum * 20 == $scope.localPlaces.length) {
                $scope.nextButtonFav = false; 
            }
            // handle the case when the result table is warning
            $scope.warnAlert = false;
            $scope.showFavoriteTable = true;
        }
        $scope.showTable = false;
        $scope.toDetail = false;   
        // switch the nav pills
        $scope.favActive = true;
        $scope.placeActive = false;  
        document.getElementById("favoriteTable").classList.remove("my-switch-animation-reverse"); 
        if($scope.placeDetailInfo != undefined && $scope.favList.indexOf($scope.placeDetailInfo.place_id) != -1) {
            if($scope.localPlaces.length != 0) {
                // handle the case when the detailed favorite place is not on the current page
                if(document.getElementById($scope.placeDetailInfo.place_id + "fav") != null) {
                    document.getElementById($scope.placeDetailInfo.place_id + "fav").classList.add("selectedPlaceRow");
                    // if detail search is not triggered
                    if($scope.isNotTriggered == true) {
                        document.getElementById($scope.placeDetailInfo.place_id + "fav").classList.remove("selectedPlaceRow");    
                    }                    
                }
            }
        }
    };

    $scope.showPlaceTable = function() {
        if($scope.places != undefined) {
            $scope.showTable = true;  
        }
        $scope.warnAlert = false;
        $scope.showFavoriteTable = false;
        $scope.favActive = false;
        $scope.placeActive = true;
        $scope.toDetail = false;
        document.getElementById("placeTable").classList.remove("my-switch-animation-reverse");
    };

    function initForm() {
        $scope.keyword = undefined;
        $scope.otherLocation = undefined;
        $scope.isDisabled = true;
        $scope.checkHere = true;
        $scope.checkOther = false;
        $scope.requireKeyword = true;
        // the search button is disabled before the user location is fetched
        $scope.isNotFetched = true;
        // details button is disabled in the beginning
        $scope.isNotTriggered = true;
        // switch pills to place table
        $scope.placeActive = true;
        $scope.favActive = false;
        // empty the places info
        $scope.places = undefined;

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
            {name: "Lodging", value: "lodging"},
            {name: "Movie Theater", value: "movie_theater"},
            {name: "Museum", value: "museum"},
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

        var geoLat = 0.0;
        var geolon = 0.0;
        var otherGeoLat = 0.0;
        var otherGeoLng = 0.0;
        // global variable for map use
        var mapToGeoLoc = "";       

        // init the place list value        
        var next_page_token = "";
        var firstPagePlace = "";
        var secondPagePlace = "";
        var thirdPagePlace = "";
        // init the warning value
        var warnAlertPhotos = false;
        var warnAlertReviews = false;
        var warnAlertReviewsGoogle = false;
        var warnAlertReviewsYelp = false;
    }

    function initFavList() {
        // localStorage.removeItem("placesStorage");
        $scope.localPlaces = [];
        $scope.favList = [];
        var placesStorageAll = localStorage.getItem("placesStorage");
        placesStorageAll = JSON.parse(placesStorageAll);
        // if the favorite items are deleted to empty
        if(placesStorageAll != null && placesStorageAll.length == 0) {
            placesStorageAll = null;
        }
        if(placesStorageAll != null) {
            $scope.localPlaces = placesStorageAll;
            $scope.favList = [];
            for(var i = 0; i < $scope.localPlaces.length; i++) {
                $scope.favList[i] = $scope.localPlaces[i].place_id;
            }
        }    
    }

    function resetValue() {
        // reset place table: show the progress bar and hide the others
        $scope.progressing = true;
        $scope.warnAlert = false;

        $scope.previousButton = false;
        $scope.nextButton = false;
        next_page_token = "";
        firstPagePlace = "";
        secondPagePlace = "";
        thirdPagePlace = "";
        // reset detail button
        $scope.isNotTriggered = true;
        // for animation
        $scope.showTable = false;
        $scope.toDetail = false;
        document.getElementById("placeTable").classList.remove("my-switch-animation-reverse");
        document.getElementById("favoriteTable").classList.remove("my-switch-animation-reverse");
        $scope.addToFavorite = false;
        $scope.placeActive = true;
        $scope.favActive = false;
    }

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

    function initDetail() {
        // for animation
        $scope.toDetail = true;
        $scope.showTable = false;
        $scope.showFavoriteTable = false;

        // show progressing bar
        $scope.progressing = true;
        // reset tabs
        $scope.selectInfo = false;
        $scope.selectPhotos = false;
        $scope.selectMap = false;
        $scope.selectReviews = false;        
        // reset the review tab
        $scope.showGoogleReview = false;
        $scope.showYelpReview = false;

        $scope.isWarnAlertMap = false;
        mapToGeoLoc = "";

        $scope.warnAlertPhotos = false;
        warnAlertPhotos = false;

        $scope.warnAlertReviews = false;
        warnAlertReviews = false;
        $scope.warnAlertReviewsGoogle = false;
        warnAlertReviewsGoogle = false;
        $scope.warnAlertReviewsYelp = false;
        warnAlertReviewsYelp = false;
        // enable detail button
        $scope.isNotTriggered = false;
        // disable twitter button
        $scope.twitterDisabled = true;
        $scope.twitterSrc = "javaScript:void(0)";
        // store place detail for the use of favorite
        $scope.placeDetailInfo = "";
    }
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

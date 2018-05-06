var express = require("express");
var https = require("https");
var app = express();
var cors = require('cors');

app.use(cors());

app.use(express.static("./public"));

app.get("/search", function(req, res) {
    var responseData = "";
    // if other location is used, then fetch the geoLocation data
    // the value from client side is string type
    if(req.query.otherLocation != "undefined") {
        var urlOfMap = "https://maps.googleapis.com/maps/api/geocode/json?address=" 
                        + req.query.otherLocation + "&key=AIzaSyDhC1Tha8FKORJfe7--SYluRWe_n1LVMoE";
        // with https.get, req & req.end is automatically set.
        https.get(urlOfMap, function(response) {
            response.on("data", function(data) {
                // JSON format
                responseData += data;
            });
            response.on("end", function() {
                responseData = JSON.parse(responseData);
                if(responseData.status == "ZERO_RESULTS") {
                    // JSON format
                    responseData = JSON.stringify({status: "ZERO_RESULTS"});
                    res.send(responseData);
                } else {
                    var lat = responseData.results['0'].geometry.location.lat;
                    var lng = responseData.results['0'].geometry.location.lng;
                    // JSON format
                    responseData = JSON.stringify({lat: lat, lng: lng});
                    res.send(responseData);
                }
            });

        });
    } 
    // if current location is used, then fetch the nearby place data
    else {
        var radius = req.query.distance * 1600;
        var type = req.query.category;
        var location = req.query.geoLocation;
        var keyword = req.query.keyword;
        var urlOfPlace = "";
        if(type == "default") {
            urlOfPlace = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" 
                        + location + "&radius=" + radius + "&keyword=" 
                        + keyword + "&key=AIzaSyDhC1Tha8FKORJfe7--SYluRWe_n1LVMoE";
        } else {
            urlOfPlace = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" 
                        + location + "&radius=" + radius + "&type=" + type + "&keyword=" 
                        + keyword + "&key=AIzaSyDhC1Tha8FKORJfe7--SYluRWe_n1LVMoE";
        }

        https.get(urlOfPlace, function(response) {
            response.on("data", function(data) {
                // JSON format
                responseData += data;
            });
            response.on("end", function() {
                res.send(responseData);
            });
        });
    }
});

app.get("/next", function(req, res) {
    var next_page_token = req.query.next_page_token;
    var responseData = "";
    var nextPageUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=" 
                        + next_page_token + "&key=AIzaSyDhC1Tha8FKORJfe7--SYluRWe_n1LVMoE";
    https.get(nextPageUrl, function(response) {
        response.on("data", function(data) {
            // JSON format
            responseData += data;
        });
        response.on("end", function() {
            res.send(responseData);
        });    
    });
});

app.get("/yelpSearch", function(req, res) {
    var responseData = "";
    var yelpUrl = "";
    if(req.query.address1 != undefined) {
        yelpUrl = encodeURI("/v3/businesses/matches/best?name=" + req.query.name 
                + "&city=" + req.query.city + "&state=" + req.query.state + "&country=US&address1=" + req.query.address1);
    } else {
        yelpUrl = encodeURI("/v3/businesses/matches/best?name=" + req.query.name 
                + "&city=" + req.query.city + "&state=" + req.query.state + "&country=US");
    }
    // console.log(yelpUrl);
    var options = {
        host: "api.yelp.com",
        path: yelpUrl,
        headers: {"Authorization": "Bearer gyqyD1vhiuNFbMZRY4Dp9oM9PoIKy26wPoxsAfhPtQdKzrerXDQERSnIhNU0YrIMZ3fzo2kOaYtqG5QuP9JKgIeewBbkHbIx_Q1mVVhnvOUa7D4_EdyYJ4rxbLzBWnYx"}
    };
    https.get(options, function(response) {
            response.on("data", function(resultData) {
                responseData += resultData;
            });
            response.on("end", function() {
                res.send(responseData);
        });    
    });
});

app.get("/yelpReview", function(req, res) {
    var responseData = "";
    var yelpReviewUrl = "/v3/businesses/" + req.query.id + "/reviews";
    var options = {
        host: "api.yelp.com",
        path: yelpReviewUrl,
        headers: {"Authorization": "Bearer gyqyD1vhiuNFbMZRY4Dp9oM9PoIKy26wPoxsAfhPtQdKzrerXDQERSnIhNU0YrIMZ3fzo2kOaYtqG5QuP9JKgIeewBbkHbIx_Q1mVVhnvOUa7D4_EdyYJ4rxbLzBWnYx"}
    };
    https.get(options, function(response) {
        response.on("data", function(resultData) {
            responseData += resultData;
        });
        response.on("end", function() {
            res.send(responseData);
        });
    });
});

// get place detail
app.get("/detail", function(req, res) {
    var placeid = req.query.placeid;
    var responseData = "";
    var placeDetailUrl = "https://maps.googleapis.com/maps/api/place/details/json?placeid=" 
                        + placeid + "&key=AIzaSyDhC1Tha8FKORJfe7--SYluRWe_n1LVMoE";
    https.get(placeDetailUrl, function(response) {
        response.on("data", function(data) {
            // JSON format
            responseData += data;
        });
        response.on("end", function() {
            res.send(responseData);
        });    
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

// export the app instance as a module so that it can be included in other files
module.exports = app;


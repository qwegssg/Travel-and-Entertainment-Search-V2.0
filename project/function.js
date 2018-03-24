function initAutocomplete() {
    var input = document.getElementById("otherLocation");
    var autocomplete = new google.maps.places.Autocomplete(input, {types: ['address']});
}

function enableOther() {
    document.getElementById("otherLocation").disabled = false;
    // document.getElementById("otherLocation").required = true;
}

function enableHere() {
    document.getElementById("otherLocation").disabled = true;
}
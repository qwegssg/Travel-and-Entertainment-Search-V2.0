function initAutocomplete() {
    var input = document.getElementById("otherLocation");
    var autocomplete = new google.maps.places.Autocomplete(input, {types: ['address']});
}
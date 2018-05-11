# Travel-and-Entertainment-Search-V2.0. 
## 1. Introduction
Create a webpage that allows users to search for places using the Google Places API and display the results on the same page below the form. Once the user clicks on a button to search for place details, the webpage displays several tabs which contain an info table, photos of the place, map and route search form and reviews respectively. The webpage also supports adding places to and removing places from favorites list and posting place info to Twitter.  

The server-side script is based on Node.js. The client-side script is based on AngularJS. The application is deployed on AWS cloud.
## 2. Description
When a user initially opens the webpage, the page looks like Figure 2.1.
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Search_form.jpg)  

<h4 align = "center">Figure 2.1</h4>  


### 2.1 Search Form Design  
**Keyword:** This field is required. Validation is performed on this field.
**Category:** The default value of “Category” is “Default”, which covers all of the “types” provided
by the Google Places API.  
**Distance (miles):** This is the radius of the area within which the search is performed. The center
of the area is specified in the “From” field.  
**From:** The center of the area within which the search is performed. The user can choose
between their current location or a different location. This field is required (the user must either choose the first radio button or choose the second one and provide a location) and must be validated.The input box below the second radio button is disable by default. If the user chooses to provide a different location, this input field is enabled. This input field supports autocomplete.  

The search form has two buttons:  
**1. Search:** The “Search” button is disabled whenever either of the required fields is empty or validation fails or the user location is not obtained yet.  
**2. Clear:** This button resets the form fields, clear all validation errors if present, switch the view to the results tab and clear the results area.  

Search form validation is shown in Figure 2.2:  
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Validation.png)  
<h4 align = "center">Figure 2.2</h4>  

### 2.2 Results Tab  
Once the validation is successful and the user clicks on “Search” button, the application makes an AJAX call to the Node.js script hosted on AWS. The Node.js script on AWS will then make a request to Google Places API to get the places information. A sample output is shown in Figure 2.3. The displayed table includes six columns: # (Index number), Category, Name, Address, Favorite and Details.  
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Place_list.png)  
<h4 align = "center">Figure 2.3</h4>  

### 2.3 Details  
Once a button in the “Details” column is clicked, the webpage searches for the details of that place. Above the tabs in the details view, the name of the place, a button that allows users to go back to the previous list, a favorites button and a Twitter button are displayed.  

#### 2.3.1 Info Tab  
A table containing the detailed info of the place is displayed in this tab. The tab is shown in Figure 2.4. There is a “link” with text “Daily open hours” in the “Hours” field. Once it is clicked, it opens a new dialog displaying the open hours of every day with the current day’s hours at the top, as shown in Figure 2.5;
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Info_Tab.jpeg)
<h4 align = "center">Figure 2.4</h4> 
<br>  
  
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Opening_Hours.jpeg)  
<h4 align = "center">Figure 2.5</h4>  
  
#### 2.3.2 Photos Tab  
Photos are displayed in four columns. When a photo is clicked, a new tab is opened to display that photo in its original size. Photos Tab are shown in Figure 2.6:  
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Photos_Tab.jpeg)  
<h4 align = "center">Figure 2.6</h4>  

#### 2.3.3 Map Tab  
A Direction Search Form is shown on the top of Map Tab. This form has three input fields and a button:  
**From:** The starting point goes into this field. If the user uses “Current location” in the initial search form, the default value of this field should be “Your location” which means the user location. Otherwise, the default value is the location specified by the user. The field supports autocomplete function. The user can enter “My location” to use the user’s current location as the starting point.  
**To:** This is a read-only field which contains the name and the address of the target place whose details are being displayed.  
**Travel Mode:** This is a dropdown list containing four travel modes: Driving, Bicycling, Transit, and Walking. The default value is Driving.  
**Get Directions:** This button is disabled if “From” field is empty or contains only spaces.  
Below the form, there is a Google Map centered at the target place with a marker on it by default，as shown in Figure 2.7. There is a button between the map and the form which toggles the Google Street View, as shown in Figure 2.8. 
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Map_Tab1.jpeg)  
<h4 align = "center">Figure 2.7</h4>  
<br>  

![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Street_View.jpeg)  
<h4 align = "center">Figure 2.8</h4>  
Once the “Get Directions” button is enabled and clicked, the route from the starting point to the destination in the specified travel mode is displayed. The detailed travel instructions is displayed below the map. All the feasible routes are listed below the map. The route selected by the user is displayed on the map and the travel instructions is listed below, as shown in Figure 2.9:  
<br>  

![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Map_Tab2.jpeg)  
<h4 align = "center">Figure 2.9</h4>  

#### 2.3.4 Reviews Tab  
This tab displays the Google reviews and Yelp reviews of the place. By default, Google reviews are displayed in the default order. There are two dropdowns in this tab. The first one allows the user to switch between Google reviews and Yelp reviews. The second one allows the user to sort the reviews in several different ways: Default Order, Highest Rating, Lowest Rating, Most Recent and Least Recent.  
Each of reviews has its author name, author image, time, rating, and content. The author name and image are clickable. Once they are clicked, a new page is opened and go to the author’s page for Google reviews or the review page for Yelp reviews.  
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Reviews_Tab.jpeg)  
<h4 align = "center">Figure 2.10</h4>  

### 2.4 Favorites Tab  
The favorites tab is very similar to the results tab: the places on the list are displayed in a table; there is a button that allows the user to go to the details view and is disabled initially; the user can search for place details by clicking on the buttons in the “Details” column; pagination is supported with each page containing up to 20 records.  
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Fav_Tab.jpeg)  
<h4 align = "center">Figure 2.11</h4>  
The place information displayed in the favorites tab is saved in and loaded from the local storage of the browser; the buttons in the “Favorite” column of the favorites tab is used to remove a place from the list and has a trash can icon instead of a star icon in results tab; the places in the favorites tab are sorted in the order they are added to the favorites list.  

### 2.5 Responsive Design  
The following are snapshots of the webpage opened with Safari on iPhone 8.  

<div style="display:inline;">
<img src="https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/1.jpg" width="25%">
<img src="https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/2.jpg" width="25%">
<img src="https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/3.jpg" width="25%">
</div>
<div style="display:inline;">
<img src="https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/4.jpg" width="25%">
<img src="https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/5.jpg" width="25%">
<img src="https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/6.jpg" width="25%">
</div>  
  
### Application link: http://nodejsyutaoren.us-east-2.elasticbeanstalk.com/

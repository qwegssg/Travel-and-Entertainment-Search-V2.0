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
![Sorry! Something wrong with the img.](https://github.com/qwegssg/Travel-and-Entertainment-Search-V2.0/blob/master/snapshots/Opening_Hours.jpeg)
<h4 align = "center">Figure 2.5</h4>  

### 2.dfdfdfd Responsive Design  
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

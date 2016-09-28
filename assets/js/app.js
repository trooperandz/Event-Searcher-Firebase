// Initialize Firebase
/*
var config = {
  apiKey: "AIzaSyA9gw81RM2br5S9X55E0G6ZGjJMo1oDVRs",
  authDomain: "eventi-testing-db.firebaseapp.com",
  databaseURL: "https://eventi-testing-db.firebaseio.com",
  storageBucket: "eventi-testing-db.appspot.com",
  messagingSenderId: "393804341426"
};*/

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBKXSuOL_8TzGqi84Wna4x_HW5M7NoCR5o",
  authDomain: "eventi-auth-testing.firebaseapp.com",
  databaseURL: "https://eventi-auth-testing.firebaseio.com",
  storageBucket: "eventi-auth-testing.appspot.com",
  messagingSenderId: "515619523046"
};

firebase.initializeApp(config);

// Establish easy access to db object
var db = firebase.database();

/*
// Establish firebase global vars
var provider = new firebase.auth.FacebookAuthProvider();
var googprovider = new firebase.auth.GoogleAuthProvider();
var uidUser;
var currentUserProfile;
var currentUserRef;
var user;
var userName;
var userEmail;
var userImg;
var authed = firebase.auth().currentUser;
var justRegistered = true;
var previousUser = false;


firebase.auth().onAuthStateChanged(function(user) {   
     if(user) {
        console.log("entered user auth code block");
        $("#login").remove();
        currentUserProfile = firebase.auth().currentUser;
        uidUser = firebase.auth().currentUser.uid;
        currentUserRef = database.ref('Users/'+uidUser);
        (console.log(uidUser));
        console.log(currentUserProfile.displayName);
        $("#name").html(currentUserProfile.displayName);
        console.log(currentUserProfile.photoURL);
        let pic = $('<img src='+currentUserProfile.photoURL+'>');
        pic.addClass('img-responsive');
        $("#pic").html(pic)
        console.log(currentUserProfile.email)
    } else {
        let loginCreate = $('<button>')
        loginCreate.addClass('btn navButtons');
        loginCreate.attr('id', 'login');//<button class= "btn" id="login"> login </button>
        loginCreate.text('Login')
        $(".navbar-right").append(loginCreate);
        console.log("u aint logged in :)");
      }
});

firebase.auth().getRedirectResult().then(function(result) {
    console.log("Entered user auth 2nd code block");
    if (result.credential) {
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var token = result.credential.accessToken;
        console.log("token: " + token);
        console.log("result: " + result);
        user = result.user;
        console.log("diplay name: " + user.displayName);
        userName = user.displayName;
        userEmail = user.email;
        console.log("email: " + user.email);
        console.log("photo url: " + user.photoURL);
        userImg = user.photoURL;
        currentUserProfile = firebase.auth().currentUser;
        uidUser = firebase.auth().currentUser.uid;
        console.log("uidUser: " + uidUser);
        currentUserRef = database.ref('Users/'+uidUser);
        currentUserRef.update({
             name: userName,
             email: userEmail,
             photo: userImg,
        });
        setTimeout(function () {
             $('.loggedModal').modal("show");
        }, 2000);
   }
  // The signed-in user info.
}).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
    // ...
});*/

// For testing purposes, for testing of modal that pops up if user tries to 'Add Favorite', but they are not logged in
var userLoggedIn = true;

// Establish global for database user reference
var usersRef = db.ref("Users");

// For testing purposes, to obtain user informtion as if user were logged in
//console.log('firebase logged-in userId: ' + firebase.auth().currentUser.uid);
//var userId = "757827487";
var userId = "FORCDQYjywPRkTZeFfhmEgLlYoZ2";

// Object for storing event properties and methods specific to any event actions, searching, etc
var eventObj = {

	// Set delay interval for ajaxCall(), so the spinner is visible for a minimum period of time (otherwise will go away too fast)
	timeDelay: 530,

    // Set delay interval for generateFavContent() to longer period thatn timeDelay, as it will be too short because there is no ajax call taking up time
    timeDelayFavContent: 930,

	// Set query url as global so that ajaxCall() method may access it without receiving url as parameter 
	// (setTimeout does not allow for passing parameters to fn's)
	queryUrl: "",

    // Set favArray as global so that generateFavContent() may be called inside of setTimeout function
    // (setTimeout does not allow for passing parameters to fn's)
    favArray: [],

    // Store an array of user favorite titles for reuse in dropdowns and side slider content
    favTitleArray: [],

	/**
	 * Build the query url string, and execute ajaxCall(), based on dataObj params.
	 * Separated out from main ajaxCall() function, to properly execute processing spinner
	 * @param {object} dataObj Object containing search params
	 * @return N/A
	 */
	executeQueryUrl: function(dataObj) {
		// Set variables from dataObj items
  	    var city 	        = dataObj.city;
  	    var categoryId      = dataObj.categoryId;
  	    var queryStartDate  = dataObj.queryStartDate;
  	    var queryEndDate    = dataObj.queryEndDate;

  	    // Build url query
  	    eventObj.queryUrl = "https://www.eventbriteapi.com/v3/events/search/?token=IVKXSGGHO6MZSHMF5QZZ&location.address=" + city + "&categories=" + categoryId + "&start_date.range_start=" + queryStartDate + "&start_date.range_end=" + queryEndDate + "&location.within=10mi";

	  	// Load the spinner to indicate processing
		$('div.spinner-div').html('<div class="spinner">Loading...</div>');

		// Run the ajaxCall() method, after timeDelay interval. The spinner is removed once the ajax call is complete.
		setTimeout(eventObj.ajaxCall, eventObj.timeDelay);
	},

	/**
	 * Format the dates to send to the api query, and for updating the main page header
	 * Put in separate function so that it may be used for in several different query form submit scenarios
	 * Note: used for the following scenarios:
	 * @param
	 * @return
	 */
	formatQueryDates: function(firstDate, lastDate) {
		// Set default date ranges if firstDate == null. Start date == today, end date == 6 months from now
		// Otherwise, set dates based on user input
		// Note: Eventbrite requires date to be in datetime format: "2010-01-31T13:00:00".
        // Default moment.format() function returns "MMMM-DD-YYT00:00:00-00:00". Cut of extra content so that api query works
        // Do not apply moment formatting to the date if the date has not been entered.  moment will return an error if so
        // Note: revisit the possibility of setting localStorage vars for start and end dates, so that category click will return dates from search?
        if(firstDate == null) {
        	firstDate   = new Date();
        	lastDate = moment(firstDate).add(6, 'months');
        } else {
        	firstDate = new Date(firstDate);
        	lastDate = new Date(lastDate);
        }

		var queryStartDate = moment(firstDate).format().slice(0, -6);
		var startDate      = moment(firstDate).format('MM/DD/YYYY');
		var queryEndDate   = moment(lastDate).format().slice(0, -6);
		var endDate        = moment(lastDate).format('MM/DD/YYYY');
		console.log("startDate: " + startDate + " queryStartDate: " + queryStartDate + " endDate: " + endDate + " queryEndDate: " + queryEndDate);

		// Return an object containing all correctly formatted date references
		return {
			queryStartDate: queryStartDate,
			startDate: startDate,
			queryEndDate: queryEndDate,
			endDate: endDate
		}
	},

    /**
     * Run the ajax call to the Eventbrite api
     * @param N/A
     * @return N/A
     * Note: this method is executed inside of executeQueryUrl() method
     */
  	ajaxCall: function() {
  	    $.ajax({
  	     url: eventObj.queryUrl,
  	     //url: "https://www.eventbriteapi.com/v3/events/search/?token=IVKXSGGHO6MZSHMF5QZZ&location.address=Austin&categories=103&start_date.range_start=2016-09-22T00:00:00&start_date.range_end=2016-10-25T00:00:00&location.within=10mi",
  	      method: "GET",
  	    }).done(function(response) {
  	    	console.log("typeof response: " + typeof response);
  	    	if(response != undefined) {
  	    		console.log("entered response != '' block");

  	    		// Remove the spinner
  	    		eventObj.removeSpinner();

  	        	// Empty out existing event content
  	        	$('.event-boxes').empty();

  	        	console.log("Response: " + response.events[1]);

  	        	// Save the response object as a session variable
  	        	localStorage.setItem("homePage-results", JSON.stringify(response));

  	        	//console.log("localStorage 'search-results': " + JSON.stringify(response));

  	        	// Now generate the new content, and append it to the main section, replacing existing content
  	        	eventObj.generateSearchContent(response);

  	        } else {
  	        	// This else block doesn't work. Never executes.  Can't figure out how to check for undefined, bc it is always logging as an object
  	        	console.log("entered response false block");
  	        	$('.event-boxes').html('<h3 style="color: #FEDC32;"> Sorry, but there were no events found for your search! </h3>');
  	        }

  	        // Redirect to dashboard page, now that search results have been returned
  	        //window.location="file:///Users/Yo/Desktop/Bootcamp/homework/group-projects/Group-Event-Project1/dashboard.html";
  	    });
  	}, // ajaxCall()

  	/**
  	 * Remove the spinner when the ajax call returns a response
  	 * Item removed inside of div.spinner-div is actually <div class="spinner"></div>
  	 * Put this in a function for ease of readability, and for reuse in case name or structure of spinner operation changes
  	 * @param N/A
  	 * @return N/A
  	 */
  	removeSpinner: function() {
  		$('div.spinner-div').empty();
  	},

    /**
     * Create markup for event boxes
     * @param {object} dataObj Object containing value params
     * @return N/A
     */
    generateEventBoxes: function(dataObj) {
        // Build string of html content, filling in variable content with response items. fullDesc will be used for modal dropdown of full description
        var html =  '<div class="col-xs-12 col-sm-12 col-md-6 col-lg-4 event-box">' +
                        '<div class="panel event-content text-center card-image" id="event' + dataObj.index + '">' +
                            '<h3 class="event-name" data-name="' + dataObj.longName + '">' + dataObj.shortName + '</h3>' +
                            '<p class="event-date" data-date="' + dataObj.date + '">' + dataObj.date + '</p>' +
                            '<p class="event-time" data-time="' + dataObj.time + '">' + dataObj.time + '</p>' +
                            '<p class="event-desc" data-desc="' + dataObj.longDesc + '">' + dataObj.shortDesc + '</p>' +
                        '</div>' +
                        '<button type="button" class="btn btn-lg btn-block fav-button show">add favorite</button>' +
                        '<div class="card-reveal">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>' +
                            '<h2>select a category</h2>' +
                            '<select type="text" class="form-control" id="user-category">' +
                                dataObj.options +
                            '</select>' +
                            '<button type="button" class="btn btn-block text-center add-to-category">add to category</button>' +
                            '<h2 id="create-new">create a new category</h2>' +
                            '<input type="text" class="form-control category-input" placeholder="new category name"/>' +
                            '<i class="glyphicon glyphicon-share-alt category-icon"></i>' +
                            '<p class="add-fav-feedback"></p>' +
                        '</div>' +
                    '</div>';

         // Append new event block to div.main
         $(".event-boxes").append(html);
    },

  	/**
	 * Create the search event box content cards from an event response data object
	 * This is used by ajaxCall(), as well as the default dashboard page load from the localStorage "response" item
	 * @param {object} response Data containing all of the event search results
	 * @return N/A
	 */
	generateSearchContent: function(response) {
        console.log("event 1: " , response.events[1]);
        console.log("response: " , response);
		// Loop through each event item from the event search response object
		response.events.forEach(function(item, index, arr) {

			// Set easy access to name
			var name = item.name.text;
            var shortName = "";
            var longName = "";

            if (name) {
                longName = name;
                shortName = (name.length > 60) ? name.slice(0, 60) + "..." : name;
            } else {
                longName = shortName = "No description available.";
            }

			// Set easy access to date. Format it using moment.js plugin
			var date = moment(item.start.local).format('MMMM Do YYYY');

            // Set easy access to event time.  Format it using moment.js plugin
            var startTime = moment(item.start.local).format('LT');
            var endTime   = moment(item.end.local).format('LT');
            var time      = startTime + " - " + endTime;

			// Set easy access to event description
			var desc = item.description.text;
			var shorDesc = "";
			var longDesc = "";

			// If there is no item description, set default message. Save long description for modal dropdown
			if (desc != null) {
				longDesc  = desc;
				shortDesc = desc.slice(0, 100) + "...";
			} else {
				longDesc = shortDesc = "No description available.";
			}

            // If user is logged in, generate <select> fav options for card slider, from favTitleArray global var
            var options = "";
            if(userLoggedIn) {
                console.log("user is logged in line 215");
                //console.log("user favTitleArray var: " , eventObj.favTitleArray);
                options += '<option value=""> Select... </option>';
                eventObj.favTitleArray.forEach(function(title){
                    console.log("entered favTitleArray loop");
                    options += '<option value="' + title + '">' + title + '</option>';
                });
            } else {
                options += '<option value="">No favorites available...</option>';
            }

			// Build string of html content, filling in variable content with response items. fullDesc will be used for modal dropdown of full description
			var dataObj = {
                index: index,
                longName: longName,
                shortName: shortName,
                date: date,
                time: time,
                longDesc: longDesc,
                shortDesc: shortDesc,
                options: options
            }
            eventObj.generateEventBoxes(dataObj);
		});
	}, // generateSearchContent()

    /** 
     * After user clicks their favorite from the side favorites slider, db call generates array of event favorites.  Loop through those and generate content with this function
     * May need to integrate this back into the main generateSearchContent() function, but not sure.  Just strong-arm it for now...
     * the favArray variable is global, as setTimeout doesn't like to have functions inside that are passed params.....
     * @param N/A
     * @return N/A
     */
    generateFavContent: function() {
        // Loop through each event object inside of the events array, creating event cards to put into .event-boxes div container
        eventObj.favArray.forEach(function(item, index, arr) {
            console.log("arr: " + arr);
            console.log("item: " + item);

            // Set easy access to name, and cut the length for card display if length > 60 characters
            var name = item.name;
            longName = name;
            shortName = (name.length > 60) ? name.slice(0, 60) + "..." : name;
           
            // Set easy access to date
            var date = item.date;

            // Set easy access to event time
            var time = item.time;

            // Set easy access to event description. Note:  in other code, this is var desc.  When I tried to do that, it grabbed the last previous desc from the last generated event content box.  Weird.  Some global thing
            //console.log("item desc: " + item.desc);
            var desc = item.desc;
            console.log("desc: " + desc);
            var shortDesc = desc.slice(0, 100) + "...";
            var longDesc = desc;

            // Generate html string of select options. 
            // If user login is in working order, no need to check for user login, as this method can't be accessed unless user is logged in
            // If the array is empty (was running into that and can't explain), show a default option with generic message
            var options = "";
            if(eventObj.favTitleArray.length > 0) {
                eventObj.favTitleArray.forEach(function(title) {
                    options += '<option value="' + title + '">' + title + '</option>';
                });
            } else {
                options += '<option value=""> No Favs Are Available </option>';
            }

            // Note: below is duplicated code.  You need to make this a function in itself to conform to DRY principle
            // Build string of html content, filling in variable content with response items. fullDesc will be used for modal dropdown of full description
             var dataObj = {
                index: index,
                longName: longName,
                shortName: shortName,
                date: date,
                time: time,
                longDesc: longDesc,
                shortDesc: shortDesc,
                options: options
            }
            eventObj.generateEventBoxes(dataObj);
        });

        // Clear out the global var favArray so that next time favs are clicked, it won't include the previously viewed items....
        eventObj.favArray = [];

        // Remove the spinner
        eventObj.removeSpinner();
    },

    /**
     * Process search field inputs - prepare them for ajax call
     * @param
     * @return {object} dataObj Contains all form input data
     */
    getSearchInputData: function() {
        // Get form inputs. Trim whitespace
        var city         = $('#search-city').val().trim();
        var categoryId   = $('#search-category').val().trim();
        var categoryName = $('#search-category option:selected').data("category");
        var firstDate    = $('#search-date-start').val().trim();
        var lastDate     = $('#search-date-end').val().trim();
        console.log("city: " + city + " categoryId: " + categoryId + " categoryName: " + categoryName + " date1: " + firstDate + " date2: " + lastDate);

  		// Prevent form submit if all inputs are empty
        if(city == "" && categoryId == "" && firstDate == "" && lastDate == "") {
        	// Close the search modal, and then show the alert modal
        	$('.searchModal').modal("hide");
            contentObj.showAlertModal("You didn't enter any search criteria!");
            return false;
        }

        // Prevent form submit if there was no city entered.  This is the minimum search requirement
        if(city == "") {
        	// Close the search modal, and then show the alert modal
        	$('.searchModal').modal("hide");
            contentObj.showAlertModal("You must at least enter a city for your search!");
            return false;
        }

  		// Set city location to session var. Note: this is also set in other places. You want to overrite it every time a new search occurs
  		localStorage.setItem("city-location", city);

  		// All inputs are good to go; now format dates for query string and search feedback msg string
  		var dateObj = eventObj.formatQueryDates(firstDate, lastDate);

        // Send search inputs to ajaxCall. Note: ajaxCall will set response data as localStorage item for dashboard.html content generation
        var dataObj = {
            city: city,
            categoryId: 	categoryId,
            categoryName: 	categoryName,
            startDate: 		dateObj.startDate,
            queryStartDate: dateObj.queryStartDate,
            endDate: 		dateObj.endDate,
            queryEndDate: 	dateObj.queryEndDate
        }

        return dataObj;
    },

    /**
     * Set search results feedback heading based on searched items
     * @param {object} dataObj All search parameters
     * @return N/A
     */
    getFeedbackMsg: function(dataObj) {

        // First, build beginning default string.
        var msg = '';

        // If user entered a category, add that as well
        if(dataObj.categoryName != null) {
            msg += dataObj.categoryName;
        }

        // City will ALWAYS be required
        msg += ' events in ' + dataObj.city;

        // If date range was entered, add that as well. First, format it back
        msg += ' ' + dataObj.startDate + ' - ' + dataObj.endDate;

        // Set search feedback as localStorage item
        localStorage.setItem("search-feedback", msg);

        // Now insert the feedback search results into the main heading
        $('.header-span').text(localStorage.getItem("search-feedback"));

        // Note: main heading with favorites feedback is updated inside of favorites click handler
    },

    /**
     * Get event information from the selected card, when user chooses to add to new or existing category
     * @param {object} htmlObj Html clicked element
     * @return {object} Object containing event name, date, time, description
     */
    getCardFavData: function(htmlObj) {
        var name = $(htmlObj).parent().siblings('.card-image').children('.event-name').data('name');
        var date = $(htmlObj).parent().siblings('.card-image').children('.event-date').data('date');
        var time = $(htmlObj).parent().siblings('.card-image').children('.event-time').data('time');
        var desc = $(htmlObj).parent().siblings('.card-image').children('.event-desc').data('desc'); 
        console.log("name: " + name + " date: " + date + " time: " + time + " desc: " + desc);

        return {
            name: name,
            date: date,
            time: time,
            desc: desc
        }
    },

    /**
     * Get logged-in user's favorites information, for use in side favorites slider, and event card slider <select> options, and event cards
     * Note: usersRef and userId are global vars established at top of program. userId gets set when user logs in
     * User will not be able to access this function if he/she is not logged in already, so no need to check for login at this point
     * Event card slider <select> options will be generated from favTitleArray array
     */
    getUserFavoritesData: function() {                                                                                          
        // Establish favTitles array for storing titles alone. Note: The fav title array is global so it can be re-used inside of the getFavContent() method
        var favEventsArray = [];
        usersRef.child(userId).child("favCategories").on('child_added', function(snapshot) {
            eventObj.favTitleArray.push(snapshot.key);
            favEventsArray.push(snapshot.val());
            $('.slider-favs').append('<li> <button class="click-option user-generated-categories" data-category="' + snapshot.key + '">' + snapshot.key + ' </button> </li>');
        });                        
        console.log("favTitleArray: " , eventObj.favTitleArray);
        console.log("favEventsArray: " , favEventsArray);
    }
} // eventObj

var contentObj = {
	/**
	 * Show modal for any system alerts
	 * @param {string} msg The alert message to display
	 * @return N/A
	 */
	showAlertModal: function(msg) {
		// Replace content with param
		$('.alertModal p#modal-alert-msg').text(msg);

		// Show the modal
		$('.alertModal').modal("show");
	}
}

$(document).ready(function() {
    // Backstretch plugin for responsive background container image
    $.backstretch("assets/img/chihuly-bg-02-copy.jpg");

    // If user is logged in, grab their favorties data from the db
    if(userLoggedIn) {
        eventObj.getUserFavoritesData();
    }

	// Include the datepicker, from jQuery UI library
  	$("#search-date-start").datepicker();
  	$("#search-date-end").datepicker();

  	// Slide Reveal function for favorites side content
    $("#slider").slideReveal({
        trigger: $("#trigger"),
        push: false,
        overlay: true,
        position: "right",
        speed: 600
    });

    // Get events on initial page load, if the user used the search form on the main homepage (comes from localStorage var)
    // If user chose to login instead, show 'all events' in their current location by default (for now, location is hard-coded to "Austin")
    if(localStorage.getItem("homePage-results") != null) {
        console.log("homePage-results session var is set. Value is: " + localStorage.getItem("homePage-results"));

        // Turn JSON back from a string into an object
        var response = JSON.parse(localStorage.getItem("homePage-results"));
        eventObj.generateSearchContent(response);

        // Now insert the feedback search results into the main heading
        $('.header-span').text(localStorage.getItem("search-feedback"));

        console.log("The page should have loaded the homepage search results!");
    } else {
        // Set default events load with location "Austin", since user logged in, but didn't search
        var firstDate = null;
        var lastDate  = null;
        var dateObj   = eventObj.formatQueryDates(firstDate, lastDate);

        // Generate new result set, setting event categoryId to null & categoryName to "all events" to retrieve 'all events', and new city location as the location
        var dataObj = {
            city:           "Austin",
            categoryId:     null,
            categoryName:   "all events",
            startDate:      dateObj.startDate,
            queryStartDate: dateObj.queryStartDate,
            endDate:        dateObj.endDate,
            queryEndDate:   dateObj.queryEndDate
        }
        // Execute the query
        eventObj.executeQueryUrl(dataObj);

        // Generate feedback message
        eventObj.getFeedbackMsg(dataObj);
    }

    // Card slider for my favorites options
    $('.event-boxes').on('click','.show', function(){
        console.log(this);
        console.log("I clicked");
        $(this).siblings('.card-reveal').slideToggle('slow');
    });

    // Close the card slider when the 'X' is clicked
    $('.event-boxes').on('click','.close', function(){
        $(this).parent().slideToggle('slow');
    });

	// If the user clicks on an event box, show modal with event info (giving greater detail of description etc)
	// Had to start with div.main parent, then narrow down, due to DOM being updated dynamically with events after initial page load
	$('.event-boxes').on('click', 'div.event-content', function() {
		console.log("this: " + this);

		// Get the parent element for reference
		var parentId = "#" + $(this).attr("id");
		console.log("parentId: " + parentId);

		// Fill in the div.eventModal elements with updated content
		var data;

		// Get event name
		data = $(parentId + ' h3').data("name");
		$('#modal-event-name').text(data);

		// Get event date
		data = $(parentId + ' p.event-date').data("date");
		$('#modal-event-date').text(data);

        // Get event time
        data = $(parentId + ' p.event-time').data("time");
        $('#modal-event-time').text(data);

		// Get event description
		data = $(parentId + ' p.event-desc').data("desc");
		$('#modal-event-desc').text(data);

		// Now show the modal
		$('.eventModal').modal("show");
	});

	// On click function to display only the events within that specific category
	// Note: user's location will be based on session var, which is based on either A) auto location at login, or B) via event search form
	$('.click-option').on('click', function(){
		// Set city based on location session var
		if(localStorage.getItem("city-location") != null) {
			var city = localStorage.getItem("city-location");
		} else {
			// Note: just as a fail-safe, set a default city.  YOU DON"T want to ever actually have to use this, dude!!
			var city = "Austin";
		}

		// Assign the data from the button to eventInfo
		var categoryId = $(this).data("id");
		console.log("categoryId: " + categoryId);

		// Get the category name
		var categoryName = $(this).data("category");
		console.log("categoryName: " + categoryName);

		// Set and format default date range for query search and search feedback heading string. Function will return object with date properties
		var firstDate = null;
		var lastDate  = null;
		var dateObj   = eventObj.formatQueryDates(firstDate, lastDate);

        // Run Ajax function
        var dataObj = {
            city: 			city,
            categoryId: 	categoryId,
            categoryName: 	categoryName,
            startDate: 		dateObj.startDate,
            queryStartDate: dateObj.queryStartDate,
            endDate: 		dateObj.endDate,
            queryEndDate: 	dateObj.queryEndDate
        }

        eventObj.executeQueryUrl(dataObj);

        // Update the search feedback main heading
        eventObj.getFeedbackMsg(dataObj);
	});

	// Process search modal submit
    $('#modal-search-submit').on('click', function() {
        // Get form input data and process so it is ready to send to the api ajax call
        var dataObj = eventObj.getSearchInputData();

        // Check for false return from getSearchInputData(), to prevent spinner from executing
        if(!dataObj) {
          return false;
        }

        // Execute the ajax call, and save response to localStorage
        eventObj.executeQueryUrl(dataObj);

        // Set the search feedback message, and save to localStorage
        eventObj.getFeedbackMsg(dataObj);

    });

	// If user clicks 'Add Favorite' button, show alert modal if user is not logged in yet
	$('.fav-button').on('click', function(){
		if(!userLoggedIn) {
			contentObj.showAlertModal("You must be logged in to save favorites!");
		}
	});

	// If user clicks "Find Events" button, show event search modal
	$('button#find-events-btn').on('click', function() {
		$('.searchModal').modal("show");
	});

	// If user enters new city into location input, set localStorage item to that city
	// To-do:  Do we want to make it so that this action also populates 'all events' in that location by default?? Sure!!
	$('.location-icon').on('click', function() {
		// Get the text in the input
		var city = $('.location-input').val().trim();

		// Set city to local storage
		localStorage.setItem("city-location", city);
		console.log("localStorage city: " + city);

		// Set categoryId == "", as default load for change location action == all categories
		var categoryId = "";

		// Set categoryName == "all events" for change location main heading feedback
		var categoryName = "all events";

		// Show fadeIn/fadeOut feedback to user for successful location set
		$('p.location-input-feedback').text(city + " location set successfully!").fadeIn(1000).fadeOut(2000);

		// Empty out the text that user just submitted
		$('.location-input').val("");

		// Set and format default date range for query search and search feedback heading string. Function will return object with date properties
		// Note: might want to revisit the possibility of setting date range to == localStorage dates, instead of default, in some cases
		var firstDate = null;
		var lastDate  = null;
		var dateObj   = eventObj.formatQueryDates(firstDate, lastDate);

		// Generate new result set, setting event categoryId to null & categoryName to "all events" to retrieve 'all events', and new city location as the location
		var dataObj = {
			city: city,
            categoryId: 	categoryId,
            categoryName: 	categoryName,
            startDate: 		dateObj.startDate,
            queryStartDate: dateObj.queryStartDate,
            endDate: 		dateObj.endDate,
            queryEndDate: 	dateObj.queryEndDate
		}
		// Execute the query
		eventObj.executeQueryUrl(dataObj);

		// Generate feedback message
		eventObj.getFeedbackMsg(dataObj);
	});

    // If user clicks on a favorites link from the right-side slider menu, get and generate event content boxes 
    // Event box content comes from data stored in the db; the key associated with the event will be the exact string of the data-category attr
    // This category string is plugged into the data retrieval db function
    $('.slider-favs').on('click', 'button', function() {

        // Close the slider panel
        $('#slider').slideReveal("hide");

        // Get the category name (same as db key) for the favorites bucket
        var category = $(this).data("category");
        console.log("category from li: " + category);

        // Find the category in the db under the user's record. THIS WORKS!!
        // Note: switched to favArray global, so that setTimeout generateFavContent() doesn't have to be passed a param (setTimeout doesn't like that)
        //var events = [];

        usersRef.child(userId).child("favCategories").child(category).on("child_added", function(snapshot) {
            eventObj.favArray.push(snapshot.val());
        });
        console.log("user events from fav slider click: " , eventObj.favArray);
        console.log("typeof Events: " + typeof eventObj.favArray);

        /* this gets the object, but I can't loop through it, I need to access it at the next level, and put each object into an array instead
        usersRef.child(userId).child("favCategories").child(category).once("value").then(function(snapshot) {
            events = snapshot.val();
            console.log("user events from fav slider click: " , events);
            console.log("typof Events: " + typeof events);
        });*/

        // Load the spinner to indicate processing. Note: spinner is removed inside of generateFavContent() function
        $('div.spinner-div').html('<div class="spinner">Loading...</div>');

        // Empty content here, before adding content
        $('.event-boxes').empty();

        // Update the heading (incorporate this into getFeedbackMsg() function eventually). or maybe not...bc it's pretty different...
        $('.header-span').text("Browsing your " + category + " event favorites");

        // Fake the 'delay', to simulate processing, or it will happen too fast
        setTimeout(eventObj.generateFavContent, eventObj.timeDelayFavContent);
    });

    // If user chooses to add a favorite (inside of the card slider) to an existing fave category, add the event info to the database under their favorites
    $('.event-boxes').on('click', '.add-to-category', function() {
        // Get the category favorite reference string
        var category = $(this).siblings('.card-reveal select').val();
        //console.log("category: " + category);
        
        // Validate the category selection
        if(category == "") {
            contentObj.showAlertModal("You didn't select a category!");
            return false;
        }

        // Get all remaining event information from the original event card.
        var dataObj = eventObj.getCardFavData($(this));

        // Now put the favorite into the database, under the correct user
        usersRef.child(userId).child("favCategories").child(category).push({
            date: dataObj.date,
            desc: dataObj.desc,
            name: dataObj.name,
            time: dataObj.time
        });

        // Now give feedback to the user that add was successful
        $(this).siblings('.add-fav-feedback').text("Event added to " + category + "!").fadeIn(1000).fadeOut(3000);

        // Return <select> to default <option>. Couldn't get this to work
        //$(this).siblings('select>option:eq(0)').prop('selected', true);
    });

    // If user chooses to add a favorite to a new category, add the event to the database, under the new category name
    // Note: will also need to update the select dropdowns with the new category, and add it to the side slider fav buttons list
    $('.event-boxes').on('click', '.category-icon', function() {
        console.log("add category icon clicked man!");
        // Get the new category name. Trim the text for any whitespace
        var category = $(this).siblings('.category-input').val().trim();
        //console.log("category: " + category);

        // Validate the input.  Do not allow it to be empty
        if(category == "") {
            contentObj.showAlertModal("You must enter a category title!");
            return false;
        }

        // Get all remaining event information from the original event card.
        var dataObj = eventObj.getCardFavData($(this));
        
        // Now add the new favorite into the database, under the correct user
        usersRef.child(userId).child("favCategories").child(category).push({
            date: dataObj.date,
            desc: dataObj.desc,
            name: dataObj.name,
            time: dataObj.time
        });

        // Now give feedback to the user that add was successful
        $(this).siblings('.add-fav-feedback').text("Event added to " + category + "!").fadeIn(1000).fadeOut(3000);

        // Clear out the input field after successful event addition
        $(this).siblings('.category-input').val('');
    });

	// Also allow user to submit city location input via keyboard enter key
	$('.location-input').keypress(function(e) {
		if(e.which == 13) {
			// Run the click handler for location input action
			$('.location-icon').click();
		}
	});
});
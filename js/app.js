'use strict';
var map, marker, infowindow;

//Model Information

var locations = [ //Location Data
    {
        name: 'Taj Mahal',
        lat: 27.175009,
        lng: 78.042091,
        url: 'http://tajmahal.gov.in'
        },
    {
        name: 'Qutab Minar',
        lat: 28.512972,
        lng: 77.186316 ,
        url: 'http://www.qutubminar.org/'
        },
    {
        name: 'Meenakshi Amman Temple',
        lat: 9.919505,
        lng: 78.119342 ,
        url: 'http://www.maduraimeenakshi.tnhrce.in/'
        },
    {
        name: 'Charminar',
        lat: 17.361564,
        lng: 78.474665,
        url: 'http://www.hyd.co.in/charminar/'
        },
    {
        name: 'Mysore Palace',
        lat: 12.305135,
        lng: 76.655148,
        url: 'http://mysorepalace.gov.in/'
        },
    {
        name: 'Hawa Mahal',
        lat:  26.923936,
        lng: 75.826744,
        url: 'http://www.hawa-mahal.com/'
        },
    {
        name: 'Victoria Memorial',
        lat: 22.544808,
        lng: 88.342558,
        url: 'http://www.victoriamemorial-cal.org/'
        },
    {
        name: 'Konark Sun Temple',
        lat:  19.887595,
        lng: 86.094536,
        url: 'http://www.konarksuntempleindia.com/'
        },
    {
        name: 'Harmandir Sahib',
        lat: 31.61998,
        lng: 74.876485 ,
        url: 'http://www.goldentempleamritsar.org/'
        },
    {
        name: 'Ajanta Caves',
        lat: 20.566868, 
        lng: 75.725096,
        url: 'https://www.maharashtratourism.gov.in/treasures/caves'
        }
    ];

var ViewModel = function () {
    var self = this;

    function placeInfo(data) { //Knockout Obsrvables
        self.name = ko.observable(data.name);
        self.url = ko.obsrvable(data.url);
        self.lat = ko.observable(data.lat);
        self.lng = ko.observable(data.lng);
        self.LatLng = ko.computed(function () {
            return self.lat() + self.lng();
        });
    }

    self.allPlaces = ko.observableArray(locations); //Will link location data to an observable data

    self.allPlaces().forEach(function (place) { //To create markers and infowindows for each location on the map
        marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(place.lat, place.lng),
            title: place.name,
            animation: google.maps.Animation.DROP,
            icon: 'icons/monument.png',
        });
        place.marker = marker;
        place.marker.addListener('click', toggleBounce);

        function toggleBounce() { //Function to bounce marker when clicked.
            if (place.marker.getAnimation() !== null) {
                place.marker.setAnimation(null);
            } else {
                place.marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    place.marker.setAnimation(null);
                }, 1000);
            }
        }
        google.maps.event.addListener(place.marker, 'click', function () { //Opens, populates and bounces infowindow when marker is clicked.
            if (!infowindow) {
                infowindow = new google.maps.InfoWindow();
            }

            //Wikipedia API
            var content;
            var infoNames = place.name;
            var infoURL = place.url;
            var urlNames = encodeURI(place.name);
            var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=" + urlNames + "&limit=1&redirects=return&format=json";

            self.apiTimeout = setTimeout(function () {
                alert('ERROR: Failed to load data');
            }, 5000);

            self.apiTimeout;
            $.ajax({
                url: wikiUrl,
                dataType: "jsonp",
                success: function (response) {
                    clearTimeout(self.apiTimeout);
                    var articleList = response[1];
                    console.log(response);
                    if (articleList.length > 0) {
                        for (var i = 0; i < articleList.length; i++) {
                            var articleStr = articleList[i];
                            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                            content = '<div class="info">' + '<h3 class="text-center" id="infoTitle">' + infoNames + '</h3>' + '<p>' + response[2] + '</p>' + '<a href="' + infoURL + '" target="_blank">' + infoURL + '</a>' + '</div>';
                            infowindow.setContent(content);
                        }
                    } else {
                        content = '<div class="info">' + '<h3 class="text-center" id="infoTitle">' + infoNames + '</h3>' + '<p>' + "Sorry, No Articles Found on Wikipedia" + '</p>' + '</div>';
                        infowindow.setContent(content);
                    }
                    infowindow.open(map, place.marker);
                    setTimeout(function () { //Closes infowindow after 9 seconds.
                        infowindow.close();
                    }, 9000);
                },
                error: (function () {
                    content = '<div class="info">' + '<h3 class="text-center" id="infoTitle">' + infoNames + '</h3>' + '<p>' + "Failed to reach Wikipedia Servers, please try again" + '</p>' + '</div>';
                    infowindow.setContent(content);
                })
            });

        });
    }); //End ForEach

    self.list = function (place, marker) {
        google.maps.event.trigger(place.marker, 'click'); //Links list to allPlaces marker information, so both have the same content.
    };
    // Search functionality on location names
    self.query = ko.observable(''); //Creates an observable for the search bar

    self.searchResults = ko.computed(function () {
        return ko.utils.arrayFilter(self.allPlaces(), function (list) {
            //Match search with items in sortedLocations() observable array
            var listFilter = list.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
            if (listFilter) { //if user input matches any of the brewery names, show only the matches
                list.marker.setVisible(true);
            } else {
                list.marker.setVisible(false); //hide markers and list items that do not match results
            }

            return listFilter;

        });
    });
}; //ViewModel End

//function initializeMap() { //Initializes map, marker, and infowindow data
function initializeMap() {
    //Map Data
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: {
            lat: 20.593684,
            lng: 78.96288 
        },
        zoom: 5,
        draggable: false,
        scrollwheel: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    ko.applyBindings(new ViewModel());
}

//Alerts user for an error with google.
function googleError() {
    alert("Google Has Encountered An Error.  Please Try Again Later");
    console.log('error');
}

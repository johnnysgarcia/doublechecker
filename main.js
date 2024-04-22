$(document).ready(function() {
    var scannedPages = {}; // To keep track of scanned pages

    $('#scanBtn').off().click(function() {
        var url = $('#url').val();
        var searchString = $('#searchString').val();
        clearResults(); // Clear existing results
        scanPage(url, searchString);
    });

    $('input[name="service"]').change(function() {
        if ($(this).val() === "all") {
            if ($(this).is(":checked")) {
                // Uncheck all other checkboxes and clear the services array
                $('input[name="service"]:not(:checked)').prop('checked', false);
                $('#searchString').val('');
            }
        } else {
            // Uncheck "All Services" checkbox if any other checkbox is checked
            $('#allServicesCheckbox').prop('checked', false);
        }
    });

    function scanPage(url, searchString) {
        if (scannedPages[url]) {
            return; // If page is already scanned, return
        }
        scannedPages[url] = true; // Mark the page as scanned
        
        //fetches the content of the URL 
        $.get(url, function(data) {
	        //returns a collection of all a tags with an href. 
            var links = $(data).find('a[href]');
            console.log('links is ' + links);
            displayLinks(url, links, searchString);
            
            //loops through all the links 
            links.each(function() {
                var href = $(this).attr('href');
                //if its an internal page, recursively call this function for that link
                if (isValidLink(href) && isInternalLink(href, url)) {
                    var absoluteUrl = getAbsoluteUrl(href, url);
                    scanPage(absoluteUrl, searchString); // Recursively scan each page on the domain
                }
            });
        });
    }

	//takes the page URL, the list of links on that page, and a search string if provided 
    function displayLinks(pageUrl, links, searchString) {
        var selectedServices = getSelectedServices();
        var $results = $('#results');
        var isFloater = false;
        //create a header for this page 
        $results.append('<h2>Website Page: <a href="' + pageUrl + '">' + pageUrl + '</a></h2>');
        $results.append('<h3>External links found:</h3>');
        var $externalLinksUl = $('<ul></ul>');
        //scans through links on the page. 
        links.each(function() {
            var href = $(this).attr('href');
           //checks for the fh-fixed--bottom class, currently I don't think the app registers the floater as this is always returning false
            isFloater = $(this).hasClass('fh-fixed--bottom');
            console.log(isFloater)
             //if the link is one we are searching for, call format link and append it to the list. 
            if (isValidLink(href) && isExternalLink(href) && (containsAnySelectedService(href, selectedServices) || selectedServices.length === 0) && containsSearchString(href, searchString)) {
                var formattedLink = formatExternalLink(href, isFloater);
                $externalLinksUl.append('<li>' + formattedLink + '</li>');
            }
        });
        $results.append($externalLinksUl);
    }

    function formatExternalLink(url, isFloater) {
	    // if the link is a fareharbor link, split up the values on the link 
        if (url.includes('fareharbor.com')) {
            var shortName = url.split('/')[5];
            var itemMatch = url.match(/items\/(\d+)/);
            var flowMatch = url.match(/flow=(\d+)/);
            var itemName = itemMatch ? itemMatch[1] : '';
            var flowName = flowMatch ? flowMatch[1] : '';
            //format listing depending on the service. 
            return '<div class="fh-button-true-flat fh-size--small fh-shape--round"><img class="fhlogo" src="images/fhlogo.png"> FareHarbor</div> <div class="fh-button-true-flat fh-size--small fh-shape--round">SN: ' + shortName + '</div> <div class="fh-button-true-flat fh-size--small fh-shape--round">Item: ' + itemName + '</div> <div class="fh-button-true-flat fh-size--small fh-shape--round">Flow: ' + flowName + '</div>';
        } else if (url.includes('peek.com')){
	        var link = url;
	        return '<div class="fh-button-true-flat-peek fh-size--small fh-shape--round fh-color--black"><img class="peeklogo" src="images/peeklogo.png"> Peek</div> ' + link;
        } else if (url.includes('rezdy')){
	        var link = url;
	        return '<div class="fh-button-true-flat-rezdy fh-size--small fh-shape--round fh-color--white"><img class="peeklogo" src="images/rezdylogo.jpeg"> Rezdy</div> ' + link;
        } else if (url.includes('trytn')){
	        var link = url;
	        return '<div class="fh-button-true-flat-trytn fh-size--small fh-shape--round fh-color--white"><img class="trytnlogo" src="images/trytnlogo.png"> Trytn</div> ' + link;
        } else if (url.includes('checkfront')){
	        var link = url;
	        return '<div class="fh-button-true-flat-checkfront fh-size--small fh-shape--round fh-color--white"><img class="fhlogo" src="images/checkfrontlogo.png"> Checkfront</div> ' + link;
        } else if (url.includes('regpack')){
	        var link = url;
	        return '<div class="fh-button-true-flat-regpack fh-size--small fh-shape--round fh-color--white"><img class="peeklogo" src="images/regpacklogo.png"> Regpack</div> ' + link;
        } else if (url.includes('bokun')){
	        var link = url;
	        return '<div class="fh-button-true-flat-bokun fh-size--small fh-shape--round fh-color--white"><img class="fhlogo" src="images/bokunlogo.png"> Bokun</div> ' + link;
        } else if (url.includes('lodgify')){
	        var link = url;
	        return '<div class="fh-button-true-flat-lodgify fh-size--small fh-shape--round fh-color--white"><img class="trytnlogo" src="images/lodgifylogo.png"> Lodgify</div> ' + link;
        } else if (url.includes('cloudbeds')){
	        var link = url;
	        return '<div class="fh-button-true-flat-cloudbeds fh-size--small fh-shape--round fh-color--white"><img class="fhlogo" src="images/cloudbedslogo.jpg"> CloudBeds</div> ' + link;
        } else if (url.includes('zerve')){
	        var link = url;
	        return '<div class="fh-button-true-flat-zerve fh-size--small fh-shape--round fh-color--black"><img class="peeklogo" src="images/zervelogo.png"> Zerve</div> ' + link;
        } else if (url.includes('calendly')){
	        var link = url;
	        return '<div class="fh-button-true-flat-calendly fh-size--small fh-shape--round fh-color--black"><img class="trytnlogo" src="images/calendlylogo.png"> Calendly</div> ' + link;
        } else if (url.includes('eventbrite')){
	        var link = url;
	        return '<div class="fh-button-true-flat-eventbrite fh-size--small fh-shape--round fh-color--black"><img class="fhlogo" src="images/eventbritelogo.png"> Eventbrite</div> ' + link;
        } else if (url.includes('trekksoft')){
	        var link = url;
	        return '<div class="fh-button-true-flat-trekksoft fh-size--small fh-shape--round fh-color--white"><img class="fhlogo" src="images/trekksoftlogo.png"> TrekkSoft</div> ' + link;
        } else if (url.includes('travefy')){
	        var link = url;
	        return '<div class="fh-button-true-flat-travefy fh-size--small fh-shape--round fh-color--black"><img class="fhlogo" src="images/travefylogo.png"> Travefy</div> ' + link;
        } else if (url.includes('anyroad')){
	        var link = url;
	        return '<div class="fh-button-true-flat-anyroad fh-size--small fh-shape--round fh-color--black"><img class="trytnlogo" src="images/anyroadlogo.png"> Anyroad</div> ' + link;
        } else if (url.includes('airbnb')){
	        var link = url;
	        return '<div class="fh-button-true-flat-airbnb fh-size--small fh-shape--round fh-color--black"><img class="trytnlogo" src="images/airbnblogo.png"> AirB&B</div> ' + link;
        } else if (url.includes('booqable')){
	        var link = url;
	        return '<div class="fh-button-true-flat-booqable fh-size--small fh-shape--round fh-color--black" style="border: 1px solid #000 !important;"><img class="peeklogo" src="images/booqablelogo.jpeg"> Booqable</div> ' + link;
        }else {
            return url;
        }
    }

    function getSelectedServices() {
        var selectedServices = [];
        $('input[name="service"]:checked').each(function() {
            var service = $(this).val();
            if (service !== "all") {
                selectedServices.push(service);
            }
        });
        return selectedServices;
    }

    function isValidLink(url) {
        return url && !url.startsWith('#') && !url.startsWith('/') && !url.includes('#') && !url.includes('javascript:void(0)');
    }

    function isExternalLink(url) {
        try {
            var hostname = new URL(url).hostname;
            var baseUrl = new URL($('#url').val()).hostname;
            return hostname !== baseUrl;
        } catch (error) {
            console.error("Invalid URL:", url);
            return false;
        }
    }

    function isInternalLink(href, baseUrl) {
        try {
            var absoluteUrl = getAbsoluteUrl(href, baseUrl);
            return absoluteUrl.startsWith(baseUrl);
        } catch (error) {
            console.error("Invalid URL:", href);
            return false;
        }
    }

    function containsAnySelectedService(url, services) {
        for (var i = 0; i < services.length; i++) {
            var serviceName = services[i].toLowerCase();
            if (url.toLowerCase().includes(serviceName)) {
                return true; // If any selected service name is found in the URL, return true
            }
        }
        return false; // If none of the selected service names are found in the URL, return false
    }

    function containsSearchString(url, searchString) {
        if (!searchString) {
            return true;
        }
        return url.toLowerCase().includes(searchString.toLowerCase());
    }

    function getAbsoluteUrl(href, baseUrl) {
        if (href.startsWith('http') || href.startsWith('//')) {
            return href; // Absolute URL
        } else if (href.startsWith('/')) {
            var url = new URL(baseUrl);
            return url.origin + href; // Absolute URL with same protocol and host as baseUrl
        } else {
            var lastIndex = baseUrl.lastIndexOf('/');
            return baseUrl.substring(0, lastIndex + 1) + href; // Relative URL
        }
    }

    function clearResults() {
        $('#results').empty(); // Empty the results container
        scannedPages = {}; // Reset scanned pages
    }
});

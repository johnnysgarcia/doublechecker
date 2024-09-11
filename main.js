$(document).ready(function() {
    var scannedPages = {}; // To keep track of scanned pages

    $('#scanBtn').off().click(function() {
        var url = $('#url').val();
        var searchString = $('#searchString').val();
        clearResults(); // Clear existing results
        clearError();
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

    async function scanPage(url, searchString) {
    if (scannedPages[url]) {
        console.log(`Already scanned: ${url}`);
        return; // If page is already scanned, return
    }
    scannedPages[url] = true; // Mark the page as scanned

    try {
        console.log(`Fetching: ${url}`);
        // Fetches the content of the URL
        const data = await $.get(url);
        // Returns a collection of all <a> tags with an href
        const links = $(data).find('a[href]');
        //console.log(`Found ${links.length} links on ${url}`);
        const scripts = $(data).find('script');
        console.log(`Found ${scripts.length} scripts on ${url}`);

        displayLinks(url, links, scripts, searchString);
        // Create an array of promises for recursive scanning
        const scanPromises = [];
        // Loops through all the links
        links.each(function() {
            const href = $(this).attr('href');
            const absoluteUrl = new URL(href, url).href;
            console.log(absoluteUrl)
            // If it's an internal page, recursively call this function for that link
            if (isValidLink(absoluteUrl) && isInternalLink(absoluteUrl, url)) {
                console.log(`Queueing scan for: ${absoluteUrl}`);
                scanPromises.push(scanPage(absoluteUrl, searchString)); // Add the promise to the array
            }
        });

        // Wait for all recursive scans to complete
        await Promise.all(scanPromises);
    } catch (error) {
      //error thrown with phones and emails, should fix when removing these links.
      var $errorDiv = $('#errorBox');
      //if ($errorDiv.html() === ""){
      $errorDiv.append('<p><div><h3>Error:</h3>'+  url + '<p>Ensure that the link is secure <strong>(prepended with https://)</strong> and the <strong><a href="https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=en&pli=1">Allow CORS</a></strong> chrome extension is active on your browser.</p><div>');
//}
        console.error(`Error scanning page ${url}:`, error);
    }
}

	//takes the page URL, the list of links on that page, and a search string if provided
    function displayLinks(pageUrl, links, scripts, searchString) {
        var selectedServices = getSelectedServices();
        var $results = $('#results');
        var isFloater = false;
        //create a header for this page
        $results.append('<h2>Website Page: <a href="' + pageUrl + '">' + pageUrl + '</a></h2>');
        var $externalLinksUl = $('<ul></ul>');
        var $linksFound = false;
        //scans through links on the page.

        scripts.each(function(){
          var scriptSrc = $(this).attr('src');
          formatExternalScript(scriptSrc);
        })

        links.each(function() {
            var href = $(this).attr('href');
           //checks for the fh-fixed--bottom class, currently I don't think the app registers the floater as this is always returning false
            isFloater = $(this).hasClass('fh-fixed--bottom');
             //if the link is one we are searching for, call format link and append it to the list.
            if (isValidLink(href) && isExternalLink(href) && (containsAnySelectedService(href, selectedServices) || selectedServices.length === 0) && containsSearchString(href, searchString)) {
                var formattedLink = formatExternalLink(href, isFloater);
                $externalLinksUl.append('<li>' + formattedLink + '</li>');
                $linksFound = true;
            }
        });
        if ($linksFound){
          $externalLinksUl.prepend('<h3>Matching Links:</h3>');
        }
        $results.append($externalLinksUl);
    }

    function formatExternalScript(scriptSrc){
      //Johnny needs to build out some functionality here.
      if (scriptSrc.includes('fareharbor.com')){
        var shortname = '';
        var flow = '';
        var item = '';
        var scriptType = '';
        console.log(shortname)
      }
    }

    function formatExternalLink(url, isFloater) {
        // if the link is an email, phone number, or socials return empty
        if (url.includes('mailto:') || 
        url.includes('tel:') || 
        url.includes('facebook.com') || 
        url.includes('twitter.com') || 
        url.includes('instagram.com') || 
        url.includes('linkedin.com') || 
        url.includes('youtube.com') || 
        url.includes('pinterest.com') || 
        url.includes('tiktok.com') ||
        url.includes('vimeo') ||
        url.includes('yelp') ||
        url.includes('tripadvisor') ||
        url.includes('snapchat.com')) {
        return '';
    }  
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

    function clearError(){
      $('#errorBox').empty();
    }
});

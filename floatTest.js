$(document).ready(function() {
    // Function to search for the <a> tag with the 'fh' class
    function searchForFHClass() {
        let found = false;
        $('a').each(function() {
            const classList = $(this).attr('class');
            if (classList && classList.includes('fh')) {
                found = true;
                console.log("Found an <a> tag with 'fh' class: ", classList);
                appendFloaterMessage();
            }
        });

        if (!found) {
            console.log("No <a> tags with 'fh' class found in this scan.");
        }
    }

    // Function to append the floater message
    function appendFloaterMessage() {
        var $externalLinksUl = $('<ul></ul>'); // Assuming you're appending to an existing list
        $externalLinksUl.append('<div>Has Floater</div>');
        $('#results').append($externalLinksUl); // Append to the results or desired location
    }

    // Polling mechanism that runs every 2 seconds
    const intervalId = setInterval(function() {
        console.log('Polling DOM for <a> tags with "fh" class...');
        searchForFHClass();
    }, 2000);

    // Optionally, stop the interval after a certain amount of time (e.g., 30 seconds)
    setTimeout(function() {
        clearInterval(intervalId);
        console.log("Stopped polling for <a> tags with 'fh' class.");
    }, 30000); // Stops after 30 seconds
});

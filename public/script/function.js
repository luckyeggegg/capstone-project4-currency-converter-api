$(document).ready(function() {

    // debounce() to control the data-sending frequency
    // This is the declaration of the debounce function. It takes two parameters: func, which is the function to be debounced, and wait, which is the number of milliseconds to delay before invoking func.
    function debounceSoucrce(func, wait) {
        var timeout;    // This variable is used to keep a reference to the timer that controls the delay. It is declared outside the returned function so that it is shared across all invocations of the returned function.
    
        return function() { // The debounce function returns a new function that actually gets called whenever the event (like input) occurs. This returned function is what manages the debouncing behavior.
            var context = this, args = arguments;   // Inside the returned function, context is set to this to capture the value of this when the function is invoked (which depends on the context in which it is called). args is set to arguments, which is an array-like object containing all the arguments passed to the function.
            clearTimeout(timeout);  // Each time the returned function is invoked, it clears the previous timer set by setTimeout. This means that if the event is triggered again before the wait time has passed, the previously scheduled execution of func is canceled.
            timeout = setTimeout(function() {   //This sets a new timer that will invoke the function after wait milliseconds have passed. If no new events occur within that time, the function inside setTimeout will execute.

                timeout = null; // Once the timer executes and the function is called, timeout is set to null, indicating that the function has been executed and can be scheduled again.
                func.apply(context, args);  // Finally, func is called using apply, which allows you to invoke the function with a specific value of this (context) and the arguments (args) that were originally passed to the debounced function.
            }, wait);
        };
    }
    
    // Function to handle sending of data, debounced
    var handleDataSentSourceDebounced = debounceSoucrce(function() {
        handleDataSentSource();
    }, 2000); // Wait for 2000ms after the last event to call the function

    var handleDataSentTargetDebounced = debounceSoucrce(function() {
        handleDataSentTarget();
    }, 2000); // Wait for 2000ms after the last event to call the function
    

    // Function to handle sending of data
    function handleDataSentSource() {
        var currencySource = $("#code-selected-source").text().trim();
        var amountSource = $("#source-amount").val();
        var currencyTarget = $("#code-selected-target").text().trim();

        // Ensure that amountSource is not empty or negative before sending
        if (amountSource != "" && parseFloat(amountSource) >=0 ) {
            sendSourceCurrencyAndAmount(currencySource, amountSource, currencyTarget);
        }
    }

    // Function to handle sending of data
    function handleDataSentTarget() {
        var currencySource = $("#code-selected-source").text().trim();
        var amountTarget = $("#amount-amount").val();
        var currencyTarget = $("#code-selected-target").text().trim();

        // Ensure that amountSource is not empty or negative before sending
        if (amountTarget != "" && parseFloat(amountTarget) >=0 ) {
            sendTargetCurrencyAndAmount(currencySource, amountTarget, currencyTarget);
        }
    }
    
    function sendSourceCurrencyAndAmount(currencySource, amountSource, currencyTarget) {
        // Use jQuery's ajax method to send data to the server asynchronously
        $.ajax({
            url: "/receive-data-from-source", // The URL of the server endpoint
            method: "POST",
            contentType: "application/json", // The MIME type of the content being sent to the server
            
            // Convert the data object to a JSON string for sending
            data: JSON.stringify({ 
                currencySource: currencySource,
                amountSource: amountSource,
                currencyTarget: currencyTarget }),

            success: function(response) {   // Define a function to be called if the request succeeds
                console.log("Data sent successfully: ", response);

                // Update the DOM with the new conversion rate and amountTarget
                if (response.conversion_rate) {
                    $(".conversion-rate-display").text("1 " + $("#code-selected-source").text().trim() + " = " + response.conversion_rate + " " + $("#code-selected-target").text().trim());
                }
                if (response.amountTarget) {
                    $("#target-amount").val(response.amountTarget.toFixed(2));  // toFixed(2) is used to format the number to two decimal places
                }
            },
            error: function(error) {    // Define a function to be called if the request fails
                console.log("Error sending data: ", error)
            }
        })
    };


    function sendTargetCurrencyAndAmount(currencySource, amountTarget, currencyTarget) {
        $.ajax({
            url: "/receive-data-from-target", 
            method: "POST",
            contentType: "application/json", 

            data: JSON.stringify({ 
                currencySource: currencySource,
                amountTarget: amountTarget,
                currencyTarget: currencyTarget }),

            success: function(response) {  
                console.log("Data sent successfully: ", response);


                if (response.conversion_rate_reverse) {
                    $(".conversion-rate-display").text("1 " + $("#code-selected-source").text().trim() + " = " + response.conversion_rate_reverse + " " + $("#code-selected-target").text().trim());
                }
                if (response.amountSource) {
                    $("#source-amount").val(response.amountSource.toFixed(2)); 
                }
            },
            error: function(error) {
                console.log("Error sending data: ", error)
            }
        })
    };



    // Toggle dropdown
    $("#source-selected").click(function() {
        $("#source-dropdown").slideToggle("fast");
    });

    // Select a currency
    $("#source-dropdown li").click(function() {
        // var currencySource = $(this).data("value");
        var newCodeSelectedSource = $(this).text();
        
        // replace the currency selected
        $("#code-selected-source").text(newCodeSelectedSource);
        $("#flag-source").attr("class", $(this).find("span").attr("class"));
        // hide the dropdown list
        $("#source-dropdown").hide();

        // Call handleDataSend to attempt to send data
        handleDataSentSourceDebounced();

    });

    $("#source-amount").on("input", function() {
        // Call handleDataSend to attempt to send data
        handleDataSentSourceDebounced();
    });

    // Close dropdown when clicking outside
    $(document).on("click", function(event) {
        // Check if the click event target is not a descendant of '#custom-source'
        if (!$(event.target).closest("#custom-source").length) {
            $("#source-dropdown").hide();
        }
    });

    // Toggle dropdown
    $("#target-selected").click(function() {
        $("#target-dropdown").slideToggle("fast");
    });

    // Select a currency
    $("#target-dropdown li").click(function() {
        var newCodeSelectedtarget = $(this).text();
        
        // replace the currency selected
        $("#code-selected-target").text(newCodeSelectedtarget);
        $("#flag-target").attr("class", $(this).find("span").attr("class"));
        // hide the dropdown list
        $("#target-dropdown").hide();

        // Call handleDataSend to attempt to send data
        handleDataSentSourceDebounced();

    });

    
    $("#target-amount").on("input", function() {
        // Call handleDataSend to attempt to send data
        handleDataSentTargetDebounced();
    });

    // Close dropdown when clicking outside
    $(document).on("click", function(event) {
        // Check if the click event target is not a descendant of '#custom-target'
        if (!$(event.target).closest("#custom-target").length) {
            $("#target-dropdown").hide();
        }
    });






});
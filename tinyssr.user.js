// ==UserScript==
// @name         Collapsible SSR Display
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  create a new, collapsible display for the Woo SSR to make it more readable
// @author       Timothy Volpert
// @downloadURL  https://github.com/tvolpert/a8c-hacks/raw/main/tinyssr.user.js
// @updateURL    https://github.com/tvolpert/a8c-hacks/raw/main/tinyssr.user.js
// @match        https://*.zendesk.com/agent/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zendesk.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // multi-chat logic: GO
    setInterval(makeItPretty, 5000); // zendesk is terrible about event triggers so we'll still just try to do this every 5 seconds
    function makeItPretty() {
        let siteBoxes = document.querySelectorAll('.sidebar_box_container'); //find sidebars for all open chats/tickets
        siteBoxes.forEach(prettify);
    }
    function prettify(item) {
        // set up our patterns
        let pattern = /(### .+ ###)\n\n([^#]+)/gm;
        let findURL = /(?<=Site address \(URL\): )(.+)/;
        // look for our element to see what has already been done
        let pretty = item.querySelector('.prettyssr .actual');
        // get the text of the SSR
        let theText = item.querySelector('div.custom_field_22871957 textarea')
        if (theText != null && theText.textContent != null) {
            let raw = theText.textContent;
            let currentSiteURL;
            if (raw.match(findURL) != null) {currentSiteURL = raw.match(findURL)[0]; }
            if (raw =='' | typeof(raw) == undefined | raw == null) {
                console.log('no SSR found!');
                if (pretty != null){
                    pretty.innerHTML = 'No SSR provided';
                }
            } else if (pretty != null && currentSiteURL != null && pretty.innerHTML.includes(currentSiteURL)) { //if the site URL is already present in our SSR, do nothing
                console.log('the SSR for ' + currentSiteURL + ' is already in place!');
            } else if (raw != '') { // only do this if there's something in the SSR box
                console.log('SSR found, cleaning up')
                //this is where the actual reformatting happens 
                //first remove #s used as number signs that might break our formatting
                let hashies = /#(?=\d+)/gm;
                raw = raw.replaceAll(hashies, '');

                // make formatted URL a link (if present)
                let theURL = /(View formatted: )(https:\/\/woocommerce\.com.+)/;
                let theLink = `<a href="$2" target="_blank" class="button">View formatted</a>`
                raw = raw.replace(theURL, theLink)

                // reformat SSR with collapsible boxes
                let newPattern = `<details class="ssr-section"><summary>$1<\/summary>$2<\/details>`;
                let cooked = raw.replaceAll(pattern, newPattern);
                cooked = cooked.replaceAll('\n', '</p><p>');
                cooked = cooked.replaceAll('`', '');
                //end actual reformatting

                if (typeof(pretty) == 'undefined' | pretty == null) { //if our element doesn't exist yet, make one
                    console.log('creating a pretty lil element');

                    // create a new element to display the reformatted SSR
                    let prettySSR = document.createElement('div');
                    prettySSR.classList = "prettyssr property_box";
                    prettySSR.innerHTML = '<div><h5>System Status Report (pretty)</h5><div class="actual">' + cooked + '</div></div>';

                    // insert our new element into the sidebar, at the top
                    let propertyBox = item.querySelector('.property_box');
                    item.insertBefore(prettySSR, propertyBox);
                } else { //if element exists but is empty or has a different site, plop the new one in
                    console.log("new site, refreshing SSR");
                    pretty.innerHTML = cooked;
                }
            } 
        }
        
    }
})();

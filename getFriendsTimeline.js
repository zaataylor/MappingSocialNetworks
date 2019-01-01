//Gets the link correspond to the "Friends Timeline" page, and get's current user's Facebook name

var link;
$(document).ready(function () {

    //getting link to "Friends Timeline" page
    var link = $("ul li a[data-tab-key=friends]").attr("href");
    //getting name
    var name = $("#fb-timeline-cover-name").text();
    if ((link != undefined || link != "") && (name != undefined || name != "")) {
        //pass this link via a message to the background script
        chrome.runtime.sendMessage({ from: "getFriendsTL", pageUrl: link, displayName: name })
    }
})

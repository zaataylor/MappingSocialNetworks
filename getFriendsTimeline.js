//go to friends page and get links to friends pages timeline

var link;
$(document).ready(function () {
    //searching for unordered list items with link/append attributes
    var result = $("ul").children("li").children("a");
    //chrome.runtime.sendMessage("b", function(){})
    //message registers as being sent from main profile page

    //for each one we find, seeing if data-tab-key attribute equals "friends"
    $(result).each(function(){
        if($(this).attr("data-tab-key") == "friends") {
            link = $(this).attr("href");
            //if so, store this link for later use
            chrome.storage.sync.set({'friendTimelineURL': link}, function(){
                
            })
            //chrome.runtime.sendMessage("c", function(){})
        }
    })
})

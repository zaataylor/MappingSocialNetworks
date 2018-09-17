//go to Friends page and get links to Friends page timeline using jQuery

var link;
$(document).ready(function () {
    
    //searching for friends link
    var link = $("ul li a[data-tab-key=friends]").attr("href");
    if(link != undefined || link != ""){
        //pass this link via a message to the background script
        chrome.runtime.sendMessage({from: "getFriendsTL", pageUrl: link}, function(response){
            console.log(response.pageUrl)
        })
    }
})

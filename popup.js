//popup.js
var buttonClicked = document.getElementById('touchToMap');

var timelineURL;
var tabIndex;

//executed when the blue button described in popup.html is clicked
buttonClicked.onclick = function(){

    tabHelper("getFriendsTimeline.js");

    chrome.storage.sync.get('friendTimelineURL', function(obj){
        timelineURL = obj.friendTimelineURL;
        chrome.tabs.create({url: timelineURL, active: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, )
        })
    })
}



function tabHelper(scriptToInject) {
    //get the current tab the user is on
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        //inject jQuery script so it can be used later
        chrome.tabs.executeScript(tabs[1].id, {file: "jquery-3.3.1.min.js"}, function(){
            //inject relevant script
            chrome.tabs.executeScript(tabs[1].id, {file: scriptToInject}, function(){
                
            })
        })
    })
}

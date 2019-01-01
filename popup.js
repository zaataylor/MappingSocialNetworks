//controls what happens when popup (a button) is clicked
var button = document.getElementById('touchToMap');

//executed when the blue button described in popup.html is clicked
button.onclick = function () {
    chrome.runtime.sendMessage({from: "popup"})
}

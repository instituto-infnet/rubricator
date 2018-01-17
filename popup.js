/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */

function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(url);
  });

}

function send(rubricas) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(tab.id, {action:'modify', data: rubricas}, function(response) {});
  });
}

function getValue() {
  var content = document.getElementById('rubrics').value.split(/\n/);
  var lines = [];

  for (var i = 0; i < content.length; i++){
    if (content[i]) {
      lines.push(content[i]);
    }
  }
  return lines;
}

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var log = document.getElementById('log');
    var button = document.getElementById("send");

    button.addEventListener("click", function() {
      console.log("Rubricator!");
      send(getValue());
    }, false);
  });
});

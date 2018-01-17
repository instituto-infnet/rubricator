var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
  s.parentNode.removeChild(s);
};

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
  if (request.action == 'modify')
    var rubrics = [];
    if(request.data.length > 0){
      rubrics = request.data;
    }

    var tableCriteria = document.getElementById('rubric-criteria');
    var tbody = tableCriteria.children;
    var firstRow = tbody[0].childNodes;

    var btnAddItem = document.getElementById('rubric-criteria-addcriterion');
    var arrayObj = rubrics;
    var lvlObj = ["Demonstrou competência", "Não demonstrou competência"];
    var size = arrayObj.length - 1;

    // add Campos
    for(var i = 0; i < size; i++){
      btnAddItem.click();
    }

    // remove terceira coluna do critério
    for(var j = 0; j < arrayObj.length; j++){
      var level2 = tbody[0].childNodes[j].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[1];
      level2.remove();
    }

    // add texto do item de rubrica e levels
    for(var h = 0; h < arrayObj.length; h++){
      var descriptionNode = tbody[0].childNodes[h].childNodes[1];
      var descriptionNodeTextArea = descriptionNode.childNodes[0];
      var descriptionNodeSpan = descriptionNode.childNodes[1].childNodes[1];

      var levelD = tbody[0].childNodes[h].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
      var levelND = tbody[0].childNodes[h].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[1];

      var levelDTextArea = levelD.childNodes[0].childNodes[0].childNodes[0];
      var levelDSpan = levelD.childNodes[0].childNodes[0].childNodes[1].childNodes[1];

      var levelNDTextArea = levelND.childNodes[0].childNodes[0].childNodes[0];
      var levelNDSpan = levelND.childNodes[0].childNodes[0].childNodes[1].childNodes[1];

      descriptionNodeTextArea.innerText = arrayObj[h];
      descriptionNodeSpan.innerText = arrayObj[h];

      levelDTextArea.innerText = lvlObj[0];
      levelDSpan.innerText = lvlObj[0];

      levelNDTextArea.innerText = lvlObj[1];
      levelNDSpan.innerText = lvlObj[1];
    }

  sendResponse({});
});

chrome.extension.sendRequest({action:'show'}, function(response) {});


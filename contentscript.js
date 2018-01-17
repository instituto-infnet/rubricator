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
    console.log(firstRow);

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
      var level3 = tbody[0].childNodes[j].childNodes[2].childNodes[0].childNodes[0].childNodes[0].childNodes[2];
      level3.remove();
      level2.classList.add('last');
    }

    // add texto do item de rubrica e levels
    for(var h = 0; h < arrayObj.length; h++){
      var descriptionNode = tbody[0].childNodes[h].childNodes[1];
      var descriptionNodeTextArea = descriptionNode.childNodes[0];
      var descriptionNodeSpan = descriptionNode.childNodes[1].childNodes[1];

      var levels = tbody[0].childNodes[h].childNodes[2].childNodes[0].childNodes[0].childNodes[0];

      var d =  levels.childNodes[0];
      var nd = levels.childNodes[1];

      var levelDTextArea = d.childNodes[0].childNodes[0].childNodes[0];
      var levelDSpan = d.childNodes[0].childNodes[0].childNodes[1].childNodes[1];

      var levelNDTextArea = nd.childNodes[0].childNodes[0].childNodes[0];
      var levelNDSpan = nd.childNodes[0].childNodes[0].childNodes[1].childNodes[1];

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


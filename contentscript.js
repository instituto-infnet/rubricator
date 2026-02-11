var s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
(document.head || document.documentElement).appendChild(s);
s.onload = function() {
    s.remove();
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'modify') {
        var arrayObj = request.data || [];
        var tableCriteria = document.getElementById('rubric-criteria');
        var btnAddItem = document.getElementById('rubric-criteria-addcriterion');

        if (!tableCriteria || !btnAddItem) return;

        var existingRows = tableCriteria.querySelectorAll('tr.criterion').length;
        var neededRows = arrayObj.length;

        if (neededRows > existingRows) {
            for (var i = 0; i < (neededRows - existingRows); i++) {
                btnAddItem.click();
            }
        }

        setTimeout(function() {
            var rows = tableCriteria.querySelectorAll('tr.criterion');
            var lvlObj = ["Não demonstrou o item de rubrica", "Demonstrou o item de rubrica"];

            rows.forEach(function(row, h) {
                if (!arrayObj[h]) return;

                const fillMoodleField = (container, text) => {
                    const tx = container.querySelector('textarea');
                    const displayDiv = container.querySelector('.plainvalue');
                    const displayText = container.querySelector('.textvalue');
                    
                    if (tx) {
                        tx.value = text;
                        tx.classList.remove('hiddenelement'); 
                        tx.dispatchEvent(new Event('input', { bubbles: true }));
                        tx.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    
                    if (displayText) {
                        displayText.innerText = text;
                    }

                    if (displayDiv) {
                        displayDiv.classList.remove('empty'); 
                    }
                };

                var descNode = row.querySelector('td.description');
                if (descNode) fillMoodleField(descNode, arrayObj[h]);

                var levels = row.querySelectorAll('td.level');
                levels.forEach(function(level, idx) {
                    if (idx > 1) {
                        level.remove();
                    } else if (lvlObj[idx]) {
                        fillMoodleField(level, lvlObj[idx]);
                    }
                });
            });
            
            sendResponse({status: "success"});
        }, 1000); 
    }
    return true;
});

chrome.runtime.sendMessage({action: 'show'}, function(response) {
    if (chrome.runtime.lastError) {}
});
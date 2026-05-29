/**
 * Rubricator - Content Script
 * Finalidade: Injetar rubricas no Moodle tratando quebras de linha e colunas dinâmicas.
 */

// Injeção do script auxiliar caso necessário
var s = document.createElement('script');
s.src = chrome.runtime.getURL('script.js');
(document.head || document.documentElement).appendChild(s);
s.onload = function() {
    s.remove();
};

// --- ESTILIZAÇÃO GLOBAL ---
const style = document.createElement('style');
style.innerHTML = `
    /* Ataca a tabela de critérios, descrições e definições de níveis */
    #rubric-criteria td.description,
    #rubric-criteria .definition,
    .rubric .description, 
    .rubric .level,
    .gradingform_rubric td,
    .gradingform_rubric .text-break,
    .gradingform_rubric .description,
    .gradingform_rubric .level {
        white-space: pre-wrap !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        min-height: 1em !important;
    }

    /* Força para o modo leitura/visualização */
    .gradingform_rubric.readonly .description,
    .gradingform_rubric.readonly .level {
        white-space: pre-wrap !important;
    }
`;
document.head.appendChild(style);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("=== [Rubricator] Mensagem recebida ===");

    if (request.action === 'modify') {
        var rawData = request.data || [];
        var arrayObj = [];

        // --- 1. TRATAMENTO DO TEXTO E QUEBRAS DE LINHA ---
        if (Array.isArray(rawData)) {
            arrayObj = rawData.map(function(item) {
                if (typeof item === 'string' && item.includes(';')) {
                    // Substitui ponto e vírgula por quebra de linha real
                    return item.split(';').map(s => s.trim()).join('\n');
                }
                return item;
            });
        }

        var tableCriteria = document.getElementById('rubric-criteria');
        var btnAddItem = document.getElementById('rubric-criteria-addcriterion');

        if (!tableCriteria || !btnAddItem) {
            console.error("[Rubricator] Erro: Elementos nativos do Moodle não encontrados.");
            return;
        }

        // --- 2. GERENCIAMENTO DE LINHAS (CRITÉRIOS) ---
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
            var targetLevels = 2;

            if (request.tipoRubrica === 'quadruplo') {
                lvlObj = ["ND", "D", "DL", "DML"];
                targetLevels = 4;
            }

            const fillMoodleField = (container, text) => {
                const tx = container.querySelector('textarea');
                const displayDiv = container.querySelector('.plainvalue');
                const textValue = container.querySelector('.textvalue');
                
                if (tx) {
                    tx.focus();
                    tx.value = text;
                    
                    tx.dispatchEvent(new Event('input', { bubbles: true }));
                    tx.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    setTimeout(() => { tx.blur(); }, 50);
                }
                
                if (textValue) {
                    textValue.style.whiteSpace = "pre-wrap";
                    textValue.innerText = text;
                }

                if (displayDiv) {
                    displayDiv.classList.remove('empty'); 
                }
            };

            // --- 3. PROCESSAMENTO DE CADA LINHA ---
            rows.forEach(function(row, h) {
                if (!arrayObj[h]) return;

                var descNode = row.querySelector('td.description');
                if (descNode) fillMoodleField(descNode, arrayObj[h]);

                var btnAddLevel = row.querySelector('input[name*="addlevel"], .addlevel input');
                
                var injectLevels = () => {
                    var levels = row.querySelectorAll('td.level');
                    
                    if (levels.length < targetLevels && btnAddLevel) {
                        btnAddLevel.click();
                        setTimeout(injectLevels, 150);
                        return;
                    }

                    levels.forEach(function(level, idx) {
                        if (idx >= targetLevels) {
                            if (request.tipoRubrica !== 'quadruplo') level.remove();
                        } else if (lvlObj[idx]) {
                            fillMoodleField(level, lvlObj[idx]);
                        }
                    });
                };

                injectLevels();
            });
            
            console.log("=== [Rubricator] Injeção Finalizada com Sucesso ===");
            sendResponse({status: "success"});
        }, 1000); 
    }
    return true;
});

chrome.runtime.sendMessage({action: 'show'}, function(response) {
    if (chrome.runtime.lastError) {
        // ignore
    }
});
function getCurrentTab(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error("[Rubricator Popup] Erro ao buscar aba:", chrome.runtime.lastError);
      return;
    }
    var tab = tabs[0];
    callback(tab);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.getElementById('btn-enviar');
  const rubricTextArea = document.getElementById('rubric-text');

  if (!btnEnviar || !rubricTextArea) {
    console.error("[Rubricator Popup] Erro: IDs do HTML não encontrados.");
    return;
  }

  btnEnviar.addEventListener('click', () => {
    console.log("[Rubricator Popup] Iniciando processamento...");
    
    const textoBruto = rubricTextArea.value.trim();
    if (!textoBruto) {
      alert('Por favor, insira o texto da rubrica.');
      return;
    }

    const radioSelecionado = document.querySelector('input[name="tipo_rubrica"]:checked');
    const tipoRubrica = radioSelecionado ? radioSelecionado.value : 'padrao';

    const linhas = textoBruto.split('\n');
    let arrayCompetencias = [];
    let blocoAcumulado = "";

    linhas.forEach((linha) => {
      let linhaLimpa = linha.trim();
      if (linhaLimpa === "") return; 

      if (blocoAcumulado === "") {
        blocoAcumulado = linhaLimpa;
      } else {
        blocoAcumulado += "\n" + linhaLimpa;
      }

      const terminaComPontoEVirgula = linhaLimpa.endsWith(';');
      const terminaComTag = linhaLimpa.endsWith(']');

      if (!terminaComPontoEVirgula && !terminaComTag) {
        arrayCompetencias.push(blocoAcumulado);
        blocoAcumulado = ""; // Reseta o acumulador para a próxima competência
      }
    });

    if (blocoAcumulado !== "") {
      arrayCompetencias.push(blocoAcumulado);
    }

    console.log("[Rubricator Popup] Enviando competências:", arrayCompetencias);

    getCurrentTab((tab) => {
      if (!tab) {
        alert("Erro: Aba ativa não encontrada.");
        return;
      }

      chrome.tabs.sendMessage(tab.id, {
        action: 'modify',
        data: arrayCompetencias,          
        tipoRubrica: tipoRubrica   
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error("[Rubricator Popup] Erro:", chrome.runtime.lastError.message);
          alert("Erro: Recarregue a página do Moodle (F5) antes de usar.");
          return;
        }
        
        if (response && response.status === 'success') {
          window.close(); 
        }
      });
    });
  });
});
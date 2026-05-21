// Log inicial para confirmar o carregamento no console do popup
console.log("[Rubricator Popup] Script carregado com sucesso.");

/**
 * Captura a aba ativa no navegador para enviar a mensagem
 */
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

/**
 * Evento principal disparado ao abrir a janelinha (popup)
 */
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

    // Captura a escolha do modelo de rubrica
    const radioSelecionado = document.querySelector('input[name="tipo_rubrica"]:checked');
    const tipoRubrica = radioSelecionado ? radioSelecionado.value : 'padrao';

    /**
     * LÓGICA DE VARREDURA INTELIGENTE
     * Analisa linha por linha para decidir o agrupamento.
     */
    const linhas = textoBruto.split('\n');
    let arrayCompetencias = [];
    let blocoAcumulado = "";

    linhas.forEach((linha) => {
      let linhaLimpa = linha.trim();
      if (linhaLimpa === "") return; // Ignora linhas vazias

      // Adiciona a linha ao acumulador
      if (blocoAcumulado === "") {
        blocoAcumulado = linhaLimpa;
      } else {
        // Mantém a quebra de linha visual para que o Moodle exiba corretamente
        blocoAcumulado += "\n" + linhaLimpa;
      }

      /**
       * REGRA DE FECHAMENTO (Ajustada para o seu teste):
       * Uma competência só é enviada para o array quando:
       * 1. A linha NÃO termina com ";" (Ponto e vírgula)
       * 2. E a linha NÃO termina com "]" (Evita quebrar após tags de título como [/c])
       */
      const terminaComPontoEVirgula = linhaLimpa.endsWith(';');
      const terminaComTag = linhaLimpa.endsWith(']');

      if (!terminaComPontoEVirgula && !terminaComTag) {
        arrayCompetencias.push(blocoAcumulado);
        blocoAcumulado = ""; // Reseta o acumulador para a próxima competência
      }
    });

    // Segurança: Se sobrou algo no acumulador após o loop (ex: última linha com ponto e vírgula)
    if (blocoAcumulado !== "") {
      arrayCompetencias.push(blocoAcumulado);
    }

    console.log("[Rubricator Popup] Enviando competências:", arrayCompetencias);

    // Envio para o Content Script
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
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('send'); 
  const textarea = document.getElementById('rubrics');

  if (btn) {
    btn.addEventListener('click', function () {
      const data = textarea.value.split('\n').filter(line => line.trim() !== '');

      if (data.length === 0) {
        console.warn("Nenhuma rubrica para enviar.");
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] && tabs[0].id) {
          if (!tabs[0].url || tabs[0].url.startsWith('chrome://')) {
            console.error("Não é possível executar nesta página.");
            return;
          }

          chrome.tabs.sendMessage(tabs[0].id, { action: 'modify', data: data }, function (response) {
            if (chrome.runtime.lastError) {
              console.error("Aba não pronta ou script não carregado. Tente atualizar a página do Moodle (F5).");
            } else {
              console.log("Comando enviado com sucesso!");
            }
          });
        }
      });
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'show') {
    const status = document.getElementById('status');
    if (status) status.innerText = "Pronto!";
  }
  sendResponse({ status: "ok" });
});
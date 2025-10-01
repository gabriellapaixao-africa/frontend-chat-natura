const BACKEND_URL = 'https://gemini-looker-chat-868810243218.southamerica-east1.run.app'; 
const generateButton = document.getElementById('generate-button');
const responseContainer = document.getElementById('response-container');

generateButton.addEventListener('click', async () => {
    // Desabilita o botão e mostra a mensagem de "carregando"
    generateButton.disabled = true;
    responseContainer.innerHTML = '<p class="placeholder">Gerando insights, por favor aguarde... Isso pode levar alguns segundos.</p>';

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // O corpo agora pode ser vazio, pois o backend sabe o que fazer
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.text || `Erro na rede: ${response.statusText}`);
        }
        
        // Renderiza a resposta formatada em Markdown
        responseContainer.innerHTML = marked.parse(data.text);

    } catch (error) {
        responseContainer.innerHTML = `<p><strong>Ocorreu um erro:</strong> ${error.message}</p>`;
        console.error('Erro:', error);
    } finally {
        // Reabilita o botão ao final
        generateButton.disabled = false;
    }
});

const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const suggestedQuestionsContainer = document.getElementById('suggested-questions');

const BACKEND_URL = 'https://gemini-looker-chat-868810243218.southamerica-east1.run.app'; 

// --- NOVA ADIÇÃO: VARIÁVEL PARA GUARDAR O HISTÓRICO ---
let conversationHistory = [];
// ----------------------------------------------------

const suggestedQuestions = [
    "Qual foi o faturamento total no último trimestre?",
    "Qual produto teve o melhor desempenho de vendas?",
    "Compare as vendas entre as regiões Sul e Nordeste.",
    "Mostre a tendência de crescimento mês a mês."
];

function displaySuggestedQuestions() {
    // ... (esta função continua igual)
    suggestedQuestionsContainer.innerHTML = '';
    suggestedQuestions.forEach(questionText => {
        const button = document.createElement('button');
        button.textContent = questionText;
        button.className = 'suggested-button';
        button.addEventListener('click', () => {
            userInput.value = questionText;
            chatForm.dispatchEvent(new Event('submit'));
        });
        suggestedQuestionsContainer.appendChild(button);
    });
}

window.addEventListener('load', displaySuggestedQuestions);

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'user-message');
    userInput.value = '';
    suggestedQuestionsContainer.innerHTML = ''; 

    // --- MUDANÇA: Adiciona a mensagem do usuário ao histórico ---
    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    // ---------------------------------------------------------

    const loadingMessage = addMessage('Analisando...', 'loading-message');

    try {
        // --- MUDANÇA: Envia o histórico junto com a nova pergunta ---
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: userMessage, 
                history: conversationHistory 
            }),
        });
        // -----------------------------------------------------------

        chatBox.removeChild(loadingMessage);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro na rede: ${response.statusText}`);
        }

        const data = await response.json();
        const botResponseText = data.text;
        addMessage(botResponseText, 'bot-message');

        // --- MUDANÇA: Adiciona a resposta do bot ao histórico ---
        conversationHistory.push({ role: 'model', parts: [{ text: botResponseText }] });
        // -------------------------------------------------------

    } catch (error) {
        if (loadingMessage.parentNode) {
            chatBox.removeChild(loadingMessage);
        }
        const errorMessage = `Desculpe, ocorreu um erro: ${error.message}`;
        addMessage(errorMessage, 'bot-message');
        // Adiciona a mensagem de erro ao histórico para contexto futuro
        conversationHistory.push({ role: 'model', parts: [{ text: errorMessage }] });
        console.error('Erro:', error);
    } finally {
        displaySuggestedQuestions();
    }
});

function addMessage(text, className) {
    // ... (esta função continua igual)
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    const p = document.createElement('p');
    p.textContent = text;
    messageDiv.appendChild(p);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

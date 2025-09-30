// (As constantes no início continuam as mesmas)
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const suggestedQuestionsContainer = document.getElementById('suggested-questions');
const BACKEND_URL = 'https://classy-tapioca-330139.netlify.app/'; 
let conversationHistory = [];

// --- FUNÇÃO DE SUGESTÕES ATUALIZADA ---
function displaySuggestedQuestions(questions) {
    suggestedQuestionsContainer.innerHTML = '';
    if (!questions || questions.length === 0) return;

    questions.forEach(questionText => {
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

// (O evento 'load' e o addMessage continuam iguais, MAS o addMessage será atualizado)

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'user-message', false); // 'false' para não processar como markdown
    userInput.value = '';
    suggestedQuestionsContainer.innerHTML = ''; 
    conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    const loadingMessage = addMessage('Analisando...', 'loading-message', false);

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userMessage, history: conversationHistory }),
        });

        chatBox.removeChild(loadingMessage);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.text || `Erro na rede: ${response.statusText}`);
        }
        
        const botResponseText = data.text;
        // --- MUDANÇA: Adiciona a resposta processando Markdown ---
        addMessage(botResponseText, 'bot-message', true); // 'true' para processar como markdown

        conversationHistory.push({ role: 'model', parts: [{ text: botResponseText }] });

        // --- MUDANÇA: Exibe as sugestões dinâmicas recebidas ---
        displaySuggestedQuestions(data.suggestions);

    } catch (error) {
        // ... (o tratamento de erro continua igual, mas usando addMessage)
        if (loadingMessage.parentNode) chatBox.removeChild(loadingMessage);
        const errorMessage = `Desculpe, ocorreu um erro: ${error.message}`;
        addMessage(errorMessage, 'bot-message', false);
        conversationHistory.push({ role: 'model', parts: [{ text: errorMessage }] });
    }
});

// --- FUNÇÃO addMessage ATUALIZADA PARA RENDERIZAR MARKDOWN ---
function addMessage(text, className, isMarkdown) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    
    if (isMarkdown) {
        // Converte o texto Markdown para HTML e insere no div
        messageDiv.innerHTML = marked.parse(text);
    } else {
        // Para mensagens do usuário e de erro, apenas insere o texto
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}

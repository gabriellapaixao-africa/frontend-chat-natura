const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const suggestedQuestionsContainer = document.getElementById('suggested-questions');

// !! IMPORTANTE !! Cole a URL do seu serviço Cloud Run aqui
const BACKEND_URL = 'https://gemini-looker-chat-868810243218.southamerica-east1.run.app'; 

// Lista de perguntas que você quer sugerir
const suggestedQuestions = [
    "Qual foi o faturamento total no último trimestre?",
    "Qual produto teve o melhor desempenho de vendas?",
    "Compare as vendas entre as regiões Sul e Nordeste.",
    "Mostre a tendência de crescimento mês a mês."
];

// Função para mostrar as perguntas como botões
function displaySuggestedQuestions() {
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

    const loadingMessage = addMessage('Analisando...', 'loading-message');

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userMessage }),
        });

        chatBox.removeChild(loadingMessage);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro na rede: ${response.statusText}`);
        }

        const data = await response.json();
        addMessage(data.text, 'bot-message');

    } catch (error) {
        if (loadingMessage.parentNode) {
            chatBox.removeChild(loadingMessage);
        }
        addMessage(`Desculpe, ocorreu um erro: ${error.message}`, 'bot-message');
        console.error('Erro:', error);
    } finally {
        // Opcional: mostrar novas sugestões ou as mesmas novamente após a resposta
        displaySuggestedQuestions();
    }
});

function addMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    
    const p = document.createElement('p');
    p.textContent = text;
    messageDiv.appendChild(p);
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv;
}
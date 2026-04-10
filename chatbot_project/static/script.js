const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.querySelector('.typing');

function addMessage(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user-msg' : 'bot-msg'}`;
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
    typingIndicator.style.display = 'block';
    chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
    typingIndicator.style.display = 'none';
}

async function sendMessage(text) {
    const message = text || userInput.value.trim();
    if (!message) return;

    if (!text) userInput.value = '';
    
    addMessage(message, true);
    
    showTyping();

    try {
        const response = await fetch('/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Simulate a small delay for "thinking"
        setTimeout(() => {
            hideTyping();
            addMessage(data.reply);
        }, 600);

    } catch (error) {
        hideTyping();
        addMessage("Sorry, I'm having trouble connecting right now. 🔌");
    }
}

sendBtn.addEventListener('click', () => sendMessage());

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function quickReply(text) {
    sendMessage(text);
}

// Initial Greeting
window.onload = () => {
    setTimeout(() => {
        addMessage("Hi! I'm AssistAI. How can I help you today? 😊");
    }, 500);
}

document.getElementById('send-button').addEventListener('click', function() {
	let userInput = document.getElementById('user-input').value;
	if (userInput.trim() !== "") {
		 addMessage(userInput, 'user-message');
		 // Ответ бота (например, можно здесь интегрировать реальный API)
		 addMessage("Это ответ бота на ваш запрос: " + userInput, 'bot-message');
		 document.getElementById('user-input').value = "";
	}
});

function addMessage(text, className) {
	let messageContainer = document.getElementById('chat-container');
	let messageElement = document.createElement('div');
	messageElement.className = 'message ' + className;
	messageElement.innerHTML = `<p>${text}</p>`;
	messageContainer.appendChild(messageElement);
	messageContainer.scrollTop = messageContainer.scrollHeight;
}

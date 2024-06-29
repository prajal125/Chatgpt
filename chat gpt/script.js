document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector("#send-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatbotToggler = document.querySelector(".chatbot-toggler");

    let userMessage;
    const API_KEY = "sk-proj-7YzLWyezs792FzR0Yxv7T3BlbkFJATb1U8WBb9vG6dxlyQAi"; // Your actual API key
    const API_URL = "https://api.openai.com/v1/chat/completions"; // OpenAI API URL

    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="fa-solid fa-robot"></span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    }

    const generateResponse = (incomingChatLi) => {
        const messageElement = incomingChatLi.querySelector("p");
    
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }]
            })
        }
    
        console.log("Sending request to API:", requestOptions); // Debugging information
    
        fetch(API_URL, requestOptions)
            .then(response => {
                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After');
                    if (retryAfter) {
                        throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`);
                    } else {
                        throw new Error(`Rate limit exceeded. Please wait and try again later.`);
                    }
                } else if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Received response from API:", data); // Debugging information
                messageElement.textContent = data.choices ? data.choices[0].message.content : "No response from API";
            })
            .catch((error) => {
                console.error("Error from API:", error); // Debugging information
                if (error.message.includes("Rate limit exceeded")) {
                    messageElement.textContent = error.message;
                } else {
                    messageElement.textContent = "Oops! Something went wrong. Please try again.";
                }
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }
    
    

    const debounce = (func, delay) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    const handleChat = debounce(() => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;
        chatInput.value = ""; // Clear the input field after getting the value

        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        setTimeout(() => {
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
    }, 1000); // Adjust debounce delay as needed

    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    sendChatBtn.addEventListener("click", handleChat);
    chatInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleChat();
        }
    });
});

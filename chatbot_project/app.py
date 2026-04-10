from flask import Flask, render_template, request, jsonify
from datetime import datetime
import re
import random

app = Flask(__name__)

# Extended Knowledge Base / Rules
RULES = {
    r"hi|hello|hey|greetings": [
        "Hello! How can I help you today? 😊",
        "Hi there! Nice to meet you. 👋",
        "Hey! What's on your mind?"
    ],
    r"name|who are you": [
        "I am AssistAI, your friendly rule-based assistant. 🤖",
        "You can call me AssistAI. I'm here to help!"
    ],
    r"how are you": [
        "I'm functioning at 100% capacity! How about you? 🚀",
        "I'm doing great, thank you for asking! 😊"
    ],
    r"time": [
        lambda: f"The current time is {datetime.now().strftime('%I:%M %p')}. 🕒"
    ],
    r"date|today": [
        lambda: f"Today is {datetime.now().strftime('%A, %B %d, %Y')}. 📅"
    ],
    r"weather": [
        "I don't have a barometer, but I hope it's sunny where you are! ☀️",
        "I can't check real-time weather yet, but stay cozy! 🌦️"
    ],
    r"joke|laugh": [
        "Why did the web developer walk out of a restaurant? Because of the table layout! 😂",
        "What do you call a computer that sings? A Dell! 🎤",
        "Why was the cell phone wearing glasses? Because it lost its contacts! 📱"
    ],
    r"help|can you do": [
        "I can tell you the time, date, tell jokes, or just chat! Try asking 'What time is it?' or 'Tell me a joke'."
    ],
    r"creator|who made you|your developer": [
        "I was crafted by Ayan, a brilliant developer! 😎",
        "My origins trace back to Ayan's code. 💻"
    ],
    r"thanks|thank you": [
        "You're very welcome! Happy to help. ✨",
        "Anytime! Let me know if you need anything else. 😊"
    ],
    r"bye|exit|goodbye": [
        "Goodbye! Have a wonderful day! 👋",
        "See you later! stay curious. ✨"
    ],
    r"favorite color": [
        "I love Electric Blue! It matches my personality. ⚡",
        "Deep Purple is quite elegant, don't you think? 💜"
    ],
    r"meaning of life": [
        "According to a very famous book, it's 42. 📖",
        "To learn, grow, and help others! (And to write clean code). 💻"
    ]
}

def get_response(user_input):
    user_input = user_input.lower().strip()
    
    for pattern, responses in RULES.items():
        if re.search(pattern, user_input):
            response = random.choice(responses)
            if callable(response):
                return response()
            return response
            
    return "I'm not quite sure how to answer that yet. 😅 Try asking for 'help' to see what I can do!"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def chatbot():
    data = request.json
    user_text = data.get("message", "")
    response = get_response(user_text)
    return jsonify({"reply": response})

if __name__ == "__main__":
    app.run(debug=True)
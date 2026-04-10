# CodSoft Projects

This repository contains internship projects completed at CodSoft.

## Projects Included

### 1. Chatbot Project (`chatbot_project`)
A rule-based chatbot built with **Flask**. It uses regular expressions to match user input and provide predefined responses.
- **Features**: Tells time/date, tells jokes, answers basic questions.
- **Technologies**: Python, Flask, HTML/CSS.
- **Run**: `cd chatbot_project && python app.py`

### 2. Movie Recommendation System (`movie recomendation`)
A content-based movie recommendation system that suggests similar movies based on genres and other features.
- **Features**: Interactive web interface, OMDB API integration for posters.
- **Technologies**: Python, Flask, Pandas, Scikit-learn, Pickle.
- **Note**: Requires `movies.pkl` and `similarity.pkl` for operation.
- **Run**: `cd "movie recomendation" && python app.py`

### 3. Tic-Tac-Toe AI (`tic-tac-toe-ai`)
An unbeatable Tic-Tac-Toe game using the **Minimax algorithm** with Alpha-Beta pruning.
- **Features**: Responsive UI, AI opponent, scoreboard.
- **Technologies**: HTML, CSS, JavaScript, Python (Simple Server).
- **Run**: `cd tic-tac-toe-ai && python tictactoe.py`

---

## How to Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/codesoft.git
   cd codesoft
   ```

2. **Install Dependencies**:
   It is recommended to use a virtual environment.
   ```bash
   pip install flask requests pandas
   ```

3. **Explore Projects**:
   Navigate to each project directory and run the application as specified above.

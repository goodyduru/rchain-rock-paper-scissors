from flask import Flask, render_template, request
import json
import random
app = Flask(__name__)

@app.route('/')
def index():
    return render_template("page.html")

@app.route('/join', methods=['POST'])
def join():
    request_body = request.get_json()
    id = request_body['id']
    response = {'message': 'Game Successfully Created'}
    return json.dumps(response)

@app.route('/create')
def create():
    random_num = random.randint(1, 1000000)
    response = {'game_id': random_num}
    return json.dumps(response)

@app.route('/play', methods=['POST'])
def play():
    request_body = request.get_json()
    chosen_option = request_body['chosen_option']
    message, option = player_won(chosen_option)
    response = {'message': message, 'option': option}
    return json.dumps(response)

def player_won(chosen_option):
    options = ["rock", "paper", "scissors"]
    option = options[random.randint(0, 2)]
    message = "won"
    if chosen_option == "rock":
        if option == "paper":
            message = "lost"
        elif option == "rock":
            message = "draw"
    elif chosen_option == "paper":
        if option == "paper":
            message = "draw"
        elif option == "scissors":
            message = "lost"
    else:
        if option == "rock":
            message = "lost"
        elif option == "scissors":
            message = "draw"
    return message, option
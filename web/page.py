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
    message = "You Won"
    if chosen_option == "rock":
        if option == "paper":
            message = "You Lost"
        elif option == "rock":
            message = "You Drew"
    elif chosen_option == "paper":
        if option == "paper":
            message = "You Drew"
        elif option == "scissors":
            message = "You Lost"
    else:
        if option == "rock":
            message = "You Lost"
        elif option == "scissors":
            message = "You Drew"
    return message, option.capitalize()
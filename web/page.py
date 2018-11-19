from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, emit, send, rooms
import json
import random
from rchain_grpc import casper
app = Flask(__name__)
app.secret_key = b'_3(1*03/{}{^%]'
socketio = SocketIO(app)
RNODE_HOST = 'localhost'
connection = casper.create_connection(host=RNODE_HOST, port=40401)
rholang_code = """
new print(`rho:io:stdout`) in {
    print!("Hello World!")
}
"""
print(casper.deploy(connection, rholang_code))
print(casper.propose(connection))
@app.route('/')
def index():
    return render_template("page.html")

@app.route('/join', methods=['POST'])
def join():
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
    player_data = {
        'chosen_option': request_body['option'],
        'room': request_body['room'],
        'player_id': request_body['player_id'],
        'game_played': request_body['game_played']
    }
    emit("opponent-play", player_data, namespace='/', broadcast=True)
    response = {'message': "Played"}
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

"""
    SocketIO Functions
"""
@socketio.on('join')
def on_join(data):
    join_room(data['room'], sid=data['player_id'], namespace='/')
    print(rooms(data['player_id'], '/'))
    if data['player_id'] == 2:
        print("Opponent Has Joined")
        emit("opponent", {'room': data['room']}, namespace='/', broadcast=True)

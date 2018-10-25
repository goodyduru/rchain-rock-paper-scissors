"use strict"

document.addEventListener('DOMContentLoaded', () => {
    //Grab DOM Elements
    let join_button = document.getElementById('join-button');
    let game_id_elem = document.getElementById('game-id');
    let join_section = document.getElementById('join-section');
    let play_section = document.getElementById('play-section');
    let play_button = document.getElementById('play-button');
    let chosen_option = document.getElementById('chosen-option');
    let create_game = document.getElementById('create-game');
    let rock_choice = document.getElementById('rock-img');
    let paper_choice = document.getElementById('paper-img');
    let scissors_choice = document.getElementById('scissors-img');
    let player_choice_img = document.getElementById('player-choice-img');
    let opponent_choice_img = document.getElementById('opponent-choice-img');
    let player_score_elem = document.getElementById('player-score');
    let opponent_score_elem = document.getElementById('opponent-score');
    let final_statement = document.getElementById('final-statement');
    let game_id_alert = document.getElementById('game-id-alert');

    //Add Event Listeners To The DOM Elements
    create_game.addEventListener('click', create);
    join_button.addEventListener('click', join);
    rock_choice.addEventListener('click', choose);
    paper_choice.addEventListener('click', choose);
    scissors_choice.addEventListener('click', choose);
    play_button.addEventListener('click', play);

    //Gaming Variables.
    let game_played = 0;
    let player_score = 0;
    let opponent_score = 0;
    let game_id = 0;
    let player_id = 0;
    let room = "";
    let previous_option = "";
    let opponent_game = null;

    //Socket-io Variable
    var socket = io.connect('http://127.0.0.1:5000');
    
    /**
     * Create A Game
     */
    function create(evt) {
        evt.preventDefault();
        makeGet('/create').then(data => {
            game_id_alert.textContent = data.game_id;
            game_id = data.game_id;
            player_id = 1;
            room = "room-" + game_id;
            socket.emit('join', {room: room, player_id: player_id});
            join_section.classList.add('hidden');
            play_section.classList.remove('hidden');
            opponent_choice_img.parentElement.classList.add('not-joined');
        })
    }

    /**
     * Join an existing game using the game id. If game id isn't active,
     * create new game.
     */
    function join(evt) {    
        evt.preventDefault();
        if ( game_id_elem.value == "" ) {
            console.log("Game ID required!");
            game_id_elem.value = ""
            return;
        }
        let post_body = {
            id: parseInt(game_id_elem.value, 10)
        }
        makePost('/join', post_body)
        .then(data => {
            join_section.classList.add('hidden');
            play_section.classList.remove('hidden');
            game_id = parseInt(game_id_elem.value, 10);
            game_id_alert.textContent = game_id;
            player_id = 2
            room = "room-" + game_id;
            socket.emit('join', {room: room, player_id: player_id});
            game_id_elem.value = ""
        });
    }

    /**
     * Play A Game
     */
    function play(evt) {
        evt.preventDefault();
        if ( game_played > 2 ) {
            console.log("Exceeded Your Game Limits");
            return;
        }
        let post_body = {
            option: chosen_option.value,
            room: game_id,
            player_id: player_id,
            game_played: game_played + 1
        }
        makePost('/play', post_body)
        .then(data => {
            console.log("I've played");
            previous_option = chosen_option.value;
            game_played++;
            score_if_opponent_has_played();
        })
    }

    function score_if_opponent_has_played() {
        if ( opponent_game != null && 
            game_played == opponent_game.game_played ) {
            show_opponent_option(opponent_game.chosen_option);
            let message = get_message(previous_option, opponent_game.chosen_option);
            add_score(message);
            if ( game_played > 2 ) {
                show_final_if_game_end();
            }
        }
    }

    function show_opponent_option(opponent_choice) {
        let choice_img = "";
        if ( opponent_choice == "rock" ) {
            choice_img = "/static/img/rock.png";
        }
        else if ( opponent_choice == "paper" ) {
            choice_img = "/static/img/paper.png";
        }
        else {
            choice_img = "/static/img/scissors.png";
        }
        opponent_choice_img.setAttribute('src', choice_img);
        opponent_choice_img.classList.remove('transparent');
    }

    function get_message(player_option, opponent_option) {
        console.log(player_option, opponent_option);
        let message = "won"
        if ( player_option == "rock" ) {
            if ( opponent_option == "paper" ) {
                message = "lost";
            }
            else if ( opponent_option == "rock" ) {
                message = "draw";
            }
        }
        else if ( player_option == "paper" ) {
            if ( opponent_option == "paper" ) {
                message = "draw";
            }
            else if ( opponent_option == "scissors" ) {
                message = "lost";
            }
        }
        else {
            if ( opponent_option == "rock" ) {
                message = "lost";
            }
            else if ( opponent_option == "scissors" ) {
                message = "draw";
            }
        }
        return message;
    }

    function add_score(message) {
        if ( message == "won" ) {
            player_score += 1000;
            player_score_elem.textContent = player_score;
        }
        else if ( message == "lost" ) {
            opponent_score += 1000;
            opponent_score_elem.textContent = opponent_score
        }
    }

    function show_final_if_game_end() {
        let final = "";
        if ( player_score > opponent_score ) {
            final = "You Won";
        }
        else if ( player_score < opponent_score ) {
            final = "You Lost";
        }
        else {
            final = "You Drew";
        }
        final_statement.textContent = final;
    }

    /**
     * Function For Choice
     */
    function choose(evt) {
        evt.preventDefault();
        let img_src = evt.target.src;
        let choice = define_choice(img_src);
        chosen_option.value = choice;
        player_choice_img.setAttribute('src', img_src);
        player_choice_img.classList.remove('transparent');
    }

    function define_choice(img_src) {
        if ( img_src.indexOf('paper') > -1 ) {
            return "paper";
        }
        else if ( img_src.indexOf('rock') > -1 ) {
            return "rock";
        }
        else {
            return "scissors";
        }
    }

    /**
     * Abstract out the POST submission
     * @param {*} route The request destination
     * @param {*} data An object containing the data to be passed
     * @returns A promise containing the response object
     */

    async function makePost(route, data) {
        let request = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(route, request);
        return response.json();
    }

    async function makeGet(route) {
        const response = await fetch(route);
        return response.json();
    }

    /**
     * Socket Functions
     */
    socket.on('connect', function() {
        console.log("Socket Connected");
    })
    
    socket.on('opponent', function(message) {
        if ( player_id == 1 && message.room == "room-"+game_id ) {
            opponent_choice_img.parentElement.classList.remove('not-joined');
        }
    })

    socket.on('opponent-play', function(message) {
        console.log(player_id);
        console.log(message);
        if ( message.player_id != player_id && message.room == game_id ) {
            opponent_game = message
            score_if_opponent_has_played();
        }
    })
});
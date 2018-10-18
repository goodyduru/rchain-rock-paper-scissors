"use strict"

document.addEventListener('DOMContentLoaded', () => {
    //Grab DOM Elements
    let join_button = document.getElementById('join-button');
    let game_id = document.getElementById('game-id');
    let join_section = document.getElementById('join-section');
    let play_section = document.getElementById('play-section');
    let play_button = document.getElementById('play-button');
    let chosen_option = document.getElementById('chosen-option');
    let create_game = document.getElementById('create-game');
    let rock_choice = document.getElementById('rock-img');
    let paper_choice = document.getElementById('paper-img');
    let scissors_choice = document.getElementById('scissors-img');
    let your_choice_img = document.getElementById('your-choice-img');
    let opponent_choice_img = document.getElementById('opponent-choice-img');
    let your_score_elem = document.getElementById('your-score');
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
    let your_score = 0;
    let opponent_score = 0

    /**
     * Join an existing game using the game id. If game id isn't active,
     * create new game.
     */
    function join(evt) {
        evt.preventDefault();
        if ( game_id.value == "" ) {
            console.log("Game ID required!");
            return;
        }
        let post_body = {
            id: parseInt(game_id.value, 10)
        }
        makePost('/join', post_body)
        .then(data => {
            console.log(data.message);
            join_section.classList.add('hidden');
            play_section.classList.remove('hidden');
        });
        game_id.value = ""
    }

    /**
     * Play A Game
     */
    function play(evt) {
        evt.preventDefault();
        if ( game_played > 2 ) {
            console.log("Exceeded Your Game");
            return;
        }
        let post_body = {
            chosen_option: chosen_option.value
        }
        makePost('/play', post_body)
        .then(data => {
            show_opponent_option(data.option);
            add_score(data.message);
            game_played++;
            show_final_if_game_end();
        })
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

    function add_score(message) {
        if ( message == "won" ) {
            your_score += 1000;
            your_score_elem.textContent = your_score;
        }
        else if ( message == "lost" ) {
            opponent_score += 1000;
            opponent_score_elem.textContent = opponent_score
        }
    }

    function show_final_if_game_end() {
        let final = "";
        if ( your_score > opponent_score ) {
            final = "You Won";
        }
        else if ( your_score < opponent_score ) {
            final = "You Lost";
        }
        else {
            final = "You Drew";
        }
        final_statement.textContent = final;
    }

    /**
     * Create A Game
     */
    function create(evt) {
        evt.preventDefault();
        makeGet('/create').then(data => {
            game_id_alert.textContent = data.game_id;
            join_section.classList.add('hidden');
            play_section.classList.remove('hidden');
        })
    }

    /**
     * Function For Choice
     */
    function choose(evt) {
        evt.preventDefault();
        let img_src = evt.target.src;
        let choice = define_choice(img_src);
        chosen_option.value = choice;
        your_choice_img.setAttribute('src', img_src);
        your_choice_img.classList.remove('transparent');
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
});
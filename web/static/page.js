"use strict"

document.addEventListener('DOMContentLoaded', () => {
    console.log("Hi")
    //Grab DOM Elements
    let join_button = document.getElementById('join-button');
    let game_id = document.getElementById('game-id');
    let join_section = document.getElementById('join-section');
    let play_section = document.getElementById('play-section');
    let play_button = document.getElementById('play-button');
    let chosen_option = document.getElementById('chosen-option');

    //Add Event Listeners To The DOM Elements
    join_button.addEventListener('click', join)
    play_button.addEventListener('click', play)

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
            console.log(data.message)
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
        let post_body = {
            chosen_option: chosen_option.value
        }
        makePost('/play', post_body)
        .then(data => {
            console.log(data.message)
            console.log("Your Opponent Chose", data.option)
        })
    }

    /**
     * Abstract out the POST submission
     * @param {*} route The request destination
     * @param {*} data An object containing the data to be passed
     * @returns A promise containing the response object
     */

    function makePost(route, data) {
        let request = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        }
        return fetch(route, request)
            .then(response => {
                return response.json()})
    }
});
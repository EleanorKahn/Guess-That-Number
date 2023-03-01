(function () {
  /* ============================================================== */
  /* ============================================================== */
  /* ============================================================== */
  /* ============================================================== */
  /* ============================ Constants ======================= */
  const MAX_GUESSES = 10;
  const maxValue = 100;
  const minValue = 1;

  /* ============================================================== */
  /* ============================================================== */
  /* ============================================================== */
  /* ============================================================== */
  /* ======================== DOM Elements ======================== */
  const playBtn = document.getElementById('playBtn');
  const playerGuessField = document.getElementById('playerGuess');
  const resultDiv = document.getElementById('resultDiv');
  const currentGuess = document.getElementById('currentGuess');
  const lowOrHi = document.getElementById('lowOrHi');
  const prevGuesses = document.getElementById('prevGuesses');
  const resetBtn = document.getElementById('resetBtn');
  playBtn.addEventListener('click', checkGuess);
  resetBtn.addEventListener('click', resetGame);

  /* ============================================================== */
  /* ============================================================== */
  /* ============================================================== */
  /* ============================================================== */
  /* ======================== gameState  ======================== */
  const gameState = {
    answer: Math.floor(Math.random() * 100) + 1,
    numGuesses: 0,
    playerGuess: 0,
    numWins: 0,
    numLosses: 0
  };

  const gameStateHandlers = {
    new_game: function () {
      gameState.answer = Math.floor(Math.random() * 100) + 1;
      gameState.numGuesses = 0;
      gameState.playerGuess = 0;
    },
    wrong_guess: function ({ playerGuess }) {
      gameState.numGuesses++;
      gameState.playerGuess = playerGuess;
    },
    correct_guess: function ({ playerGuess }) {
      gameState.numGuesses++;
      gameState.numWins++;
      gameState.playerGuess = playerGuess;
    },
    game_over: function ({ playerGuess }) {
      gameState.numGuesses++;
      gameState.numLosses++;
      gameState.playerGuess = playerGuess;
    }
  };

  /* ============================================================== */
  /* ============================================================== */
  /* ============================================================== */
  /* ============================================================== */
  /* ======================== DOM handlers ======================== */
  const domHandlers = {
    new_game: function () {
      //alert(`domHandlers: new game`);
      prevGuesses.textContent = 'Previous guesses: ';
      playerGuessField.disabled = false;
      playBtn.disabled = false;
      resultDiv.style.backgroundColor = 'lightsteelblue';
      resultDiv.style.borderColor = 'lightsteelblue';
      playerGuessField.value = '';
      currentGuess.textContent = '';
      lowOrHi.textContent = '';
      resetBtn.style.display = 'none';
    },
    wrong_guess: function () {
      resultDiv.style.backgroundColor = 'orange';
      resultDiv.style.borderColor = 'darkorange';
      currentGuess.textContent = 'Wrong!';
      playerGuessField.value = '';
      lowOrHi.textContent =
        gameState.playerGuess < gameState.answer
          ? 'Your guess is too low!'
          : 'Your guess is too high!';
      prevGuesses.textContent += 
        prevGuesses.textContent.length <= 18
        ? `${gameState.playerGuess}`
        : ", " + gameState.playerGuess;
    },
    correct_guess: function () {
      resultDiv.style.backgroundColor = 'mediumturquoise';
      resultDiv.style.borderColor = 'darkturquoise';
      resultDiv.style.borderStyle = 'dotted'; 
      currentGuess.textContent =
        gameState.numWins < 2 
          ? `Congratulations! Your guess is correct! You've won 1 time.`
          : `Congratulations! Your guess is correct! You've won ${gameState.numWins} times.`;
      lowOrHi.textContent = '';
      playerGuessField.disabled = true;
      playBtn.disabled = true;
      resetBtn.style.display = 'inline';
    },
    game_over: function () {
      resultDiv.style.backgroundColor = 'orange';
      resultDiv.style.borderColor = 'darkorange';
      currentGuess.textContent = 
      gameState.numLosses < 2
      ? `Game Over! You have lost 1 time.`
      : `GAME OVER! You have lost ${gameState.numLosses} times.`;
      lowOrHi.textContent = '';
      playerGuessField.disabled = true;
      playBtn.disabled = true;
      resetBtn.style.display = 'inline';
    },
    error_repeat_guess: function () {
      resultDiv.style.backgroundColor = 'gray';
      resultDiv.style.borderColor = 'black';
      currentGuess.textContent = `You've already guessed that number! Guess again!`;
      lowOrHi.textContent = "";
      playerGuessField.value = '';
    },
    error_range: function () {
      resultDiv.style.backgroundColor = 'gray';
      resultDiv.style.borderColor = 'black';
      currentGuess.textContent = `This number is outside the range of the game. Remember to guess a number between 1 and 100!`;
      lowOrHi.textContent = "";
      playerGuessField.value = '';
    },
    error_NaN: function () {
      resultDiv.style.backgroundColor = 'gray';
      resultDiv.style.borderColor = 'black';
      currentGuess.textContent = `That's not a number. Remember to guess a NUMBER between 1 and 100!`;
      lowOrHi.textContent = "";
      playerGuessField.value = '';
    }
  };

  /**
   * @function
   * @name updateDom
   * @description is responsible for dispatching domHandlers function
   * @typedef payload the data passed to the updateDom function
   * @param {String} payload.new_state the key to relevant DOM handler in domHandlers object
   * @return {undefined} the function does not return anything
   */
  function updateDom({ new_state }) {
    //alert(`update DOM: ${new_state}`);
    domHandlers[new_state]();
  }

  /**
   * @function
   * @name updateGameState
   * @description is responsible for dispatching gameStateHandlers function
   * @typedef payload the data passed to the updateGameState function
   * @param {String} payload.new_state the key to relevant gameState handler in gameStateHandlers object
   * @return {undefined} the function does not return anything
   */
  function updateGameState({ new_state, playerGuess }) {
    //alert(`update game state: ${new_state}`);
    gameStateHandlers[new_state]({ playerGuess });
  }

  /**
   * @function
   * @name checkGuess
   * @description handles all game logic, interacting with the value inputed by the player and calling domHandlers, updating state, as well as directing errors to relevant functions.
   * @param none
   * @return {undefined} the function does not return anything
   */
  function checkGuess() {
    const playerGuess = parseInt(playerGuessField.value);
    console.log({ ...gameState });
    if (checkErrors(playerGuess)) {
      handleErrors(playerGuess);
    } else if (playerGuess === gameState.answer) {
      updateGameState({ new_state: 'correct_guess', playerGuess });
      updateDom({ new_state: 'correct_guess' });
    } else if (gameState.numGuesses === MAX_GUESSES) {
      updateGameState({ new_state: 'game_over', playerGuess });
      updateDom({ new_state: 'game_over' });
    } else {
      updateGameState({ new_state: 'wrong_guess', playerGuess });
      updateDom({ new_state: 'wrong_guess' });
    }
  }

  function checkErrors(playerGuess) {
    if (playerGuess > maxValue || playerGuess < minValue || prevGuesses.textContent.includes(` ${playerGuess.toString()},`) || (prevGuesses.textContent.includes(` ${playerGuess.toString()}`) && gameState.numGuesses === 1)||isNaN(playerGuess)) {
      return true;
    }
  }

  //function handleErrors(playerguess)
  //goes through error logic, and sends to the appropriate DOM handler 
  function handleErrors(playerGuess) {
    if (isNaN(playerGuess)) {
      updateDom({ new_state: 'error_NaN' });
    } else if (playerGuess < minValue || playerGuess > maxValue) {
      updateDom({ new_state: 'error_range' });
    } else if (prevGuesses.textContent.includes(playerGuess.toString())) {
      updateDom({ new_state: 'error_repeat_guess' });
    } 
  }

  /**
   * @function
   * @name resetGame
   * @description resets the game to original state so player can play again (excluding numWins and numLosses)
   * @return {undefined} the function does not return anything
   */
  function resetGame() {
    updateGameState({ new_state: 'new_game' });
    updateDom({ new_state: 'new_game' });
  }

  resetGame();
})();

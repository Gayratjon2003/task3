const crypto = require("crypto");

class Move {
  constructor(name, index) {
    this.name = name;
    this.index = index;
  }

  getName() {
    return this.name;
  }

  getIndex() {
    return this.index;
  }
}

class MoveGenerator {
  constructor() {
    this.random = crypto.randomBytes(32);
  }

  generateMove(moves) {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  generateKey() {
    return this.random.toString("hex");
  }
}

class GameRules {
  constructor(moves) {
    this.moves = moves;
    this.movesCount = moves.length;
  }

  determineWinner(userMove, computerMove) {
    const halfMoves = Math.floor(this.movesCount / 2);
    const userIndex = userMove.getIndex();
    const computerIndex = computerMove.getIndex();

    if (userIndex === computerIndex) {
      return "Draw";
    } else if (
      (userIndex >= computerIndex + 1 &&
        userIndex <= computerIndex + halfMoves) ||
      (userIndex + this.movesCount >= computerIndex + 1 &&
        userIndex + this.movesCount <= computerIndex + halfMoves)
    ) {
      return "You win!";
    } else {
      return "You lose!";
    }
  }
}

function displayMoves(moves) {
  console.log("Available moves:");
  moves.forEach((move, index) => {
    console.log(`${index + 1} - ${move.getName()}`);
  });
  console.log("0 - Exit");
  console.log("? - Help");
}

function getUserChoice(moves) {
  const choice = readlineSync.question("Enter your move: ");

  if (choice === "0") {
    console.log("Exiting the game. Goodbye!");
    process.exit(0);
  }

  if (choice === "?") {
    displayMoves(moves);
    return getUserChoice(moves);
  }

  if (!choice || !/^\d+$/.test(choice) || choice < 1 || choice > moves.length) {
    console.log("Invalid input. Please enter a valid move number.");
    return getUserChoice(moves);
  }

  return parseInt(choice);
}

function playGame(moves) {
  const moveGenerator = new MoveGenerator();
  let secretKey = moveGenerator.generateKey();
  
  while (true) {
    const computerMove = moveGenerator.generateMove(moves);
    console.log(`HMAC: ${moveGenerator.generateKey()}`);
    displayMoves(moves);
    const userChoice = getUserChoice(moves);
    const userMove = moves[userChoice - 1];

    console.log(`Your move: ${userMove.getName()}`);
    console.log(`Computer move: ${computerMove.getName()}`);

    const gameRules = new GameRules(moves);
    const result = gameRules.determineWinner(userMove, computerMove);

    console.log(result);
    console.log(`HMAC key: ${secretKey}`);

    process.exit(1);
  }
}

const readlineSync = require("readline-sync");
const moves = process.argv
  .slice(2)
  .map((arg, index) => new Move(arg, index + 1));

if (moves.length < 3 || moves.length % 2 === 0 || hasDuplicates(moves)) {
  console.log(
    "Incorrect arguments. Please provide an odd number of non-repeating moves."
  );
  console.log("Example: node index.js rock paper scissors lizard Spock");
  process.exit(1);
}

function hasDuplicates(array) {
  return new Set(array).size !== array.length;
}

playGame(moves);

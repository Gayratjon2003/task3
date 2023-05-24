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

class HMACCalculator {
  calculateHMAC(move, key) {
    const hmac = crypto.createHmac("sha256", key);
    hmac.update(move.getName());
    return hmac.digest("hex");
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

class HelpTableGenerator {
  constructor(moves) {
    this.moves = moves;
    this.movesCount = moves.length;
  }

  generateHelpTable() {
    const table = [];
    const headerRow = [""].concat(this.moves.map((move) => move.getName()));
    table.push(headerRow.join("\t"));

    for (let i = 0; i < this.movesCount; i++) {
      const row = [this.moves[i].getName()];

      for (let j = 0; j < this.movesCount; j++) {
        const result = this.determineWinnerText(this.moves[i], this.moves[j]);
        row.push(result);
      }

      table.push(row.join("\t"));
    }

    return table.join("\n");
  }

  determineWinnerText(move1, move2) {
    const gameRules = new GameRules(this.moves);
    const result = gameRules.determineWinner(move1, move2);

    if (result === "Draw") {
      return "Draw";
    } else if (result === "You win!") {
      return "Win";
    } else {
      return "Lose";
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
    const helpTableGenerator = new HelpTableGenerator(moves);
    console.log(helpTableGenerator.generateHelpTable());
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
  const hmacCalculator = new HMACCalculator();

  console.log(`HMAC key: ${moveGenerator.generateKey()}`);

  while (true) {
    const userChoice = getUserChoice(moves);
    const userMove = moves[userChoice - 1];
    const computerMove = moveGenerator.generateMove(moves);
    const hmac = hmacCalculator.calculateHMAC(
      computerMove,
      moveGenerator.generateKey()
    );

    console.log(`HMAC: ${hmac}`);
    displayMoves(moves);
    console.log(`Your move: ${userMove.getName()}`);
    console.log(`Computer move: ${computerMove.getName()}`);

    const gameRules = new GameRules(moves);
    const result = gameRules.determineWinner(userMove, computerMove);

    console.log(result);
    console.log(`HMAC key: ${moveGenerator.generateKey()}`);
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

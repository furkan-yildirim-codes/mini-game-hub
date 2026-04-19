let playAgain = "evet";

let bestScore = {
    kolay: null,
    orta: null,
    zor: null
};

let scores = {
    kolay: [],
    orta: [],
    zor: []
};

let difficulty;
let maxNumber;
let secretNumber;
let guess;
let count;
let gameStarted = false;
let outputTimer;

function startGame() {
    difficulty = document.querySelector(".difficulty-btn.active").dataset.difficulty;

    if (difficulty === "kolay") maxNumber = 50;
    else if (difficulty === "orta") maxNumber = 100;
    else maxNumber = 500;

    secretNumber = Math.floor(Math.random() * maxNumber) + 1;
    count = 1;
    gameStarted = true;
    document.getElementById("guessInput").value = "";

    print(`\nOyun başladı!\n1 ile ${maxNumber} arasında bir sayı tahmin et`);
}

function checkGuess() {
    if (!gameStarted) {
        print("\nÖnce oyunu başlatman gerekiyor.");
        return;
    }

    let input = document.getElementById("guessInput").value;

    if (input === "") {
        print("\nYalnızca sayı girmen gerekiyor dostum!");
        return;
    }

    guess = Number(input);

    if (guess < 1 || guess > maxNumber) {
        print(`\n1 ile ${maxNumber} arasında bir sayı söylemen gerekiyor!`);
        clearGuessInput();
        return;
    }

    if (guess < secretNumber) {
        print("\nDaha büyük bir sayı söyle kanka");
        count++;
        clearGuessInput();
    } else if (guess > secretNumber) {
        print("\nDaha küçük bir sayı söyle kanka");
        count++;
        clearGuessInput();
    } else {
        let text = "\nTebrikler! Doğru bildin 🎉";
        text += `\nTahmin sayın: ${count}\n`;

        scores[difficulty].push(count);
        scores[difficulty].sort((a,b) => a - b);

        if (bestScore[difficulty] === null || count < bestScore[difficulty]) {
            bestScore[difficulty] = count;
            text += "\nYeni Rekor! BRAVOO 🔥";
        } else {
            text += `\n${difficulty} modundaki en iyi skorun : ${bestScore[difficulty]}`;
        }

        text += `\n\n🏆 ${difficulty.toUpperCase()} Modu Skor Tablosu:\n`;

        let topScores = scores[difficulty].slice(0, 3);

        topScores.forEach((score, i) => {
            text += `${i + 1}. ${score} Tahmin\n`;
        });

        print(text);
        gameStarted = false;
    }
}

function restartGame() {
    startGame();
}

function selectDifficulty(button) {
    document.querySelectorAll(".difficulty-btn").forEach((difficultyButton) => {
        difficultyButton.classList.remove("active");
    });

    button.classList.add("active");
}

function print(text) {
    const output = document.getElementById("output");
    let index = 0;

    clearInterval(outputTimer);
    output.innerText = "";
    output.classList.add("is-typing");

    outputTimer = setInterval(() => {
        output.innerText += text[index];
        index++;

        if (index >= text.length) {
            clearInterval(outputTimer);
            output.classList.remove("is-typing");
        }
    }, 24);
}

function clearGuessInput() {
    document.getElementById("guessInput").value = "";
}

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
let nextHardHintAt;

const difficultyMessages = {
    kolay: "\nKolay Modu Aktif, aralığımız dar ve sana bolca ipucu verecem,sakin ve keyifli bir seçenek, hazırsan Başlat butonuna bas...",
    orta: "\nOrta Modu Aktif, aralığımız biraz daha geniş ve ipuçların daha seyrek olacak, biraz daha zorlayıcı bir seçenek, hazırsan Başlat butonuna bas...",
    zor: "\nZor Modu Aktif, aralığın çok geniş ve ipuçların çok sınırlı, gerçekten maceracılara göre bir tercih, şimdiden seni sinirlendireceğim için özür diliyorum👻 hazırsan Başlat butonuna bas..."
};

document.addEventListener("DOMContentLoaded", () => {
    print("\nHoşgeldin kanka, bir zorluk şeç ve sayıların dünyasına giriş yap🚀Bol şans...");
    setupCountdown();

    document.getElementById("guessInput").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            checkGuess();
        }
    });

    const exitButton = document.getElementById("exitButton");

    exitButton.addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
            return;
        }

        event.preventDefault();
        exitButton.classList.add("exiting");
        document.body.classList.add("is-exiting");

        setTimeout(() => {
            window.location.href = exitButton.href;
        }, 1100);
    });
});

function setupCountdown() {
    const countdownWidget = document.getElementById("countdownWidget");
    const countdownToggle = document.getElementById("countdownToggle");
    const countdownTime = document.getElementById("countdownTime");

    if (!countdownWidget || !countdownToggle || !countdownTime) {
        return;
    }

    function getNextMidnight() {
        const target = new Date();
        target.setHours(24, 0, 0, 0);
        return target;
    }

    let countdownTarget = getNextMidnight();

    function updateCountdown() {
        const now = new Date();
        let diff = countdownTarget - now;

        if (diff <= 0) {
            countdownTarget = getNextMidnight();
            diff = countdownTarget - now;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const seconds = String(totalSeconds % 60).padStart(2, "0");

        countdownTime.textContent = `${hours}:${minutes}:${seconds}`;
    }

    countdownToggle.addEventListener("click", () => {
        const isOpen = countdownWidget.classList.toggle("is-open");
        countdownToggle.textContent = isOpen ? "Sayacı Kapat" : "Sayacı Aç";
        countdownToggle.setAttribute("aria-expanded", String(isOpen));
    });

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
}

function startGame() {
    const selectedDifficulty = document.querySelector(".difficulty-btn.active");

    if (!selectedDifficulty) {
        print("\nÖnce bir zorluk seçmen gerekiyor kanka.");
        return;
    }

    difficulty = selectedDifficulty.dataset.difficulty;

    if (difficulty === "kolay") maxNumber = 100;
    else if (difficulty === "orta") maxNumber = 250;
    else maxNumber = 500;

    secretNumber = Math.floor(Math.random() * maxNumber) + 1;
    count = 1;
    nextHardHintAt = getNextHardHintTurn();
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
        print(getWrongGuessMessage("büyük"), difficulty === "zor");
        count++;
        clearGuessInput();
    } else if (guess > secretNumber) {
        print(getWrongGuessMessage("küçük"), difficulty === "zor");
        count++;
        clearGuessInput();
    } else {
        let text = "\nTebrikler! Doğru bildin 🎉";
        text += `\nTahmin sayın: ${count}\n`;

        scores[difficulty].push(count);
        scores[difficulty].sort((a, b) => a - b);

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
    print(difficultyMessages[button.dataset.difficulty], button.dataset.difficulty === "zor");
}

function print(text, isDanger = false) {
    const output = document.getElementById("output");
    let index = 0;

    clearInterval(outputTimer);
    output.innerText = "";
    output.classList.toggle("danger-output", isDanger);
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

function getEasyModeHint() {
    if (difficulty !== "kolay" || count !== 2) {
        return "";
    }

    const numberType = secretNumber % 2 === 0 ? "çift" : "tek";
    const typeHints = [
        `\nKüçük ipucu: Tuttuğum sayı ${numberType}.`,
        `\nBonus yardım: Sayı ${numberType} çıktı kanka.`,
        `\nKolay moddan ekstra kıyak: Aradığın sayı ${numberType}.`,
        `\nBir sır daha vereyim: Sayının tipi ${numberType}.`,
        `\nYaklaşman için küçük bilgi: Tuttuğum sayı ${numberType}.`
    ];

    return typeHints[Math.floor(Math.random() * typeHints.length)];
}

function getWrongGuessMessage(direction) {
    if (difficulty === "zor") {
        return getHardModeMessage(direction);
    }

    if (difficulty === "orta") {
        return getMediumModeMessage(direction);
    }

    return getEasyModeMessage(direction);
}

function getEasyModeMessage(direction) {
    const easyHints = [
        `\nDaha ${direction} bir sayı söyle kanka`,
        `\nBiraz daha ${direction} git, yaklaşıyoruz.`,
        `\nYön belli: Daha ${direction} bir tahmin lazım.`,
        `\nKolay mod kıyağı: Sayı daha ${direction} tarafta.`,
        `\nGüzel deneme, ama daha ${direction} düşün.`,
        `\nAzıcık rota değiştir: Daha ${direction}.`,
        `\nBu sayı senden daha ${direction} bir tahmin bekliyor.`
    ];

    return easyHints[Math.floor(Math.random() * easyHints.length)] + getEasyModeHint();
}

function getMediumModeMessage(direction) {
    if (count % 2 === 0) {
        const hintMessages = [
            `\nOrta mod ipucu zamanı: Daha ${direction} bir sayı söyle.`,
            `\nTamam, biraz yardım edeyim: Daha ${direction}.`,
            `\nYön belli oldu kanka: Daha ${direction} tarafa git.`,
            `\nİkinci denemenin hakkı: Daha ${direction} bir sayı lazım.`,
            `\nOrta moddan küçük bir kıyak: Daha ${direction}.`,
            `\nBu sefer yönü söylüyorum: Daha ${direction} düşün.`,
            `\nİpucu geldi, dikkatli kullan: Daha ${direction}.`,
            `\nBiraz yaklaştırayım seni: Daha ${direction} tarafta ara.`,
            `\nTam ortadan konuşuyorum: Daha ${direction} bir tahmin lazım.`
        ];

        return hintMessages[Math.floor(Math.random() * hintMessages.length)];
    }

    const mildTaunts = [
        "\nKolay moddan bir farkımız olsun di mi?",
        "\nHemen ipucu yok, orta mod biraz naz yapar.",
        "\nBir tahmin daha düşün, sonra belki konuşuruz.",
        "\nBu mod ne çok kolay ne çok acımasız, biraz sabır.",
        "\nİpucu hemen gelirse orta modun havası kaçar.",
        "\nFena deneme değil, ama yönü birazdan konuşuruz.",
        "\nBiraz sezgi, biraz şans; orta modun olayı bu.",
        "\nŞimdilik yön yok, sadece hafif bir sessizlik.",
        "\nOrta mod sana hemen sır vermez, ama tamamen de susmaz.",
        "\nBunu not ettim, ama ipucu için biraz erken.",
        "\nKolay mod olsaydı şimdi yardım gelmişti, ama burası orta.",
        "\nBir tahminlik daha sabır, sonra işler değişebilir.",
        "\nYakın mısın uzak mısın, bunu az sonra konuşalım.",
        "\nTahmin güzel, cevap biraz daha seçici davranıyor.",
        "\nOrta mod dengeli gider; hemen panik yok."
    ];

    return mildTaunts[Math.floor(Math.random() * mildTaunts.length)];
}

function getHardModeMessage(direction) {
    if (count >= nextHardHintAt) {
        nextHardHintAt += getNextHardHintTurn();
        const hintMessages = [
            `\nTamam tamam, bu seferlik ipucu: Daha ${direction} bir sayı söyle.`,
            `\nZor modun kapısı aralandı: Daha ${direction} tarafa bak.`,
            `\nŞanslı günündesin, yön veriyorum: Daha ${direction}.`,
            `\nBu ipucunu iyi kullan: Sayı daha ${direction} tarafta.`,
            `\nNadir bir yardım geldi: Daha ${direction} dene.`,
            `\nSistem acıdı galiba: Daha ${direction} bir sayı lazım.`,
            `\nKaranlığın içinden bir fısıltı: Daha ${direction}.`
        ];

        return hintMessages[Math.floor(Math.random() * hintMessages.length)];
    }

    const taunts = [
        "\nZor moddasın, sık sık ipucu vereceğimi mi sandın?",
        "\nBu modun adı boşuna zor değil kanka, biraz sezgi lazım.",
        "\nİpucu kasası kilitli, şimdilik kendi başınasın.",
        "\nGüzel deneme ama yön tabelası bugün izinli.",
        "\nZor mod seni hafif hafif terletmek için burada.",
        "\nBu tahmine ipucu yok, evren sessiz kalmayı seçti.",
        "\nYaklaştın mı uzaklaştın mı? İşte asıl macera burada.",
        "\nBen sayı tuttum, sen de cesaretini topla.",
        "\nİpucu bekleme kuyruğunda 47. sıradasın gibi düşün.",
        "\nZor modun duvarları var kanka, merdiveni sen bulacaksın.",
        "\nBu seferlik sır vermiyorum, tahmin kasların çalışsın.",
        "\nSayı orada bir yerde, ama pusula şu an tatilde.",
        "\nBunu bilseydin zaten zor modu seçmezdin, değil mi?",
        "\nKaranlık tarafta ipuçları taksitle verilir.",
        "\nŞimdilik sadece şunu söyleyeyim: Yanlış cevap.",
        "\nBen olsam biraz daha düşünürdüm ama tabii sen bilirsin.",
        "\nTahminin cesur, sonuç biraz utangaç kaldı.",
        "\nZor mod bugün çok konuşkan değil, şaşırtıcı olmadı.",
        "\nSayı seni duydu ama cevap vermemeyi seçti.",
        "\nİpucu perisi şu an molada, kahvesi bitince bakarız.",
        "\nBu kapıdan ipucu çıkmadı, diğer tahmine geçelim."
    ];

    return taunts[Math.floor(Math.random() * taunts.length)];
}

function getNextHardHintTurn() {
    return Math.random() < 0.5 ? 3 : 4;
}

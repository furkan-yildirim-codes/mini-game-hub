let playAgain = "evet";

let bestScore = {
    kolay: null,
    orta: null,
    zor: null,
    ozel: null
};

let scores = {
    kolay: [],
    orta: [],
    zor: [],
    ozel: []
};

let difficulty;
let maxNumber;
let secretNumber;
let guess;
let count;
let gameStarted = false;
let outputTimer;
let nextHardHintAt;
let countdownWidget;
let countdownToggle;
let countdownReset;
let countdownTime;
let countdownInterval;
let countdownSeconds = 0;
let countdownUnlockTimer;
let countdownAnimateTimer;
let customizeUnlockTimer;
let customizeToggle;
let customPanel;
let customMaxNumberInput;
let customTimeLimitInput;
let customHintModeInput;
let applyCustomSettingsButton;
let gamePanel;
let customPanelTimer;
let customSettings = {
    maxNumber: 100,
    timeLimit: 60,
    hintMode: "sometimes"
};

const difficultyMessages = {
    kolay: "\nKolay Modu Aktif, aralığımız dar ve sana bolca ipucu vereceğim,sakin ve keyifli bir seçenek, hazırsan Başlat butonuna bas...",
    orta: "\nOrta Modu Aktif, aralığımız biraz daha geniş ve ipuçların daha seyrek olacak, biraz daha zorlayıcı bir seçenek, hazırsan Başlat butonuna bas...",
    zor: "\nZor Modu Aktif, aralığın çok geniş ve ipuçların çok sınırlı, gerçekten maceracılara göre bir tercih, şimdiden seni sinirlendireceğim için özür diliyorum👻 hazırsan Başlat butonuna bas..."
};

document.addEventListener("DOMContentLoaded", () => {
    print("\nHoşgeldin kanka, süreli oynamak istiyorsan sayacı aktif et veya bir zorluk seç,kendi dünyamı yaratayım diyorsan özelleştire bas,ardından sayıların dünyasına giriş yap🚀Bol şans...");
    setupCountdown();
    setupCustomization();

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
    countdownWidget = document.getElementById("countdownWidget");
    countdownToggle = document.getElementById("countdownToggle");
    countdownReset = document.getElementById("countdownReset");
    countdownTime = document.getElementById("countdownTime");

    if (!countdownWidget || !countdownToggle || !countdownReset || !countdownTime) {
        return;
    }


    countdownToggle.addEventListener("click", () => {
        if (gameStarted) {
            print("\nOyun sırasında sayacı açıp,kapatmazsın⛔​");
            return;
        }
        const isOpen = countdownWidget.classList.toggle("is-open");
        countdownToggle.textContent = isOpen ? "Sayacı Kapat" : "Sayacı Aç";
        countdownToggle.setAttribute("aria-expanded", String(isOpen));
        if (isOpen && document.querySelector(".difficulty-btn.active") && !gameStarted) {
            resetEasyCountdown();
        }
        print(isOpen ? "\nSayaç Aktif, zor bir tecrübe istiyorsun anlaşılan🥶" : "\nSayaç Kapandı, biraz basit seviyoruz galiba🙂‍↕️​");
    });

    countdownReset.addEventListener("click", resetGameState);

}

function setupCustomization() {
    customizeToggle = document.getElementById("customizeToggle");
    customPanel = document.getElementById("customPanel");
    customMaxNumberInput = document.getElementById("customMaxNumber");
    customTimeLimitInput = document.getElementById("customTimeLimit");
    customHintModeInput = document.getElementById("customHintMode");
    applyCustomSettingsButton = document.getElementById("applyCustomSettings");
    gamePanel = document.querySelector(".game-panel");

    if (!customizeToggle || !customPanel || !customMaxNumberInput || !customTimeLimitInput || !customHintModeInput || !applyCustomSettingsButton) {
        return;
    }

    customizeToggle.addEventListener("click", () => {
        if (gameStarted) {
            print("\nOyun sırasında ayar değiştiremezsin⛔​");
            return;
        }

        if (customPanel.hidden) {
            showCustomPanel();
            print("\nÖzel ayarlar açıldı. Kendi oyununu kur bakalım.");
            return;
        }

        hideCustomPanel();
        print("\nÖzel ayarlar kapandı.");
    });

    applyCustomSettingsButton.addEventListener("click", applyCustomSettings);
}

function applyCustomSettings() {
    if (gameStarted) {
        print("\nOyun sırasında özel ayarları değiştiremezsin⛔​");
        return;
    }

    const selectedMaxNumber = Math.min(Math.max(Number(customMaxNumberInput.value) || 100, 10), 9999);
    const selectedTimeLimit = Math.min(Math.max(Number(customTimeLimitInput.value) || 0, 0), 3600);

    customSettings = {
        maxNumber: selectedMaxNumber,
        timeLimit: selectedTimeLimit,
        hintMode: customHintModeInput.value
    };

    customMaxNumberInput.value = String(selectedMaxNumber);
    customTimeLimitInput.value = String(selectedTimeLimit);

    document.querySelectorAll(".difficulty-btn").forEach((difficultyButton) => {
        difficultyButton.classList.remove("active");
    });

    difficulty = "ozel";
    hideCustomPanel();

    if (selectedTimeLimit > 0) {
        countdownWidget?.classList.add("is-open");
        countdownToggle.textContent = "Sayacı Kapat";
        countdownToggle.setAttribute("aria-expanded", "true");
        resetEasyCountdown();
    } else {
        countdownWidget?.classList.remove("is-open");
        countdownToggle.textContent = "Sayacı Aç";
        countdownToggle.setAttribute("aria-expanded", "false");
        clearEasyCountdown();
    }

    print(`\nÖzel Mod Aktif, Aralık 1-${selectedMaxNumber} arasında, süre ${selectedTimeLimit > 0 ? `${selectedTimeLimit} saniye` : "kapalı"}, İpucu Durumu: ${getCustomHintModeLabel()}, Hazırsan Başlat butonuna bas⚠️`);
}

function startGame() {
    const selectedDifficulty = document.querySelector(".difficulty-btn.active");

    if (!selectedDifficulty && difficulty !== "ozel") {
        print("\nÖnce bir zorluk seçmen gerekiyor kanka.");
        return;
    }

    if (selectedDifficulty) {
        difficulty = selectedDifficulty.dataset.difficulty;
    }

    if (difficulty === "kolay") maxNumber = 100;
    else if (difficulty === "orta") maxNumber = 250;
    else if (difficulty === "zor") maxNumber = 500;
    else maxNumber = customSettings.maxNumber;

    secretNumber = Math.floor(Math.random() * maxNumber) + 1;
    count = 1;
    nextHardHintAt = getNextHardHintTurn();
    gameStarted = true;
    document.getElementById("guessInput").value = "";

    if (countdownWidget?.classList.contains("is-open") && (difficulty !== "ozel" || customSettings.timeLimit > 0)) {
        startEasyCountdown();
    } else {
        clearEasyCountdown();
    }

    syncCountdownLock();
    syncCustomizeLock();
    syncDifficultyLock();

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
        stopEasyCountdown();
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
        syncCountdownLock();
        syncCustomizeLock();
        syncDifficultyLock();
    }
}

function restartGame() {
    stopEasyCountdown();
    startGame();
}

function selectDifficulty(button) {
    if (gameStarted) {
        print("\nOyun sırasında modu değiştiremezsin⛔​");
        return;
    }

    document.querySelectorAll(".difficulty-btn").forEach((difficultyButton) => {
        difficultyButton.classList.remove("active");
    });

    button.classList.add("active");
    difficulty = button.dataset.difficulty;

    if (countdownWidget?.classList.contains("is-open") && !gameStarted) {
        resetEasyCountdown();
    } else if (!gameStarted) {
        clearEasyCountdown();
    }

    print(difficultyMessages[button.dataset.difficulty], button.dataset.difficulty === "zor");
}

function formatCountdownTime(totalSeconds) {
    const safeSeconds = Math.max(totalSeconds, 0);
    const hours = String(Math.floor(safeSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((safeSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(safeSeconds % 60).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}

function updateCountdownDisplay() {
    if (!countdownTime) {
        return;
    }

    countdownTime.textContent = formatCountdownTime(countdownSeconds);
}

function animateCountdownDisplay(targetSeconds = countdownSeconds) {
    if (!countdownTime) {
        return;
    }

    clearInterval(countdownAnimateTimer);

    const parts = countdownTime.textContent.split(":").map(Number);
    let shownSeconds = (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    const step = shownSeconds <= targetSeconds ? 2 : -2;

    countdownAnimateTimer = setInterval(() => {
        if ((step > 0 && shownSeconds >= targetSeconds) || (step < 0 && shownSeconds <= targetSeconds)) {
            clearInterval(countdownAnimateTimer);
            countdownTime.textContent = formatCountdownTime(targetSeconds);
            return;
        }

        shownSeconds += step;

        if ((step > 0 && shownSeconds > targetSeconds) || (step < 0 && shownSeconds < targetSeconds)) {
            shownSeconds = targetSeconds;
        }

        countdownTime.textContent = formatCountdownTime(shownSeconds);
    }, 28);
}

function stopEasyCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = null;
}

function clearEasyCountdown() {
    stopEasyCountdown();
    countdownSeconds = 0;
    updateCountdownDisplay();
}

function resetEasyCountdown() {
    stopEasyCountdown();
    let targetSeconds;

    if (difficulty === "kolay") {
        targetSeconds = 90;
    } else if (difficulty === "orta") {
        targetSeconds = 60;
    } else if (difficulty === "zor") {
        targetSeconds = 45;
    } else if (difficulty === "ozel") {
        targetSeconds = customSettings.timeLimit;
    } else {
        targetSeconds = 0;
    }

    countdownSeconds = targetSeconds;
    animateCountdownDisplay(targetSeconds);
}

function startEasyCountdown() {
    resetEasyCountdown();

    countdownInterval = setInterval(() => {
        countdownSeconds--;
        updateCountdownDisplay();

        if (countdownSeconds > 0) {
            return;
        }

        stopEasyCountdown();
        gameStarted = false;
        clearGuessInput();
        syncDifficultyLock();
        syncCountdownLock();
        syncCustomizeLock();
        print("\nSüre bitti kaybettin☠️", true);
    }, 1000);
}

function resetGameState() {
    stopEasyCountdown();

    bestScore = {
        kolay: null,
        orta: null,
        zor: null,
        ozel: null
    };

    scores = {
        kolay: [],
        orta: [],
        zor: [],
        ozel: []
    };

    difficulty = undefined;
    maxNumber = undefined;
    secretNumber = undefined;
    guess = undefined;
    count = undefined;
    nextHardHintAt = undefined;
    gameStarted = false;
    countdownSeconds = 0;
    customSettings = {
        maxNumber: 100,
        timeLimit: 60,
        hintMode: "sometimes"
    };

    syncCountdownLock();
    syncCustomizeLock();
    syncDifficultyLock();

    document.querySelectorAll(".difficulty-btn").forEach((difficultyButton) => {
        difficultyButton.classList.remove("active");
    });

    document.getElementById("guessInput").value = "";
    clearInterval(outputTimer);

    countdownWidget.classList.remove("is-open");
    countdownToggle.textContent = "Sayacı Aç";
    countdownToggle.setAttribute("aria-expanded", "false");

    if (customPanel) {
        customPanel.hidden = true;
        customPanel.classList.remove("is-entering", "is-leaving");
    }

    if (gamePanel) {
        gamePanel.hidden = false;
    }

    if (customizeToggle) {
        customizeToggle.setAttribute("aria-expanded", "false");
    }

    if (customMaxNumberInput && customTimeLimitInput && customHintModeInput) {
        customMaxNumberInput.value = "100";
        customTimeLimitInput.value = "60";
        customHintModeInput.value = "sometimes";
    }

    syncCountdownLock();
    syncCustomizeLock();
    syncDifficultyLock();
    updateCountdownDisplay();

    print("\nHoşgeldin kanka, süreli oynamak istiyorsan sayacı aktif et veya bir zorluk seç,kendi dünyamı yaratayım diyorsan özelleştire bas,ardından sayıların dünyasına giriş yap🚀Bol şans...");
}

function showCustomPanel() {
    clearTimeout(customPanelTimer);
    customPanel.hidden = false;
    customPanel.classList.remove("is-leaving");
    customPanel.classList.add("is-entering");

    if (gamePanel) {
        gamePanel.hidden = true;
    }

    customizeToggle.setAttribute("aria-expanded", "true");

    customPanelTimer = setTimeout(() => {
        customPanel.classList.remove("is-entering");
    }, 780);
}

function hideCustomPanel() {
    clearTimeout(customPanelTimer);
    customPanel.classList.remove("is-entering");
    customPanel.classList.add("is-leaving");
    customizeToggle.setAttribute("aria-expanded", "false");

    customPanelTimer = setTimeout(() => {
        customPanel.hidden = true;
        customPanel.classList.remove("is-leaving");

        if (gamePanel) {
            gamePanel.hidden = false;
        }
    }, 260);
}

function syncCountdownLock() {
    if (!countdownToggle) {
        return;
    }

    clearTimeout(countdownUnlockTimer);

    if (gameStarted) {
        countdownToggle.classList.remove("is-unlocking");
        countdownToggle.classList.add("is-locked");
        return;
    }

    if (countdownToggle.classList.contains("is-locked")) {
        countdownToggle.classList.add("is-unlocking");
        countdownUnlockTimer = setTimeout(() => {
            countdownToggle.classList.remove("is-unlocking");
        }, 240);
    }

    countdownToggle.classList.remove("is-locked");
}

function syncCustomizeLock() {
    if (!customizeToggle) {
        return;
    }

    clearTimeout(customizeUnlockTimer);

    if (gameStarted) {
        customizeToggle.classList.remove("is-unlocking");
        customizeToggle.classList.add("is-locked");
        return;
    }

    if (customizeToggle.classList.contains("is-locked")) {
        customizeToggle.classList.add("is-unlocking");
        customizeUnlockTimer = setTimeout(() => {
            customizeToggle.classList.remove("is-unlocking");
        }, 240);
    }

    customizeToggle.classList.remove("is-locked");
}

function syncDifficultyLock() {
    document.querySelectorAll(".difficulty-btn").forEach((difficultyButton) => {
        if (gameStarted) {
            difficultyButton.classList.remove("is-unlocking");
            difficultyButton.classList.add("is-locked");
            return;
        }

        if (difficultyButton.classList.contains("is-locked")) {
            difficultyButton.classList.add("is-unlocking");
            setTimeout(() => {
                difficultyButton.classList.remove("is-unlocking");
            }, 240);
        }

        difficultyButton.classList.remove("is-locked");
    });
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
    if (difficulty === "ozel") {
        return getCustomModeMessage(direction);
    }

    if (difficulty === "zor") {
        return getHardModeMessage(direction);
    }

    if (difficulty === "orta") {
        return getMediumModeMessage(direction);
    }

    return getEasyModeMessage(direction);
}

function getCustomHintModeLabel() {
    if (customSettings.hintMode === "always") {
        return "Her yanlışta ipucu verilecek";
    }

    if (customSettings.hintMode === "never") {
        return "İpucu verilmeyecek";
    }

    return "Ara sıra ipucu verilecek";
}

function getCustomModeMessage(direction) {
    if (customSettings.hintMode === "never") {
        const noHintMessages = [
            "\nÖzel mod sessiz: Yanlış cevap.",
            "\nBu ayarda ipucu yok, bir tahmin daha.",
            "\nYanlış oldu. Yön bilgisi kapalı."
        ];

        return noHintMessages[Math.floor(Math.random() * noHintMessages.length)];
    }

    if (customSettings.hintMode === "sometimes" && count % 2 !== 0) {
        const limitedHintMessages = [
            "\nYanlış cevap. Özel mod ipucunu biraz saklıyor.",
            "\nBu tur ipucu yok, bir sonraki tahmin daha değerli.",
            "\nYaklaştın mı uzaklaştın mı, şimdilik sır."
        ];

        return limitedHintMessages[Math.floor(Math.random() * limitedHintMessages.length)];
    }

    const hintMessages = [
        `\nÖzel mod ipucu: Daha ${direction} bir sayı söyle.`,
        `\nAyarların konuştu: Sayı daha ${direction} tarafta.`,
        `\nBu tur yön belli, daha ${direction} düşün.`
    ];

    return hintMessages[Math.floor(Math.random() * hintMessages.length)];
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

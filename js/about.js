const dailyGames = [
    {
        name: "Wordle",
        score: "4 / 6",
        result: "Solved",
        statOneLabel: "STREAK",
        statOneValue: "1",
        statTwoLabel: "AVERAGE",
        statTwoValue: "3.7"
    },

    {
        name: "Tradle",
        score: "2 / 6",
        result: "Solved",
        statOneLabel: "STREAK",
        statOneValue: "1",
        statTwoLabel: "AVERAGE",
        statTwoValue: "2.05"
    },

    {
        name: "Krillion",
        score: "410",
        result: "Completed",
        statOneLabel: "STREAK",
        statOneValue: "1",
        statTwoLabel: "AVERAGE",
        statTwoValue: "410"
    }
]

const gameGrid = document.getElementById("game-grid");
const gamesDate = document.getElementById("games-date");

function renderGames() {
    
    gameGrid.innerHTML = "";

    for (const game of dailyGames) {

        const card = document.createElement("article");

        card.classList.add("game-card");

        card.innerHTML = `
        <p class="game-name">
            ${game.name.toUpperCase()}
        </p>

        <p class="game-score">
            ${game.score}
        </p>

        <p class="game-result>
            ${game.result}
        </p>

        <div class="game-stats">

            <div>
                <span class="game-stat-label">
                    ${game.statOneLabel}
                </span>

                
                <span class="game-stat-value">
                    ${game.statOneValue}
                </span>
            </div>

            <div>
                <span class="game-stat-label">
                    ${game.statTwoLabel}
                </span>

                
                <span class="game-stat-value">
                    ${game.statTwoValue}
                </span>
            </div>

        </div>
        `;

        gameGrid.appendChild(card);
    }
}

function renderDate() {

    const today = new Date();

    gamesDate.textContent = 
        today.toLocaleDateString(
            "en-GB",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        ).toUpperCase();
}

renderDate();
renderGames();
class ExplorerGrid {
    constructor(size, probability) {
        this.size = size;
        this.probability = probability;

        this.grid = [];
        this.spanningSites = new Set();

        this.element = document.getElementById("explorer-lattice");
        this.statusElement = document.getElementById("percolation-status");
        this.occupiedElement = document.getElementById("occupied-count");

        this.generate();
    }

    generate() {
        this.grid = [];
        this.spanningSites.clear();

        let occupiedCount = 0;

        for (let row = 0; row < this.size; row++) {
            const currentRow = [];

            for (let col = 0; col < this.size; col++) {
                const occupied = Math.random() < this.probability;

                 if (occupied) {
                    occupiedCount++;
                }

                currentRow.push(occupied);
            }

            this.grid.push(currentRow);
        }

        this.findSpanningCluster();
        this.render();

        this.occupiedElement.textContent = 
            `${occupiedCount} / ${this.size * this.size}`;
    }


    getNeighbours(row, col) {
        const neighbours = [];

        if (row > 0) {
            neighbours.push([row - 1, col]);
        }

        if (row < this.size - 1) {
            neighbours.push([row + 1, col]);
        }

        if (col > 0) {
            neighbours.push([row, col - 1]);
        }

        if (col < this.size - 1) {
            neighbours.push([row, col + 1])
        }

        return neighbours;
    }


    findSpanningCluster() {
        const visited = Array.from(
            { length: this.size },
            () => Array(this.size).fill(false)
        );

        const queue = [];

        // Start BFS from occupied sites in top row
        for (let col = 0; col < this.size; col++) {
            if (this.grid[0][col]) {
                queue.push([0, col]);
                visited[0][col] = true;
            }
        }

        let reachedBottom = false;

        while (queue.length > 0) {
            const [row, col] = queue.shift();

            this.spanningSites.add(`${row},${col}`);

            if (row == this.size - 1) {
                reachedBottom = true;
            }

            const neighbours = this.getNeighbours(row, col);

            for (const [nextRow, nextCol] of neighbours) {
                if (
                    this.grid[nextRow][nextCol] && 
                    !visited[nextRow][nextCol]
                ) {
                    visited[nextRow][nextCol] = true;
                    queue.push([nextRow, nextCol]);
                }
            }
        }

        this.spans = reachedBottom;
    }

    render() {
        this.element.innerHTML = "";

        this.element.style.gridTemplateColumns = 
        `repeat(${this.size}, 1fr)`;

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {

                const site = document.createElement("div");

                site.classList.add("explorer-site");

                if (this.grid[row][col]) {
                    site.classList.add("occupied");
                }

                if (
                    this.spans &&
                    this.spanningSites.has(`${row},${col}`)
                ) {
                    site.classList.add("spanning");
                }

                this.element.appendChild(site);
            }
        }

        this.updateStatus();
    }

    updateStatus() {
        const statusDot = document.querySelector(".status-dot");

        if (this.spans) {
            this.statusElement.textContent = "SPANNING";
            statusDot.classList.add("active");
        } else {
            this.statusElement.textContent = "NOT SPANNING";
            statusDot.classList.remove("active");
        }
    }

    setProbability(probability) {
        this.probability = probability;
        this.generate();
    }
}

const probabilitySlider =
    document.getElementById("probability-slider");

const probabilityValue =
    document.getElementById("probability-value");

const dataProbability =
    document.getElementById("data-probability");

const regenerateButton = 
    document.getElementById("regenerate-lattice");


const explorerGrid = new ExplorerGrid(
    20,
    Number(probabilitySlider.value)
);


probabilitySlider.addEventListener("input", () => {

    const p = Number(probabilitySlider.value);

    probabilityValue.textContent = `p = ${p.toFixed(3)}`;
    dataProbability.textContent = p.toFixed(3);

});

probabilitySlider.addEventListener("change", () => {

    const p = Number(probabilitySlider.value);

    explorerGrid.setProbability(p);

});

regenerateButton.addEventListener("click", () => {

    explorerGrid.generate();

});
function randomGrid(size, probability) {
    const grid = [];

    for (let row = 0; row < size; row++) {
        const currentRow = [];

        for (let col = 0; col < size; col++) {
            currentRow.push(Math.random() < probability);
        }

        grid.push(currentRow);
    }

    return grid;
}

function hasSpanningCluster(grid, size) {
    const visited = Array.from(
        { length: size },
        () => Array(size).fill(false)
    );

    const queue = [];

    // Add occupied sites from the top row
    for (let col = 0; col < size; col++) {
        if (grid[0][col]) {
            queue.push([0, col]);
            visited[0][col] = true;
        }
    }

    // Using an index is faster than repeatedly calling queue.shift()
    let queueIndex = 0;

    while (queueIndex < queue.length) {
        const [row, col] = queue[queueIndex];
        queueIndex++;

        // Reached bottomm boundary
        if (row == size - 1) {
            return true;
        }

        const neighbours = [
            [row - 1, col],
            [row + 1, col],
            [row, col - 1],
            [row, col + 1]
        ];

        for (const [nextRow, nextCol] of neighbours) {
            if (
                nextRow >= 0 &&
                nextRow < size &&
                nextCol >= 0 &&
                nextCol < size &&
                grid[nextRow][nextCol] && 
                !visited[nextRow][nextCol]
            ) {
                visited[nextRow][nextCol] = true;
                queue.push([nextRow, nextCol])
            }
        }
    }

    return false;
}

function estimateSpanningCurve(
    size,
    trials = 50,
    numberOfPoints = 41
) {
    const curve = [];

    for (let i = 0; i < numberOfPoints; i++) {
        const p = i / (numberOfPoints - 1);

        let spanningCount = 0;

        for (let trial = 0; trial < trials; trial++) {
            const grid = randomGrid(size, p);

            if (hasSpanningCluster(grid, size)) {
                spanningCount++
            }
        }

        const q = spanningCount / trials;

        curve.push({
            p: p,
            q: q
        });
    }

    return curve;
}


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

const SVG_WIDTH = 500;
const SVG_HEIGHT = 300;

let spanningCurve = [];

function drawSpanningCurve(curve) {
    const svg = document.querySelector(".probability-svg");

    // Clear anything previously drawn
    svg.innerHTML = "";

    let pathData = "";

    curve.forEach((point, index) => {
        const x = point.p * SVG_WIDTH;
        const y = (1 - point.q) * SVG_HEIGHT;

        if (index == 0) {
            pathData += `M ${x} ${y}`;
        } else {
            pathData += ` L ${x} ${y}`;
        }
    });

    // Draw empirical probability curve
    const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    path.setAttribute("d", pathData);
    path.setAttribute("class", "spanning-curve");

    svg.appendChild(path);

    // Vertical line showing current p
    const currentLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    currentLine.setAttribute("id", "current-probability-line");
    currentLine.setAttribute("class", "current-probability-line");

    svg.appendChild(currentLine);

    // Marker showing Q(p)
    const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );

    marker.setAttribute("id", "probability-marker");
    marker.setAttribute("r", "5");
    marker.setAttribute("class", "probability-marker");

    svg.appendChild(marker);
}

function interpolateSpanningProbability(p) {
    if (spanningCurve.length == 0) {
        return 0;
    }

    if (p <= spanningCurve[0].p) {
        return spanningCurve[0].q;
    }

    if (p >= spanningCurve[spanningCurve.length - 1].p) {
        return spanningCurve[spanningCurve.length - 1].q;
    }

    for (let i = 0; i < spanningCurve.length - 1; i++) {
        const left = spanningCurve[i];
        const right = spanningCurve[i + 1];

        if (p >= left.p && p <= right.p) {
            const fraction =
                (p - left.p) / (right.p - left.p);

            return left.q + 
                fraction * (right.q - left.q);
        }
    }

    return 0;
}

function updateProbabilityMarker(p) {
    const q = interpolateSpanningProbability(p);

    const x = p * SVG_WIDTH;
    const y = (1 - q) * SVG_HEIGHT;

    const marker = 
        document.getElementById("probability-marker");

    const line =
        document.getElementById("current-probability-line");

    if (!marker || !line) {
        return;
    }

    marker.setAttribute("cx", x);
    marker.setAttribute("cy", y);

    line.setAttribute("x1", x);
    line.setAttribute("x2", x);

    line.setAttribute("y1", SVG_HEIGHT);
    line.setAttribute("y2", y);
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

spanningCurve = estimateSpanningCurve(
    explorerGrid.size,
    50,
    41
);

drawSpanningCurve(spanningCurve);

updateProbabilityMarker(
    Number(probabilitySlider.value)
);

probabilitySlider.addEventListener("input", () => {

    const p = Number(probabilitySlider.value);

    probabilityValue.textContent = `p = ${p.toFixed(3)}`;
    dataProbability.textContent = p.toFixed(3);

    updateProbabilityMarker(p);

});

probabilitySlider.addEventListener("change", () => {

    const p = Number(probabilitySlider.value);

    explorerGrid.setProbability(p);

});

regenerateButton.addEventListener("click", () => {

    explorerGrid.generate();

});


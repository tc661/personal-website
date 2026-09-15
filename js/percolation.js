class Site {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.occupied = false;
        this.neighbours = [];
        this.element = null;
    }

    occupy() {
        this.occupied = true;
        this.element.classList.add('occupied');
    }
}

class Lattice {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.sites = [];
        this.bonds = new Set();

        for (let row = 0; row < rows; row++) {
            let currentRow = [];

            for (let col = 0; col < cols; col++) {
                currentRow.push(new Site(row, col));
            }

            this.sites.push(currentRow);
        }
    }

    getNeighbours(row, col) {
        const neighbors = [];

        if (row > 0) {
            neighbors.push(this.sites[row - 1][col]);
        }

        if (row < this.rows - 1) {
            neighbors.push(this.sites[row + 1][col]);
        }

        if (col > 0) {
            neighbors.push(this.sites[row][col - 1]);
        }

        if (col < this.cols - 1) {
            neighbors.push(this.sites[row][col + 1]);
        }

        return neighbors;
    }

    connectOccupiedNeighbours(site) {
        const neighbours = this.getNeighbours(site.row, site.col);

        for (const neighbour of neighbours) {
            if (neighbour.occupied) {
                site.neighbours.push(neighbour);
                neighbour.neighbours.push(site);

                const key = [
                    `${site.row},${site.col}`,
                    `${neighbour.row},${neighbour.col}`
                ].sort().join('-');

                if (!this.bonds.has(key)) {
                    this.bonds.add(key);
                    this.createBond(site, neighbour);
                }
            }
        }
    }

    createOccupationOrder() {
        const order = [];

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                order.push(this.sites[row][col]);
            }
        }

        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [order[i], order[j]] = [order[j], order[i]];
        }

        return order;
    }

    occupyNext() {
        if (!this.occupationOrder) {
            this.occupationOrder = this.createOccupationOrder();
            this.currentStep = 0;
        }

        if (this.currentStep >= this.occupationOrder.length) {
            return null;
        }

        const site = this.occupationOrder[this.currentStep];

        site.occupy();
        this.connectOccupiedNeighbours(site);

        this.currentStep++;

        return site;
    }

    createBond(siteA, siteB) {
        const bond = document.createElement('div');
        bond.classList.add('bond');

        const x1 = siteA.col * 85 + 4.5;
        const y1 = siteA.row * 85 + 4.5;

        const x2 = siteB.col * 85 + 4.5;
        const y2 = siteB.row * 85 + 4.5;

        bond.style.left = `${Math.min(x1, x2)}px`;
        bond.style.top = `${Math.min(y1, y2)}px`;

        if (siteA.row === siteB.row) {
            bond.style.width = `${Math.abs(x2 - x1)}px`;
            bond.style.height = '2px';
            bond.style.top = `${y1 - 1}px`;
        } else {
            bond.style.width = '2px';
            bond.style.height = `${Math.abs(y2 - y1)}px`;
            bond.style.left = `${x1 - 1}px`;
        }

        this.networkElement.appendChild(bond);

        return bond;
    }

    connectToDOM() {
        this.networkElement = document.querySelector('.percolation-network');

        const rows = document.querySelectorAll('.network-row');

        for (let row = 0; row < this.rows; row++) {
            const sites = rows[row].querySelectorAll('span');
        
            for (let col = 0; col < this.cols; col++) {
                this.sites[row][col].element = sites[col];
            }
        }
    }
}


const lattice = new Lattice(5, 5);

lattice.connectToDOM();

function animatePercolation() {
    const site = lattice.occupyNext();

    if (site != null) {
        setTimeout(animatePercolation, 250);
    }
}

animatePercolation();

console.log(lattice.bonds);
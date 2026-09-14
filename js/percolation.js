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

        bond.style.left = `${siteA.col * 85 + 4.5}px`;
        bond.style.top = `${siteA.row * 85}px`;

        this.sites[siteA.row][siteA.col].element.parentElement.appendChild(bond);

        return bond;
    }

    connectToDOM() {
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

const siteA = lattice.sites[2][2];
const siteB = lattice.sites[2][3];

lattice.createBond(siteA, siteB);
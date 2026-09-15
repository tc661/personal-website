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

    getGeometry() {
        const width = this.networkElement.clientWidth;
        const height = this.networkElement.clientHeight;

        const styles = getComputedStyle(this.networkElement);
        const siteSize = parseFloat(styles.getPropertyValue('--site-size'));
        const siteRadius = siteSize / 2;

        const horizontalSpacing =
            (width - siteSize) / (this.cols - 1);

        const verticalSpacing =
            (height - siteSize) / (this.rows - 1);

        return {
            siteRadius,
            horizontalSpacing,
            verticalSpacing
        };
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

        const {
            siteRadius,
            horizontalSpacing,
            verticalSpacing,
        } = this.getGeometry();

        const x1 = siteRadius + siteA.col * horizontalSpacing;
        const y1 = siteRadius + siteA.row * verticalSpacing;

        const x2 = siteRadius + siteB.col * horizontalSpacing;
        const y2 = siteRadius + siteB.row * verticalSpacing;

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

    reset() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const site = this.sites[row][col];

                site.occupied = false;
                site.neighbours = [];
                site.element.classList.remove('occupied');
            }
        }

        this.bonds.clear()

        const bondElements = this.networkElement.querySelectorAll('.bond');

        for (const bond of bondElements) {
            bond.remove();
        }

        this.occupationOrder = null;
        this.currentStep = 0;
    }

    connectToDOM() {
        this.networkElement = document.querySelector('.percolation-network');

        const {
            siteRadius,
            horizontalSpacing,
            verticalSpacing,
        } = this.getGeometry();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {

                const siteElement = document.createElement('span');

                siteElement.classList.add('site');

                const x = siteRadius + col * horizontalSpacing;
                const y = siteRadius + row * verticalSpacing;

                siteElement.style.left = `${x}px`;
                siteElement.style.top = `${y}px`;

                this.networkElement.appendChild(siteElement)

                this.sites[row][col].element = siteElement;
            }
        }
    }
}


const lattice = new Lattice(6, 6);

lattice.connectToDOM();

function animatePercolation() {
    const site = lattice.occupyNext();

    if (site != null) {
        setTimeout(animatePercolation, 250);
    } else {
        setTimeout(() => {
            lattice.networkElement.classList.add("resetting");

            setTimeout(() => {
                lattice.reset();
                lattice.networkElement.classList.remove("resetting");
                animatePercolation();
            }, 400);

        }, 1200);
    }
}

animatePercolation();
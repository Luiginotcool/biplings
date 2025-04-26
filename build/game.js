"use strict";
class Game {
    static init() {
        Game.cells = [];
        Game.extraCells = [];
        Game.margin = 400;
        Game.pos = { x: 0, y: 0 };
        let factor = 1 / 2;
        let width = 10;
        let height = width;
        Game.grid = new Grid(factor, width, height, 200);
        Game.cells = this.grid.cells;
        [Game.extraCells, Game.blankGrid] = Cell.blankCellArray(Game.grid);
    }
    static gameLoop(dt) {
        let speed = 4;
        if (Input.keys.left) {
            Game.pos.x += speed;
        }
        if (Input.keys.right) {
            Game.pos.x -= speed;
        }
        if (Input.keys.up) {
            Game.pos.y += speed;
        }
        if (Input.keys.down) {
            Game.pos.y -= speed;
        }
        let x = Game.pos.x;
        let y = Game.pos.y;
        let xIso = x - y;
        let yIso = y * this.grid.factor + x * this.grid.factor;
        x = xIso + (App.width - Game.grid.sw) / 2;
        y = yIso + (App.width - Game.grid.sw) / 2;
        Game.grid.mapScreenOrigin = { x: x, y: y };
        Game.blankGrid.mapScreenOrigin = { x: x, y: y };
        Game.grid.updateCenterMidpoint();
        Game.blankGrid.updateCenterMidpoint();
        Game.draw();
        console.log(Game.blankGrid.gameOrigin);
    }
    static draw() {
        Graphics.background();
        let grid = Game.grid;
        let blankGrid = Game.blankGrid;
        let sw = grid.sw;
        let sh = sw * grid.factor;
        let m = 0;
        let linew = 3;
        let w = App.width;
        let h = App.height;
        let x1 = (App.width - grid.windowW) / 2 - m - linew / 2;
        let y1 = (App.height - grid.windowH) / 2 - m - linew / 2;
        Graphics.context.lineWidth = linew;
        Graphics.fillRect(x1, y1, grid.windowW + linew, grid.windowH + linew, "grey");
        Graphics.lineRect(x1, y1, grid.windowW + linew, grid.windowH + linew, "black");
        Graphics.context.lineWidth = 1;
        //Graphics.fillRect()
        Game.extraCells.forEach((cell) => {
            cell.draw(blankGrid);
        });
        Game.cells.forEach((cell) => {
            cell.draw(grid);
            cell.label(grid);
        });
        Graphics.fillRect(0, 0, w, y1);
        Graphics.fillRect(0, 0, x1, h);
        Graphics.fillRect(0, h - y1, w, h - y1);
        Graphics.fillRect(w - x1, 0, w - x1, h);
        //Graphics.drawCircle(App.width / 2, App.height / 2, 20, "red")
        Game.drawPlayer();
    }
    static sortCells(cells) {
        cells.sort((cell1, cell2) => { return -(cell1.y - cell1.x) + (cell2.y - cell2.x); });
    }
    static screenCoordToGameCoord(x, y) {
    }
    static drawPlayer() {
        let mx = 0;
        let my = 0;
        let rx = 60;
        let ry = rx * Game.grid.factor;
        let points = [
            { x: mx - rx, y: my },
            { x: mx, y: my - ry },
            { x: mx + rx, y: my },
            { x: mx, y: my + ry },
        ].map((point) => { return { x: point.x + App.width / 2, y: point.y + (App.height / 2) }; });
        console.log(points);
        Graphics.fillPoly(points, "red");
        Graphics.context.lineWidth = 2;
        Graphics.outlinePoly(points, "black");
        Graphics.context.lineWidth = 1;
    }
}
class Cell {
    constructor(i, x, y, colour = Graphics.fg, wallColour = Graphics.fg, height = 0) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.wallColour = wallColour;
        this.index = i;
        this.height = height;
        this.heightStep = 5;
    }
    static makeCellArray(grid) {
        let cells = [];
        for (let y = 0; y < grid.h; y++) {
            for (let x = 0; x < grid.w; x++) {
                //let colour = Colour.HSLtoRGB((Math.pow(x+y, 1/3))%1, 1, 0.65).tocss()
                let colour = (x >= 2 && x <= 4 && y >= 2 && y <= 4) ? "grey" : "white";
                let wallColour = Colour.HSLtoRGB((Math.pow(x + y, 1 / 2)) % 1, 1, 0.25).tocss();
                let height = Math.random() * 12;
                let cell = new Cell(cells.length, x, y, colour, wallColour, height);
                cells.push(cell);
            }
        }
        Game.sortCells(cells);
        return cells;
    }
    static blankCellArray(grid) {
        let cells = [];
        let b = 4;
        let newGrid = new Grid(grid.factor, grid.w + 2 * b, grid.h + 2 * b, grid.cellWidth);
        newGrid.gameOrigin = { x: -b, y: b };
        for (let y = 0; y < newGrid.h; y++) {
            for (let x = 0; x < newGrid.w; x++) {
                //let colour = Colour.HSLtoRGB((Math.pow(x+y, 1/3))%1, 1, 0.65).tocss()
                let colour = (x + y) % 2 ? "white" : "black";
                let wallColour = Colour.HSLtoRGB((Math.pow(x + y, 1 / 2)) % 1, 1, 0.25).tocss();
                let height = 0;
                let cell = new Cell(cells.length, x, y, colour, wallColour, height);
                cells.push(cell);
            }
        }
        Game.sortCells(cells);
        return [cells, newGrid];
    }
    getCoords(grid) {
        let heightStep = grid.heightStep;
        let height = Math.floor(this.height);
        let [points, midpoint] = this.gameCoordToIsometricScreenCell(grid);
        let newPoints = points.map((point) => { return { x: point.x, y: point.y - height * heightStep }; });
        let wallsPoints = [
            points[0], points[3], newPoints[3], newPoints[0],
            points[3], points[2], newPoints[2], newPoints[3],
            points[0], points[1], newPoints[1], newPoints[0],
            points[1], points[2], newPoints[2], newPoints[1],
        ];
        midpoint.y = midpoint.y - height * heightStep;
        return {
            top: newPoints,
            walls: wallsPoints,
            midpoint: midpoint
        };
    }
    draw(grid) {
        let height = this.height;
        this.height = this.height + 0 * (2 - 1 * ((this.x - Game.grid.w / 2) *
            (this.y - Game.grid.h / 2))) *
            Math.sin((2 - 1 * ((this.x - Game.grid.w / 2) *
                (this.y - Game.grid.h / 2))) * App.frames / 100);
        let coords = this.getCoords(grid);
        this.height = height;
        let topPoints = coords.top;
        let wallsPoints = coords.walls;
        Graphics.fillPoly(wallsPoints.slice(0, 4), this.wallColour);
        Graphics.fillPoly(wallsPoints.slice(4, 8), this.wallColour);
        Graphics.fillPoly(wallsPoints.slice(8, 12), this.wallColour);
        Graphics.fillPoly(wallsPoints.slice(12, 16), this.wallColour);
        Graphics.fillPoly(topPoints, this.colour);
        Graphics.outlinePoly(topPoints, "black");
        Graphics.outlinePoly(wallsPoints.slice(0, 4), "black");
        Graphics.outlinePoly(wallsPoints.slice(4, 8), "black");
    }
    label(grid) {
        let midpoint = this.getMidpoint(grid);
        midpoint.y = midpoint.y - this.height * grid.heightStep;
        Graphics.text(`x: ${this.x}, y: ${this.y}`, midpoint.x - 25, midpoint.y + 8, "black");
    }
    getMidpoint(grid) {
        let x, y;
        x = this.x;
        y = -this.y;
        let mx = grid.centerMidpointx + (x * grid.cellWidth) - (y * grid.cellWidth);
        let my = grid.centerMidpointy + (y * grid.cellHeight) + (x * grid.cellHeight);
        return { x: mx, y: my };
    }
    gameCoordToIsometricScreenCell(grid) {
        let x, y;
        x = this.x;
        y = -this.y;
        let cellWidth = grid.cellWidth;
        let cellHeight = grid.cellHeight;
        let centerMidpointx = grid.centerMidpointx;
        let centerMidpointy = grid.centerMidpointy;
        let mx = centerMidpointx + (x * cellWidth) - (y * cellWidth);
        let my = centerMidpointy + (y * cellHeight) + (x * cellHeight);
        let rx = cellWidth;
        let ry = cellHeight;
        return [[
                { x: mx - rx, y: my },
                { x: mx, y: my - ry },
                { x: mx + rx, y: my },
                { x: mx, y: my + ry },
            ], { x: mx, y: my }];
    }
}
class Grid {
    constructor(factor, width, height = width, cellWidth, gameOrigin, mapScreenOrigin, heightStep) {
        this.factor = factor;
        this.w = width;
        this.h = height;
        if (typeof cellWidth === "undefined") {
            this.windowW = App.width - Game.margin;
            this.windowH = this.windowW * this.factor;
            this.cellWidth = this.windowW / (this.w + this.h);
        }
        else {
            this.cellWidth = cellWidth;
        }
        this.cellHeight = this.cellWidth * factor;
        console.log(this.cellWidth);
        this.sw = this.cellWidth * (this.w + this.h - 2);
        this.sh = this.sw * this.factor;
        if (typeof gameOrigin === "undefined") {
            gameOrigin = { x: 0, y: 0 };
        }
        this.gameOrigin = gameOrigin;
        if (typeof mapScreenOrigin === "undefined") {
            mapScreenOrigin = { x: (App.width - this.sw) / 2, y: App.height / 2 };
        }
        this.mapScreenOrigin = mapScreenOrigin;
        if (typeof heightStep === "undefined") {
            heightStep = 5;
        }
        this.heightStep = heightStep;
        this.centerMidpointx = (this.gameOrigin.x * this.cellWidth) - (this.gameOrigin.y * this.cellWidth) + this.mapScreenOrigin.x;
        this.centerMidpointy = (this.gameOrigin.y * this.cellHeight) + (this.gameOrigin.x * this.cellHeight) + this.mapScreenOrigin.y;
        console.log(this);
        this.cells = Cell.makeCellArray(this);
    }
    updateCenterMidpoint() {
        this.centerMidpointx = (this.gameOrigin.x * this.cellWidth) - (this.gameOrigin.y * this.cellWidth) + this.mapScreenOrigin.x;
        this.centerMidpointy = (this.gameOrigin.y * this.cellHeight) + (this.gameOrigin.x * this.cellHeight) + this.mapScreenOrigin.y;
    }
}

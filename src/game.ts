class Game {
    static colours: Colour[][]
    static cells: Cell[]

    static grid: Grid

    static init(): void {
        Game.cells = [];
        
        
        let factor = 1/2;
        let width = 3;
        let height = 6;
        Game.grid = new Grid(factor, width, height)
        

        for (let y = 0; y < Game.grid.h; y++) {
            for (let x = 0; x < Game.grid.w; x++) {
                //let colour = Colour.HSLtoRGB((Math.pow(x+y, 1/3))%1, 1, 0.65).tocss()
                let colour = (x >= 2 && x <= 4 && y >= 2 && y <= 4) ? "grey" : "white"
                let wallColour = Colour.HSLtoRGB((Math.pow(x+y, 1/2))%1, 1, 0.25).tocss()
                let p = 0.05;
                let height = 50*Math.exp(-Math.pow(x - Game.grid.w / 2, 2) * p - Math.pow(y - Game.grid.h / 2, 2) * p) 
                let cell = new Cell(this.cells.length, x, y, colour, wallColour, height);
                Game.cells.push(cell);
            }
        }

        Game.sortCells(Game.cells);


    }

    static gameLoop(dt: number): void {


        Game.draw();

        Graphics.text("Hello", 50, 100);
    }

    static draw(): void {
        Graphics.background()

        let grid = Game.grid;
        let sw = grid.cellWidth * (grid.w + grid.h);
        let sh = sw * grid.factor;
        //Graphics.fillRect()


        Game.cells.forEach((cell) => {
            cell.draw(grid);
            cell.label(grid);
        })
    }   

    static sortCells(cells:Cell[]) {
        cells.sort((cell1, cell2) => {return -(cell1.y - cell1.x) + (cell2.y - cell2.x);});
    }

    static screenCoordToGameCoord(x: number, y: number) {

    }



}

class Cell {
    x: number;
    y: number;
    colour: string;
    wallColour: string;
    index: number;
    height: number;
    heightStep: number;

    constructor(i:number, x:number, y:number, colour = Graphics.fg, wallColour = Graphics.fg, height = 0) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.wallColour = wallColour
        this.index = i;
        this.height = height;
        this.heightStep = 2;
    }

    static makeCellArray(grid: Grid) {
        let cells = []
        
        for (let y = 0; y < grid.h; y++) {
            for (let x = 0; x < grid.w; x++) {

                //let colour = Colour.HSLtoRGB((Math.pow(x+y, 1/3))%1, 1, 0.65).tocss()
                let colour = (x >= 2 && x <= 4 && y >= 2 && y <= 4) ? "grey" : "white"

                let wallColour = Colour.HSLtoRGB((Math.pow(x+y, 1/2))%1, 1, 0.25).tocss()

                let p = 0.05;
                let height = 0
                let cell = new Cell(cells.length, x, y, colour, wallColour, height);
                Game.cells.push(cell);
            }
        }

        Game.sortCells(Game.cells);
    }

    getCoords(grid: Grid): {top: {x: number, y: number}[], walls: {x: number, y: number}[], midpoint: {x: number, y: number}} {
        let heightStep = 2;
        let height = Math.floor(this.height);
        let [points, midpoint] = this.gameCoordToIsometricScreenCell(grid);
        let newPoints = points.map((point) => {return {x: point.x, y: point.y - height * heightStep}});
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
        }
    }

    draw(grid: Grid) {
        let height = this.height;
        this.height = this.height + 0*(2 - 1*((this.x - Game.grid.w / 2) * 
                    (this.y - Game.grid.h / 2)))*
                    Math.sin((2 - 1*((this.x - Game.grid.w / 2) * 
                    (this.y - Game.grid.h / 2))) * App.frames/ 100)
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

    label(grid: Grid) {
        let midpoint = this.getMidpoint(grid);
        midpoint.y = midpoint.y - this.height * this.heightStep;
        Graphics.text(`x: ${this.x}, y: ${this.y}`, midpoint.x - 25, midpoint.y + 8, "black");
    }

    getMidpoint(grid: Grid) {
        let x,y
        x = this.x
        y = -this.y
        let mx = grid.centerMidpointx + (x * grid.cellWidth) - (y * grid.cellWidth)
        let my = grid.centerMidpointy + (y * grid.cellHeight) + (x * grid.cellHeight)
        return {x: mx, y: my};
    }

    gameCoordToIsometricScreenCell(grid: Grid): [{x: number, y: number}[],{x: number, y: number}] {
        let x,y
        x = this.x
        y = -this.y

        let cellWidth = grid.cellWidth;
        let cellHeight = grid.cellHeight;

        let centerMidpointx = grid.centerMidpointx;
        let centerMidpointy = grid.centerMidpointy;

        let mx = centerMidpointx + (x * cellWidth) - (y * cellWidth)
        let my = centerMidpointy + (y * cellHeight) + (x * cellHeight)
        let rx = cellWidth
        let ry = cellHeight
        return [[
            {x: mx - rx, y: my     },
            {x: mx     , y: my - ry},
            {x: mx + rx, y: my     },
            {x: mx     , y: my + ry},
        ], {x: mx, y: my}]
    }
}


class Grid {
    factor: number;
    cellWidth: number;
    cellHeight: number;
    sw: number;
    sh: number;
    w: number;
    h: number;
    gameOrigin: {x: number, y: number}
    mapScreenOrigin: {x: number, y: number}
    centerMidpointx: number;
    centerMidpointy: number;


    constructor(
        factor: number, 
        width: number, 
        height = width, 
        cellWidth?: number,
        gameOrigin?: {x: number, y: number},
        mapScreenOrigin?: {x: number, y: number}
    ) {
        this.factor = factor;
        this.w = width;
        this.h = height;
        if (typeof cellWidth === "undefined") {
            let screenW = App.width;
            let screenH = App.height;
            this.cellWidth = screenW / (this.w + this.h)
        } else {
            this.cellWidth = 50;
        }

        this.cellHeight = this.cellWidth * factor;
        console.log(this.cellWidth);


        this.sw = this.cellWidth*(this.w+this.h - 2);
        this.sh = this.sw*this.factor;

        if (typeof gameOrigin === "undefined") {
            gameOrigin = {x: 0, y: 0};
        }
        this.gameOrigin = gameOrigin;
        if (typeof mapScreenOrigin === "undefined") {
            mapScreenOrigin = {x: (App.width - this.sw) /2, y: App.height/2}
        }
        this.mapScreenOrigin = mapScreenOrigin!;

        this.centerMidpointx = (this.gameOrigin.x * this.cellWidth) - (this.gameOrigin.y * this.cellWidth) + this.mapScreenOrigin.x
        this.centerMidpointy = (this.gameOrigin.y * this.cellHeight) + (this.gameOrigin.x * this.cellHeight) + this.mapScreenOrigin.y
    }
}

class Game {
    static colours: Colour[][]
    static cells: Cell[]
    static extraCells: Cell[]

    static grid: Grid
    static blankGrid: Grid

    static margin: number;

    static pos: {x: number, y: number}

    static init(): void {
        Game.cells = [];
        Game.extraCells = []; 
        Game.margin = 400     
        Game.pos = {x: 0, y: 0}  
        
        let factor = 1/2;
        let width = 5;
        let height = width;
        Game.grid = new Grid(factor, width, height);
        Game.cells = this.grid.cells;
        [Game.extraCells, Game.blankGrid] = Cell.blankCellArray(Game.grid);
    }

    static gameLoop(dt: number): void {

        Game.pos.x = App.frames / 1;

        Game.grid.mapScreenOrigin = Game.pos;
        Game.blankGrid.mapScreenOrigin = Game.pos;
        Game.draw();
    }

    static draw(): void {
        Graphics.background()

        let grid = Game.grid;
        let blankGrid = Game.blankGrid;
        let sw = grid.sw;
        let sh = sw * grid.factor;
        let m = 0
        let linew = 3
        let w = App.width
        let h = App.height;
        let x1 = (App.width - grid.windowW) / 2 - m - linew / 2;
        let y1 = (App.height - grid.windowH) / 2 - m - linew / 2;



        Graphics.context.lineWidth = linew
        Graphics.fillRect(x1, y1, grid.windowW + linew, grid.windowH + linew, "grey")
        Graphics.lineRect(x1, y1, grid.windowW + linew, grid.windowH + linew, "black")
        Graphics.context.lineWidth = 1;

        //Graphics.fillRect()


        Game.extraCells.forEach((cell) => {
            cell.draw(blankGrid);
        })

        Graphics.fillRect(0, 0, w, y1)
        Graphics.fillRect(0, 0, x1, h)
        Graphics.fillRect(0, h-y1, w, h-y1)
        Graphics.fillRect(w-x1, 0, w-x1, h)

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


                let height = Math.random()*12


                let cell: Cell = new Cell(cells.length, x, y, colour, wallColour, height);
                cells.push(cell);
            }
        }

        Game.sortCells(cells);
        return cells;
    }

    static blankCellArray(grid: Grid): [Cell[], Grid] {
        let cells = []
        let b = 3;
        let newGrid = new Grid(grid.factor, grid.w + 2*b, grid.h + 2*b, grid.cellWidth);
        //newGrid.gameOrigin = {x: -b/2, y: b/2}
        
        for (let y = 0; y < newGrid.h; y++) {
            for (let x = 0; x < newGrid.w; x++) {

                //let colour = Colour.HSLtoRGB((Math.pow(x+y, 1/3))%1, 1, 0.65).tocss()
                let colour = (x+y)%2 ? "white" : "black"


                let wallColour = Colour.HSLtoRGB((Math.pow(x+y, 1/2))%1, 1, 0.25).tocss()


                let height = 0


                let cell: Cell = new Cell(cells.length, x, y, colour, wallColour, height);
                cells.push(cell);
            }
        }

        Game.sortCells(cells);
        return [cells, newGrid];
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
    cells: Cell[];
    windowW: number;
    windowH: number;


    constructor(
        factor: number, 
        width: number, 
        height = width, 
        cellWidth?: number,
        gameOrigin?: {x: number, y: number},
        mapScreenOrigin?: {x: number, y: number},
    ) {
        this.factor = factor;
        this.w = width;
        this.h = height;
        if (typeof cellWidth === "undefined") {
            this.windowW = App.width - Game.margin;
            this.windowH = this.windowW * this.factor;
            this.cellWidth = this.windowW / (this.w + this.h)
        } else {
            this.cellWidth = cellWidth;
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
    
        this.cells = Cell.makeCellArray(this);
    }

    getCenterMidpoint() {
        
    }
}

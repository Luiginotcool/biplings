class Game {
    static colours: Colour[][]
    static cells: Cell[]

    static grid: Grid

    static init(): void {
        App.canvas.onclick = () => {
            Graphics.drawCircle(Input.mouseX, Input.mouseY, 10, `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`)
        }

        let colours = [];
        Game.cells = [];
        
        
        let factor = 1/2;
        let width = 3;
        let height = 10;
        Game.grid = new Grid(factor, width, height)
        

        for (let y = 0; y < Game.grid.h; y++) {
            for (let x = 0; x < Game.grid.w; x++) {
                //let colour = Colour.HSLtoRGB((Math.pow(x+y, 1/3))%1, 1, 0.65).tocss()
                let colour = (x >= 2 && x <= 4 && y >= 2 && y <= 4) ? "grey" : "white"
                let wallColour = Colour.HSLtoRGB((Math.pow(x+y, 1/2))%1, 1, 0.25).tocss()
                let p = 0.05;
                let height = 0*Math.exp(-Math.pow(x - Game.grid.w / 2, 2) * p - Math.pow(y - Game.grid.h / 2, 2) * p) 
                let cell = new Cell(this.cells.length, x, y, colour, wallColour, height);
                Game.cells.push(cell);
            }
        }

        Game.cells.sort(Game.sortIsoDist);


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


        //console.log(Game.cells)

        Game.cells.forEach((cell) => {
            let height = cell.height;
            cell.height = cell.height + 0*(2 - 1*((cell.x - Game.grid.w / 2) * (cell.y - Game.grid.h / 2)))*Math.sin((2 - 1*((cell.x - Game.grid.w / 2) * (cell.y - Game.grid.h / 2))) * App.frames/ 100)
            let coords = cell.getCoords(this.grid);
            cell.height = height;
            let topPoints = coords.top;
            let wallsPoints = coords.walls;
            let midpoint = coords.midpoint;

            Graphics.fillPoly(wallsPoints.slice(0, 4), cell.wallColour);
            Graphics.fillPoly(wallsPoints.slice(4, 8), cell.wallColour);
            Graphics.fillPoly(wallsPoints.slice(8, 12), cell.wallColour);
            Graphics.fillPoly(wallsPoints.slice(12, 16), cell.wallColour);
            Graphics.fillPoly(topPoints, cell.colour);
            Graphics.outlinePoly(topPoints, "black");
            Graphics.outlinePoly(wallsPoints.slice(0, 4), "black");
            Graphics.outlinePoly(wallsPoints.slice(4, 8), "black");

            Graphics.text(`x: ${cell.x}, y: ${cell.y}`, midpoint.x - 25, midpoint.y + 8, "black");
            //console.log(cell.x, cell.y, midpoint)
        })
    }   

    static sortIsoDist(cell1: Cell, cell2: Cell) {
        return -(cell1.y - cell1.x) + (cell2.y - cell2.x);
    }

    static screenCoordToGameCoord(x: number, y: number) {

    }


    static gameCoordToIsometricScreenCell(x: number, y:number, grid: Grid): [{x: number, y: number}[],{x: number, y: number}] {
        y = -y
        // 0, 0 -> 
        //      mx - xrad, my
        //      mx, my - yrad
        //      mx + xrad, my
        //      mx, my + yrad

        //  Get center
        //  Calculate points

        // gap * numx = sw
        // xrad / yrad = sw / sh
        // 0, 0 -> sw/2, sh/2
        // 1, 0 -> sw/2 + gap, sh/2

        let factor = grid.factor;
        let cellWidth = grid.cellWidth;
        let cellHeight = grid.cellHeight;

        let numx = grid.w;
        let numy = grid.h;


        let gridw
        if (x > y) {
            gridw = (-1+numy) * cellWidth * 2 + (numx - numy) * cellWidth;
        } else {
            gridw = (-1+numx) * cellWidth * 2 + (numy - numx) * cellWidth;
        }


        let gameOrigin = {x: 0, y: 0}
        let mapScreenOrigin = {x: (App.width - gridw) /2, y: App.height/2}

        let centerMidpointx = (gameOrigin.x * cellWidth) - (gameOrigin.y * cellWidth) + mapScreenOrigin.x
        let centerMidpointy = (gameOrigin.y * cellHeight) + (gameOrigin.x * cellHeight) + mapScreenOrigin.y

        //Graphics.drawCircle(centerMidpointx, centerMidpointy, 20);

        // Total screen width
        // if x > y
        // Total grid w is numy * width * 2 + (numx - numy) * width
        // if y > x
        // Total grid w is numx * width * 2 + (numy - numx) * width
        // origin is screenw - gridw / 2

        


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

class Cell {
    x: number;
    y: number;
    colour: string;
    wallColour: string;
    index: number;
    height: number;

    constructor(i:number, x:number, y:number, colour = Graphics.fg, wallColour = Graphics.fg, height = 0) {
        this.x = x;
        this.y = y;
        this.colour = colour;
        this.wallColour = wallColour
        this.index = i;
        this.height = height;
    }

    getCoords(grid: Grid): {top: {x: number, y: number}[], walls: {x: number, y: number}[], midpoint: {x: number, y: number}} {
        let heightStep = 2;
        let height = Math.floor(this.height);
        let [points, midpoint] = Game.gameCoordToIsometricScreenCell(this.x, this.y, grid);
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


    constructor(
        factor: number, 
        width: number, 
        height = width, 
        cellWidth = -1,
        gameOrigin = {x: 0, y: 0},
        mapScreenOrigin: {x: number, y: number} | undefined
    ) {
        this.factor = factor;
        this.w = width;
        this.h = height;
        if (cellWidth < 0) {
            let screenW = App.width;
            let screenH = App.height;
            this.cellWidth = screenW / (this.w + this.h)
        } else {
            this.cellWidth = 50;
        }

        this.cellHeight = this.cellWidth * factor;
        console.log(this.cellWidth);


        this.sw = this.cellWidth*(this.w+this.h);
        this.sh = this.sw*this.factor;

        this.gameOrigin = {x: 0, y: 0}
        if (this.mapScreenOrigin === undefined) {
            mapScreenOrigin = {x: (App.width - this.sw) /2, y: App.height/2}
        }
        this.mapScreenOrigin = mapScreenOrigin!;
    }

}
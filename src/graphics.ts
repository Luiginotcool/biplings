class Graphics {
    static context: CanvasRenderingContext2D;
    static fg: string;
    static bg: string;

    static init(canvas: HTMLCanvasElement): void {
        Graphics.context = canvas.getContext("2d")!;
        Graphics.fg = "black";
        Graphics.bg = "#776065";
    }

    static drawArrow(startX: number, startY: number, endX: number, endY: number, arrowSize: number): void {
        var context = Graphics.context;
        context.fillStyle = Graphics.fg
        // Calculate arrow angle
        var angle = Math.atan2(endY - startY, endX - startX);
    
        // Draw line
        context.beginPath();
        context.moveTo(startX, startY);
        context.lineTo(endX, endY);
        context.stroke();
    
        // Draw arrowhead
        context.beginPath();
        context.moveTo(endX, endY);
        context.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6));
        context.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6));
        context.closePath();
        context.fill();
    }

    static line(x1: number, y1: number, x2: number, y2: number, colour = Graphics.fg): void {
        let context = Graphics.context;
        context.strokeStyle = colour;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2,y2);
        context.stroke();
    }
    
    static drawFps(fps: number): void {
        Graphics.context.fillStyle = "BLACK";
        Graphics.context.fillRect(8,16,43,18);
        Graphics.context.fillStyle = "white";
        Graphics.context.font = "15px Arial";
        Graphics.context.fillText(`${fps.toFixed(0)} fps`, 10, 30);
    }

    static background(colour = Graphics.bg) {
        if (!App.canvas) {
            console.log("NO CANVAS")
            return;
        }
        //console.log("FILLING")
        Graphics.context.fillStyle = colour;
        Graphics.context.fillRect(0, 0, App.canvas.width, App.canvas.height);
    }
    
    static fillRect(x: number, y: number, w: number, h: number, colour = Graphics.fg) {
        Graphics.context.fillStyle = colour;
        Graphics.context.fillRect(x, y, w, h)
    }

    static lineRect(x: number, y: number, w: number, h: number, colour = Graphics.fg) {
        Graphics.context.strokeStyle = colour;
        Graphics.context.strokeRect(x, y, w, h)
    }
    
    static drawCircle(x:number, y:number, radius:number, fill: null | string = null, stroke = Graphics.fg, strokeWidth = 1) {
        let ctx = Graphics.context
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
        if (fill) {
          ctx.fillStyle = fill
          ctx.fill()
        }
        if (stroke) {
          ctx.lineWidth = strokeWidth
          ctx.strokeStyle = stroke
          ctx.stroke()
        }
    }

    static fillPoly(points: {x: number, y: number}[], colour = Graphics.fg) {
        let context = Graphics.context;

        context.fillStyle = colour;
    
        // Draw arrowhead
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length; i++) {
            let j = (i+1) % 4
            let point = points[j]
            context.lineTo(point.x, point.y);
            //console.log(point.x, point.y)
        }

        //context.lineTo()
        context.closePath();
        context.fill();
    
    }

    static outlinePoly(points: {x: number, y: number}[], colour = Graphics.fg) {
        let context = Graphics.context;

        context.strokeStyle = colour;
    
        // Draw arrowhead
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length; i++) {
            let j = (i+1) % 4
            let point = points[j]
            context.lineTo(point.x, point.y);
            //console.log(point.x, point.y)
        }

        //context.lineTo()
        context.closePath();
        context.stroke();
    
    }

    static text(str: string, x: number, y: number, colour = Graphics.fg) {
        let ctx = Graphics.context;
        ctx.font = "12px serif";
        ctx.fillStyle = colour;
        ctx.fillText(str, x, y);
    }
}

class Colour {
    r: number;
    g: number;
    b: number;

    constructor(r=0,g=0,b=0) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    static HSLtoRGB(h: number, s: number, l: number) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        }
        else {
            function hue2rgb(p: number, q: number, t: number){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return new Colour(r * 255, g * 255, b * 255);
    }

    tocss() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`
    }
}
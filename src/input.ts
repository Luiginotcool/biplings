class Input {
    static keys  = {
        "left": 0,
        "right": 0,
        "up": 0,
        "down": 0,
        "p": 0,
        "shift":0,
    };
    static mouseX: number;
    static mouseY: number;

    static init(): void {
        document.addEventListener('keydown', function(e) { Input.changeKey(e.key, 1)});
        document.addEventListener('keyup',   function(e) { Input.changeKey(e.key, 0) });
        document.addEventListener("mousemove", function(e) { Input.setMousePos(e.clientX, e.clientY)});
    }

    static changeKey(key:string, to:number): void {
        switch (key) {
            // left, a
            case "ArrowLeft": case "a": this.keys.left = to; break;
            // right, d
            case "ArrowRight": case "d": this.keys.right = to; break;
            // up, w
            case "ArrowUp": case "w": this.keys.up = to; break;
            // down, s
            case "ArrowDown": case "s": this.keys.down = to; break;
            // p
            case "p": this.keys.p = to; break;
            // shift
            case "Control": this.keys.shift = to; break;
        }
    }

    static setMousePos(x: number, y:number) {
        Input.mouseX = x;
        Input.mouseY = y;
    }

}
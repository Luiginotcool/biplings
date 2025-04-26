class App {
    static canvas: HTMLCanvasElement;
    static width: number;
    static height: number;
    static frames: number;
    static oldTimeStamp: number;
    static noLoop: boolean;
    static dt: number;

    static init(): void {
        App.canvas = <HTMLCanvasElement>document.getElementById("canvas");
        App.width = window.innerWidth;
        App.height = window.innerHeight;
        App.canvas.width = App.width;
        App.canvas.height = App.height;
        App.frames = 0;
        App.oldTimeStamp = 0;

        App.noLoop = false;

        

        
        Input.init();
        console.log(Input.keys)

        Graphics.init(App.canvas);
        //App.testGraphics();

        Game.init();


        window.requestAnimationFrame(App.gameLoop);
    }

    static gameLoop(timeStamp: DOMHighResTimeStamp): void {
        if (App.noLoop) {
            window.requestAnimationFrame(App.gameLoop);
        } else {
            App.dt = (timeStamp - App.oldTimeStamp);
            App.oldTimeStamp = timeStamp;
            let fps = Math.round(1000 / (App.dt < 1000/60 ? 1000/60: App.dt));

            Game.gameLoop(App.dt);
    
            Graphics.drawFps(fps);
            App.frames++;
    
            App.noLoop = false;
            window.requestAnimationFrame(App.gameLoop);
        }
    }

    static testGraphics(): void {
        Graphics.background();
        Graphics.drawCircle(100, 200, 20, "blue");
    }
}

App.init();
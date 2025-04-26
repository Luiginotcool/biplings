"use strict";
class App {
    static init() {
        App.canvas = document.getElementById("canvas");
        App.width = window.innerWidth;
        App.height = window.innerHeight;
        App.canvas.width = App.width;
        App.canvas.height = App.height;
        App.frames = 0;
        App.oldTimeStamp = 0;
        App.noLoop = false;
        Input.init();
        console.log(Input.keys);
        Graphics.init(App.canvas);
        //App.testGraphics();
        Game.init();
        window.requestAnimationFrame(App.gameLoop);
    }
    static gameLoop(timeStamp) {
        if (App.noLoop) {
            window.requestAnimationFrame(App.gameLoop);
        }
        else {
            App.dt = (timeStamp - App.oldTimeStamp);
            App.oldTimeStamp = timeStamp;
            let fps = Math.round(1000 / (App.dt < 1000 / 60 ? 1000 / 60 : App.dt));
            Game.gameLoop(App.dt);
            Graphics.drawFps(fps);
            App.frames++;
            App.noLoop = false;
            window.requestAnimationFrame(App.gameLoop);
        }
    }
    static testGraphics() {
        Graphics.background();
        Graphics.drawCircle(100, 200, 20, "blue");
    }
}
App.init();

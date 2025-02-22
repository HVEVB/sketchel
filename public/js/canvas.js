function download(filename, data) {
    var element = document.createElement('a');
    element.setAttribute('href', data);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

window.onload = () => {
    function preventBehavior(e) {
        e.preventDefault(); 
    };
    
    document.addEventListener("touchmove", preventBehavior, {passive: false});
    window.Sketchel = new Object();
    window.Sketchel.Settings = {
        "BrushWidth": 10,
        "Color": "#FF0000"
    };
    document.getElementsByClassName("ExportBtn")[0].addEventListener("click", (e) => {
        if (Sketchel.History.length > 0) {
            download("Sketchel_Export.png", Sketchel.canvas.toDataURL());
        } else {
            alert("You might want to actually draw something before exporting your drawing... Just sayin");
        }
    });
    document.getElementsByClassName("SaveBtn")[0].addEventListener("click", (e) => {
        if (Sketchel.History.length > 0) {
            let postData = {
                width: window.Sketchel.canvas.width,
                height: window.Sketchel.canvas.height,
                history: window.Sketchel.History
            };

            $.ajax({
                type: 'POST',
                url: 'https://sketchel.art/api/post',
                processData: false,
                data: JSON.stringify(postData),
                success: function(msg){
                    window.location(msg);
                }
            });
        } else {
            alert("You might want to actually draw something before saving your drawing... Just sayin");
        }
    });
    document.getElementsByClassName("PencilBtn")[0].addEventListener("click", (e) => {
        window.Sketchel.canvas.style.cursor = "url(pencilCur.svg) 5 5, auto";
        window.Sketchel.pickr.applyColor();
    });
    document.getElementsByClassName("EraserBtn")[0].addEventListener("click", (e) => {
        window.Sketchel.canvas.style.cursor = "url(eraserCur.svg) 5 5, auto";
        window.Sketchel.Settings.Color = "#ffffff";
    });
    window.Sketchel.Redraw = () => {
        window.Sketchel.Clear();
        window.Sketchel.History.forEach((el) => {
            if (el.type == "brush_draw")
            {
                window.Sketchel.ctx.beginPath();
                window.Sketchel.ctx.lineCap = "round";
                window.Sketchel.ctx.strokeStyle = el.color;
                window.Sketchel.ctx.lineWidth = el.width;
                window.Sketchel.ctx.moveTo(el.from.x, el.from.y);
                window.Sketchel.ctx.lineTo(el.to.x, el.to.y);
                window.Sketchel.ctx.stroke();
            }
            else
            {
                console.log("other");
            }
        });
    }
    document.onkeydown = (e) => {
        var evtobj = window.event? event : e;
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) 
            document.getElementsByClassName("UndoBtn")[0].click();
        if (evtobj.keyCode == 89 && evtobj.ctrlKey)
            document.getElementsByClassName("RedoBtn")[0].click();
    }
    document.getElementsByClassName("UndoBtn")[0].addEventListener("click", (e) => {
        if (window.Sketchel.isDrawing) return;
        if (window.Sketchel.History.length == 0) return;
        while (true) {
            window.Sketchel.Redo.push(window.Sketchel.History[window.Sketchel.History.length-1]);
            window.Sketchel.History.splice(-1,1);
            if ((!window.Sketchel.History[window.Sketchel.History.length-1]) || window.Sketchel.History[window.Sketchel.History.length-1].final)
            {
                window.Sketchel.Redraw();
                return;
            }
        }
    });
    document.getElementsByClassName("RedoBtn")[0].addEventListener("click", (e) => {
        if (window.Sketchel.isDrawing) return;
        if (window.Sketchel.Redo.length == 0) return;
        var final = false;
        while (true) {
            window.Sketchel.Redo[window.Sketchel.Redo.length-1].final = false;
            console.log(window.Sketchel.Redo[window.Sketchel.Redo.length-1]);
            window.Sketchel.History.push(window.Sketchel.Redo[window.Sketchel.Redo.length-1]);
            window.Sketchel.Redo.splice(-1,1);
            if ((!window.Sketchel.Redo[window.Sketchel.Redo.length-1]) || final)
            {
                window.Sketchel.Redraw();
                return;
            }
            if (window.Sketchel.Redo[window.Sketchel.Redo.length-1].final) final = true;
        }
    });
    document.getElementsByClassName("ClearBtn")[0].addEventListener("click", (e) => {
        window.Sketchel.Redo = [];
        window.Sketchel.Clear();
        window.Sketchel.History.push({
            "type": "brush_draw",
            "from": {
                "x": 1,
                "y": 1
            },
            "to": {
                "x": window.Sketchel.canvas.height,
                "y": window.Sketchel.canvas.width
            },
            "color": "#ffffff",
            "width": 10000,
            "final": true
        });
    });
    document.getElementsByClassName("Brushslider")[0].onmousemove = (e) => {
        window.Sketchel.Settings.BrushWidth = e.target.value;
        document.getElementsByClassName("BrushSize")[0].innerHTML = e.target.value;
    };
    document.getElementsByClassName("Brushslider")[0].onchange = (e) => {
        window.Sketchel.Settings.BrushWidth = e.target.value;
        document.getElementsByClassName("BrushSize")[0].innerHTML = e.target.value;
    };
    window.Sketchel.pickr = Pickr.create({
        el: '.pickr',
        theme: 'nano',

        swatches: [
            'rgba(244, 67, 54, 1)',
            'rgba(233, 30, 99, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(103, 58, 183, 1)',
            'rgba(63, 81, 181, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(3, 169, 244, 1)',
            'rgba(0, 188, 212, 1)',
            'rgba(0, 150, 136, 1)',
            'rgba(76, 175, 80, 1)',
            'rgba(139, 195, 74, 1)',
            'rgba(205, 220, 57, 1)',
            'rgba(255, 235, 59, 1)',
            'rgba(255, 193, 7, 1)'
        ],
        default: '#000',

        components: {

            // Main components
            preview: true,
            hue: true,
            // Input / output Options
            interaction: {
                input: true,
                save: true
            }
        }
    });
    document.getElementsByClassName("pcr-button")[0].style.height = "100%";
    document.getElementsByClassName("pcr-button")[0].style.width = "100%";
    window.Sketchel.canvas = document.getElementsByClassName("SketchelCanvas")[0];
    window.Sketchel.ctx = window.Sketchel.canvas.getContext("2d");

    window.Sketchel.canvas.width = window.Sketchel.canvas.clientWidth - 20;
    window.Sketchel.canvas.height = window.Sketchel.canvas.clientHeight - 20;
    window.Sketchel.History = [];
    window.Sketchel.Settings.Color = window.Sketchel.pickr.getColor().toHEXA().join('');
    window.Sketchel.Redo = new Array();
    window.Sketchel.Clear = (e) => {
        window.Sketchel.ctx.beginPath();
        window.Sketchel.ctx.lineCap = "round";
        window.Sketchel.ctx.strokeStyle = "#ffffff";
        window.Sketchel.ctx.lineWidth = 10000;
        window.Sketchel.ctx.moveTo(1, 1);
        window.Sketchel.ctx.lineTo(window.Sketchel.canvas.height, window.Sketchel.canvas.width);
        window.Sketchel.ctx.stroke();
        window.Sketchel.pickr.applyColor();
    }
    window.Sketchel.pickr.on('save', (e) => {
        if (e.toHEXA().join('').length > 6) {
            window.Sketchel.pickr.setColor("#" + e.toHEXA().join('').substring(0, 6));
            window.Sketchel.pickr.applyColor();
        } else {
            window.Sketchel.Settings.Color = "#" + e.toHEXA().join('');
        }
    });
    window.Sketchel.canvas.onmousedown = (e) => {
        window.Sketchel.StartDraw(e);
        console.log(e);
    }
    window.Sketchel.canvas.onmousemove = (e) => {
        window.Sketchel.ContinueDraw(e);
        console.log(e);
    }
    window.Sketchel.canvas.onmouseup = (e) => {
        window.Sketchel.StopDraw(e);
        console.log(e);
    }
    setTimeout(() => {
        window.Sketchel.Clear();
    }, 100);
    window.Sketchel.canvas.addEventListener("touchstart", function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        window.Sketchel.canvas.dispatchEvent(mouseEvent);
    }, false);
    window.Sketchel.canvas.addEventListener("touchend", function (e) {
        var mouseEvent = new MouseEvent("mouseup", {});
        window.Sketchel.canvas.dispatchEvent(mouseEvent);
    }, false);
    window.Sketchel.canvas.addEventListener("touchmove", function (e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        window.Sketchel.canvas.dispatchEvent(mouseEvent);
    }, false);

    // Get the position of a touch relative to the canvas
    function getTouchPos(canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX,
            y: touchEvent.touches[0].clientY
        };
    }
    window.Sketchel.StartDraw = (e) => {
        if (window.Sketchel.Redo.length > 0)
            window.Sketchel.Redo = [];
        //if (e.buttons == 1) {
            window.Sketchel.isDrawing = true;
            let rect = window.Sketchel.canvas.getBoundingClientRect();
            window.Sketchel.Settings.LastPos = {
                "x": e.x - rect.x,
                "y": e.y - rect.y
            };
            window.Sketchel.ctx.beginPath();
            window.Sketchel.ctx.lineCap = "round";
            window.Sketchel.ctx.strokeStyle = window.Sketchel.Settings.Color;
            window.Sketchel.ctx.lineWidth = window.Sketchel.Settings.BrushWidth;
            let LastPos = window.Sketchel.Settings.LastPos;
            window.Sketchel.ctx.moveTo(LastPos.x, LastPos.y);
            window.Sketchel.ctx.lineTo(e.x - rect.x, e.y - rect.y);
            window.Sketchel.ctx.stroke();
            window.Sketchel.History.push({
                "type": "brush_draw",
                "from": {
                    "x": LastPos.x,
                    "y": LastPos.y
                },
                "to": {
                    "x": e.x - rect.x,
                    "y": e.y - rect.y
                },
                "color": window.Sketchel.Settings.Color,
                "width": window.Sketchel.Settings.BrushWidth + ""
            });
            window.Sketchel.Settings.LastPos = {
                "x": e.x - rect.x,
                "y": e.y - rect.y
            };
        //}
    }
    window.Sketchel.StopDraw = (e) => {
        if (e.buttons)
        {
            if (e.buttons == 1) return;
            if (e.buttons == 3) return;
        }
        window.Sketchel.isDrawing = false;
        window.Sketchel.History[window.Sketchel.History.length-1].final = true;
    }
    window.Sketchel.ContinueDraw = (e) => {
        if (window.Sketchel.isDrawing) {
            let rect = window.Sketchel.canvas.getBoundingClientRect();
            /*if (e.buttons == 0 || e.buttons == 2) {
                window.Sketchel.isDrawing = false;
                return;
            }*/
            window.Sketchel.ctx.beginPath();
            window.Sketchel.ctx.lineCap = "round";
            window.Sketchel.ctx.fillStyle = window.Sketchel.Settings.Color;
            window.Sketchel.ctx.lineWidth = window.Sketchel.Settings.BrushWidth;
            let LastPos = window.Sketchel.Settings.LastPos;
            window.Sketchel.ctx.moveTo(LastPos.x, LastPos.y);
            window.Sketchel.ctx.lineTo(e.x - rect.x, e.y - rect.y);
            window.Sketchel.ctx.stroke();
            window.Sketchel.History.push({
                "type": "brush_draw",
                "from": {
                    "x": LastPos.x,
                    "y": LastPos.y
                },
                "to": {
                    "x": e.x - rect.x,
                    "y": e.y - rect.y
                },
                "color": window.Sketchel.Settings.Color,
                "width": window.Sketchel.Settings.BrushWidth + ""
            });
            window.Sketchel.Settings.LastPos = {
                "x": e.x - rect.x,
                "y": e.y - rect.y
            };
        }
    }
}
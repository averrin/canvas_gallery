/*
 * TODO:
 *  zoomout animation
 *  zoomin animation from current image position
 *  optimize full view animation
 */


window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();


var bg = document.getElementById('layer1');
var fg = document.getElementById('layer2');
var bgctx = bg.getContext('2d');
var fgctx = fg.getContext('2d');

window.onresize = recalc;
window.defaultState = "";
window.h = 180;
var selectedImage = {key: "", in_zoom: false, col: 0, row: 0};
var nav = [];
var lastRect = {};

//function reset() {
//    bgctx.clearRect(0, 0, bg.width, bg.height);
//    var imageObj = new Image();
//    imageObj.onload = function () {
//        bgctx.drawImage(this, 0, 0);
//    };
//    imageObj.src = window.defaultState;
//}

function redraw() {
    bgctx.clearRect(0, 0, bg.width, bg.height);
    for (var i in images) {
        drawImage(i, bgctx);
    }

    bgctx.font = '20pt Calibri';
    var s = "Use      /     /     /      for selection;        for toggle zoom";
    bgctx.fillStyle = '#222233';
    var x = 90;
    bgctx.beginPath();
    for(i = 0; i < 4; i++) {
        bgctx.rect(x, window.innerHeight - 48, 24, 24);
        x += 40;
    }
    bgctx.rect(400, window.innerHeight - 48, 24, 24);
    bgctx.fill();
    bgctx.fillStyle = '#eee';
    x = 91;
    for(i = 0; i < 4; i++) {
        var c = ["\u25B6", "\u25C0", "\u25BC", "\u25B2"][i];
        bgctx.fillText(c, x, window.innerHeight - 28, 24, 24);
        x += 40;
    }
    bgctx.font = '14pt Calibri';
    bgctx.fillText("\u21B5", 402, window.innerHeight - 28, 24, 24);
    bgctx.font = '20pt Calibri';
    bgctx.fillText(s, 40, window.innerHeight - 28);

    selectedImage.in_zoom = false;
    selectImage(selectedImage.key, selectedImage.in_zoom);
    fgctx.textAlign = 'right';
    fgctx.font = '16pt Calibri';
}
function recalc() {
    nav = [];
    bgctx.canvas.width = window.innerWidth - 40;
    bgctx.canvas.height = window.innerHeight - 20;
    fgctx.canvas.width = window.innerWidth - 40;
    fgctx.canvas.height = window.innerHeight - 20;
    var hoffset = 40;
    var voffset = 40;
    var n = 0;
    var m = 0;

    for (var i in images) {
        if(selectedImage.key == "") {
            selectedImage.key = i;
        }
        var img = images[i].img;
        var k = window.h / img.height;
        var w = img.width * k;
        if (hoffset + w > window.innerWidth) {
            voffset += window.h;
            hoffset = 40;
            m += 1;
            n = 0;
        }
        var oz = (window.innerHeight - 100) / h;
        if ( w*oz > window.innerWidth - 160) {
            oz = (window.innerWidth - 160) / w;
        }
        images[i].rect = {
            y0: voffset,
            x0: hoffset,
            width: w,
            height: h
        };
        images[i].oz = oz;

        if(typeof nav[m] == "undefined"){
            nav[m] = []
        }
        nav[m][n] = i;

        images[i].col = n;
        images[i].row = m;
        hoffset += w;
        n += 1;
    }

    if(window.h > (window.innerHeight - 20) / (m+1)){
        window.h = (window.innerHeight - 20) / (m+1); // too small
        recalc()
    }

    redraw();
    window.h = 180;
}

var images = {};

function loadImages(sources, callback) {
    var loadedImages = 0;
    var numImages = 0;
    for (var _ in sources) {
        numImages++;
    }
    for (var src in sources) {
        images[src] = {};
        images[src].img = new Image();
        images[src].img.onload = function () {
            if (++loadedImages >= numImages) {
                callback(images);
            }
        };
        images[src].img.src = sources[src];
        images[src].title = src;
    }
}

var sources = {
    stairs: 'images/one.jpg',
    sky: 'images/two.jpg',
    view: 'images/three.jpg',
    shadowrun: 'images/four.jpg',
    light: 'images/five.jpg',
    highway: 'images/six.jpg',
    poster: 'images/seven.jpg',
    bridge: 'images/eight.jpg',
    rain: 'images/nine.jpg',
    roof: 'images/10.jpg',
    11: 'images/11.jpg',
    12: 'images/12.jpg',
    13: 'images/13.jpg',
    14: 'images/14.jpg',
    15: 'images/15.png',
    16: 'images/16.jpg',
    17: 'images/17.jpg'
};

function drawImage(key, ctx) {
    if (typeof key == "string") {
        var image = images[key];
    } else {
        image = key;
    }
    var rect = image.rect;
    ctx.drawImage(image.img, rect.x0, rect.y0, rect.width, rect.height);
    var spread = 40;
    lastRect = {
        x0: rect.x0 - spread,
        y0: rect.y0 - spread,
        width: rect.width + spread*2,
        height: rect.height + spread*2
    };
}

function zoom(key, startTime, in_zoom) {
    var image = images[key];
    var rect = image.rect;
    var time = (new Date()).getTime() - startTime;
    var speed = 3;
    var oz = 1.2;
    var z = 0;
    var ti = {};
    var th = 30;


    if (!in_zoom) {
        z = (oz - 1) * time / 1000 * speed;

        ti = {
            img: image.img,
            rect: {
                x0: Math.round(rect.x0 - (rect.width * z) / 2),
                y0: Math.round(rect.y0 - (rect.height * z) / 2),
                width: Math.round(rect.width * (1 + z)),
                height: Math.round(rect.height * (1 + z))
            },
            title: image.title
        }
    } else {
        oz = image.oz;
        speed = 3;
        z = (oz - 1) * time / 1000 * speed;
        ti = {
            img: image.img,
            rect: {
                x0: 40,
                y0: 40,
                width: Math.round(rect.width * (1 + z)),
                height: Math.round(rect.height * (1 + z))
            },
            title: image.title
        }
    }
    if (z >= oz - 1) {
        return;
    }

    //fgctx.clearRect(0, 0, bg.width, bg.height);
    fgctx.clearRect(lastRect.x0, lastRect.y0, lastRect.width, lastRect.height)
    fgctx.save();

    fgctx.shadowColor = '#0a0a0a';
    fgctx.shadowBlur = 20;
    fgctx.shadowOffsetX = 10;
    fgctx.shadowOffsetY = 10;

    drawImage(ti, fgctx);
    rect = ti.rect;
    fgctx.restore();

    fgctx.beginPath();
    fgctx.rect(rect.x0, rect.y0 + rect.height - th, rect.width, th);
    fgctx.fillStyle = "rgba(0,0,0,0.8)";
    fgctx.fill();

    var s = image.title + " [" + image.img.width + "x" + image.img.height + "]";
    fgctx.fillStyle = '#eee';
    fgctx.fillText(s, rect.x0 + rect.width - 8, rect.y0 + rect.height - 8);

    requestAnimFrame(function () {
        zoom(key, startTime, in_zoom);
    });

}

function selectImage(key, in_zoom) {
    var startTime = (new Date()).getTime();
    zoom(key, startTime, in_zoom);
}

loadImages(sources, function (images) {
    recalc();
});

function next() {
    var i = selectedImage;
    i.col += 1;
    if(i.col > nav[i.row].length - 1){
        i.col = 0;
        i.row += 1;
        if(i.row > nav.length - 1){
            i.row = 0;
        }
    }
    i.key = nav[i.row][i.col];
    selectImage(i.key, i.in_zoom);
}
function prev() {
    var i = selectedImage;
    i.col -= 1;
    if(i.col < 0){
        i.row -= 1;
        if(i.row < 0){
            i.row = nav.length - 1;
        }
        i.col = nav[i.row].length - 1;
    }
    i.key = nav[i.row][i.col];
    selectImage(i.key, i.in_zoom);
}

function up(){
    var i = selectedImage;
    i.row -= 1;
    if(i.row < 0){
        i.row = nav.length - 1;
    }
    if(i.col > nav[i.row].length - 1){
        i.col = nav[i.row].length - 1;
    }
    i.key = nav[i.row][i.col];
    selectImage(i.key, i.in_zoom);
}
function down(){
    var i = selectedImage;
    i.row += 1;
    if(i.row > nav.length - 1){
        i.row = 0;
    }
    if(i.col > nav[i.row].length - 1){
        i.col = nav[i.row].length - 1;
    }
    i.key = nav[i.row][i.col];
    selectImage(i.key, i.in_zoom);
}

function show() {
    selectedImage.in_zoom = !selectedImage.in_zoom;
    selectImage(selectedImage.key, selectedImage.in_zoom);
}
function normal() {
    selectedImage.in_zoom = !selectedImage.in_zoom;
    selectImage(selectedImage.key, selectedImage.in_zoom);
}

document.addEventListener('keydown', function (e) {
    if (e.keyIdentifier == "Right") {
        next();
    }
    if (e.keyIdentifier == "Left") {
        prev();
    }
    if (e.keyIdentifier == "Up") {
        up();
    }
    if (e.keyIdentifier == "Down") {
        down();
    }
    if (e.keyIdentifier == "Enter") {
        if (selectedImage.in_zoom) {
            show();
        } else {
            normal()
        }
    }
});
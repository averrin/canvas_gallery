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
var selectedImage = {key: "", in_zoom: false};
window.defaultState = "";

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

    var s = "Use -> and <- keys for item selection; Enter - toggle zoom";
    bgctx.font = '20pt Calibri';
    bgctx.fillStyle = '#1f1f1f';
    bgctx.fillStyle = '#eee';
    bgctx.fillText(s, 40, window.innerHeight - 20 - 8);
//    window.defaultState = bg.toDataURL("image/png");

    selectedImage.in_zoom = false;
    if(selectedImage.key != "") {
        selectImage(selectedImage.key, selectedImage.in_zoom);
    }else{
        next();
    }
}
function recalc() {
    bgctx.canvas.width = window.innerWidth - 40;
    bgctx.canvas.height = window.innerHeight - 20;
    fgctx.canvas.width = window.innerWidth - 40;
    fgctx.canvas.height = window.innerHeight - 20;
    var hoffset = 40;
    var voffset = 40;
    var h = 180;

    for (var i in images) {
        var img = images[i].img;
        var k = h / img.height;
        var w = img.width * k;
        if (hoffset + w > window.innerWidth) {
            voffset += h;
            hoffset = 40;
        }
        var oz = (window.innerWidth - 200) / w;
        if ( h*oz > window.innerHeight - 100) {
            oz = (window.innerHeight - 100) / h;
        }
        images[i].rect = {
            y0: voffset,
            x0: hoffset,
            x1: w,
            y1: h
        };
        images[i].oz = oz;
        hoffset += w;
    }

    redraw();
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
    clouds: 'images/11.jpg',
    night: 'images/12.jpg'
};

function drawImage(key, ctx) {
    if (typeof key == "string") {
        var image = images[key];
    } else {
        image = key;
    }
    var rect = image.rect;
    ctx.drawImage(image.img, rect.x0, rect.y0, rect.x1, rect.y1);
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
                x0: rect.x0 - (rect.x1 * z) / 2,
                y0: rect.y0 - (rect.y1 * z) / 2,
                x1: rect.x1 + (rect.x1 * z),
                y1: rect.y1 + (rect.y1 * z)
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
                x1: rect.x1 + (rect.x1 * z),
                y1: rect.y1 + (rect.y1 * z)
            },
            title: image.title
        }
    }
    if (z >= oz - 1) {
        return;
    }

    fgctx.clearRect(0, 0, bg.width, bg.height);
    fgctx.save();

    fgctx.shadowColor = '#111';
    fgctx.shadowBlur = 20;
    fgctx.shadowOffsetX = 10;
    fgctx.shadowOffsetY = 10;

    drawImage(ti, fgctx);
    rect = ti.rect;
    fgctx.restore();

    fgctx.beginPath();
    fgctx.rect(rect.x0, rect.y0 + rect.y1 - th, rect.x1, th);
    fgctx.fillStyle = "rgba(0,0,0,0.8)";
    fgctx.fill();

    var s = image.title + " [" + image.img.width + "x" + image.img.height + "]";
    fgctx.font = '16pt Calibri';
    fgctx.textAlign = 'right';
    fgctx.fillStyle = '#1f1f1f';
    fgctx.lineWidth = 4;
    fgctx.strokeText(s, rect.x0 + rect.x1 - 8, rect.y0 + rect.y1 - 8);
    fgctx.fillStyle = '#eee';
    fgctx.font = '16pt Calibri';
    fgctx.fillText(s, rect.x0 + rect.x1 - 8, rect.y0 + rect.y1 - 8);

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
    if (selectedImage.key == "" || Object.keys(images).indexOf(selectedImage.key) + 1 == Object.keys(images).length) {
        selectedImage.key = Object.keys(images)[0];
    } else {
        selectedImage.key = Object.keys(images)[Object.keys(images).indexOf(selectedImage.key) + 1];
    }
    selectImage(selectedImage.key, selectedImage.in_zoom);
}
function prev() {
    if (selectedImage.key == "" || Object.keys(images).indexOf(selectedImage.key) == 0) {
        selectedImage.key = Object.keys(images).slice(-1)[0];
    } else {
        console.log(Object.keys(images)[Object.keys(images).indexOf(selectedImage.key) - 1], Object.keys(images).indexOf(selectedImage.key))
        selectedImage.key = Object.keys(images)[Object.keys(images).indexOf(selectedImage.key) - 1];
    }
    selectImage(selectedImage.key, selectedImage.in_zoom);
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
    if (e.keyIdentifier == "Enter") {
        if (selectedImage.in_zoom) {
            show();
        } else {
            normal()
        }
    }
});
//// positions ////

var plr_xy = {
    x: 0.5, y: 1,
    vx: 0, vy: 0,
    limit: true
};

var objs = [obj1, obj2, obj3];
var objs_xy = [{}, {}, {}];

//// input ////

var moffset;

function updatex(x) {
    plr_xy.x = (x - moffset) / zone.clientWidth;
}

main.onmousemove = function (e) {
    updatex(e.clientX);
    e.preventDefault();
};

main.onclick = function (e) {
    updatex(e.clientX);
    plr_xy.vy = -0.1;
    e.preventDefault();
};

main.ontouchstart = function (e) {
    updatex(e.changedTouches[0].clientX);
    plr_xy.vy = -0.1;
    e.preventDefault();
    main.onclick = undefined;
};

main.ondblclick = function (e) {
    e.preventDefault();
};

//// physics ////

var calcpos = function (xy) {
    // motion

    xy.x += xy.vx;
    xy.y += xy.vy;

    // gravity

    var g = -0.01;
    xy.vy -= g;

    // collision

    var rate = -0.5;

    xy.out = false;

    if (xy.x < 0) {
        if (xy.limit && xy.vx < 0) {
            xy.vx *= rate;
            xy.x = 0;
        } else {
            xy.out = true;
        }
    }

    if (xy.x > 1) {
        if (xy.limit && xy.vx > 0) {
            xy.vx *= rate;
            xy.x = 1;
        } else {
            xy.out = true;
        }
    }

    if (xy.y < 0) {
        if (xy.limit && xy.vy < 0) {
            xy.vy *= rate;
            xy.y = 0;
        } else {
            xy.out = true;
        }
    }

    if (xy.y > 1) {
        if (xy.limit && xy.vy > 0) {
            xy.vy *= rate;
            xy.y = 1;
        } else {
            xy.out = true;
        }
    }

    return xy;
};

//// game ////



//// output ////

var makepx = function (pos) {
    return Math.floor(pos) + 'px';
}

var setpos = function (obj, xy) {
    obj.style.left = makepx(zone.clientWidth * xy.x);
    obj.style.top = makepx(zone.clientHeight * xy.y);
};

var doscale = function () {
    var zone_border = 0.15;
    var plr_scale = 0.2;

    var min_size = Math.min(
        main.clientWidth, main.clientHeight
    )

    // apply

    moffset = min_size * (zone_border); // see "input"

    zone.style.margin = makepx(min_size * zone_border);

    var pspx = makepx(min_size * plr_scale);
    plr.style.width = pspx;
    plr.style.height = pspx;
};

//// timer ////

setInterval(function (e) {
    doscale();

    calcpos(plr_xy);
    setpos(plr, plr_xy);
    for (var i in objs) {
        calcpos(objs_xy[i]);
        setpos(objs[i], objs_xy[i]);
    }
}, 40);

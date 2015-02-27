//// positions ////

var plr_xy = {
    x: 0.5, y: 1,
    vx: 0, vy: 0,
    limit: true
};

var objs = [obj1, obj2, obj3];
var objs_xy = [{x: -1}, {x: -1}, {x: -1}];

//// input ////

var moffset;

var updatex = function (x) {
    plr_xy.x = (x - moffset) / zone.clientWidth;
};

main.onmousemove = function (e) {
    updatex(e.clientX);
    e.preventDefault();
};

main.onclick = function (e) {
    updatex(e.clientX);
    jump();
    e.preventDefault();
};

main.ontouchstart = function (e) {
    updatex(e.changedTouches[0].clientX);
    jump();
    e.preventDefault();
    main.onclick = undefined;
};

var noevent = function (e) {
    e.preventDefault();
};

main.ondblclick = noevent;
main.ondrag = noevent;
main.ondragstart = noevent;
main.onfocus = noevent;
main.onselect = noevent;
main.onselectstart = noevent;

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
        if (xy.limit) {
            if (xy.vx < 0) xy.vx *= rate;
            xy.x = 0;
        } else {
            xy.out = true;
        }
    }

    if (xy.x > 1) {
        if (xy.limit) {
            if (xy.vx > 0) xy.vx *= rate;
            xy.x = 1;
        } else {
            xy.out = true;
        }
    }

    // if (xy.y < 0) {
    //     if (xy.limit) {
    //         if (xy.vy < 0) xy.vy *= rate;
    //         xy.y = 0;
    //     } else {
    //         xy.out = true;
    //     }
    // }

    if (xy.y > 1) {
        if (xy.limit) {
            if (xy.vy > 0) xy.vy *= rate;
            xy.y = 1;
        } else {
            xy.out = true;
        }
    }

    return xy;
};

//// game ////

var jump = function () {
    plr_xy.vy = -0.1;
};

//// output ////

var makepx = function (pos) {
    return Math.floor(pos) + 'px';
};

var doscale = function () {
    var zone_border = 0.12;
    var plr_scale = 0.2;

    var min_size = Math.min(
        main.clientWidth, main.clientHeight
    );

    // apply

    moffset = min_size * (zone_border); // see "input"

    zone.style.margin = makepx(min_size * zone_border);

    var pspx = makepx(min_size * plr_scale);
    plr.style.width = pspx;
    plr.style.height = pspx;
};

var applypos = function (obj, xy) {
    obj.style.left = makepx(zone.clientWidth * xy.x - obj.clientWidth * 0.5);
    obj.style.top = makepx(zone.clientHeight * xy.y - obj.clientHeight * 0.5);
};

//// timer ////

setInterval(function (e) {
    calcpos(plr_xy);
    for (var i in objs) {
        calcpos(objs_xy[i]);
    }

    doscale();

    applypos(plr, plr_xy);
    for (var i in objs) {
        applypos(objs[i], objs_xy[i]);
    }
}, 25);

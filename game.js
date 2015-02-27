//// positions ////

var plr_xy = {
    x: 0.5, y: 1,
    vx: 0, vy: 0,
    g: 0.01, vymax: 0.12,
    limit: true
};

var objinit = function () {
    return {
        x: -1, y: -1,
        vx: 0, vy: 0,
        g: 0, vymax: 0.03,
        limit: false
    };
};

var objs = [obj1, obj2, obj3];
var objs_xy = [objinit(), objinit(), objinit()];
var objs_free = [0, 1, 2];

//// input ////

var moffset;

var updatex = function (x) {
    plr_xy.x = (x - moffset) / zone.clientWidth;
};

var jump = function () {
    plr_xy.vy = -0.12;
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

    xy.vy += xy.g;
    if (xy.vy > xy.vymax) {
        xy.vy = xy.vymax;
    }

    // collision

    var rate = -0.5;

    if (xy.x < 0) {
        if (xy.limit) {
            if (xy.vx < 0) xy.vx *= rate;
            xy.x = 0;
        }
    }

    if (xy.x > 1) {
        if (xy.limit) {
            if (xy.vx > 0) xy.vx *= rate;
            xy.x = 1;
        }
    }

    // if (xy.y < 0) {
    //     if (xy.limit) {
    //         if (xy.vy < 0) xy.vy *= rate;
    //         xy.y = 0;
    //     }
    // }

    if (xy.y > 1) {
        if (xy.limit) {
            if (xy.vy > 0) xy.vy *= rate;
            xy.y = 1;
        }
    }

    return xy;
};

//// game ////

var score = 0;

var rand = function (lower, upper) {
    return lower + Math.random() * (upper - lower);
};

var randselect = function (list) {
    return list[Math.floor(Math.random() * list.length)]
}

var pickobj = function () {
    if (objs_free.length > 0) {
        return objs_free.pop();
    } else {
        return undefined;
    }
};

var throwobj = function () {
    var i = pickobj();

    if (i) {
        var spd = 0.5;
        var rev = randselect([false, true]);

        objs_xy[i] = {
            x: rev ? 1.1 : -0.1,
            y: rand(0.2, 0.5),
            vx: spd * rand(0.01, 0.02) * (rev ? -1 : 1),
            vy: spd * rand(-0.01, -0.03),
            g: Math.pow(spd * rand(0.03, 0.05), 2),
            vymax: 0.03,
            limit: false
        };
    }
};

//// view ////

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
    var x = zone.clientWidth * xy.x;
    obj.style.left = makepx(x - obj.clientWidth * 0.5);

    var y = zone.clientHeight - Math.min(
        zone.clientHeight,  zone.clientWidth
    ) * (1 - xy.y);
    obj.style.top = makepx(y - obj.clientHeight * 0.5);
};

//// timer ////

setInterval(function (e) {
    // physics

    calcpos(plr_xy);
    for (var i in objs) {
        calcpos(objs_xy[i]);
    }

    // game

    throwobj();

    // view

    doscale();

    applypos(plr, plr_xy);
    for (var i in objs) {
        applypos(objs[i], objs_xy[i]);
    }
}, 25);

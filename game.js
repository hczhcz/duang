//// positions ////

var plr_xy = {
    x: 0.5, y: 1,
    vx: 0, vy: 0,
    g: 0.01, vymax: 0.12,
    limit: true
};

var OBJCONSTS = {
    out: -2,
    free: -1,
    good: 1,
    bad: 2
};

var OBJSTR = {
    '-2': [''],
    '-1': [''],
    '1': ['效果!'],
    // feel free to add new items
    '2': ['观众!', '让寸分!', 'POI!', '蛤蛤!', '从网!', '蓝黑!']
};

var objinit = function (st) {
    return {
        x: -1, y: -1,
        vx: 0, vy: 0,
        g: 0, vymax: 0.03,
        limit: false
    };
};

var objs = [obj1, obj2, obj3];
var objs_text = [text1, text2, text3];
var objs_xy = [objinit(), objinit(), objinit()];
var objs_status = [OBJCONSTS.free, OBJCONSTS.free, OBJCONSTS.free];

//// input ////

var moffset;

var updatex = function (x) {
    plr_xy.x = (x - moffset) / zone.clientWidth;
};

var jump = function () {
    plr_xy.vy = -0.12;
};

main.onmousedown = function (e) {
    updatex(e.clientX);
    jump();
    e.preventDefault();
};

main.onmousemove = function (e) {
    updatex(e.clientX);
    e.preventDefault();
};

main.ontouchstart = function (e) {
    updatex(e.changedTouches[0].clientX);
    jump();
    e.preventDefault();
    main.onmousedown = undefined;
    main.onmousemove = undefined;
};

main.ontouchmove = function (e) {
    updatex(e.changedTouches[0].clientX);
    e.preventDefault();
    main.onmousedown = undefined;
    main.onmousemove = undefined;
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

//// scores ////

var gamels = 'DUANG_BEST';

var score = Math.floor(localStorage.getItem(gamels) * 0.5);
if (typeof score != 'number') {
    score = 0;
    localStorage.setItem(gamels, 0);
}

var setscore = function (value) {
    score = value;

    var best = localStorage.getItem(gamels);
    if (score > best) {
        best = score;
        localStorage.setItem(gamels, best);
    }
};

var showscore = function () {
    score1.innerText = score;
    score2.innerText = localStorage.getItem(gamels);
}

//// game ////

var rand = function (lower, upper) {
    return lower + Math.random() * (upper - lower);
};

var randselect = function (list) {
    return list[Math.floor(Math.random() * list.length)]
};

var randchance = function (rate) {
    return Math.random() < rate;
};

var xmodel = function (lower, upper) {
    // based on score
    var scaled = score * 0.01;
    return lower + (scaled / (1 + scaled)) * (upper - lower);
};

var pickobj = function () {
    for (var i in objs) {
        if (objs_status[i] < 0) {
            return i;
        }
    }
};

var throwobj = function (i) {
    if (randchance(xmodel(0.01, 0.1))) {
        var spd = xmodel(0.4, 1.2);
        var rev = randchance(0.5);

        objs_xy[i] = {
            x: rev ? 1.1 : -0.1,
            y: rand(0.2, 0.5),
            vx: spd * rand(0.01, 0.02) * (rev ? -1 : 1),
            vy: spd * rand(-0.01, -0.03),
            g: Math.pow(spd * rand(0.03, 0.05), 2),
            vymax: 0.03,
            limit: false
        };

        objs_status[i] = -objs_status[i];

        objs_text[i].innerText = randselect(
            OBJSTR[objs_status[i]]
        );
    }
};

var inrange = function (pos1, pos2, len) {
    return (
        Math.pow(pos1.x - pos2.x, 2) +
        Math.pow(pos1.y - pos2.y, 2)
    ) < Math.pow(len, 2);
};

var checkobj = function (i) {
    if (objs_status[i] == OBJCONSTS.good) {
        if (objs_xy[i].y > 1) {
            objs_status[i] = OBJCONSTS.out;
        } else if (inrange(objs_xy[i], plr_xy, 0.15)) {
            // good collision
            setscore(score + 1);
            objs_status[i] = OBJCONSTS.free;
            objs_xy[i] = objinit();
        }
    } else if (objs_status[i] == OBJCONSTS.bad) {
        if (objs_xy[i].y > 1) {
            objs_status[i] = OBJCONSTS.free;
        } else if (inrange(objs_xy[i], plr_xy, 0.15)) {
            // bad collision
            setscore(Math.floor(score * 0.5));
            objs_status[i] = OBJCONSTS.free;
            objs_xy[i] = objinit();
        }
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

    var y = zone.clientHeight * 0.5 + Math.min(
        zone.clientHeight,  zone.clientWidth
    ) * (xy.y - 0.5);

    obj.style.left = makepx(x - obj.clientWidth * 0.5);
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

    for (var i in objs) {
        checkobj(i);
    }

    var i1 = pickobj();
    if (i1) {
        throwobj(i1);
    }

    showscore();

    // view

    doscale();

    applypos(plr, plr_xy);
    for (var i in objs) {
        applypos(objs[i], objs_xy[i]);
    }
}, 25);

/* Hide the tutorial element initially */
$('#tutorial').hide();

/* Initialize MBob object with default properties */
MBob = {};
MBob.bestxy = 9999;  /* Default best distance */
MBob.run = 0;        /* Run status */
MBob.id = 0;         /* ID of target */
MBob.blok = "";      /* Blocked items */
MBob.xxxx = 0;       /* Temporary variable */
MBob.blokuj = 1;     /* Block status */
MBob.checker = 0;    /* Checker status */
MBob.checker2 = 0;   /* Secondary checker status */
MBob.interv1 = "";   /* Interval 1 */
MBob.interv2 = "";   /* Interval 2 */
MBob.interv3 = "";   /* Interval 3 */

/* Function to display an alert (currently empty) */
mAlert = function(a, c, d, B) {};

/* Function to add lock (currently empty) */
g.lock.add = function(i) {};

/* Create and style configuration div, then append to centerbox2 */
$('<div id="MBob_config"><div id="MBob_config_header" style="cursor:move;">Drag here</div></div>').css({
    position: "absolute",
    left: -300,
    top: -50,
    width: 250,
    padding: "20px",
    border: "1px solid gold",
    color: "white",
    "background-color": "#1a1a1a",
    "font-size": "13px",
    "box-shadow": "0 0 15px rgba(0, 0, 0, 0.5)",
    "border-radius": "10px"
}).appendTo("#centerbox2");

/* Add HTML content to MBob_config element */
MBob_config.innerHTML += `
    <center>
        <input id="MBob_nazpotwor" placeholder="mob names" class="input-field">
        <br/><br/>
        <input id="MBob_healerhp" placeholder="%HP<Healer" type="number" class="input-field">
        <br/>
        <label for="dropneut" class="checkbox-label">
            <input id="dropneut" type="checkbox" value="drop"> destroy neutral items
        </label>
        <br/><br/>
        <input id="MBob_maxdrop" placeholder="max item value" type="number" class="input-field">
        <br/><br/>
        <button onclick="MBob.start1()" class="action-button">Start</button>
        <button onclick="MBob.stop1()" class="action-button">Stop</button>
    </center>
`;

/* Create and append style element for input fields and buttons */
const style = document.createElement('style');
style.innerHTML = `
    .input-field {
        width: 90%;
        margin-bottom: 10px;
        padding: 8px;
        border-radius: 5px;
        border: 1px solid #444;
        background-color: #2e2e2e;
        color: white;
        font-size: 13px;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .input-field:focus {
        border-color: gold;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
    .checkbox-label {
        display: block;
        text-align: left;
        margin-bottom: 10px;
        cursor: pointer;
        color: #ccc;
        font-size: 14px;
    }
    .checkbox-label input {
        margin-right: 5px;
    }
    .action-button {
        width: 90%;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid gold;
        background-color: #333;
        color: white;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    .action-button:hover {
        background-color: gold;
        color: black;
    }
    .action-button:active {
        background-color: #e5e500;
    }
`;
document.head.appendChild(style);

/* Function to drop items based on conditions */
MBob.drop = function() {
    if (dropneut.checked == true && (g.bags[0][0] - g.bags[0][1] <= 2)) {
        for (var i in g.item) {
            if (g.item[i].cl == 15 && g.item[i].pr <= MBob_maxdrop.value) {
                _g('moveitem&st=-2&id=' + i);
                $('#dropmenu').fadeOut();
                break;
            }
        }
    }
};

/* Function to heal hero based on conditions */
MBob.heal = function() {
    for (var i in g.item) {
        if (g.item[i].cl == 16 && hero.hp <= hero.maxhp * Number(MBob_healerhp.value) / 100 && MBob_healerhp.value != "") {
            $("#item" + i).dblclick();
        }
    }
};

/* Function to reload items based on conditions */
MBob.rel = function() {
    var sukces = false;
    for (var i in g.item) {
        itemek = $("#item" + i);
        if (g.item[i].cl == 21 && itemek.css("top") == "183px" && itemek.css("left") == "92px") {
            var stat = g.item[i].stat;
            var name = g.item[i].name;
            var id = g.item[i].id;
            sukces = true;
            break;
        }
    }
    if (sukces) {
        var nrilosc = stat.indexOf("ammo");
        var ilosc = 51;
        if (nrilosc != -1) {
            ilosc = stat.slice(nrilosc + 5, nrilosc + 9);
            ilosc = parseInt(ilosc);
        }
        if (ilosc < 50) {
            for (var i in g.item) {
                if (name == g.item[i].name && id != g.item[i].id) {
                    _g("moveitem&st=1&id=" + g.item[i].id);
                    break;
                }
            }
        }
    }
};

/* Function for hero movement with pathfinding */
hero.MBobgo = function(y, w) {
    var x = [],
        t = (hero.opt & 128) ? 8 : 20;
    var l = Math.max(0, Math.min(y, this.x) - t),
        h = Math.min(map.x - 1, Math.max(y, this.x) + t);
    var v = Math.max(0, Math.min(w, this.y) - t),
        u = Math.min(map.y - 1, Math.max(w, this.y) + t);
    for (var q = l - 1; q <= h + 1; q++) {
        x[q] = [];
        for (var p = v - 1; p <= u + 1; p++) {
            x[q][p] = (q >= l && q <= h && p >= v && p <= u && !isset(g.npccol[q + p * 256]) && (!map.col || map.col.charAt(q + p * map.x) == "0")) ? -1 : -2
        }
    }
    x[this.x][this.y] = 0;
    b = -1;
    road = [];
    var s = {
        x: -1,
        y: -1,
        dist: 599
    };
    for (var r = 1; r < h - l + u - v + 3; r++) {
        for (var q = l; q <= h; q++) {
            for (var p = v; p <= u; p++) {
                if (x[q][p] == -1 && ((x[q][p - 1] == r - 1) || (x[q][p + 1] == r - 1) || (x[q - 1][p] == r - 1) || (x[q + 1][p] == r - 1))) {
                    x[q][p] = r
                }
                if (x[y][w] > 0) {
                    q = h + 1;
                    break
                }
                s.dist2 = Math.abs(y - q) + Math.abs(w - p);
                if ((x[q][p] == r) && (s.dist2 < s.dist)) {
                    s.x = q;
                    s.y = p;
                    s.dist = s.dist2
                }
            }
        }
    }
    s.hdist = Math.abs(y - hero.x) + Math.abs(w - hero.y);
    if (x[y][w] > 0 || s.dist < s.hdist) {
        if (x[y][w] < 0) {
            if (y > s.x) {
                b = 2
            } else {
                if (y < s.x) {
                    b = 1
                } else {
                    if (w > s.y) {
                        b = 0
                    } else {
                        if (w < s.y) {
                            b = 3
                        }
                    }
                }
            }
            y = s.x;
            w = s.y;
        }
        road[0] = {
            x: y,
            y: w
        };
        for (var o = x[y][w] - 1, n = y, m = w; o > 0; o--) {
            if (x[n][m - 1] == o) {
                m--
            } else {
                if (x[n][m + 1] == o) {
                    m++
                } else {
                    if (x[n - 1][m] == o) {
                        n--
                    } else {
                        if (x[n + 1][m] == o) {
                            n++
                        } else {
                            o = 0
                        }
                    }
                }
            }
            if (o) {
                road[x[y][w] - o] = {
                    x: n,
                    y: m
                }
            }
        }
    }
    if (road.length > 1 && g.playerCatcher.follow == null) {
        $("#target").stop().css({
            left: y * 32,
            top: w * 32,
            display: "block",
            opacity: 1
        }).fadeOut(1000)
    }
};

/* Overriding battleMsg function to include MBob functionalities */
var tmpBattleMsg = battleMsg;
battleMsg = function(c, t) {
    MBob.run = 0;
    var ret = tmpBattleMsg(c, t);
    if (c.search(/winner=/) >= 0) {
        _g("fight&a=quit");
        $('#loots_button').click();
        MBob.drop();
        MBob.rel();
        MBob.heal();
        MBob.run = 0;
    }
    return ret;
};

/* Function to find and target nearest mob */
MBob.func1 = function() {
    if (MBob.run == 0) {
        hero.nextx = '';
        hero.nexty = '';
        MBob.bestxy = 9999;
        for (var i in g.npc) {
            if (MBob_nazpotwor.value.search(g.npc[i].nick) != -1 && MBob.blok.search(i) == -1 && (g.npc[i].type == 2 || g.npc[i].type == 3)) {
                x1 = Math.pow(Math.abs(hero.x - g.npc[i].x), 2);
                y1 = Math.pow(Math.abs(hero.y - g.npc[i].y), 2);
                MBob.bestxy1 = Math.sqrt(x1) + Math.sqrt(y1);
                if (MBob.bestxy1 < MBob.bestxy) {
                    MBob.bestxy = MBob.bestxy1;
                    hero.nextx = g.npc[i].x;
                    hero.nexty = g.npc[i].y;
                    MBob.id = i;
                    MBob.run = 1;
                    MBob.blokuj = 0;
                };
            };
        };
        if (hero.nextx != '' && hero.nexty != '') {
            g.stop = false;
            hero.MBobgo(hero.nextx, hero.nexty);
        }
    }
};

/* Function to check and handle mob engagement */
MBob.func2 = function() {
    if (road.length == 0 && MBob.blokuj == 0) {
        if ((Math.abs(hero.rx - g.npc[MBob.id].x) <= 1 && Math.abs(hero.ry - g.npc[MBob.id].y) <= 1) && (g.npc[MBob.id].type == 2 || g.npc[MBob.id].type == 3)) {
            MBob.blokuj = 1;
            _g("fight&a=attack&ff=1&id=-" + MBob.id);
        } else {
            if (MBob.checker2 == 2) {
                MBob.blokuj = 1;
                MBob.blok = MBob.blok + "|" + MBob.id;
                MBob.run = 0;
                MBob.checker2 = 0;
            } else if (MBob.checker2 != 2) {
                MBob.checker2++;
            }
        }
    }
};

/* Function to manage run state based on checker */
MBob.func3 = function() {
    if (road.length == 0) {
        if (MBob.checker < 60) {
            MBob.checker++;
        } else if (MBob.checker >= 60) {
            MBob.run = 0;
            MBob.checker = 0;
        }
    } else {
        MBob.checker = 0;
    }
};

/* Start interval functions for MBob */
MBob.start1 = function() {
    MBob.interv1 = setInterval(MBob.func1, 400);
    MBob.interv2 = setInterval(MBob.func2, 300);
    MBob.interv3 = setInterval(MBob.func3, 50);
};

/* Stop interval functions for MBob and reset properties */
MBob.stop1 = function() {
    clearInterval(MBob.interv1);
    clearInterval(MBob.interv2);
    clearInterval(MBob.interv3);
    MBob.bestxy = 9999;
    MBob.run = 0;
    MBob.id = 0;
    MBob.blok = "";
    MBob.xxxx = 0;
    MBob.blokuj = 1;
    MBob.checker = 0;
    MBob.checker2 = 0;
    MBob.interv1 = "";
    MBob.interv2 = "";
    MBob.interv3 = "";
};

/* Reset MBob.blok every 30 seconds */
setInterval(function() {
    MBob.blok = "";
}, 30000);

/* Make an element draggable using another element as the handle */
function makeDraggable(element, handle) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;

    /* Function to handle mouse down event for dragging */
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    /* Function to handle element dragging */
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    /* Function to stop dragging */
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

/* Make the MBob_config element draggable using its header */
makeDraggable(document.getElementById("MBob_config"), document.getElementById("MBob_config_header"));

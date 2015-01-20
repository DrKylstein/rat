
function Monitor(color, backColor) {
    var monitorCanvas = document.createElement('canvas');
    var monitor = monitorCanvas.getContext('2d');
    monitor.imageSmoothingEnabled = false;
    var COLS = 40;
    var ROWS = 15;
    monitorCanvas.width = 8*COLS;
    monitorCanvas.height = 16*ROWS;
    var monitorTex = new THREE.Texture(monitorCanvas);
    monitorTex.magFilter = THREE.NearestFilter;
    monitor.textAlign = 'left';
    monitor.textBaseline = 'top';

    var cy;
    
    this.clear = function() {
        monitor.globalCompositeOperation = 'source-over';
        monitor.fillStyle= new THREE.Color(backColor).getStyle();
        monitor.fillRect(0,0, monitorCanvas.width,monitorCanvas.height);
        monitor.fillStyle = new THREE.Color(color).getStyle();
        monitor.globalCompositeOperation = 'darken';
        monitor.fillRect(0,0, monitorCanvas.width,monitorCanvas.height);
        cy = 0;
        monitorTex.needsUpdate = true;
    }
    this.println = function(text) {
        monitor.globalCompositeOperation = 'source-over';
        text = text.toUpperCase();
        var words = text.split(' ');
        var cx = 0;
        words.forEach(function(word){
            if(cx + word.length > COLS) {
                cx = 0;
                ++cy;
            }
            for(var i = 0; i < word.length; i++) {
                var index = word.charCodeAt(i)-32;
                monitor.drawImage(font, (index%16)*8,Math.floor(index/16)*16, 8,16,  cx*8,cy*16, 8,16);
                ++cx;
            }
            cx++;

        });
        cx = 0;
        ++cy;
        monitor.globalCompositeOperation = 'darken';
        monitor.fillStyle = new THREE.Color(color).getStyle();
        monitor.fillRect(0,0, monitorCanvas.width,monitorCanvas.height);
        monitorTex.needsUpdate = true;
    }
    this.setRow = function(r) {
        if(r >= 0) {
            cy = r;
        } else {
            cy = ROWS + r;
        }
    }
    
    this.clear();
    
    
    this.tex = monitorTex;
};
var monitor = new Monitor(SCREEN_COLORS[0], SCREEN_COLORS[1]);
function makeMainframe() {
    var root = new THREE.Object3D();
    var base = makeBox(10,6,5, GOOD_COLORS[0], GOOD_COLORS[1]);
    root.add(base);
    
    var bottom = 6;
    
    var mid = makeBox(10,7,4,GOOD_COLORS[0], GOOD_COLORS[1]);
    mid.position.y = bottom;
    mid.position.z = 4/2 - 5/2;
    root.add(mid);
    bottom += 7;
    
    var r = 3/4;
    
    var screen = makeBox(5, 5*r, 0, null, monitor.tex);
    screen.position.z = 2 + 0.01;
    screen.position.y = 1.75;
    screen.position.x = -5/2 + 10/2 - 1;
    mid.add(screen);

    var greeble = makeBox(2, 2*r, 0.25, GOOD_COLORS[0], GOOD_COLORS[1]);
    greeble.position.z = 2 + 0.25/2;
    greeble.position.y = 1.75;
    greeble.position.x = -10/2 + 2/2 + 1;
    mid.add(greeble);
    
    var greeble = makeBox(2, 2*r, 0.25, GOOD_COLORS[0], GOOD_COLORS[1]);
    greeble.position.z = 2 + 0.25/2;
    greeble.position.y = 1.75 + 3*r;
    greeble.position.x = -10/2 + 2/2 + 1;
    mid.add(greeble);
    
    var top = makeBox(10,2,5,GOOD_COLORS[0], GOOD_COLORS[1]);
    top.position.y = bottom;
    root.add(top);
    
    var whole = new THREE.Object3D();
    root.position.z = 5/2 + 2;
    whole.add(root);
    
    return whole;
}

function makeTable() {
    var root = new THREE.Object3D();
    
    var top = makeBox(20,1,10, ENV_COLORS[0], ENV_COLORS[1]);
    top.position.y = 5;
    root.add(top);
    
    var leg = makeBox(1,5,1, ENV_COLORS[0], ENV_COLORS[1]);
    leg.position.set(-20/2 + 1/2, 0, -10/2 + 1/2);
    root.add(leg);
    var leg = makeBox(1,5,1, ENV_COLORS[0], ENV_COLORS[1]);
    leg.position.set(20/2 - 1/2, 0, 10/2 - 1/2);
    root.add(leg);
    var leg = makeBox(1,5,1, ENV_COLORS[0], ENV_COLORS[1]);
    leg.position.set(-20/2 + 1/2, 0, 10/2 - 1/2);
    root.add(leg);
    var leg = makeBox(1,5,1, ENV_COLORS[0], ENV_COLORS[1]);
    leg.position.set(20/2 - 1/2, 0, -10/2 + 1/2);
    root.add(leg);
    
    root.userData.top = top.position.y + 1;
    
    return root;
}

function makeCeilingLight() {
    var root = new THREE.Object3D();
    
    var top = makeBox(5,2,5, ENV_COLORS[0], ENV_COLORS[1]);
    top.position.y = -2;
    root.add(top);
    
    pointify(top.children[0].geometry, 2, 0.5, 0.5);
    
    var diffuser = makeBox(5, 0.1, 5, 0xffffff, 0xffffff);
    diffuser.position.y = -2 - 0.1;
    root.add(diffuser);
    
    return root;
}

function makeRepairStation(obstacleNodes) {
    var root = new THREE.Object3D();
    var base = makeBox(10,2,8, REPAIR_COLORS[0], REPAIR_COLORS[1]);
    root.add(base);
    
    var bottom = 2;
    
    var mid = makeBox(10,15,2,REPAIR_COLORS[0], REPAIR_COLORS[1]);
    mid.position.y = bottom;
    mid.position.z = 2/2 - 8/2;
    root.add(mid);
    bottom += 15;
    
    var greeble = makeBox(3, 2, 0.25, REPAIR_COLORS[0], REPAIR_COLORS[1]);
    greeble.position.z = 2/2 + 0.25/2;
    greeble.position.y = 7;
    greeble.position.x = 3;
    mid.add(greeble);
    
    var greeble = makeBox(3, 2, 0.25, REPAIR_COLORS[0], REPAIR_COLORS[1]);
    greeble.position.z = 2/2 + 0.25/2;
    greeble.position.y = 7;
    greeble.position.x = -3;
    mid.add(greeble);

    
    var top = makeBox(10,2,8,REPAIR_COLORS[0], REPAIR_COLORS[1]);
    top.position.y = bottom;
    root.add(top);
    
    root.position.z = 8/2 + 2;
    var whole = new THREE.Object3D();
    whole.add(root);
    
    obstacleNodes.push(base);
    obstacleNodes.push(mid)
    
    return whole;
}

function makeDesktop() {
    var root = new THREE.Object3D();
    var top = 0;
    
    var base = makeBox(5,6,4, ENV_COLORS[0], ENV_COLORS[1]);
    root.add(base);
    
    var screen = makeBox(4,3,0.5, ENV_COLORS[0], ENV_COLORS[1]);
    root.add(screen);
    screen.position.set(0,2,2.25);
    
    var keyboard = makeBox(5,0.5,2, ENV_COLORS[0], ENV_COLORS[1]);
    
    keyboard.position.z = 3;
    root.add(keyboard);
    
    return root;
}

function makeTapeDrive(spinners) {
    var root = new THREE.Object3D();
    var base = makeBox(10,6,5, ENV_COLORS[0], ENV_COLORS[1]);
    root.add(base);
    
    var bottom = 6;
    
    var mid = makeBox(10,7,5,ENV_COLORS[0], ENV_COLORS[1]);
    mid.position.y = bottom;
    //mid.position.z = 4/2 - 5/2;
    root.add(mid);
    bottom += 7;
            
    var tape = makeCylinder(2, 0.25, ENV_COLORS[0], ENV_COLORS[1]);
    tape.rotation.x = Math.PI/2;
    tape.position.z = 5/2 + 0.25/2;
    tape.position.y = 4.5;
    tape.position.x = -2.5;
    mid.add(tape);
    spinners.push(tape);
    
    var tape = makeCylinder(2, 0.25, ENV_COLORS[0], ENV_COLORS[1]);
    tape.rotation.x = Math.PI/2;
    tape.position.z = 5/2 + 0.25/2;
    tape.position.y = 4.5;
    tape.position.x = 2.5;
    mid.add(tape);
    spinners.push(tape);
    
    var head = makeBox(2,1,0.25, ENV_COLORS[0], ENV_COLORS[1]);
    head.position.y = 0.5;
    head.position.z = 5/2 + 0.25/2;
    mid.add(head);
    
    var top = makeBox(10,2,5,ENV_COLORS[0], ENV_COLORS[1]);
    top.position.y = bottom;
    root.add(top);
    
    var whole = new THREE.Object3D();
    root.position.z = 5/2 + 1;
    whole.add(root);
    
    return whole;
}
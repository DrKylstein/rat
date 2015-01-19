
function Monitor(color, backColor) {
    var monitorCanvas = document.createElement('canvas');
    var monitor = monitorCanvas.getContext('2d');
    monitor.imageSmoothingEnabled = false;
    monitorCanvas.width = 320;
    monitorCanvas.height = 200;
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
        for(var i = 0; i < text.length; i++) {
            var index = text.charCodeAt(i)-32;
            monitor.drawImage(font, (index%16)*8,Math.floor(index/16)*16, 8,16,  i*8,cy*16, 8,16);
        }
        ++cy;
        monitor.globalCompositeOperation = 'darken';
        monitor.fillStyle = new THREE.Color(color).getStyle();
        monitor.fillRect(0,0, monitorCanvas.width,monitorCanvas.height);
        monitorTex.needsUpdate = true;
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
    
    return root;
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

function makeRepairStation() {
    var root = new THREE.Object3D();
    var top = 0;
    
    var torso = makeBox(6,9,6, REPAIR_COLORS[0], REPAIR_COLORS[1]);
    torso.rotation.y = Math.PI/4;
    pointify(torso.children[0].geometry, 9, 0.5, 0.5);
    root.add(torso);
    top += 9;
    
    var head = makeBox(7,4,7, REPAIR_COLORS[0], REPAIR_COLORS[1]);
    head.children[0].rotation.x = Math.PI;
    pointify(head.children[0].geometry, 4, 0.5, 0.5);
    head.position.y = top;
    top += 4;
    root.add(head);
    
    var eye = makeBox(1,1,1, REPAIR_COLORS[0], REPAIR_COLORS[1]);
    eye.position.y = 1;
    eye.position.z = 3;
    eye.position.x = -1;
    head.add(eye);

    var eye = makeBox(1,1,1, REPAIR_COLORS[0], REPAIR_COLORS[1]);
    eye.position.y = 1;
    eye.position.z = 3;
    eye.position.x = 1;
    head.add(eye);


    var light = makeBox(1.5,1.5,1, REPAIR_COLORS[0], REPAIR_COLORS[1]);
    light.position.y = 2.25;
    light.position.z = 3;
    head.add(light);
    
    
    return {body:root, head:head};
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
    
    return root;
}
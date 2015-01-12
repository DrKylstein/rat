
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
        monitor.fillStyle= new THREE.Color(backColor).getStyle();
        monitor.fillRect(0,0, monitorCanvas.width,monitorCanvas.height);
        cy = 0;
        monitorTex.needsUpdate = true;
    }
    this.println = function(text) {
        text = text.toUpperCase();
        for(var i = 0; i < text.length; i++) {
            var index = text.codePointAt(i)-32;
            monitor.drawImage(font, (index%16)*8,Math.floor(index/16)*16, 8,16,  i*8,cy*16, 8,16);
        }

        /*monitor.fillStyle= new THREE.Color(color).getStyle();
        monitor.font ='bold 16px monospace';
        monitor.fillText(text.toUpperCase(), 8,8+cy*16);*/
        ++cy;
        monitorTex.needsUpdate = true;
    }
    
    this.clear();
    
    
    this.tex = monitorTex;
};
var monitor = new Monitor(SCREEN_COLORS[0], SCREEN_COLORS[1]);
function makeMainframe() {
    var root = new THREE.Object3D();
    var base = makeBox(10,6,5, 0x0000ff, 0x000088);
    root.add(base);
    
    var bottom = 6;
    
    var mid = makeBox(10,7,4,0x0000ff, 0x000088);
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

    var greeble = makeBox(2, 2*r, 0.25, 0xff0000, 0x880000);
    greeble.position.z = 2 + 0.25/2;
    greeble.position.y = 1.75;
    greeble.position.x = -10/2 + 2/2 + 1;
    mid.add(greeble);
    
    var greeble = makeBox(2, 2*r, 0.25, 0xffff00, 0x888800);
    greeble.position.z = 2 + 0.25/2;
    greeble.position.y = 1.75 + 3*r;
    greeble.position.x = -10/2 + 2/2 + 1;
    mid.add(greeble);
    
    var top = makeBox(10,2,5,0x0000ff, 0x000088);
    top.position.y = bottom;
    root.add(top);
    
    return root;
}

function makeTable() {
    var root = new THREE.Object3D();
    
    var top = makeBox(20,1,10, 0xff00ff, 0x880088);
    top.position.y = 5;
    root.add(top);
    
    var leg = makeBox(1,5,1, 0xcccccc, 0x888888);
    leg.position.set(-20/2 + 1/2, 0, -10/2 + 1/2);
    root.add(leg);
    var leg = makeBox(1,5,1, 0xcccccc, 0x888888);
    leg.position.set(20/2 - 1/2, 0, 10/2 - 1/2);
    root.add(leg);
    var leg = makeBox(1,5,1, 0xcccccc, 0x888888);
    leg.position.set(-20/2 + 1/2, 0, 10/2 - 1/2);
    root.add(leg);
    var leg = makeBox(1,5,1, 0xcccccc, 0x888888);
    leg.position.set(20/2 - 1/2, 0, -10/2 + 1/2);
    root.add(leg);
    
    return root;
}

function makeCeilingLight() {
    var root = new THREE.Object3D();
    
    var top = makeBox(5,2,5, 0x0000ff, 0x000088);
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
    
    var torso = makeBox(6,9,6, 0xffffff, 0x888888);
    torso.rotation.y = Math.PI/4;
    pointify(torso.children[0].geometry, 9, 0.5, 0.5);
    root.add(torso);
    top += 9;
    
    var head = makeBox(7,4,7, 0xffffff, 0x888888);
    head.children[0].rotation.x = Math.PI;
    pointify(head.children[0].geometry, 4, 0.5, 0.5);
    head.position.y = top;
    top += 4;
    root.add(head);
    
    var eye = makeBox(1,1,1, 0xff00ff, 0x440044);
    eye.position.y = 1;
    eye.position.z = 3;
    eye.position.x = -1;
    head.add(eye);

    var eye = makeBox(1,1,1, 0xff00ff, 0x440044);
    eye.position.y = 1;
    eye.position.z = 3;
    eye.position.x = 1;
    head.add(eye);


    var light = makeBox(1.5,1.5,1, 0xffff00, 0x888800);
    light.position.y = 2.25;
    light.position.z = 3;
    head.add(light);
    
    
    return {body:root, head:head};
}
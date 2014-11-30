function makeRizzo() {
    var root= new THREE.Object3D();
    var body = makeBox(9,5,9, 0x0000ff, 0x000088);
    pointify(body.children[0].geometry, 5, 1,1);
    root.add(body);
    var eye = makeBox(2,1,1, 0xff0000, 0xffff00);
    eye.position.y = 2;
    eye.position.z = -2;
    root.add(eye);
    
    var camera = new THREE.Object3D();
    root.add(camera);
    camera.position.y = 5;
    return {body:root, eye:camera};
}

function makeAnneka() {
    var body = new THREE.Object3D();
    var eye = new THREE.Object3D();
    
    var top = makeBox(5,5,5, 0xff0000,0xffff00);
    pointify(top.children[0].geometry, 5, 1, 1);
    var bottom = makeBox(5,5,5, 0xff0000,0xffff00);
    pointify(bottom.children[0].geometry, 5, 1, 1);
    bottom.rotation.x = Math.PI;

    eye.add(top);
    eye.add(bottom);
    
    var rotors = new THREE.Object3D();
    
    for(var i = 0; i < 4; i++) {
        var root = new THREE.Object3D();
        var rotor = makeBox(10,1,5, 0xff0000,0xffff00);
        rotor.position.x = 12;
        root.rotation.y = Math.PI*i/2;
        root.add(rotor);
        rotors.add(root);
    }
    spinners.push(rotors);
    eye.add(rotors);
    
    body.position.x = -150;
    body.position.y = 100;
    body.add(eye);
    
    return {body:body,eye:eye};
}

function makeIgor() {
    var root = new THREE.Object3D();
    var base = makeBox(4,2,4, 0x0000ff, 0x000088);
    var torso = makeBox(8,7,6, 0x0000ff, 0x000088);
    var head = makeBox(7,4,7, 0x0000ff, 0x000088);
    head.rotation.y = Math.PI/4;
    var eye = makeBox(2,1,1, 0x00ff00, 0x002200);
    var camera = new THREE.Object3D();
    
    pointify(torso.children[0].geometry, 9, 0.5, 0.25);
    pointify(base.children[0].geometry, 2, 0.25, 0.25);
    pointify(head.children[0].geometry, 4, 1, 1);
    torso.children[0].rotation.x = Math.PI;
    
    torso.position.y = 2;
    head.position.y = 2+7;
    eye.position.y = 2+7+2;
    eye.position.z = -1.5;
    camera.position.y = 2+7+1;
    
    root.add(base);
    root.add(torso);
    root.add(head);
    root.add(eye);
    root.add(camera);
    
    return {body:root, eye:camera};
}

function makeGuard() {
    var root = new THREE.Object3D();
    
    var torso = makeBox(7,8,5, 0xff0000, 0x888888);
    pointify(torso.children[0].geometry, 10, 0.5, 0.5);
    torso.children[0].rotation.x = Math.PI;
    root.add(torso);
    
    var gun = makeBox(3,3,3, 0xff0000, 0x880000);
    pointify(gun.children[0].geometry, 3, 0, 1);
    gun.children[0].rotation.x = Math.PI*1/8;
    gun.position.z = -2;
    gun.position.y = 2;
    root.add(gun);
    
    var head = makeBox(7,3,5, 0xff0000, 0x880000);
    pointify(head.children[0].geometry, 3, 0.5, 0.5);
    head.position.y = 8;
    root.add(head);

    var eye = makeBox(2,1,1, 0xffff00, 0x884400);
    var camera = new THREE.Object3D();
    eye.position.y = 8+2;
    eye.position.z = -1.5;
    camera.position.y = 8+1;

    root.add(eye);
    root.add(camera);
    
    return {body:root, eye:camera};
}

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
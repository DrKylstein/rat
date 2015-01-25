var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var listener = audioCtx.listener;
listener.dopplerFactor = 1;
listener.speedOfSound = 343.3;
var master = audioCtx.createGain();
master.gain.value = 0.5;
master.connect(audioCtx.destination);

var shotSound = new (function () {
    var factor = 0.5;
    var cAttack = 0.1;
    var cRelease = 0.5;
    var cSustain = 1.0;
    var cHold = 0.5;
    var mAttack = 0.125;
    var mRelease = 0.125;
    var depth = 1200;
    var mHold = 0.25;

    var carrier = audioCtx.createOscillator();
    var modulator = audioCtx.createOscillator();
    var cGain = audioCtx.createGain();
    var mGain = audioCtx.createGain();
    modulator.connect(mGain);
    mGain.connect(carrier.detune);
    carrier.connect(cGain);
    
    var panner = audioCtx.createPanner();
    panner.connect(master);
    //panner.rolloffFactor = 1.0;
    panner.refDistance = 10;
    panner.maxDistance = 100;
    
    cGain.connect(panner);
    carrier.type = 'sine';
    modulator.type = 'sine';

    cGain.gain.value = 0;
    mGain.gain.value = 0;


    modulator.start();
    carrier.start();

    carrier.frequency.value = 330;
    modulator.frequency.value = carrier.frequency.value * factor;
    
    this.play = function(pos) {
        cGain.gain.cancelScheduledValues(audioCtx.currentTime);
        mGain.gain.cancelScheduledValues(audioCtx.currentTime);
        
        cGain.gain.value = 0;
        mGain.gain.value = 0;
        
        panner.setPosition(pos.x, pos.y, pos.z);
        
        cGain.gain.linearRampToValueAtTime(cSustain, audioCtx.currentTime + cAttack);
        mGain.gain.linearRampToValueAtTime(depth, audioCtx.currentTime + mAttack);

        cGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + cAttack + cHold + cRelease);
        mGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + mAttack + mHold + mRelease);
    }
    
})();

var bufferSize = 2 * audioCtx.sampleRate,
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate),
    output = noiseBuffer.getChannelData(0);
for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
}
var whiteNoise = audioCtx.createBufferSource();
whiteNoise.buffer = noiseBuffer;
whiteNoise.loop = true;
whiteNoise.start(0);
var noiseGain = audioCtx.createGain();
noiseGain.gain.value = 0;
whiteNoise.connect(noiseGain);
noiseGain.connect(master);
var NOISE_VOL = 0.5;


function findById(arr, id) {
    var index = -1;
    var obj = null;
    arr.every(function(item, i){
        if(item.id == id) {
            index = i;
            obj = item;
            return false;
        }
        return true;
    });
    if(index != -1) {
        return {index:index, obj:obj};
    }
    return null;
}

var FAR = 800;
var MAX_LIGHTS = 8;
var camera, hudCamera, overlayCamera;
var renderer = new THREE.WebGLRenderer({antialias:true, maxLights:MAX_LIGHTS}); 
var scene = new THREE.Scene(); 
var hudScene = new THREE.Scene();
var bottomHud = new THREE.Object3D();
var topHud = new THREE.Object3D();
var centerHud = new THREE.Object3D();
hudScene.add(bottomHud);
hudScene.add(topHud);
hudScene.add(centerHud);
topHud.position.z = 1;
bottomHud.position.z = 1;
centerHud.position.z = 1;
var overlayScene = new THREE.Scene();
renderer.autoClear = false;
var canvas = renderer.domElement;
document.body.appendChild(canvas);


(function initCameras() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, FAR ); 
    hudCamera = new THREE.OrthographicCamera(-0.5, 0.5, height/width/2, -height/width/2, 1, 10);
    hudCamera.position.z = 10;
    bottomHud.position.y = -height/width/2;
    topHud.position.y = height/width/2;
    centerHud.scale.set(Math.min(1.0, height/width),Math.min(1.0, height/width),1);
    overlayCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
    overlayCamera.position.z = 10;
    renderer.setSize(width, height);
})();

window.onresize = function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    hudCamera.left = -0.5;
    hudCamera.right = 0.5;
    hudCamera.top = height/width/2;
    hudCamera.bottom = -height/width/2;
    hudCamera.updateProjectionMatrix();
    bottomHud.position.y = -height/width/2;
    topHud.position.y = height/width/2;
    centerHud.scale.set(Math.min(1.0, height/width),Math.min(1.0, height/width),1);
    
    renderer.setSize(width, height);
}
var overlayShader;
var noiseLevel = 0;

function render(time) {
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(hudScene, hudCamera);
    renderer.clearDepth();
    overlayShader.uniforms.time.value = time;
    overlayShader.uniforms.noiseLevel.value = noiseLevel;
    renderer.render(overlayScene, overlayCamera);
}

scene.fog = new THREE.Fog(ENV_COLORS[1], 1, FAR);
renderer.setClearColor(ENV_COLORS[1],1);

(function(){
    var geometry = new THREE.PlaneGeometry(1.0, 1.0);
    overlayShader = new THREE.ShaderMaterial( {
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'effectShader' ).textContent,
        uniforms:{
            time:{type:'f', value:3},
            noiseLevel:{type:'f', value:0}
        }
    });
    var mesh = new THREE.Mesh(geometry, overlayShader);
    overlayShader.transparent = true;
    mesh.position.z = 1;
    overlayScene.add(mesh);
})();

var projectiles = [];
var lights = [];
var pausedPathers = [];
var vecTweens = [];
var bot = null;
var client = null;
var host = null;

var world = makeWorld();
scene.add(world.world);

var controls = new THREE.PointerLockControls(camera, world.bots[0].body, world.bots[0].eye);

canvas.requestPointerLock = canvas.requestPointerLock ||
                canvas.mozRequestPointerLock ||
                canvas.webkitRequestPointerLock;
                
document.exitPointerLock = document.exitPointerLock    ||
                           document.mozExitPointerLock ||
                           document.webkitExitPointerLock;
                           
canvas.onclick = function() {
    if(document.pointerLockElement === canvas ||
        document.mozPointerLockElement === canvas ||
        document.webkitPointerLockElement === canvas) 
    {
    } else {
        canvas.requestPointerLock();
    }
}

if ("onpointerlockchange" in document) {
  document.addEventListener('pointerlockchange', lockChangeAlert, false);
} else if ("onmozpointerlockchange" in document) {
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
} else if ("onwebkitpointerlockchange" in document) {
  document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);
}

function lockChangeAlert() {
    var state = document.pointerLockElement === canvas ||
    document.mozPointerLockElement === canvas ||
    document.webkitPointerLockElement === canvas;
    controls.enabled = state;
    pauseMessage.visible = !state;
    //crosshair.visible = state;
    compass.visible = state;
    if(state) {
        window.addEventListener("keydown", keydown, false);
        window.addEventListener("mousedown", mousedown, false);
    } else {
        window.removeEventListener("keydown", keydown);
        window.removeEventListener("mousedown", mousedown);
    }
}

function keydown(event){
    if(event.keyCode == 0x2D) {
        client.contents.push(world.prgRadar);
        client.contents.push(world.prgMap);
        updateRampaks();
        return;
    }
    
    var fn = event.keyCode - 0x30;
    if(interfaceAction != null) {
        interfaceAction(fn);
        return;
    }
    if(fn > 0 && fn <= world.bots.length && world.bots[fn-1] != bot) {
        setBot(fn-1);
    }
}

var cooldown = 0;
function mousedown(event){

}

var compass = new THREE.Object3D();
(function(){
    var northMarker = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
        new THREE.Vector3(-0.5, -0.5, 0.0), 
        new THREE.Vector3(-0.5, 0.5, 0.0),
        new THREE.Vector3(0.5, -0.5, 0.0), 
        new THREE.Vector3(0.5, 0.5, 0.0)
    ]);
    northMarker.position.z = 1;
    northMarker.scale.set(0.025, 0.025, 1.0);
    compass.add(northMarker);

    var southMarker = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
        new THREE.Vector3(0.5, 0.5, 0.0), 
        new THREE.Vector3(-0.5, 0.5, 0.0),
        new THREE.Vector3(-0.5, 0, 0.0), 
        new THREE.Vector3(0.5, 0, 0.0),
        new THREE.Vector3(0.5, -0.5, 0.0),
        new THREE.Vector3(-0.5, -0.5, 0.0)
    ]);
    southMarker.position.z = -1;
    southMarker.rotation.y = Math.PI;
    southMarker.scale.set(0.025, 0.025, 1.0);
    compass.add(southMarker);
    
    var eastMarker = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
        new THREE.Vector3(0.5, 0.5, 0.0), 
        new THREE.Vector3(-0.5, 0.5, 0.0),
        new THREE.Vector3(-0.5, 0, 0.0), 
        new THREE.Vector3(0.5, 0, 0.0),
        new THREE.Vector3(-0.5, 0, 0.0),
        new THREE.Vector3(-0.5, -0.5, 0.0),
        new THREE.Vector3(0.5, -0.5, 0.0)
    ]);
    eastMarker.position.x = 1;
    eastMarker.rotation.y = Math.PI/2;
    eastMarker.scale.set(0.025, 0.025, 1.0);
    compass.add(eastMarker);
    var westMarker = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
        new THREE.Vector3(0.5, 0.5, 0.0), 
        new THREE.Vector3(-0.5, 0.25, 0.0),
        new THREE.Vector3(0.5, 0, 0.0),
        new THREE.Vector3(-0.5, -0.25, 0.0),
        new THREE.Vector3(0.5, -0.5, 0.0)
    ]);
    westMarker.position.x = -1;
    westMarker.rotation.y = -Math.PI/2;
    westMarker.rotation.z = Math.PI/2;
    westMarker.scale.set(0.025, 0.025, 1.0);
    compass.add(westMarker);
})();
hudScene.add(compass);
compass.visible = false;

var VSPACE = 0.015;

world.map.position.z = 1;
world.map.scale.x *= 0.2;
world.map.scale.y *= 0.2;
world.map.position.x = 0.5 - VSPACE - 0.2;
world.map.position.y = - VSPACE - 0.2;
topHud.add(world.map);

function Bar(height, lineWidth, spacing, length) {
    var root = new THREE.Object3D();
    for(var i= 0; i < length; i++) {
        var color = BAR_COLORS[0];
        if(i >= length*2/3) {
            color = BAR_COLORS[2];
        } else if(i >= length/3){
            color = BAR_COLORS[1];
        }
        var box = makeBox(lineWidth, height, 0, color,color);
        box.position.x = i*(lineWidth+spacing);
        root.add(box);
    }
    this.display = root;
    this.set = function set(n) {
        for(var i = 0; i < length; i++) {
            root.children[i].visible = i < n;
        }
    }
}

var BIG_LABEL = 0.03;
var SMALL_LABEL = 0.025;
var BAR_H = 0.03;
var BAR_Y = VSPACE + BIG_LABEL + VSPACE + BAR_H/2;
var MAX_DAMAGE = 6;

var damageBar = new Bar(BAR_H, 0.01, 0.005, MAX_DAMAGE);
bottomHud.add(damageBar.display);
damageBar.display.position.set(0.5 - 0.10, BAR_Y-BAR_H/2, 1);
damageBar.display.rotation.y = Math.PI;
var damageSymbol = makeLines(BAR_COLORS[2], THREE.LineStrip, [
    new THREE.Vector3(-0.5, 0.5, 0.0),
    new THREE.Vector3(0.5, 0.5, 0.0),
    new THREE.Vector3(0.0, -0.5, 0.0),
    new THREE.Vector3(-0.5, 0.5, 0.0)
]);
damageSymbol.position.set(0.5 - 0.05, BAR_Y, 1.0);
damageSymbol.scale.set(BAR_H, BAR_H, 1.0);
bottomHud.add(damageSymbol);
damageBar.set(0);


var radBar = new Bar(BAR_H, 0.01, 0.005, MAX_DAMAGE);
bottomHud.add(radBar.display);
radBar.display.position.set(-0.5 + 0.10, BAR_Y-BAR_H/2, 1);
var radSymbol = new THREE.Object3D();
for(var i= 0; i < 3; i++) {
    var foil = makeLines(BAR_COLORS[2], THREE.LineStrip, [
        new THREE.Vector3(-0.25, -0.5, 0.0),
        new THREE.Vector3(0.25, -0.5, 0.0),
        new THREE.Vector3(0.0, 0.0, 0.0),
        new THREE.Vector3(-0.25, -0.5, 0.0)
    ]);
    foil.rotation.z = Math.PI*2*i/3;
    radSymbol.add(foil);
}
radSymbol.position.set(-0.5 + 0.05,  BAR_Y, 1.0);
radSymbol.scale.set(BAR_H, BAR_H, 1.0);
bottomHud.add(radSymbol);
radBar.set(0);


var terminalEmulator = new THREE.Object3D();
(function(){
    var screen = makeBox(0.9,0.9*3/4,1.0, null, monitor.tex);
    screen.children[0].position.y = 0;
    var bg = makeBox(1.0, 3/4, 0.0, SCREEN_COLORS[0], SCREEN_COLORS[1]);
    bg.children[0].position.y = 0;
    terminalEmulator.add(bg);
    terminalEmulator.add(screen);
    
    terminalEmulator.position.z = 2;
    terminalEmulator.position.y = -1.5;
    centerHud.add(terminalEmulator);
})();


var rampakLabels = [];
for(var i = 0; i < 4; i++) {
    rampakLabels.push(new Label(BIG_LABEL,SCREEN_COLORS[0]));
    rampakLabels[i].sprite.position.x = i*0.25 - 0.5 + 0.25/2;
    rampakLabels[i].sprite.position.y = VSPACE + BIG_LABEL/2;
    rampakLabels[i].setText('Empty');
    bottomHud.add(rampakLabels[i].sprite);
}
function updateRampaks() {
    rampakLabels.forEach(function(rampak, i) {
        if(i < client.contents.length)
            rampak.setText(client.contents[i].name);
        else
            rampak.setText('empty');
    })
}

var botLabels = [];
var botSubLabels = [];
var botBar = new THREE.Object3D();
for(var i = 0; i < 4; i++) {
    botLabels.push(new Label(BIG_LABEL,SCREEN_COLORS[0]));
    botLabels[i].sprite.position.x = i*0.25 - 0.5 + 0.25/2;
    botLabels[i].sprite.position.y = -VSPACE - BIG_LABEL/2;
    botLabels[i].setText('');
    botBar.add(botLabels[i].sprite);
    
    botSubLabels.push(new Label(SMALL_LABEL,SCREEN_COLORS[0]));
    botSubLabels[i].sprite.position.x = i*0.25 - 0.5 + 0.25/2;
    botSubLabels[i].sprite.position.y = -VSPACE - BIG_LABEL - VSPACE - SMALL_LABEL/2;
    botSubLabels[i].setText('');
    botBar.add(botSubLabels[i].sprite);
}
topHud.add(botBar);
function updateBotLabels() {
    for(var i = 0; i < botLabels.length; i++) {
        if(i < world.bots.length) {
            botLabels[i].setText('['+(i+1)+'] ' + world.bots[i].name);
            botSubLabels[i].setText(world.bots[i].nick);
        } else {
            botLabels[i].setText('');
            botSubLabels[i].setText('');
        }
    }
}
var botIndicator = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
    new THREE.Vector3(-0.5, 0.5, 0.0),
    new THREE.Vector3(0.5, 0.5, 0.0),
    new THREE.Vector3(0.0, -0.5, 0.0),
    new THREE.Vector3(-0.5, 0.5, 0.0)
]);
botIndicator.scale.set(0.05, 0.025, 1.0);
botIndicator.position.z = 1;
botIndicator.position.y = -VSPACE - BIG_LABEL - VSPACE - SMALL_LABEL - VSPACE - 0.0125;
botIndicator.rotation.z = Math.PI;
botBar.add(botIndicator);


var pauseMessage = new THREE.Object3D();
(function(){
    var paused = makeStaticLabel('[Paused]', BIG_LABEL, SCREEN_COLORS[0]);
    paused.position.y = BIG_LABEL/2;
    var clickto = makeStaticLabel('Click to continue', SMALL_LABEL, SCREEN_COLORS[0]);
    clickto.position.y = -SMALL_LABEL/2;
    pauseMessage.add(paused);
    pauseMessage.add(clickto);
    pauseMessage.position.z = 5;
    hudScene.add(pauseMessage);
})();


function setBot(fn) {
    if(bot)
        bot.body.visible = true;
    
    bot = world.bots[fn];
    client = findById(world.terminals, bot.id).obj;
    bot.body.visible = false;
    controls.attach(bot.body, bot.eye, bot.speed, bot.vspeed, bot.angSpeed);
    updateRampaks();
    botIndicator.position.x = fn*0.25 - 0.5 + 0.25/2;
}
setBot(0);

updateBotLabels();

function showFiles() {
    monitor.clear();
    monitor.println(host.name+': '+(4-host.contents.length)+' blocks free');
    for(var i = 0; i < 4; i++) {
        if(i < host.contents.length) {
            monitor.println(' ['+(i+1)+'] '+host.contents[i].name);
        } else if(i == 0) {
            monitor.println(' --no files--');
        } else {
            monitor.println('');
        }
    }
    monitor.setRow(-2 - 5);
    monitor.println(client.name+': '+(4-client.contents.length)+' blocks free');
    for(var i = 0; i < 4; i++) {
        if(i < client.contents.length) {
            monitor.println(' ['+(i+5)+'] '+client.contents[i].name);
        } else if(i == 0) {
            monitor.println(' --no files--');
        } else {
            monitor.println('');
        }
    }
    monitor.setRow(-1);
    monitor.println('Choose a file:_');
}

function handleFiles(fn) {
    if(fn > 0 && fn <= host.contents.length) {
        monitor.clear();
        monitor.println(host.name+' -> '+host.contents[fn-1].name);
        monitor.println('');
        monitor.println(host.contents[fn-1].description);
        monitor.setRow(-1);
        if(host.readOnly && host.readOnly > fn-1) {
            monitor.println('[1] Save [0] Back');
        } else {
            monitor.println('[1] Save [2] Delete [0] Back');
        }
        interfaceAction = handleSaveDelete(fn-1);
    }
    if(fn > 4 && fn-5 < client.contents.length) {
        monitor.clear();
        monitor.println(client.name+' -> '+client.contents[fn-5].name);
        monitor.println('');
        monitor.println(client.contents[fn-5].description);
        monitor.setRow(-1);
        monitor.println('[1] Save [2] Delete [0] Back');
        interfaceAction = handleBotSaveDelete(fn-5);
    }
}
function handleSaveDelete(index) {
    return (function(fn) {
        switch(fn) {
            case 1:
                if(client.contents.length < 4) {
                    client.contents.push(host.contents[index]);
                    rampakLabels[client.contents.length-1].setText(host.contents[index].name);
                    showFiles();
                    interfaceAction = handleFiles;
                }
                break;
            case 2:
                if(!host.readOnly || host.readOnly-1 < index) {
                    host.contents.splice(index, 1);
                    showFiles();
                    interfaceAction = handleFiles;
                }
                break;
            case 0:
                showFiles();
                interfaceAction = handleFiles;
                break;
        }
    });
}
function handleBotSaveDelete(index) {
    return (function(fn) {
        switch(fn) {
            case 1:
                if(host.contents.length < 4) {
                    host.contents.push(client.contents[index]);
                    var found = [false,false,false];
                    host.contents.forEach(function(prg){
                        var id = world.mcp.indexOf(prg);
                        if(id != -1) found[id] = true;
                    });
                    if(found.every(function(a){return a}) && host.id == world.masterComputer) {
                        interfaceAction = null;
                        monitor.clear();
                        monitor.println('Computer control restored.');
                        monitor.println('Mission Complete!');
                    } else {
                        showFiles();
                        interfaceAction = handleFiles;
                    }
                }
                break;
            case 2:
                client.contents.splice(index, 1);
                updateRampaks();
                showFiles();
                interfaceAction = handleFiles;
                break;
            case 0:
                showFiles();
                interfaceAction = handleFiles;
                break;
        }
    });
}


for(var i = 0; i < MAX_LIGHTS; i++) {
    lights.push({owner:-1, time:0, body:new THREE.PointLight(0xffffff, 0, 10)});
    scene.add(lights[i].body);
}

function getLight() {
    var oldest = lights[0];
    for(var i = 0; i < lights.length; i++) {
        if(lights[i].owner == -1) {
            return lights[i];
        }
        if(lights[i].time < oldest.time) {
            oldest = lights[i];
        }
    }
    return oldest;
}

var getLookVector = function() {
    // assumes the camera itself is not rotated
    var direction = new THREE.Vector3( 0, 0, -1 );
    return function(obj, v) {
        v.copy(direction).applyEuler(obj.rotation);
        return v;
    }
}();

var v = new THREE.Vector3(0,0,0);
var v2 = new THREE.Vector3(0,0,0);
var m = new THREE.Matrix4();
var raycaster = new THREE.Raycaster();
var prevTime = performance.now();
var UP = new THREE.Vector3(0,1,0);
var DOWN = new THREE.Vector3(0,-1,0);
var ZERO = new THREE.Vector3(0,0,0);
var interfaceAction = null;
var botbox = new THREE.Box3();

var blinkTime = 0;

function update(time) {
    var delta = Math.min(( time - prevTime ) / 1000, 0.05);
        
    world.portalDoors.forEach(function(portal){
        v.copy(bot.body.position);
        portal.door.worldToLocal(v);
        var interior = portal.inside;
        var size = portal.size;
        interior.visible = (v.z < 0 && v.z > -size.y && 
            v.x > -size.x/2 && v.x < size.x/2) || portal.door.position.x > 0;
    });

    if(controls.enabled || time == 0) { //when not paused, or on first frame
        
        listener.setPosition(bot.body.position.x, bot.body.position.y, bot.body.position.z);
        controls.getLookVector(v);
        listener.setOrientation(v.x, -v.y, v.z, UP.x, UP.y, UP.z);
        
        if(world.terminals.every(function(device){
            if(device === client) return true;
            v.set(0,0,0);
            device.body.localToWorld(v);
            if(v.distanceTo(bot.body.position) < 20) {
                if(host === device) {
                } else {
                    host = device;
                    
                    var tween = findById(vecTweens, botBar.id);
                    if(tween) {
                        vecTweens.splice(tween.index, 1);
                    }
                    vecTweens.push({
                        id:botBar.id,
                        now:botBar.position, 
                        future:new THREE.Vector3(0,BIG_LABEL+VSPACE,0), 
                        speed:1.0, 
                        alpha:0
                    });
                    
                    if(!device.hasScreen) {
                        var tween = findById(vecTweens, terminalEmulator.id);
                        if(tween) {
                            vecTweens.splice(tween.index, 1);
                        }
                        vecTweens.push({
                            id:terminalEmulator.id,
                            now:terminalEmulator.position, 
                            future:new THREE.Vector3(0,0,2), 
                            speed:1.0, 
                            alpha:0
                        });
                    }
                    if(!device.locked || (bot.hacker && !device.key) || (device.key && client.contents.indexOf(device.key) != -1)) {
                        monitor.clear();
                        if(device.locked) {
                            device.locked = false;
                            var found = findById(world.rogueBots, device.id);
                            if(found) {
                                world.rogueBots.splice(found.index, 1);
                                world.bots.push(found.obj);
                                updateBotLabels();
                                
                                var pather = findById(world.pathers, device.id);
                                if(pather) {
                                    world.pathers.splice(pather.index, 1);
                                }
                            }
                        }
                        interfaceAction = handleFiles;
                        showFiles();
                    } else {
                        interfaceAction = function(){};
                        monitor.clear();
                        monitor.println('Access Denied');
                        if(device.key) {
                            monitor.println('Key File required to unlock');
                        } else {
                            monitor.println('Proper user required to unlock');
                        }
                    }
                }
                return false;
            }
            return true;
        })) {
            if(host) {
                if(!host.hasScreen) {
                    var tween = findById(vecTweens, terminalEmulator.id);
                    if(tween) {
                        vecTweens.splice(tween.index, 1);
                    }
                    vecTweens.push({
                        id:terminalEmulator.id,
                        now:terminalEmulator.position, 
                        future:new THREE.Vector3(0,-1.5,2), 
                        speed:1.0,
                        alpha:0
                    });
                }
                monitor.clear();
                monitor.println('Logged out.');
                interfaceAction = null;
                host = null;
                
                var tween = findById(vecTweens, botBar.id);
                if(tween) {
                    vecTweens.splice(tween.index, 1);
                }
                vecTweens.push({
                    id:botBar.id,
                    now:botBar.position, 
                    future:new THREE.Vector3(0,0,0), 
                    speed:1.0, 
                    alpha:0
                });

            }
        }

        
        world.spinners.forEach(function(item){
            item.rotation.y = Math.PI*time/500;
        });
        
        
        world.doors.forEach(function(door){
            v.copy(bot.body.position);
            door.worldToLocal(v);            
            if(v.length() < 20) {
                if(door.position.x < 9) {
                    door.position.x += 25*delta;
                }
                if(door.position.x > 9) {
                    door.position.x = 9;
                }
            } else {
                if(door.position.x > 0) {
                    door.position.x -= 25*delta;
                }
                if(door.position.x < 0) {
                    door.position.x = 0;
                }
            }
        });
        
        world.pathers.forEach(function(pather){
            if(pather.body.position.distanceTo(pather.path[pather.index]) < 1) {
                pather.index = (pather.index+1) % pather.path.length;
            }
            
            v.subVectors(pather.path[pather.index], pather.body.position);
            v.normalize();
            
            if(pather.face) {
                m.lookAt(pather.body.position, pather.path[pather.index], UP);
                pather.body.rotation.setFromRotationMatrix(m);
            }
            
            v.multiplyScalar(pather.speed*delta);
            pather.body.position.add(v);
        });
        
        var targetPos = bot.body.position.clone();
        targetPos.y += 5;
        world.shooters.forEach(function(shooter){
            shooter.cooldown = Math.max(shooter.cooldown - delta, 0);
            
            if(world.bots.some(function(target) {
                v.copy(target.body.position);
                v.y += 5;
                shooter.ref.worldToLocal(v);
                var inBox = shooter.killBox.containsPoint(v);
                v.copy(target.body.position);
                v.y += 5;
                shooter.gun.parent.worldToLocal(v);
                getLookVector(shooter.gun, v2);
                v.y = 0;
                v2.y = 0;
                v.normalize();
                v2.normalize();
                var inCone = v.dot(v2) > 0.99;
                return inCone && inBox;
            })) {
                if(shooter.cooldown <= 0) {
                    
                    var beam = makeBox(0.5, 0.5, 5, DANGER_COLORS[0], DANGER_COLORS[0]);
                    beam.position.set(0,0,-3);
                    shooter.gun.localToWorld(beam.position)
                    
                    var start = shooter.gun.position.clone();
                    shooter.gun.parent.localToWorld(start);
                    
                    shotSound.play(start);
                    
                    beam.lookAt(start);
                    
                    var velocity = start.clone();
                    velocity.sub(beam.position);
                    velocity.negate();
                    velocity.normalize();
                    velocity.multiplyScalar(150);
                    
                    var light = getLight();
                    light.body.color.setHex(DANGER_COLORS[0]);
                    light.body.intensity = 0.5;
                    light.body.distance = 10;
                    light.owner = beam.id;
                    light.body.position.copy(beam.position);
                    light.time = performance.now();
                    
                    projectiles.push({
                        owner:shooter.id,
                        id:beam.id,
                        start:start,
                        body:beam,
                        velocity:velocity,
                        light:light
                    });
                    scene.add(beam);
                    shooter.cooldown = 0.25;
                }
            } else {
                shooter.gun.rotation.y += Math.PI*delta*shooter.direction*0.5;
                if(shooter.gun.rotation.y > Math.PI/4) {
                   shooter.direction = -1;
                } else if(shooter.gun.rotation.y < -Math.PI/4) {
                    shooter.direction = 1;
                }
            }
        });
        
        world.lookers.forEach(function(looker){
            v.copy(bot.body.position);
            looker.parent.worldToLocal(v);
            v.y = looker.position.y;
            looker.lookAt(v);
        });
        
        var deadProjectiles = [];
        projectiles.forEach(function(proj){
            raycaster.near = 0;
            raycaster.far = proj.velocity.length()*delta;
            v.copy(proj.velocity);
            v.normalize();
            raycaster.set(proj.body.position, v);
            
            world.damageable.filter(
                function(item){
                    return proj.owner != item.id && raycaster.intersectObject(item.body, true).length > 0;
                }
            ).forEach(function(item){
                item.damage += 1;
                if(item.id == bot.id) noiseLevel = 1.0;
            });
            
            scene.remove(proj.body);
            if(proj.body.position.distanceTo(proj.start) > 300 || 
            raycaster.intersectObject(scene, true).length > 0) {
                deadProjectiles.push(proj);
            }
            scene.add(proj.body);
            v.copy(proj.velocity);
            v.multiplyScalar(delta);
            proj.body.position.add(v);
            if(proj.id == proj.light.owner) {
                proj.light.body.position.copy(proj.body.position);
            }
        });
        deadProjectiles.forEach(function(proj){
            projectiles.splice(projectiles.indexOf(proj), 1);
            scene.remove(proj.body);
            if(proj.id == proj.light.owner) {
                proj.light.body.intensity = 0;
                proj.light.owner = -1;
            }
        });
        
        
        world.colliders.forEach(function(obj){ 
            obj.dy -= obj.g*10.0*delta;
            botbox.min.set(obj.body.position.x-obj.radius, obj.body.position.y, obj.body.position.z-obj.radius);
            botbox.max.set(obj.body.position.x+obj.radius, obj.body.position.y+obj.radius, obj.body.position.z+obj.radius);
            world.obstacles.forEach(function(box){
                if(box.isIntersectionBox(botbox)) {
                    var bd = botbox.max.y - box.min.y; //+ if intersecting
                    var td = box.max.y - botbox.min.y; //+ if intersecting
                    var ld = botbox.max.x - box.min.x; //+ if intersecting
                    var rd = box.max.x - botbox.min.x; //+ if intersecting
                    var md = botbox.max.z - box.min.z; //+ if intersecting
                    var pd = box.max.z - botbox.min.z; //+ if intersecting
                    if(bd < 0) bd = Number.POSITIVE_INFINITY;
                    if(td < 0) td = Number.POSITIVE_INFINITY;
                    if(ld < 0) ld = Number.POSITIVE_INFINITY;
                    if(rd < 0) rd = Number.POSITIVE_INFINITY;
                    if(md < 0) md = Number.POSITIVE_INFINITY;
                    if(pd < 0) pd = Number.POSITIVE_INFINITY;
                    
                    td -= 5; //stair step factor
                    
                    if(ld < rd && ld < md && ld < pd && ld < td && ld < bd) {
                        obj.body.position.x = box.min.x - obj.radius - 0.1;
                        if(obj.id == bot.id) noiseLevel = Math.min(1.0,noiseLevel+0.5);
                    }
                    if(rd < ld && rd < pd && rd < md && rd < td && rd < bd) {
                        obj.body.position.x = box.max.x + obj.radius + 0.1;
                        if(obj.id == bot.id) noiseLevel = Math.min(1.0,noiseLevel+0.5);
                    }
                    if(md < pd && md < ld && md < rd && md < td && md < bd) {
                        obj.body.position.z = box.min.z - obj.radius - 0.1;
                        if(obj.id == bot.id) noiseLevel = Math.min(1.0,noiseLevel+0.5);
                    }
                    if(pd < md && pd < ld && pd < rd && pd < td && pd < bd) {
                        obj.body.position.z = box.max.z + obj.radius + 0.1;
                        if(obj.id == bot.id) noiseLevel = Math.min(1.0,noiseLevel+0.5);
                    }
                    if(bd < pd && bd < ld && bd < rd && bd < td && bd < md) {
                        obj.body.position.y = box.min.y - obj.radius;
                    }
                    if(td < md && td < ld && td < rd && td < pd && td < bd) {
                        obj.body.position.y = box.max.y;
                        obj.dy = 0;
                    }
                }
            });
            obj.body.position.y += obj.dy*delta;
        });
                
        world.damageable.filter(function(a){return a.damage > MAX_DAMAGE || a.body.position.y < -10;}).forEach(function(item) {
            var foundBot = findById(world.bots, item.id);
            if(foundBot) {
                var deadBot = foundBot.obj;
                deadBot.body.position.copy(deadBot.spawn);
                item.damage = 0;
                var device = findById(world.terminals, deadBot.id);
                device.obj.contents = [];

                if(deadBot.resetOwner) {
                    device.obj.locked = true;
                    world.bots.splice(foundBot.index, 1);
                    world.rogueBots.push(deadBot);
                    world.terminals.splice(device.index, 1);
                    world.potentialTerminals.push(device.obj);
                    var pather = findById(pausedPathers, deadBot.id);
                    if(pather) {
                        pausedPathers.splice(pather.index, 1);
                        world.pathers.push(pather.obj);
                        pather.obj.index = 0;
                    }
                }
                if(bot.id == deadBot.id) {
                    noiseLevel = 2.0;
                    setBot(0);
                    updateBotLabels();
                    updateRampaks();
                }

            } else {
                var found = findById(world.shooters, item.id);
                if(found) {
                    world.shooters.splice(found.index, 1);
                }
                var found = findById(world.pathers, item.id);
                if(found) {
                    world.pathers.splice(found.index, 1);
                }
                var found = findById(world.terminals, item.id);
                if(found) {
                    world.terminals.splice(found.index, 1);
                }
                var found = findById(world.damageable, item.id);
                if(found) {
                    world.damageable.splice(found.index, 1);
                }
                item.body.visible = false;
            }
        });
        
        world.damageable.forEach(function(item){
            if(world.healers.some(function(healer) {
                v.copy(item.body.position);
                healer.worldToLocal(v);
                return v.lengthSq() < 5*5;
            })) {
                item.damage = Math.max(0, item.damage - 2*delta);
            }
        });
        
        var radiation = world.safeZone.distanceToPoint(bot.body.position)/30;
        radBar.set(radiation);
        var botDamage = findById(world.damageable, bot.id);
        if(radiation > 1) {
            var b = Math.floor(botDamage.obj.damage);
            botDamage.obj.damage += radiation*0.3*delta;
            if(b < Math.floor(botDamage.obj.damage))
                noiseLevel = 1.0;
        }
        
        damageBar.set(botDamage.obj.damage);
        
        controls.update(delta);
    }
    
    
    blinkTime += delta;
    world.botMarkers.forEach(function(marker){
        marker.blip.position.x = marker.body.position.x;
        marker.blip.position.y = marker.body.position.z;
        
        marker.blip.visible = (
            (blinkTime > 0.25 && marker.id == bot.id) || 
            (marker.id != bot.id && client.contents.indexOf(world.prgRadar) != -1)
        ) && world.indoors.every(function(box){
            return !box.containsPoint(marker.body.position);
        });
    });
    if(blinkTime > 0.5)
        blinkTime = 0;
    
    
    world.mapDetail.visible = client.contents.indexOf(world.prgMap) != -1;
    world.map.visible = world.indoors.every(function(box){
        return !box.containsPoint(bot.body.position);
    })
    
    
    compass.rotation.y = bot.body.rotation.y;
    
    noiseGain.gain.value = noiseLevel*NOISE_VOL;
    if(noiseLevel > 0) {
        noiseLevel = Math.max(0,noiseLevel - 1.0*delta);
    }

    
    vecTweens.forEach(function(tween){
        tween.now.lerp(tween.future, tween.alpha);
        tween.alpha += tween.speed*delta;
    });
    vecTweens.filter(function(tween){return tween.alpha >= 1.0}).forEach(function(tween){
        vecTweens.splice(findById(vecTweens, tween.id).index, 1);
        tween.now.copy(tween.future);
    });
    
    
    render(time);
    prevTime = time;
    requestAnimationFrame(update);
} 
update(0);

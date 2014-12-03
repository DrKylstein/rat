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

var camera, hudCamera, overlayCamera;
var wsize;
var renderer = new THREE.WebGLRenderer({antialias:true}); 
var scene = new THREE.Scene(); 
var hudScene = new THREE.Scene();
var overlayScene = new THREE.Scene();
renderer.autoClear = false;
var canvas = renderer.domElement;
document.body.appendChild(canvas);


(function initCameras() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var min = Math.min(width, height);
    wsize = [width/min, height/min];
    
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, FAR ); 
    hudCamera = new THREE.OrthographicCamera(-(wsize[0])/2, (wsize[0])/2, (wsize[1])/2, -(wsize[1])/2, 1, 10);
    hudCamera.position.z = 10;    
    overlayCamera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
    overlayCamera.position.z = 10;
    renderer.setSize(width, height);
})();
window.onresize = function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var min = Math.min(width, height);
    wsize = [width/min, height/min];
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    hudCamera.left = - (wsize[0]) / 2;
    hudCamera.right = (wsize[0]) / 2;
    hudCamera.top = (wsize[1]) / 2;
    hudCamera.bottom = - (wsize[1]) / 2;
    hudCamera.updateProjectionMatrix();
    
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

var stunned = [];
var projectiles = [];
var pausedPathers = [];
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
    crosshair.visible = state;
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
    if(bot.canShoot && cooldown <= 0) {
        var beam = makeBox(1, 1, 10, 0xffffff, 0xffffff);
        var pos = new THREE.Vector3(0,-2,0);
        beam.position.copy(bot.eye.localToWorld(pos));
        var v = new THREE.Vector3(0.0,0.0,1.0);
        controls.getLookVector(v);
        v.multiplyScalar(bot.radius+5);
        beam.position.add(v);
        controls.getLookVector(v);
        v.multiplyScalar(400);
        beam.lookAt(new THREE.Vector3().addVectors(beam.position, v));
        projectiles.push({
            start:new THREE.Vector3().copy(bot.body.position),
            body:beam,
            velocity:v
        });
        scene.add(beam);
        cooldown = 0.5;
    }
}

var compass = new THREE.Object3D();
(function(){
    var northMarker = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
        new THREE.Vector3(-0.5, -0.5, 0.0), 
        new THREE.Vector3(-0.5, 0.5, 0.0),
        new THREE.Vector3(0.5, -0.5, 0.0), 
        new THREE.Vector3(0.5, 0.5, 0.0)
    ]);
    northMarker.position.z = -1;
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
    southMarker.position.z = 1;
    northMarker.rotation.y = Math.PI;
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
    eastMarker.position.x = -1;
    eastMarker.rotation.y = -Math.PI/2;
    eastMarker.scale.set(0.025, 0.025, 1.0);
    compass.add(eastMarker);
    var westMarker = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
        new THREE.Vector3(0.5, 0.5, 0.0), 
        new THREE.Vector3(-0.5, 0.25, 0.0),
        new THREE.Vector3(0.5, 0, 0.0),
        new THREE.Vector3(-0.5, -0.25, 0.0),
        new THREE.Vector3(0.5, -0.5, 0.0)
    ]);
    westMarker.position.x = 1;
    westMarker.rotation.y = Math.PI/2;
    westMarker.rotation.z = Math.PI/2;
    westMarker.scale.set(0.025, 0.025, 1.0);
    compass.add(westMarker);
})();
hudScene.add(compass);
compass.visible = false;


var crosshair = makeLines( SCREEN_COLORS[0], THREE.LinePieces, [
    new THREE.Vector3(-0.5, 0.5, 0),new THREE.Vector3(-0.1, 0.1, 0),
    new THREE.Vector3(0.5, 0.5, 0),new THREE.Vector3(0.1, 0.1, 0),
    new THREE.Vector3(0.5, -0.5, 0),new THREE.Vector3(0.1, -0.1, 0),
    new THREE.Vector3(-0.5, -0.5, 0),new THREE.Vector3(-0.1, -0.1, 0),
]);
crosshair.scale.set(0.15,0.15,1.0);
crosshair.position.z = 1;
hudScene.add(crosshair);
crosshair.visible = false;

world.map.position.z = 1;
world.map.scale.x *= 0.25;
world.map.scale.y *= 0.25;
world.map.position.x = 0.5 - 0.25;
world.map.position.y = 0.5 - 0.25;
hudScene.add(world.map);

function Bar(height, lineWidth, spacing, length) {
    var root = new THREE.Object3D();
    for(var i= 0; i < length; i++) {
        var box = makeBox(lineWidth, height, 0, SCREEN_COLORS[0], SCREEN_COLORS[0]);
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

var BIG_LABEL = 0.05;
var SMALL_LABEL = 0.04;
var VSPACE = 0.015;
var BAR_H = 0.05;
var BAR_Y = -0.5 + VSPACE + BIG_LABEL + VSPACE + BAR_H/2;

var damageBar = new Bar(BAR_H, 0.01, 0.01, 10);
hudScene.add(damageBar.display);
damageBar.display.position.set(0.5 - 0.10, BAR_Y, 1);
damageBar.display.rotation.y = Math.PI;
var damageSymbol = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
    new THREE.Vector3(-0.5, 0.5, 0.0),
    new THREE.Vector3(0.5, 0.5, 0.0),
    new THREE.Vector3(0.0, -0.5, 0.0),
    new THREE.Vector3(-0.5, 0.5, 0.0)
]);
damageSymbol.position.set(0.5 - 0.05, BAR_Y, 1.0);
damageSymbol.scale.set(BAR_H, BAR_H, 1.0);
hudScene.add(damageSymbol);
damageBar.set(0);


var radBar = new Bar(BAR_H, 0.01, 0.01, 10);
hudScene.add(radBar.display);
radBar.display.position.set(-0.5 + 0.10, BAR_Y, 1);
var radSymbol = new THREE.Object3D();
for(var i= 0; i < 3; i++) {
    var foil = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
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
hudScene.add(radSymbol);
radBar.set(0);


var terminalEmulator = new THREE.Object3D();
(function(){
    var screen = new THREE.Sprite(new THREE.SpriteMaterial({map:monitor.tex}));
    screen.scale.set(0.9,0.9*3/4,1.0);
    var bg = makeBox(1.0, 3/4, 0.0, SCREEN_COLORS[0], SCREEN_COLORS[1]);
    bg.position.y = -0.5*3/4;
    terminalEmulator.add(bg);
    terminalEmulator.add(screen);
    
    terminalEmulator.position.z = 2;
    terminalEmulator.position.y = -1.5;
    hudScene.add(terminalEmulator);
})();


var rampakLabels = [];
for(var i = 0; i < 4; i++) {
    rampakLabels.push(new Label(BIG_LABEL,SCREEN_COLORS[0]));
    rampakLabels[i].sprite.position.x = i*0.25 - 0.5 + 0.25/2;
    rampakLabels[i].sprite.position.y = -0.5 + VSPACE + BIG_LABEL/2;
    rampakLabels[i].setText('Empty');
    hudScene.add(rampakLabels[i].sprite);
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
for(var i = 0; i < 4; i++) {
    botLabels.push(new Label(BIG_LABEL,SCREEN_COLORS[0]));
    botLabels[i].sprite.position.x = i*0.25 - 0.5 + 0.25/2;
    botLabels[i].sprite.position.y = 0.5 - VSPACE - BIG_LABEL/2;
    botLabels[i].setText('');
    hudScene.add(botLabels[i].sprite);
    
    botSubLabels.push(new Label(SMALL_LABEL,SCREEN_COLORS[0]));
    botSubLabels[i].sprite.position.x = i*0.25 - 0.5 + 0.25/2;
    botSubLabels[i].sprite.position.y = 0.5 - VSPACE - BIG_LABEL - VSPACE - SMALL_LABEL/2;
    botSubLabels[i].setText('');
    hudScene.add(botSubLabels[i].sprite);
}
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
botIndicator.position.y = 0.5 - VSPACE - BIG_LABEL - VSPACE - SMALL_LABEL - VSPACE - 0.0125;
botIndicator.rotation.z = Math.PI;
hudScene.add(botIndicator);


var pauseMessage = new THREE.Object3D();
(function(){
    var paused = makeStaticLabel('[Paused]', 0.1, SCREEN_COLORS[0]);
    paused.position.y = 0.025;
    var clickto = makeStaticLabel('Click to continue.', BIG_LABEL, SCREEN_COLORS[0]);
    clickto.position.y = -0.05;
    pauseMessage.add(paused);
    pauseMessage.add(clickto);
    pauseMessage.position.z = 1;
    hudScene.add(pauseMessage);
})();


function setBot(fn) {
    if(bot)
        bot.body.visible = true;
    
    bot = world.bots[fn];
    client = findById(world.terminals, bot.id).obj;
    bot.body.visible = false;
    controls.attach(bot.body, bot.eye, bot.speed, bot.vspeed);
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
            monitor.println(' '+(i+1)+'. '+host.contents[i].name);
        } else if(i == 0) {
            monitor.println(' --no files--');
        } else {
            monitor.println('');
        }
    }
    monitor.println(client.name+': '+(4-client.contents.length)+' blocks free');
    for(var i = 0; i < 4; i++) {
        if(i < client.contents.length) {
            monitor.println(' '+(i+5)+'. '+client.contents[i].name);
        } else if(i == 0) {
            monitor.println(' --no files--');
        } else {
            monitor.println('');
        }
    }
    monitor.println('Choose a file:');
}

function handleFiles(fn) {
    if(fn > 0 && fn <= host.contents.length) {
        monitor.clear();
        monitor.println(host.name+' -> '+host.contents[fn-1].name);
        monitor.println('');
        host.contents[fn-1].description.forEach(function(line){
            monitor.println(line);
        });
        monitor.println('');
        if(host.readOnly && host.readOnly > fn-1) {
            monitor.println('1Save 0Back');
        } else {
            monitor.println('1Save 2Delete 0Back');
        }
        interfaceAction = handleSaveDelete(fn-1);
    }
    if(fn > 4 && fn-5 < client.contents.length) {
        monitor.clear();
        monitor.println(client.name+' -> '+client.contents[fn-5].name);
        monitor.println('');
        client.contents[fn-5].description.forEach(function(line){
            monitor.println(line);
        });
        monitor.println('');
        monitor.println('1Save 2Delete 0Back');
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
                        var id = mcp.indexOf(prg);
                        if(id != -1) found[id] = true;
                    });
                    if(found.every(function(a){return a})) {
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


var v = new THREE.Vector3(0,0,0);
var m = new THREE.Matrix4();
var raycaster = new THREE.Raycaster();
var prevTime = performance.now();
var UP = new THREE.Vector3(0,1,0);
var DOWN = new THREE.Vector3(0,-1,0);
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
        
        if(world.terminals.every(function(device){
            if(device === client) return true;
            v.set(0,0,0);
            device.body.localToWorld(v);
            if(v.distanceTo(bot.body.position) < 20) {
                if(host === device) {
                } else {
                    host = device;
                    if(!device.hasScreen) {
                        terminalEmulator.position.y = 0.0;
                    }
                    if(!device.locked || (bot.hacker && !device.key) || (device.key && client.contents.indexOf(device.key) != -1)) {
                        monitor.clear();
                        if(device.locked) {
                            device.locked = false;
                            var found = findById(rogueBots, device.id);
                            if(found) {
                                world.rogueBots.splice(found.index, 1);
                                world.bots.push(found.obj);
                                updateBotLabels();
                                var foundStunned = findById(stunned, device.id);
                                if(foundStunned) {
                                    stunned.splice(foundStunned.index, 1);
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
                    terminalEmulator.position.y = -1.5;
                }
                monitor.clear();
                monitor.println('Logged out.');
                interfaceAction = null;
                host = null;
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
        
        
        stunned.forEach(function(stunned){
            stunned.time -= delta;
        });
        stunned.filter(function(item){return item.time <= 0;}).forEach(
        function(item, i){
            stunned.splice(i, 1);
            var foundMover = findById(pausedPathers, item.id);
            if(foundMover) {
                pausedPathers.splice(foundMover.index, 1);
                world.pathers.push(foundMover.obj);
            }
            
            var foundDevice = findById(world.terminals, item.id);
            if(foundDevice) {
                world.terminals.splice(foundDevice.index, 1);
                world.potentialTerminals.push(foundDevice.obj);
            }
        });
        
        
        var deadProjectiles = [];
        projectiles.forEach(function(proj){
            raycaster.near = 0;
            raycaster.far = proj.velocity.length()*delta;
            v.copy(proj.velocity);
            v.normalize();
            raycaster.set(proj.body.position, v);
            
            world.stunnable.filter(
                function(item){
                    return raycaster.intersectObject(item.body, true).length > 0;
                }
            ).forEach(
                function(item){
                    var found = findById(stunned, item.id);
                    if(found){
                        found.obj.time += 10;
                    } else {
                        stunned.push({id:item.id, time:10});
                        var found = findById(pathers, item.id);
                        if(found) {
                            world.pathers.splice(found.index, 1);
                            pausedPathers.push(found.obj);
                        }
                        var found = findById(potentialTerminals, item.id);
                        if(found) {
                            world.potentialTerminals.splice(found.index, 1);
                            world.terminals.push(found.obj);
                        }
                    }
                }
            );
            
            scene.remove(proj.body);
            if(proj.body.position.distanceTo(proj.start) > 300 || 
            raycaster.intersectObject(scene, true).length > 0) {
                deadProjectiles.push(proj);
            }
            scene.add(proj.body);
            v.copy(proj.velocity);
            v.multiplyScalar(delta);
            proj.body.position.add(v);
        });
        deadProjectiles.forEach(function(proj){
            projectiles.splice(projectiles.indexOf(proj), 1);
            scene.remove(proj.body);
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
        
        if(cooldown > 0)
            cooldown -= delta;
        
        
        var radiation = 0;//Math.floor(Math.max(bot.body.position.lengthManhattan() - 1500, 0)/100);
        radBar.set(radiation);
        if(radiation > 1) {
            if(!('damage' in bot)) {
                bot.damage = 0;
            }
            var b = Math.floor(bot.damage);
            bot.damage += radiation*0.3*delta;
            if(b < Math.floor(bot.damage))
                noiseLevel = 1.0;
        } else {
            if('damage' in bot) {
                if(bot.damage > 0) {
                    bot.damage -= 0.2*delta;
                }
                if(bot.damage < 0) {
                    bot.damage = 0;
                }
            }
        }
        
        
        if(bot.damage) {
            damageBar.set(bot.damage);
        } else {
            damageBar.set(0);
        }
        
        
        if((bot.damage && bot.damage > 10) || bot.body.position.y < -5) {
            bot.body.position.copy(bot.spawn);
            bot.damage = 0;
            var device = findById(world.terminals, bot.id);
            device.obj.contents.splice(0,device.obj.contents.length);
            if(bot.resetOwner) {
                device.obj.locked = true;
                var foundBot = findById(world.bots, bot.id);
                world.bots.splice(foundBot.index, 1);
                rogueBots.push(foundBot.obj);
                world.terminals.splice(device.index, 1);
                potentialTerminals.push(device.obj);
                var mover = findById(pausedPathers, bot.id);
                pausedPathers.splice(mover.index, 1);
                pathers.push(mover.obj);
                setBot(0);
                updateBotLabels();
            }
            updateRampaks();
        }
        
        controls.update(delta);
    }
    
    blinkTime += delta;
    world.botMarkers.forEach(function(marker){
        marker.blip.position.x = marker.body.position.x;
        marker.blip.position.y = marker.body.position.z;
        if(marker.id == bot.id && blinkTime > 0.25) {
            marker.blip.visible = !marker.blip.visible;
            blinkTime = 0;
        }
    });
    compass.rotation.y = bot.body.rotation.y;
    compass.rotation.x = bot.eye.rotation.x;
    if(noiseLevel > 0) {
        noiseLevel = Math.max(0,noiseLevel - 1.0*delta);
    }
    
    
    render(time);
    prevTime = time;
    requestAnimationFrame(update);
} 
update(0);

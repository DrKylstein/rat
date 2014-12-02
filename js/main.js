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
var SCREEN_COLORS = [0x00ff00, 0x002200];
var ENV_COLORS = [0x008800, 0x002200];
var BUILDING_COLORS = [0x0000ff, 0xff0000, 0x00ff00, 0x00ffff, 0xff00ff, 0xffff00, 0xffffff];

var camera, cameraOrtho, cameraNonSquare;
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
    cameraOrtho = new THREE.OrthographicCamera(-(wsize[0])/2, (wsize[0])/2, (wsize[1])/2, -(wsize[1])/2, 1, 10);
    cameraOrtho.position.z = 10;    
    cameraNonSquare = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 1, 10);
    cameraNonSquare.position.z = 10;
    renderer.setSize(width, height);
})();
window.onresize = function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var min = Math.min(width, height);
    wsize = [width/min, height/min];
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    cameraOrtho.left = - (wsize[0]) / 2;
    cameraOrtho.right = (wsize[0]) / 2;
    cameraOrtho.top = (wsize[1]) / 2;
    cameraOrtho.bottom = - (wsize[1]) / 2;
    cameraOrtho.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}
var overlayShader;
var noiseLevel = 0;

function render(time) {
    renderer.clear();
    renderer.render(scene, camera);
    renderer.clearDepth();
    renderer.render(hudScene, cameraOrtho);
    renderer.clearDepth();
    overlayShader.uniforms.time.value = time;
    overlayShader.uniforms.noiseLevel.value = noiseLevel;
    renderer.render(overlayScene, cameraNonSquare);
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

var doors, buildings, intersections, city, portalDoors, wallObjects;
var spinners = [];
var fallers = [];
var pathFollowers = [];
var stopped = [];
var stunnable = [];
var stunned = [];
var projectiles = [];
var rogueBots = [];
var bots = [];
var terminals = [];
var potentialTerminals = [];

var bot = null;
var client = null;
var host = null;
var botId = -1;

(function(){
    var world = makeWorld(ENV_COLORS, BUILDING_COLORS);
    doors = world.doors;
    city = world.world;
    buildings = world.rooms;
    intersections = world.intersections;
    portalDoors = world.portalDoors;
    wallObjects = world.wallObjects;
    scene.add(city);
})();

var eyeKey = {
    name:'eye key',
    description:[
        'Unlock a flying robot.',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' '
    ]
};

var mcp = [
    {
        name:'MCP 1/3',
        description:[
            'Restore central control of', 
            'city systems.',
            '',
            '',
            '',
            '',
            ''
        ]
    },
    {
        name:'MCP 2/3',
        description:[
            'Restore central control of', 
            'city systems.',
            '',
            '',
            '',
            '',
            ''
        ]
    },
    {
        name:'MCP 3/3',
        description:[
            'Restore central control of', 
            'city systems.',
            '',
            '',
            '',
            '',
            ''
        ]
    }
];

var programs = [
    eyeKey,
    {
        name:'foo.txt',
        description:[
            'foo', 
            'bar',
            'baz',
            'frob',
            '',
            '',
            ''
        ]
    },
    mcp[0],
    mcp[1],
    mcp[2]
];
var hackerKey = {
    name:'hacker key',
    description:[
        'Unlock a robot that can', 
        'hack computers.',
        '',
        '',
        '',
        '',
        ''
    ]
};

var monitor = new Monitor(SCREEN_COLORS[0], SCREEN_COLORS[1]);

Random.shuffle(programs);
Random.shuffle(buildings);

buildings.forEach(function(building){
    building.rooms.forEach(function(room){
        var light = makeCeilingLight();
        light.position.y = 20;
        room.add(light);
    });
});

buildings.forEach(function(building, i) {
    var room = Random.choose(building.leafRooms);
    var mainframe = makeMainframe();
    var back = room.userData.size.z/2 - 5;
    mainframe.position.z -= back;
    room.add(mainframe);
    wallObjects.push(mainframe);
    
    if(building.isStart) {
        terminals.push({
            id:mainframe.id,
            body:mainframe, 
            name:"Cyber 1", 
            contents:[hackerKey], 
            locked:false,
            hasScreen:true,
            readOnly: 1
        }); 
    } else {
        terminals.push({
            id:mainframe.id,
            body:mainframe, 
            name:"Cyber "+(i+2), 
            contents:[programs[i%programs.length]], 
            locked:true,
            hasScreen:true,
            readOnly: 1
        });
    }
    
    building.rooms.splice(building.rooms.indexOf(room),1);
    building.leafRooms.splice(building.leafRooms.indexOf(room),1);
});

buildings.forEach(function(building){
    building.leafRooms.forEach(function(room){
        if(room.userData.size.x >= 20 && room.userData.size.z >= 20) {
            var table = makeTable();
            table.position.z = -room.userData.size.z/2 + 10/2;
            wallObjects.push(table);
            room.add(table);
        }
        building.rooms.splice(building.rooms.indexOf(room),1);
    });
    building.rooms.forEach(function(room){
        if(room.userData.size.x >= 40 && room.userData.size.z >= 30) {
            var table = makeTable();
            wallObjects.push(table);
            room.add(table);
        }
    });
});


function spawnGuard(position, patrol) {
    var shape = makeGuard();
    shape.body.position.copy(position);
    pathFollowers.push({
        id:shape.id,
        body:shape.body,
        speed:20,
        face:true,
        index:0,
        path:patrol
    });
    scene.add(shape.body);
}

spawnGuard(intersections[-2][-2],
    [
        intersections[-2][-2],
        intersections[-1][-2],
        intersections[-1][-1],
        intersections[-2][-1]
    ]
);



(function(){
    var shape = makeRizzo();
    var id = shape.body.id;

    scene.add(shape.body);
    var bot = {
        id:id,
        body:shape.body, 
        eye:shape.eye, 
        radius:3, 
        canShoot:true,
        speed:400.0,
        vspeed:0.0,
        spawn: new THREE.Vector3(0,0,0),
        name:'Rizzo'
    };
    var device = {
        id:id,
        name:'Rizzo', 
        body:shape.body, 
        contents:[],
        locked:false,
        hasScreen:false
    };
    terminals.push(device);
    bots.push(bot);
    fallers.push({id:id, body:shape.body,dy:0});
})();

(function(){
    var shape = makeAnneka();
    var id = shape.body.id;
    shape.body.position.copy(intersections[1][1]);
    scene.add(shape.body);
    var bot = {
        id:id,
        body:shape.body, 
        eye:shape.eye,
        radius:30/2,
        speed:400.0,
        vspeed:400.0,
        spawn: intersections[1][1],
        resetOwner: true,
        name:'Anneka'
    };
    var device = {
        id:id,
        name:'Anneka', 
        body:shape.body, 
        contents:[], 
        locked:true, 
        hasScreen:false,
        key:eyeKey
    };
    rogueBots.push(bot);
    pathFollowers.push({
        id:id,
        body:shape.body,
        speed:30,
        face:false,
        index:0,
        device:bot,
        path:[
            new THREE.Vector3(0.0,100.0,0.0).add(intersections[1][1]),
            intersections[1][1],
            new THREE.Vector3(0.0,100.0,0.0).add(intersections[1][1]),
        
            new THREE.Vector3(0.0,100.0,0.0).add(intersections[0][1]),
            intersections[0][1],
            new THREE.Vector3(0.0,100.0,0.0).add(intersections[0][1]),
        
            new THREE.Vector3(0.0,100.0,0.0).add(intersections[0][0]),
            intersections[0][0],
            new THREE.Vector3(0.0,100.0,0.0).add(intersections[0][0]),
            
            new THREE.Vector3(0.0,100.0,0.0).add(intersections[1][0]),
            intersections[1][0],
            new THREE.Vector3(0.0,100.0,0.0).add(intersections[1][0])
        ]
    });
    stunnable.push({id:id, body:shape.body});
    potentialTerminals.push(device);
    //terminals.push(bot);
    //bots.push(bot);
})();

(function(){
    var shape = makeIgor();
    var id = shape.body.id;
    
    scene.add(shape.body);
    shape.body.position.copy(intersections[-1][-1]);
    var bot = {
        id:id,
        body:shape.body,
        eye:shape.eye,
        radius:4,
        hacker:true,
        speed:200.0,
        vspeed:0.0,
        spawn:intersections[-1][-1],
        resetOwner: true,
        name:'Igor'
    };
    var device = {
        id:id,
        name:'Igor', 
        body:shape.body, 
        contents:[], 
        locked:true, 
        hasScreen:false,
        key:hackerKey
    };
    rogueBots.push(bot);
    pathFollowers.push({
        id:id,
        body:shape.body, 
        face:true,
        path:[
            intersections[-1][-1],
            intersections[0][-1],
            intersections[0][0],
            intersections[-1][0]
        ],
        index:0,
        speed:20,
        device:bot
    })
    stunnable.push({id:id, body:shape.body});
    potentialTerminals.push(device);
    //terminals.push(bot);
    //bots.push(bot);
    fallers.push({id:id, body:shape.body,dy:0});
})();

var controls = new THREE.PointerLockControls(camera, bots[0].body, bots[0].eye);

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
    if(fn > 0 && fn <= bots.length && bots[fn-1] != bot) {
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

var damageBar = new Bar(0.05, 0.01, 0.01, 10);
hudScene.add(damageBar.display);
damageBar.display.position.set(0.5 - 0.10, -0.5 + 0.15 - 0.025, 1);
damageBar.display.rotation.y = Math.PI;
var damageSymbol = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
    new THREE.Vector3(-0.5, 0.5, 0.0),
    new THREE.Vector3(0.5, 0.5, 0.0),
    new THREE.Vector3(0.0, -0.5, 0.0),
    new THREE.Vector3(-0.5, 0.5, 0.0)
]);
damageSymbol.position.set(0.5 - 0.05, -0.5 + 0.15, 1.0);
damageSymbol.scale.set(0.05, 0.05, 1.0);
hudScene.add(damageSymbol);
damageBar.set(0);


var radBar = new Bar(0.05, 0.01, 0.01, 10);
hudScene.add(radBar.display);
radBar.display.position.set(-0.5 + 0.10,  -0.5 + 0.15 - 0.025, 1);
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
radSymbol.position.set(-0.5 + 0.05,  -0.5 + 0.15, 1.0);
radSymbol.scale.set(0.05, 0.05, 1.0);
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
    rampakLabels.push(new Label(0.05,SCREEN_COLORS[0]));
    rampakLabels[i].sprite.position.x = i*0.25 - 0.5 + 0.25/2;
    rampakLabels[i].sprite.position.y = -0.5 + 0.05;
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
for(var i = 0; i < 4; i++) {
    botLabels.push(new Label(0.05,SCREEN_COLORS[0]));
    botLabels[i].sprite.position.x = i*0.25 - 0.5 + 0.25/2;
    botLabels[i].sprite.position.y = 0.5 - 0.05;
    botLabels[i].setText('');
    hudScene.add(botLabels[i].sprite);
}
function updateBotLabels() {
    botLabels.forEach(function(bot, i) {
        if(i < bots.length)
            botLabels[i].setText(bots[i].name);
        else
            botLabels[i].setText('');
    })
}
var botIndicator = makeLines(SCREEN_COLORS[0], THREE.LineStrip, [
    new THREE.Vector3(-0.5, 0.5, 0.0),
    new THREE.Vector3(0.5, 0.5, 0.0),
    new THREE.Vector3(0.0, -0.5, 0.0),
    new THREE.Vector3(-0.5, 0.5, 0.0)
]);
botIndicator.scale.set(0.05, 0.025, 1.0);
botIndicator.position.z = 1;
botIndicator.position.y = 0.5 - 0.1;
botIndicator.rotation.z = Math.PI;
hudScene.add(botIndicator);


var pauseMessage = new THREE.Object3D();
(function(){
    var paused = makeStaticLabel('[Paused]', 0.1, SCREEN_COLORS[0]);
    paused.position.y = 0.025;
    var clickto = makeStaticLabel('Click to continue.', 0.05, SCREEN_COLORS[0]);
    clickto.position.y = -0.05;
    pauseMessage.add(paused);
    pauseMessage.add(clickto);
    pauseMessage.position.z = 1;
    hudScene.add(pauseMessage);
})();


function setBot(fn) {
    if(bot)
        bot.body.visible = true;
    
    bot = bots[fn];
    client = findById(terminals, bot.id).obj;
    botId = bot.id;
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
var raycaster = new THREE.Raycaster();
var prevTime = performance.now();
var DOWN = new THREE.Vector3(0,-1,0);
var interfaceAction = null;
var  wallBoxes = [];
function update(time) {
    var delta = Math.min(( time - prevTime ) / 1000, 0.05);
    
    //gravity
    fallers.forEach(function(item) {
        scene.remove(item.body);
        var testPos = item.body.position.clone();
        testPos.y += 5;
        raycaster.set(testPos, DOWN);
        raycaster.near = 0;
        raycaster.far = 5;
        var hit = raycaster.intersectObject(scene, true);
        if(hit.length > 0) {
            item.body.position.y = hit[0].point.y;
            item.dy = 0;
        } else {
            item.dy -= 9.8 * 10.0 * delta;
            item.body.position.y += item.dy * delta;
        }
        scene.add(item.body);
    });
    
    //culling
    portalDoors.forEach(function(portal){
        v.copy(bot.body.position);
        portal.door.worldToLocal(v);
        var interior = portal.inside;
        var size = portal.size;
        interior.visible = (v.z < 0 && v.z > -size.y && 
            v.x > -size.x/2 && v.x < size.x/2) || portal.door.position.x > 0;
    });

    if(controls.enabled || time == 0) { //when not paused, or on first frame
        
        if(terminals.every(function(device){
            if(device === client) return true;
            v.set(0,0,0);
            device.body.localToWorld(v);
            if(v.distanceTo(bot.body.position) < bot.radius+15) {
                if(host === device) {
                } else {
                    host = device;
                    //console.log(device.hasScreen)
                    if(!device.hasScreen) {
                        terminalEmulator.position.y = 0.0;
                    }
                    if(!device.locked || (bot.hacker && !device.key) || (device.key && client.contents.indexOf(device.key) != -1)) {
                        monitor.clear();
                        if(device.locked) {
                            device.locked = false;
                            var found = findById(rogueBots, device.id);
                            if(found) {
                                rogueBots.splice(found.index, 1);
                                bots.push(found.obj);
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

        spinners.forEach(function(item){
            item.rotation.y = Math.PI*time/500;
        });
        
        doors.forEach(function(door){
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
        
        pathFollowers.forEach(function(mover){
            if(mover.body.position.distanceTo(mover.path[mover.index]) < 1) {
                mover.index = (mover.index+1) % mover.path.length;
            }
            
            v.subVectors(mover.path[mover.index], mover.body.position);
            v.normalize();
            
            if(mover.face) {
                mover.body.lookAt(mover.path[mover.index]);
                mover.body.rotation.y += Math.PI;
            }
            
            v.multiplyScalar(mover.speed*delta);
            mover.body.position.add(v);
        });
        
        //stunned bots
        stunned.forEach(function(stunned){
            stunned.time -= delta;
        });
        stunned.filter(function(item){return item.time <= 0;}).forEach(
        function(item, i){
            stunned.splice(i, 1);
            var foundMover = findById(stopped, item.id);
            if(foundMover) {
                stopped.splice(foundMover.index, 1);
                pathFollowers.push(foundMover.obj);
            }
            
            var foundDevice = findById(terminals, item.id);
            if(foundDevice) {
                terminals.splice(foundDevice.index, 1);
                potentialTerminals.push(foundDevice.obj);
            }
        });
        
        //projectiles
        var deadProjectiles = [];
        projectiles.forEach(function(proj){
            raycaster.near = 0;
            raycaster.far = proj.velocity.length()*delta;
            v.copy(proj.velocity);
            v.normalize();
            raycaster.set(proj.body.position, v);
            
            stunnable.filter(
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
                        var found = findById(pathFollowers, item.id);
                        if(found) {
                            pathFollowers.splice(found.index, 1);
                            stopped.push(found.obj);
                        }
                        var found = findById(potentialTerminals, item.id);
                        if(found) {
                            potentialTerminals.splice(found.index, 1);
                            terminals.push(found.obj);
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
        
        //player collsion
        var botbox = new THREE.Box3(
            new THREE.Vector3(bot.body.position.x-bot.radius, bot.body.position.y-bot.radius, bot.body.position.z-bot.radius),
            new THREE.Vector3(bot.body.position.x+bot.radius, bot.body.position.y+bot.radius, bot.body.position.z+bot.radius)
        );
        wallBoxes.forEach(function(box){
            if(box.isIntersectionBox(botbox)) {
                var ld = botbox.max.x - box.min.x; //+ if intersecting
                var rd = box.max.x - botbox.min.x; //+ if intersecting
                var md = botbox.max.z - box.min.z; //+ if intersecting
                var pd = box.max.z - botbox.min.z; //+ if intersecting
                if(ld <= 0) ld = Number.POSITIVE_INFINITY;
                if(rd <= 0) rd = Number.POSITIVE_INFINITY;
                if(md <= 0) md = Number.POSITIVE_INFINITY;
                if(pd <= 0) pd = Number.POSITIVE_INFINITY;
                if(ld < rd && ld < md && ld < pd) {
                    bot.body.position.x = box.min.x - bot.radius - 0.1;
                    noiseLevel = Math.min(1.0,noiseLevel+0.5);
                }
                if(rd < ld && rd < pd && rd < md) {
                    bot.body.position.x = box.max.x + bot.radius + 0.1;
                    noiseLevel = Math.min(1.0,noiseLevel+0.5);
                }
                if(md < pd && md < ld && md < rd) {
                    bot.body.position.z = box.min.z - bot.radius - 0.1;
                    noiseLevel = Math.min(1.0,noiseLevel+0.5);
                }
                if(pd < md && pd < ld && pd < rd) {
                    bot.body.position.z = box.max.z + bot.radius + 0.1;
                    noiseLevel = Math.min(1.0,noiseLevel+0.5);
                }
            }
        });

        //gun cooldown
        if(cooldown > 0)
            cooldown -= delta;
        
        //radiation damge
        var radiation = Math.floor(Math.max(bot.body.position.lengthManhattan() - 800, 0)/100);
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
        
        //repair
        if(bot.damage) {
            damageBar.set(bot.damage);
        } else {
            damageBar.set(0);
        }
        
        //die and respawn
        if((bot.damage && bot.damage > 10) || bot.body.position.y < -5) {
            bot.body.position.copy(bot.spawn);
            bot.damage = 0;
            var device = findById(terminals, bot.id);
            device.obj.contents.splice(0,device.obj.contents.length);
            if(bot.resetOwner) {
                device.obj.locked = true;
                var foundBot = findById(bots, bot.id);
                bots.splice(foundBot.index, 1);
                rogueBots.push(foundBot.obj);
                terminals.splice(device.index, 1);
                potentialTerminals.push(device.obj);
                var mover = findById(stopped, bot.id);
                stopped.splice(mover.index, 1);
                pathFollowers.push(mover.obj);
                setBot(0);
                updateBotLabels();
            }
            updateRampaks();
        }
        
        //player movement
        controls.update(delta);
    }
    
    //visual effects
    compass.rotation.y = bot.body.rotation.y;
    compass.rotation.x = bot.eye.rotation.x;
    if(noiseLevel > 0) {
        noiseLevel = Math.max(0,noiseLevel - 1.0*delta);
    }
    
    render(time);
    
    //bounding boxes don't get updated until first render for some reason
    if(time == 0) {
        wallBoxes = wallObjects.map(function(wall){
            //var bbox = new THREE.BoundingBoxHelper(wall, 0xaa88ff);
            //bbox.update();
            //scene.add(bbox);
            var box = new THREE.Box3();
            box.setFromObject(wall);
            return box;
        });
    }
    
    prevTime = time;
    requestAnimationFrame(update);
} 
update(0);

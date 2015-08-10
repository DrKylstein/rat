function makeWorld() {
    var doors = [];
    var portalDoors = [];
    var buildings = [];
    var terminals = [];
    var spinners = [];
    var colliders = [];
    var obstacleNodes = [];
    var obstacles = [];
    var pathers = [];
    var damageable = [];
    var rogueBots = [];
    var bots = [];
    var botMarkers = [];
    var terminals = [];
    var potentialTerminals = [];
    var map;
    var shooters = [];
    var lookers = [];
    var healers = [];
    var masterComputer;

    var NAMES = [
    'Rodriguez',
    'Garcia',
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Wang',
    'Li',
    'Zhang',
    'Kim',
    'Pak',
    'Choi',
    'Schmidt',
    'Fischer',
    'Hoffman',
    'Miller',
    'Nguyen',
    'Bell',
    'Cox',
    'Ortiz',
    'Dubois',
    'Fournier',
    'Jensen',
    'Sorenson',
    'Karlsson',
    'Lindberg',
    'Smirnov',
    'Kuznetsov',
    'Santos',
    'Nadeem',
    'Bhat',
    'Farash',
    'Kapoor',
    'Soni',
    'Mathur'
    ];
    var BIG_ADJECTIVES = [
    'Global',
    'International',
    'Universal',
    'Solid',
    'Metro',
    'Astro',
    'New Age',
    'Epoch',
    'Premier',
    'Acme',
    'Apex',
    'World',
    'Superlative',
    'US',
    'National',
    'Apogee',
    'Top',
    'Acclaim',
    '3D',
    'Almagamated',
    'Allied',
    'Standard'
    ];
    var BIG_BUSINESSES = [
    ' Dynamics',
    ' Electronics',
    ' Research',
    ' Technology',
    ' Electromatics',
    ' Robotics',
    ' Cybernetics',
    ' Image',
    ' Holographix',
    ' Industries',
    ' Semiconductor',
    ' Photonics',
    ' Solutions',
    ' Studios',
    ' Data',
    ' Informatics',
    ' Automation',
    ' Defense',
    ' Simulation',
    ' Nuclear',
    ' Energy'
    ];
    var CORPORATIONS = [
    ' Ltd.',
    ' Inc.',
    ' Co.',
    ' LLC',
    ' Corp.',
    ' Associates'
    ];
    var SMALL_BUSINESSES = [
    ' Dentistry',
    ' Engineering',
    ' Accounting',
    ' Consultants',
    ' Services',
    ' Salon',
    ' Groceries',
    '\'s Diner',
    '\'s Place',
    ' Travel',
    '\'s Sandwiches',
    '\'s Pizza'
    ];

    var map = new THREE.Object3D();
    map.rotation.x = Math.PI;

    var REPAIRSHOP_DIST = 700;

    var wD = 2;
    var xBlocks = 2;
    var zBlocks = 2;
    var lotSize = 200;
    var roadSize = 40;
    var alleySize = 40;
    var sidewalkSize = 15;
    var xLots = 3;
    var zLots = 3;
    var heightFactor = 100;
    var heightPower = 1;

    var world = new THREE.Object3D();
    var blockWidth = lotSize*xLots + roadSize;
    var blockDepth = lotSize*zLots + alleySize;
    var cityWidth = xBlocks*blockWidth + roadSize;
    var cityDepth = zBlocks*blockDepth + alleySize;
    var eastCoast = 500;
    var westCoast = 500;
    var northCoast = 500;
    var southCoast = 500;
    var landWidth = cityWidth+eastCoast+westCoast;
    var landDepth = cityDepth+northCoast+southCoast;

    var landCenter = new THREE.Vector2(landWidth/2 - eastCoast, landDepth/2 - northCoast);

    var pavement = makeBox(landWidth, 20, landDepth, null, gridTex);
    scaleUv(pavement.children[0].geometry, landWidth/8, landDepth/8);
    pavement.position.set(landCenter.x, -20, landCenter.y);
    world.add(pavement);
    obstacleNodes.push(pavement);

    var intersections = {};
    for(var x = 0; x <= xBlocks; x++) {
        intersections[x] = {};
        for(var z = 0; z <= zBlocks; z++) {
            intersections[x][z] = (new THREE.Vector3(x*blockWidth + roadSize/2, 0.0, z*blockDepth + alleySize/2));
            /*var marker = makeMarker();
            marker.position.set(intersections[z][x].x, intersections[z][x].z, 1);
            map.add(marker);*/
        }
    }


    var lots = [];
    for(var bz = 0; bz < zBlocks; bz++) {
        for(var bx = 0; bx < xBlocks; bx++) {
            var block =
                (function makeBlock(width, depth) {
                    var root = new THREE.Object3D();
                    var sidewalk = makeBox(width, 3, depth, ENV_COLORS[0], ENV_COLORS[1]);
                    sidewalk.position.x = width/2;
                    sidewalk.position.z = depth/2;
                    root.add(sidewalk);
                    obstacleNodes.push(sidewalk);

                    var lamps = [[-1,-1], [1,1], [-1,1], [1,-1]/*, [1,0], [-1,0]*/];

                    function makeLamp() {
                        var root = new THREE.Object3D();
                        var base = makeBox(2,10,2, ENV_COLORS[0], ENV_COLORS[1]);
                        root.add(base);
                        var pole = makeBox(1,20,1, ENV_COLORS[0], ENV_COLORS[1]);
                        pole.position.y = 10;
                        root.add(pole);
                        var light = makeBox(3,3,3, ENV_COLORS[2], ENV_COLORS[2]);
                        light.position.y = 30;
                        root.add(light);
                        if(Math.random() > 0.75) {
                            root.rotation.x = Random.real(-Math.PI/6, Math.PI/6);
                            root.rotation.z = Random.real(-Math.PI/6, Math.PI/6);
                            if(Math.random() > 0.5)
                            root.remove(light);
                        }
                        obstacleNodes.push(root);

                        return root;
                    }

                    lamps.forEach(function(f){
                        var lamp = makeLamp();
                        lamp.position.y = 3;
                        lamp.position.x = sidewalk.position.x + (width/2 - (3/2 + 2))*f[0];
                        lamp.position.z = sidewalk.position.z + (depth/2 - (3/2 + 2))*f[1];
                        root.add(lamp);
                    });
                    return root;
                })(lotSize*xLots, lotSize*zLots);
            block.position.x = bx*blockWidth + roadSize;
            block.position.z = bz*blockDepth + alleySize;
            world.add(block);
            for(var lz = 0; lz < zLots; lz++) {
                for(var lx = 0; lx < xLots; lx++) {
                    var lot = new THREE.Box3(
                        new THREE.Vector3(
                            lx*lotSize + sidewalkSize,
                            3,
                            lz*lotSize + sidewalkSize
                        ),
                        new THREE.Vector3(
                            (lx+1)*lotSize - sidewalkSize,
                            103,
                            (lz+1)*lotSize - sidewalkSize
                        )
                    );
                    lot.translate(block.position);
                    var side = [];
                    if(lx == 0) side.push(-Math.PI/2);
                    if(lx == xLots - 1) side.push(Math.PI/2);
                    if(lz == 0) side.push(Math.PI);
                    if(lz == zLots - 1) side.push(0);

                    lots.push({space:lot, facings:side, bx:bx, bz:bz});
                }
            }
        }
    }

    var repairShops = [];

    Random.shuffle(lots);

    var radar = {
        name:'Radar',
        description:'See other robots on the GPS display.'
    };

    var prgMap = {
        name:'Map',
        description:'Shows a map of the city on the GPS display.'
    };

    var mcp = [
        {
            name:'MCP 1/3',
            description:'Restore central control of city systems.'
        },
        {
            name:'MCP 2/3',
            description:'Restore central control of city systems.'
        },
        {
            name:'MCP 3/3',
            description:'Restore central control of city systems.'
        }
    ];

    var mission = {
        name:'Mission',
        description:
        'The essential systems of the city are out of control. '+
        'Find the scattered pieces of the Master Control Program and assemble'+
        ' them here to restore order. The Hacker can add other robots and '+
        'terminals to your control. Take good care of it and seek out other '+
        'robots that can aid in your mission. Good luck!'
    }

    var programs = [
        mcp[0],
        mcp[1],
        mcp[2],
        radar,
        prgMap,
    ];


    (function(){
        var shape = (function() {
            var body = new THREE.Object3D();
            var eye = new THREE.Object3D();

            var top = makeBox(5,5,5, GOOD_COLORS[0], GOOD_COLORS[1]);
            pointify(top.children[0].geometry, 5, 1, 1);
            var bottom = makeBox(5,5,5, GOOD_COLORS[0], GOOD_COLORS[1]);
            pointify(bottom.children[0].geometry, 5, 1, 1);
            bottom.rotation.x = Math.PI;
            top.position.y = 5;
            bottom.position.y = 5;

            eye.add(top);
            eye.add(bottom);

            var rotors = new THREE.Object3D();

            for(var i = 0; i < 4; i++) {
                var root = new THREE.Object3D();
                var rotor = makeBox(10,1,5, GOOD_COLORS[0], GOOD_COLORS[1]);
                rotor.position.x = 12;
                root.rotation.y = Math.PI*i/2;
                root.add(rotor);
                rotors.add(root);
            }
            rotors.position.y = 5;
            spinners.push(rotors);
            eye.add(rotors);

            body.add(eye);

            return {body:body,eye:eye};
        })();
        var id = shape.body.id;

        var sx = Random.integer(0,xBlocks-1);
        var sz = Random.integer(0,zBlocks-1);

        shape.body.position.y = 100;
        shape.body.position.add(intersections[sx][sz]);
        world.add(shape.body);
        var nick = 'Amelia';

        colliders.push({
            id:id,
            body:shape.body,
            radius:7,
            g:0,
            dy:0
        });
        rogueBots.push({
            id:id,
            body:shape.body,
            eye:shape.eye,
            speed:200.0,
            vspeed:200.0,
            angSpeed:2.5,
            spawn: shape.body.position.clone(),
            resetOwner: true,
            name:'Flying Eye',
            nick:nick
        });

        var high = 100;
        var low = 0;

        pathers.push({
            id:id,
            body:shape.body,
            speed:10,
            face:false,
            index:0,
            device:bot,
            path:[
                new THREE.Vector3(0.0,high,0.0).add(intersections[sx][sz]),
                new THREE.Vector3(0.0,low,0.0).add(intersections[sx][sz]),
                new THREE.Vector3(0.0,high,0.0).add(intersections[sx][sz]),

                new THREE.Vector3(0.0,high,0.0).add(intersections[sx][sz+1]),
                new THREE.Vector3(0.0,low,0.0).add(intersections[sx][sz+1]),
                new THREE.Vector3(0.0,high,0.0).add(intersections[sx][sz+1]),

                new THREE.Vector3(0.0,high,0.0).add(intersections[sx+1][sz+1]),
                new THREE.Vector3(0.0,low,0.0).add(intersections[sx+1][sz+1]),
                new THREE.Vector3(0.0,high,0.0).add(intersections[sx+1][sz+1]),

                new THREE.Vector3(0.0,high,0.0).add(intersections[sx+1][sz]),
                new THREE.Vector3(0.0,low,0.0).add(intersections[sx+1][sz]),
                new THREE.Vector3(0.0,high,0.0).add(intersections[sx+1][sz])
            ]
        });
        damageable.push({id:id, body:shape.body, damage:0});
        terminals.push({
            id:id,
            name:nick,
            body:shape.body,
            contents:[],
            locked:true,
            hasScreen:false/*,
            key:eyeKey*/
        });
        botMarkers.push({id:id, blip:makeMarker(), body:shape.body});
    })();

    lots.forEach(function(lot, lotIndex){
        var size = lot.space.size();
        var center = lot.space.center();
        center.y = lot.space.min.y;

        size.x = Random.integer(100, size.x);
        size.z = Random.integer(100, size.z);

        var building;
        var color;
        var nearest = repairShops.length? repairShops[0].center().distanceTo(center) : Number.MAX_VALUE;
        for(var i = 1; i < repairShops.length; i++) {
            var dist = repairShops[i].center().distanceTo(center);
            if(dist < nearest) {
                nearest = dist;
            }
        }

        function isBackRoom(bound) {
            return bound.min.y <= wD - size.z/2;
        }

        var facing = Random.choose(lot.facings);

        if(lotIndex == 0) {
            var name = 'Central Processing'

            color = START_COLORS[0];

            building = makeBuilding(size.x, 300, size.z, START_COLORS[0], START_COLORS[1]);

            var bounds = flattenDegenerateTree(subdivide(
                new THREE.Vector2(-size.x/2,-size.z/2),
                new THREE.Vector2(size.x/2, size.z/2),
                20,
                false
            )).map(function(corners) {return shrink(wD/2, corners);});

            var layout = makeInnerLayout(bounds, size.x-wD*2, 20 - 0.1, size.z-wD*2, 2, ENV_COLORS[0], ENV_COLORS[1], height);
            building.add(layout);

            var backRooms = bounds.filter(isBackRoom);

            var computerRoom = backRooms[0];

            var mainframe = makeMainframe();
            var c = computerRoom.center();
            mainframe.position.set(c.x, 0, computerRoom.min.y+wD/2);
            building.add(mainframe);
            obstacleNodes.push(mainframe);
            masterComputer = mainframe.id;
            terminals.push({
                id:mainframe.id,
                body:mainframe,
                name:name,
                contents:[mission],
                locked:false,
                hasScreen:true,
                readOnly: 1
            });
            var startPos = new THREE.Vector3(c.x, 0, c.y);
            startPos.applyAxisAngle(new THREE.Vector3(0,1,0), facing);//new THREE.Vector3(center.x+c.x,lot.space.min.y,c.y+center.z);
            startPos.add(center);
            startPos.y = lot.space.min.y;

            (function(){
                var shape = (function makeIgor() {
                    var root = new THREE.Object3D();
                    var base = makeBox(4,2,4, GOOD_COLORS[0], GOOD_COLORS[1]);
                    var torso = makeBox(8,7,6, GOOD_COLORS[0], GOOD_COLORS[1]);
                    var head = makeBox(7,4,7, GOOD_COLORS[0], GOOD_COLORS[1]);
                    head.rotation.y = Math.PI/4;
                    var eye = makeBox(2,1,1, SCREEN_COLORS[0], SCREEN_COLORS[1]);
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
                })();

                var id = shape.body.id;

                var nick = 'Conky';



                world.add(shape.body);
                shape.body.position.copy(startPos);
                bots.push({
                    id:id,
                    body:shape.body,
                    eye:shape.eye,
                    hacker:true,
                    speed:100.0,
                    vspeed:0.0,
                    angSpeed:3,
                    spawn:startPos,
                    name:'Hacker',
                    nick:nick
                });

                damageable.push({id:id, body:shape.body, damage:0});
                terminals.push({
                    id:id,
                    name:nick,
                    body:shape.body,
                    contents:[],
                    hasScreen:false
                });
                colliders.push({
                    id:id,
                    body:shape.body,
                    radius:4,
                    g:9.8,
                    dy:0
                });
                botMarkers.push({id:id, blip:makeMarker(), body:shape.body});
            })();

            (function(){
                var shape = (function() {
                    var root= new THREE.Object3D();
                    var body = makeBox(9,5,9, GOOD_COLORS[0], GOOD_COLORS[1]);
                    pointify(body.children[0].geometry, 5, 1,1);
                    root.add(body);
                    var eye = makeBox(2,1,1, SCREEN_COLORS[0], SCREEN_COLORS[1]);
                    eye.position.y = 2;
                    eye.position.z = -2;
                    root.add(eye);

                    var camera = new THREE.Object3D();
                    root.add(camera);
                    camera.position.y = 5;
                    return {body:root, eye:camera};
                })();

                var id = shape.body.id;
                var nick = 'Jerry';

                shape.body.position.copy(intersections[lot.bx][lot.bz]);
                world.add(shape.body);
                terminals.push({
                    id:id,
                    name:nick,
                    body:shape.body,
                    contents:[],
                    locked:true,
                    hasScreen:false
                });
                rogueBots.push({
                    id:id,
                    body:shape.body,
                    eye:shape.eye,
                    speed:200.0,
                    vspeed:0.0,
                    angSpeed:5.0,
                    spawn: intersections[lot.bx][lot.bz],
                    name:'RAT',
                    nick:nick,
                    resetOwner:true
                });
                colliders.push({
                    id:id,
                    body:shape.body,
                    radius:3,
                    g:9.8,
                    dy:0
                });
                damageable.push({id:id, body:shape.body, damage:0});

                pathers.push({
                    id:id,
                    body:shape.body,
                    face:true,
                    path:[
                        intersections[lot.bx][lot.bz],
                        intersections[lot.bx+1][lot.bz],
                        intersections[lot.bx+1][lot.bz+1],
                        intersections[lot.bx+1][lot.bz]
                    ],
                    index:0,
                    speed:40,
                    device:bot
                });

                botMarkers.push({id:id, blip:makeMarker(), body:shape.body});

            })();


            var SPACING = 20;
            var MARGIN = 10;
            bounds.forEach(function(bound, i){
                var c = bound.center();
                var s = bound.size();
                if(s.x > 40 && s.y > 40) {
                    for(var x = SPACING; x < s.x/2 - MARGIN; x+= SPACING) {
                        for(var z = 0; z < s.y/2 - MARGIN; z+= SPACING) {
                            var drive = makeTapeDrive(spinners);
                            drive.position.x = x + c.x;
                            drive.position.z = z + c.y;
                            drive.rotation.y = -Math.PI/2;
                            building.add(drive);
                            obstacleNodes.push(drive);
                            if(x!= 0) {
                                var drive = makeTapeDrive(spinners);
                                drive.position.x = -x + c.x;
                                drive.position.z = z + c.y;
                                drive.rotation.y = Math.PI/2;
                                building.add(drive);
                                obstacleNodes.push(drive);
                            }
                            if(z != 0) {
                                var drive = makeTapeDrive(spinners);
                                drive.position.x = x + c.x;
                                drive.position.z = -z + c.y;
                                drive.rotation.y = -Math.PI/2;
                                building.add(drive);
                                obstacleNodes.push(drive);
                            }
                            if(x != 0 && z != 0) {
                                var drive = makeTapeDrive(spinners);
                                drive.position.x = -x + c.x;
                                drive.position.z = -z + c.y;
                                drive.rotation.y = Math.PI/2;
                                building.add(drive);
                                obstacleNodes.push(drive);
                            }
                        }
                    }
                }
            });



        } else if(nearest > REPAIRSHOP_DIST) {
            color = REPAIR_COLORS[0];
            building = makeBuilding(size.x, 30, size.z, REPAIR_COLORS[0], REPAIR_COLORS[1]);
            var layout = makeInnerLayout([new THREE.Box2(new THREE.Vector2(-size.x/2,-size.z/2), new THREE.Vector2(size.x/2, size.z/2))], size.x-wD*2, 20 - 0.1, size.z-wD, 2, ENV_COLORS[0], ENV_COLORS[1], height);
            building.add(layout);

            var station = makeRepairStation(obstacleNodes);
            station.position.z = -size.z/2 + wD/2;
            building.add(station);
            healers.push(station);

            repairShops.push(lot.space);
            name = Random.choose(NAMES.concat(BIG_ADJECTIVES)) + ' Robot Repair';
        } else if(programs.length > 0) {
            var height = Math.max(Random.normal(200, 300), 100);
            var name;

            name = Random.choose(NAMES.concat(BIG_ADJECTIVES));
            name += " Software";
            name += Random.choose(CORPORATIONS);

            color = IMPORTANT_COLORS[0];

            building = makeBuilding(size.x, height, size.z, color, IMPORTANT_COLORS[1]);

            var bounds = flattenDegenerateTree(subdivide(
                new THREE.Vector2(-size.x/2,-size.z/2),
                new THREE.Vector2(size.x/2, size.z/2),
                20,
                false
            )).map(function(corners) {return shrink(wD/2, corners);});

            var layout = makeInnerLayout(bounds, size.x-wD*2, 20 - 0.1, size.z-wD, 2, ENV_COLORS[0], ENV_COLORS[1], height);
            building.add(layout);

            var computerRoom = Random.choose(bounds.filter(isBackRoom));

            var mainframe = makeMainframe();
            var c = computerRoom.center();
            mainframe.position.set(c.x, 0, computerRoom.min.y+wD/2);
            building.add(mainframe);
            obstacleNodes.push(mainframe);
            terminals.push({
                id:mainframe.id,
                body:mainframe,
                name:name,
                contents:[programs.pop()],
                locked:true,
                hasScreen:true,
                readOnly: 1
            });

            bounds.forEach(function(bound) {
                var s = bound.size();
                if(Math.abs(bound.min.y - computerRoom.max.y) < wD*2) {
                    var killBox = new THREE.Box3(
                        new THREE.Vector3(bound.min.x, 0, bound.min.y),
                        new THREE.Vector3(bound.max.x, 20, bound.max.y)
                    );
                    var c = bound.center();
                    var left = spawnTurret(killBox, building);
                    left.position.x = bound.min.x + wD/2;
                    left.position.z = c.y;
                    left.rotation.y = -Math.PI/2;
                    building.add(left);
                    obstacleNodes.push(left);
                    var right = spawnTurret(killBox, building);
                    right.position.x = bound.max.x - wD/2;
                    right.position.z = c.y;
                    right.rotation.y = Math.PI/2;
                    building.add(right);
                    obstacleNodes.push(right);

                    if(s.y > 40) {
                        var left = spawnTurret(killBox, building);
                        left.position.x = bound.min.x + wD/2;
                        left.position.z = bound.min.y + wD/2 + 5;
                        left.rotation.y = -Math.PI/2;
                        building.add(left);
                        obstacleNodes.push(left);
                        var right = spawnTurret(killBox, building);
                        right.position.x = bound.max.x - wD/2;
                        right.position.z = bound.min.y + wD/2 + 5;
                        right.rotation.y = Math.PI/2;
                        building.add(right);
                        obstacleNodes.push(right);

                        var left = spawnTurret(killBox, building);
                        left.position.x = bound.min.x + wD/2;
                        left.position.z = bound.max.y - wD/2 - 5;
                        left.rotation.y = -Math.PI/2;
                        building.add(left);
                        obstacleNodes.push(left);
                        var right = spawnTurret(killBox, building);
                        right.position.x = bound.max.x - wD/2;
                        right.position.z = bound.max.y - wD/2 - 5;
                        right.rotation.y = Math.PI/2;
                        building.add(right);
                        obstacleNodes.push(right);

                        for(var x = 0; x < s.x/2 - 10; x+= 40) {
                            var tapeDrive = makeTapeDrive(spinners);
                            tapeDrive.position.x = x+c.x;
                            tapeDrive.position.z = bound.min.y + 10;
                            building.add(tapeDrive);
                            if(x!= 0) {
                                var tapeDrive = makeTapeDrive(spinners);
                                tapeDrive.position.x = -x+c.x;
                                tapeDrive.position.z = bound.min.y + 10;
                                building.add(tapeDrive);
                            }
                        }
                    }

                }
            });

        } else {

            /*var height = Math.max(Random.normal(200, 300), 30);
            var name;
            if(height > 120) {
                name = Random.choose(NAMES.concat(BIG_ADJECTIVES));
                name += Random.choose(BIG_BUSINESSES);
                name += Random.choose(CORPORATIONS);
            } else {
                name = Random.choose(NAMES);
                name += Random.choose(SMALL_BUSINESSES);
            }

            color = ENV_COLORS[0];//Random.choose(BUILDING_COLORS);

            building = makeBuilding(size.x, height, size.z, ENV_COLORS[0], ENV_COLORS[1]);

            var bounds = flattenDegenerateTree(subdivide(
                new THREE.Vector2(-size.x/2,-size.z/2),
                new THREE.Vector2(size.x/2, size.z/2),
                20,
                false
            )).map(function(corners) {return shrink(wD/2, corners);});

            var layout = makeInnerLayout(bounds, size.x-wD*2, 20 - 0.1, size.z-wD, 2, ENV_COLORS[0], ENV_COLORS[1], height);
            building.add(layout);*/
            if(Math.random() > 0.05) {
                building = makeRubble(size.x, ENV_COLORS[0], ENV_COLORS[1]);
            } else {
                building = makeBox(20,500,20, ENV_COLORS[0], ENV_COLORS[1]);
                pointify(building.children[0].geometry, 500, 1, 1);
                var light = makeBox(10, 10, 10, DANGER_COLORS[0], DANGER_COLORS[0]);
                light.position.y = 500;
                building.add(light);
            }
        }

        building.position.set(center.x, lot.space.min.y, center.z);
        building.rotation.y = facing;
        world.add(building);

        /*var sign = makeSign(name, 4, color);
        sign.position.z = size.z/2 + 1;
        sign.position.x = -size.x/4;
        sign.position.y = 15;
        building.add(sign);*/


    });

    function makeRubble(diameter, color, backColor) {
        var wD = 2;
        var root = new THREE.Object3D();
        var northC = makeBox(diameter, Random.real(10, 40), wD, color, backColor);
        var southC = makeBox(diameter, Random.real(10, 40), wD, color, backColor);
        var eastC = makeBox(diameter-wD*2, Random.real(10, 40), wD, color, backColor);
        var westC = makeBox(diameter-wD*2, Random.real(10, 40), wD, color, backColor);
        northC.position.z = -diameter/2 + wD/2;
        southC.position.z = diameter/2 - wD/2;
        eastC.position.x = diameter/2 - wD/2;
        westC.position.x = -diameter/2 + wD/2;
        eastC.rotation.y = Math.PI/2;
        westC.rotation.y = Math.PI/2;

        northC.rotation.x = Random.real(-Math.PI/6, Math.PI/6);
        southC.rotation.x = Random.real(-Math.PI/6, Math.PI/6);
        eastC.rotation.x = Random.real(-Math.PI/6, Math.PI/6);
        westC.rotation.x = Random.real(-Math.PI/6, Math.PI/6);

        eastC.rotation.order = 'YXZ';
        westC.rotation.order = 'YXZ';

        if(Math.random() > 0.6) {
            obstacleNodes.push(northC);
            root.add(northC);
        }
        if(Math.random() > 0.6) {
            obstacleNodes.push(southC);
            root.add(southC);
        }
        if(Math.random() > 0.6) {
            obstacleNodes.push(eastC);
            root.add(eastC);
        }
        if(Math.random() > 0.6) {
            obstacleNodes.push(westC);
            root.add(westC);
        }

        return root;
    }


    function makeBuilding(width, height, depth, color, backColor) {
        var root = new THREE.Object3D();

        var startHeight = 20;
        var topHeight = height - startHeight;

        var door;
        var groundFloor = (function() {
            var height = startHeight;
            var root = new THREE.Object3D();
            var north, south, east, west;

            north = makeBox(width, height, 0.1, color, backColor);
            south = makeWall(width, height, 0.1, color, backColor);
            east = makeBox(depth, height, 0.1, color, backColor);
            west = makeBox(depth, height, 0.1, color, backColor);


            door = makeBox(10, 20, 1.8, DOOR_COLORS[0], DOOR_COLORS[1]);
            door.position.z = -1;
            doors.push(door);
            south.add(door);

            root.add(north);
            root.add(south);
            root.add(east);
            root.add(west);
            north.position.z = -depth/2;
            south.position.z = depth/2;
            east.position.x = width/2 ;
            west.position.x = -width/2;
            east.rotation.y = Math.PI/2;
            west.rotation.y = Math.PI/2;

            var northC = makeBox(width, height, wD, color, backColor, true);
            var southC = makeWall(width, height, wD, color, backColor, true);
            var eastC = makeBox(depth-wD*2, height, wD, color, backColor, true);
            var westC = makeBox(depth-wD*2, height, wD, color, backColor, true);
            northC.visible = false;
            southC.visible = false;
            eastC.visible = false;
            westC.visible = false;
            root.add(northC);
            root.add(southC);
            root.add(eastC);
            root.add(westC);
            northC.position.z = -depth/2 + wD/2;
            southC.position.z = depth/2 - wD/2;
            eastC.position.x = width/2 - wD/2;
            westC.position.x = -width/2 + wD/2;
            eastC.rotation.y = Math.PI/2;
            westC.rotation.y = Math.PI/2;
            obstacleNodes.push(northC);
            obstacleNodes.push(eastC);
            obstacleNodes.push(westC);

            return root;
        })();
        root.add(groundFloor);

        var interior = makeInterior(width-wD*2, depth-wD*2, ENV_COLORS[0], ENV_COLORS[1]);
        root.add(interior);

        var top;
        if(topHeight > 100) {
            if(Math.random() > 0.5) {
                    top = makeTower(width, topHeight, depth, color, backColor);
            } else {
                    top = makeModernBuilding(width, topHeight, depth, color, backColor);
            }
        } else {
            top = makeSimpleBuilding(width, topHeight, depth, color, backColor);
        }

        top.position.y = startHeight;
        obstacleNodes.push(top);
        root.add(top);

        return root;
    }

    function makeWall(length, height, depth, color, backColor, solid) {
        var root = new THREE.Object3D();
        var left = makeBox(length/2 - 5, height, depth, color, backColor);
        var right = makeBox(length/2 - 5, height, depth, color, backColor);
        left.position.x = -length/4 - 2.5;
        right.position.x = length/4 + 2.5;
        root.add(left);
        root.add(right);

        if(solid){
            obstacleNodes.push(left);
            obstacleNodes.push(right);
        }

        return root;
    }

    function makeInterior(width, depth, color, backColor) {
        var root = new THREE.Object3D();
        var north, south, east, west;

        north = makeBox(width, 20, 0.1, color, backColor);
        south = makeWall(width, 20 - 0.1, 0.1, color, backColor);
        east = makeBox(depth, 20, 0.1, color, backColor);
        west = makeBox(depth, 20, 0.1, color, backColor);

        var jam = makeBox(0,20,2,color,backColor);
        jam.position.x = -5;
        jam.position.z = 1;
        south.add(jam);

        var topjam = makeBox(10,0,2,color,backColor);
        topjam.position.y = 20 - 0.1;
        topjam.position.z = 1;
        south.add(topjam);

        root.add(north);
        root.add(south);
        root.add(east);
        root.add(west);
        north.position.z = -depth/2;
        south.position.z = depth/2;
        east.position.x = width/2 ;
        west.position.x = -width/2;
        east.rotation.y = Math.PI/2;
        west.rotation.y = Math.PI/2;

        var cieling = makeBox(width, 0, depth, color, backColor);
        cieling.position.y = 20 - 0.1;
        root.add(cieling);

        return root;
    }

    function makeInnerLayout(bounds, width, height, depth, wallThickness, color, backColor, bh) {
        var root = new THREE.Object3D();
        var areas = bounds.map(cornersToCenterSize);

        var backmostPos = 5000;
        bounds.forEach(function(bound) {
            backmostPos = Math.min(bound.min.y,backmostPos);
        });

        var meta = {rooms:[], leafRooms:[], obj:root, size:new THREE.Vector3(width, height, depth), height:bh};

        areas.forEach(function(area, i){
            var room = new THREE.Object3D();
            room.position.x = area.center.x;
            room.position.z = area.center.y;
            room.userData.size = new THREE.Vector3(area.size.x, height, area.size.y);
            if(bounds[i].min.y <= backmostPos) meta.leafRooms.push(room);
            root.add(room);
            meta.rooms.push(room);
            var leftWall = makeBox(wallThickness, height, area.size.y, color, backColor);
            leftWall.position.x = area.center.x - area.size.x/2 - wallThickness/2;
            leftWall.position.z = area.center.y;
            if(leftWall.position.x > -width/2 + wallThickness/2) {
                root.add(leftWall);
                obstacleNodes.push(leftWall);
            }
            var LIGHT_SPACING = 40;
            var MARGIN = 5;
            for(var x = 0; x < area.size.x/2 - MARGIN; x+= LIGHT_SPACING) {
                for(var z = 0; z < area.size.y/2 - MARGIN; z+= LIGHT_SPACING) {
                    var light = makeCeilingLight();
                    light.position.y = height;
                    light.position.x = x;
                    light.position.z = z;
                    room.add(light);
                    if(x!= 0) {
                        var light = makeCeilingLight();
                        light.position.y = height;
                        light.position.x = -x;
                        light.position.z = z;
                        room.add(light);
                    }
                    if(z != 0) {
                        var light = makeCeilingLight();
                        light.position.y = height;
                        light.position.x = x;
                        light.position.z = -z;
                        room.add(light);
                    }
                    if(x != 0 && z != 0) {
                        var light = makeCeilingLight();
                        light.position.y = height;
                        light.position.x = -x;
                        light.position.z = -z;
                        room.add(light);
                    }
                }
            }
        });

        buildings.push(meta);

        for(var i = 1; i < areas.length; i++) {
            var frontWall = makeWall(areas[i].size.x + wallThickness, height, wallThickness, color, backColor, true);
            frontWall.position.x = areas[i].center.x;
            frontWall.position.z = areas[i].center.y + areas[i].size.y/2 + wallThickness/2;
            root.add(frontWall);
            var door = makeBox(10, height, 0.8, DOOR_COLORS[0], DOOR_COLORS[1]);
            doors.push(door);
            frontWall.add(door);
        }

        return root;
    }

    function cornersToCenterSize(obj) {
        var min, max;
        min = obj.min;
        max = obj.max;
        var size = new THREE.Vector2().subVectors(max, min);
        var center = new THREE.Vector2().copy(size);
        center.multiplyScalar(0.5);
        center.add(min);
        return {center:center, size:size};
    }

    function shrink(amount, corners) {
        corners.min.x += amount;
        corners.min.y += amount;
        corners.max.x -= amount;
        corners.max.y -= amount;
        return corners;
    }

    function flattenDegenerateTree(tree) {
        while(Array.isArray(tree[tree.length-1])) {
            var item = tree.splice(tree.length-1, 1)[0];
            tree.push(item[0]);
            tree.push(item[1])
        }
        return tree;
    }

    function subdivide(min, max, limit, useX) {
        var root = randSplit(min, max, limit, useX);

        var subtree = 1;
        //if(useX && Math.random() > 0.5) subtree = 0;

        useX = !useX;
        var v = new THREE.Vector2();
        v.subVectors(root[subtree].max, root[subtree].min);
        if(Math.abs(v.x) < limit*1.5 || Math.abs(v.y) < limit*1.5)
            return root;

        root[1] = subdivide(root[subtree].min, root[subtree].max, limit, useX);
        return root;
    }

    function randSplit(min, max, limit, useX) {
        if(useX) {
            var x = Random.real(min.x+limit,max.x-limit);
            return [
                new THREE.Box2(new THREE.Vector2(x, min.y), new THREE.Vector2(max.x, max.y)),
                new THREE.Box2(new THREE.Vector2(min.x, min.y),new THREE.Vector2(x, max.y))
            ];
        } else {
            var y = Random.real(min.y+limit,max.y-limit);
            return [
                new THREE.Box2(new THREE.Vector2(min.x, y), new THREE.Vector2(max.x, max.y)),
                new THREE.Box2(new THREE.Vector2(min.x, min.y), new THREE.Vector2(max.x, y))
            ];
        }
    }

    function makeTower(width, height, depth, color, backColor) {
        var root = new THREE.Object3D();
        var bottom = 0;
        var ledgeHeight = Random.integer(1,10);
        var ledgeHang = Random.integer(5,20);
        var narrowingInterval = Random.choose([Random.integer(1,5),Number.MAX]);
        //var ledgeColor = choose([0xff0000,0x00ff00,0x0000ff, 0xffff00, 0x00ffff, 0xff00ff]);
        //var tierColor = choose([0xff0000,0x00ff00,0x0000ff, 0xffff00, 0x00ffff, 0xff00ff]);
        var tierFraction = Random.integer(2,Math.max(2,Math.floor(height/10)));
        var pointy = Math.random() > 0.5;
        var hasCorners = Math.random() > 0.5;

        var firstLedge = makeBox(width+ledgeHang, ledgeHeight, depth+ledgeHang, backColor, color);
        root.add(firstLedge);
        bottom = ledgeHeight;

        var tiers = 0;
        while(true) {
            var remainingHeight = height-bottom;
            var sectionHeight = Math.max(remainingHeight/tierFraction, 30);
            if(remainingHeight < 30) sectionHeight = remainingHeight;
            var section = makeBox(width, sectionHeight, depth, color, backColor);
            section.position.y = bottom;
            root.add(section);

            if(hasCorners) {
                var corners = [];

                for(var i = 0; i < 4; i++) {
                    corners[i] = makeBox(ledgeHang/2, sectionHeight, ledgeHang/2, color, backColor);
                    corners[i].position.y = bottom;
                    root.add(corners[i]);
                }
                corners[0].position.x = width/2;
                corners[1].position.x = -width/2;
                corners[2].position.x = width/2;
                corners[3].position.x = -width/2;
                corners[0].position.z = depth/2;
                corners[1].position.z = depth/2;
                corners[2].position.z = -depth/2;
                corners[3].position.z = -depth/2;
            }

            bottom += sectionHeight;
            var ledge = makeBox(width+ledgeHang, ledgeHeight, depth+ledgeHang, backColor, color);
            ledge.position.y = bottom;
            root.add(ledge);
            bottom += ledgeHeight;
            ++tiers;
            if(tiers % narrowingInterval == 0) {
                if(width > 100) {
                    width -= 10;
                }
                if(depth > 100) {
                    depth -= 10;
                }
            }
            if(bottom >= height) {
                break;
            }
        }
        if(pointy) {
            var capHeight = Random.integer(1,3)*100;
            var cap = makeBox(width, capHeight, depth, color, 0);
            pointify(cap.children[0].geometry, capHeight, 1,1);
            cap.position.y = bottom;
            root.add(cap);
        }
        return root;
    }

    function makeModernBuilding(width, height, depth, color, backColor) {
        var root = new THREE.Object3D();
        var bottom = 0;
        var ledgeHeight = Random.integer(2,5);
        var ledgeHang = Random.integer(5,15);

        var windowHeight = Random.integer(10, 30);
        var wallHeight = Random.integer(3,10);

        while(bottom < height) {
            var window = makeBox(width, windowHeight, depth, ENV_COLORS[0], ENV_COLORS[1]);
            window.position.y = bottom;
            bottom += windowHeight;
            root.add(window);
            var upper = makeBox(width, wallHeight, depth, color, backColor);
            upper.position.y = bottom;
            bottom += wallHeight;
            root.add(upper);
        }

        var cap = makeBox(width+ledgeHang, ledgeHeight, depth+ledgeHang, backColor, color);
        cap.position.y = bottom;
        root.add(cap);

        return root;
    }

    function makeSimpleBuilding(width, height, depth, color, backColor) {
        var root = new THREE.Object3D();
        var bottom = 0;
        var ledgeHeight = Random.integer(2,10);
        var ledgeHang = Random.integer(5,15);

        var main = makeBox(width, height-ledgeHeight, depth, color, backColor);
        root.add(main);

        var cap = makeBox(width+ledgeHang, ledgeHeight, depth+ledgeHang, backColor, color);
        cap.position.y = height-ledgeHeight;
        root.add(cap);

        return root;
    }

    var mapbg = makeLineBox(cityWidth, cityDepth, SCREEN_COLORS[0], null);
    mapbg.position.set(cityWidth/2, cityDepth/2, 0);

    map.add(mapbg);

    var mapDetail = new THREE.Object3D();

    world.updateMatrixWorld();
    obstacles = obstacleNodes.map(function(wall){
        //var bbox = new THREE.BoundingBoxHelper(wall, 0xaa88ff);
        //bbox.update();
        //world.add(bbox);
        var box = new THREE.Box3();
        box.setFromObject(wall);
        return box;
    });
    var indoors = buildings.map(function(building){
        var pos = new THREE.Vector3(0,0,0);
        building.obj.localToWorld(pos);
        return new THREE.Box3().setFromCenterAndSize(pos, building.size);
    });
    buildings.forEach(function(building){
        building.rooms.forEach(function(room) {
            room.userData.bounds = new THREE.Box3().setFromCenterAndSize(new THREE.Vector3(0,0,0), room.userData.size);
            room.userData.bounds.applyMatrix4(room.matrixWorld);
        });
    });

    buildings.forEach(function(building){
        var box = makeLineBox(150,150,SCREEN_COLORS[0]);
        //box.children[0].position.y = 0;
        building.obj.localToWorld(box.position);
        box.position.y = box.position.z;
        box.position.z = 1;
        mapDetail.add(box);
    });
    map.add(mapDetail);
    map.scale.set(1/Math.max(cityWidth, cityDepth), 1/Math.max(cityWidth, cityDepth), 1);


    function spawnTurret(killBox, ref) {
        var root = new THREE.Object3D();
        var bottom = 0;

        var base = makeBox(5,10,5, DANGER_COLORS[0], DANGER_COLORS[1]);
        pointify(base.children[0].geometry, 10, 0.5, 0.5);
        root.add(base);
        bottom += 10;

        var head = makeBox(5,3,5, DANGER_COLORS[0], DANGER_COLORS[1]);
        head.position.y = bottom;
        root.add(head);
        bottom += 3;

        var gun = makeBox(1,1,3, DANGER_COLORS[0], DANGER_COLORS[1]);
        head.add(gun);
        gun.position.z = -5/2 - 3/2;
        gun.position.y = 1;


        shooters.push({id:head.id, gun:head, cooldown:0, killBox:killBox, direction:1, ref:ref});
        damageable.push({id:head.id, damage:0, body:head});

        var whole = new THREE.Object3D();
        root.position.z = -5/2;
        whole.add(root);

        return whole;
    }

    function makeMarker() {
        var box = makeBox(50,50,1,SCREEN_COLORS[0],SCREEN_COLORS[0]);
        box.children[0].position.y = 0;
        return box;
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



    botMarkers.forEach(function(marker){
        map.add(marker.blip);
    });

    var safeZone = new THREE.Box3(new THREE.Vector3(0,-30,0), new THREE.Vector3(cityWidth+200, 500, cityDepth+200));

    var mapAdjusted = new THREE.Object3D();
    mapAdjusted.add(map);
    map.position.y = 0.5;
    //map.position.x = 0.2;

    return {
        doors:doors,
        world:world,
        buildings:buildings,
        intersections:intersections,
        portalDoors:portalDoors,
        obstacles:obstacles,
        map:mapAdjusted,
        botMarkers:botMarkers,
        spinners:spinners,
        terminals:terminals,
        potentialTerminals:potentialTerminals,
        colliders:colliders,
        pathers:pathers,
        damageable:damageable,
        safeZone:safeZone,
        bots:bots,
        rogueBots:rogueBots,
        prgRadar:radar,
        prgMap:prgMap,
        mapDetail:mapDetail,
        mcp:mcp,
        indoors:indoors,
        shooters:shooters,
        lookers:lookers,
        healers:healers,
        masterComputer:masterComputer
    };
}

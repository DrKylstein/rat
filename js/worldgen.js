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
    var stunnable = [];
    var rogueBots = [];
    var bots = [];
    var botMarkers = [];
    var terminals = [];
    var potentialTerminals = [];
    var map;
    
    
    function makeBlock(width, depth, lotSize, height, bx,bz) {
        var root = new THREE.Object3D();
        var sz = [width*lotSize, depth*lotSize];
        var sidewalk = makeBox(sz[0], 3, sz[1], ENV_COLORS[0], ENV_COLORS[1]);
        sidewalk.position.x = sz[0]/2;
        sidewalk.position.z = sz[1]/2;
        root.add(sidewalk);
        obstacleNodes.push(sidewalk);
        
        var lamp = makeLamp();
        lamp.position.y = 3;
        lamp.position.x = sidewalk.position.x - sz[0]/2 + 3/2 + 2;
        lamp.position.z = sidewalk.position.z - sz[1]/2 + 3/2 + 2;
        root.add(lamp);
        
        var lamp = makeLamp();
        lamp.position.y = 3;
        lamp.position.x = sidewalk.position.x + sz[0]/2 - (3/2 + 2);
        lamp.position.z = sidewalk.position.z + sz[1]/2 - (3/2 + 2);
        root.add(lamp);
        
        var lamp = makeLamp();
        lamp.position.y = 3;
        lamp.position.x = sidewalk.position.x - sz[0]/2 + (3/2 + 2);
        lamp.position.z = sidewalk.position.z + sz[1]/2 - (3/2 + 2);
        root.add(lamp);
        
        var lamp = makeLamp();
        lamp.position.y = 3;
        lamp.position.x = sidewalk.position.x + sz[0]/2 - (3/2 + 2);
        lamp.position.z = sidewalk.position.z - sz[1]/2 + (3/2 + 2);
        root.add(lamp);
        
        var lamp = makeLamp();
        lamp.position.y = 3;
        lamp.position.x = sidewalk.position.x + sz[0]/2 - (3/2 + 2);
        lamp.position.z = sidewalk.position.z;
        root.add(lamp);
        
        var lamp = makeLamp();
        lamp.position.y = 3;
        lamp.position.x = sidewalk.position.x - sz[0]/2 + (3/2 + 2);
        lamp.position.z = sidewalk.position.z;
        root.add(lamp);
        
        for(var z = 0; z < depth; z++) {
            for(var x = 0; x < width; x++) {
                var side = [];
                if(x == 0) side.push(-Math.PI/2);
                if(x == width - 1) side.push(Math.PI/2);
                if(z == 0) side.push(Math.PI);
                if(z == depth - 1) side.push(0);
                var style = Random.choose(BUILDING_COLORS);
                if((Math.abs(x) > 0 || Math.abs(z) > 0) && Math.random() > 0.75) {
                    
                } else {
                    var building = makeBuilding(lotSize-75 , 
                        Math.max(Random.normal(height, 200),60), style, 0x000000, bx*width+x, bz*depth+z);
                    building.position.y = 3;
                    building.position.z = z*lotSize + lotSize/2;
                    building.position.x = x*lotSize + lotSize/2;
                    building.rotation.y = Random.choose(side);
                    root.add(building);
                }
            }
        }
        return root;
    }

    function makeLamp() {
        var root = new THREE.Object3D();
        var base = makeBox(2,10,2, ENV_COLORS[0], ENV_COLORS[1]);
        root.add(base);
        var pole = makeBox(1,20,1, ENV_COLORS[0], ENV_COLORS[1]);
        pole.position.y = 10;
        root.add(pole);
        var light = makeBox(3,3,3, 0x00ff00, 0x00ff00);
        light.position.y = 30;
        root.add(light);
        /*if(Math.random() > 0.75) {
            root.rotation.x = Random.normal(0, Math.PI/8);
            root.rotation.z = Random.normal(0, Math.PI/8);
        }*/
        
        obstacleNodes.push(root);
        
        return root;
    }
    
    function makeBuilding(diameter, height, color, backColor, x, z) {
        var root = new THREE.Object3D();
        var wD = 2;

        var startHeight = 20;// + Math.random()*50;
        var topHeight = height - startHeight;
        
        var door;
        var groundFloor = (function() {
            var height = startHeight;
            var root = new THREE.Object3D();
            var north, south, east, west;
            
            north = makeBox(diameter, height, 0.1, color, backColor);
            south = makeWall(diameter, height, 0.1, color, backColor);
            east = makeBox(diameter, height, 0.1, color, backColor);
            west = makeBox(diameter, height, 0.1, color, backColor);
            
            
            door = makeBox(10, 20, 1.8, 0xff0000, 0x880000);
            door.position.z = -1;
            doors.push(door);
            south.add(door);
            
            root.add(north);
            root.add(south);
            root.add(east);
            root.add(west);
            north.position.z = -diameter/2;
            south.position.z = diameter/2;
            east.position.x = diameter/2 ;
            west.position.x = -diameter/2;
            east.rotation.y = Math.PI/2;
            west.rotation.y = Math.PI/2;

            var northC = makeBox(diameter, height, wD, color, backColor, true);
            var southC = makeWall(diameter, height, wD, color, backColor, true);
            var eastC = makeBox(diameter-wD*2, height, wD, color, backColor, true);
            var westC = makeBox(diameter-wD*2, height, wD, color, backColor, true);
            northC.visible = false;
            southC.visible = false;
            eastC.visible = false;
            westC.visible = false;
            root.add(northC);
            root.add(southC);
            root.add(eastC);
            root.add(westC);
            northC.position.z = -diameter/2 + wD/2;
            southC.position.z = diameter/2 - wD/2;
            eastC.position.x = diameter/2 - wD/2;
            westC.position.x = -diameter/2 + wD/2;
            eastC.rotation.y = Math.PI/2;
            westC.rotation.y = Math.PI/2;
            obstacleNodes.push(northC);
            obstacleNodes.push(eastC);
            obstacleNodes.push(westC);
            
            return root;
        })();
        //groundFloor.visible = false;
        root.add(groundFloor);

        var interior = makeInterior(diameter-wD*2, color, color & 0x444444);
        root.add(interior);
        //interior.visible = false;
        
        var layout = makeInnerLayout(diameter-wD*2, 20 - 0.1, diameter-wD, 2, color, color & 0x444444);
        root.add(layout);
        
        portalDoors.push({door:door, inside:layout, size:new THREE.Vector2(diameter-2, diameter-2)});
        layout.visible = false;
        
        var top; 
        if(topHeight > 200) {
            if(Math.random() > 0.4) {
                    top = makeTower(diameter, topHeight, diameter, color, backColor);
            } else {
                    top = makeModernBuilding(diameter, topHeight, diameter, color, backColor);
            }
        } else {
            top = makeSimpleBuilding(diameter, topHeight, diameter, color, backColor);
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

    function makeInterior(diameter, color, backColor) {
        var root = new THREE.Object3D();
        var north, south, east, west;
        
        north = makeBox(diameter, 20, 0.1, color, backColor);
        south = makeWall(diameter, 20 - 0.1, 0.1, color, backColor);
        east = makeBox(diameter, 20, 0.1, color, backColor);
        west = makeBox(diameter, 20, 0.1, color, backColor);
        
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
        north.position.z = -diameter/2;
        south.position.z = diameter/2;
        east.position.x = diameter/2 ;
        west.position.x = -diameter/2;
        east.rotation.y = Math.PI/2;
        west.rotation.y = Math.PI/2;
        
        var cieling = makeBox(diameter, 0, diameter, color, backColor);
        cieling.position.y = 20 - 0.1;
        root.add(cieling);
                
        return root;
    }
        
    function makeInnerLayout(width, height, depth, wallThickness, color, backColor) {
        var root = new THREE.Object3D();
        var bounds = flattenDegenerateTree(
            subdivide(
                new THREE.Vector2(-width/2,-depth/2), 
                new THREE.Vector2(width/2, depth/2), 
                20, 
                false
            )
        ).map(function(corners) {
            return shrink(wallThickness/2, corners);
        });
        var areas = bounds.map(cornersToCenterSize);
        
        var backmostPos = 5000;
        bounds.forEach(function(bound) {
            backmostPos = Math.min(bound.min.y,backmostPos);
        });
        
        var meta = {rooms:[], leafRooms:[], obj:root};
        
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
            var light = makeCeilingLight();
            light.position.y = height;
            room.add(light);
        });
        
        buildings.push(meta);
        
        for(var i = 1; i < areas.length; i++) {
            var frontWall = makeWall(areas[i].size.x + wallThickness, height, wallThickness, color, backColor, true);
            frontWall.position.x = areas[i].center.x;
            frontWall.position.z = areas[i].center.y + areas[i].size.y/2 + wallThickness/2;
            root.add(frontWall);
            var door = makeBox(10, height, 0.8, 0xff0000, 0x880000);
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
                {min:new THREE.Vector2(x, min.y), max:new THREE.Vector2(max.x, max.y)},
                {min:new THREE.Vector2(min.x, min.y), max:new THREE.Vector2(x, max.y)}
            ];
        } else {
            var y = Random.real(min.y+limit,max.y-limit);
            return [
                {min:new THREE.Vector2(min.x, y), max:new THREE.Vector2(max.x, max.y)},
                {min:new THREE.Vector2(min.x, min.y), max:new THREE.Vector2(max.x, y)}
            ];
        }
    }
    
    function makeTower(width, height, depth, color, backColor) {
        var root = new THREE.Object3D();
        var bottom = 0;
        var ledgeHeight = Random.integer(1,10);
        var ledgeHang = Random.integer(5,20);
        var narrowingInterval = Random.integer(1,10);
        //var ledgeColor = choose([0xff0000,0x00ff00,0x0000ff, 0xffff00, 0x00ffff, 0xff00ff]);
        //var tierColor = choose([0xff0000,0x00ff00,0x0000ff, 0xffff00, 0x00ffff, 0xff00ff]);
        var tierFraction = Random.integer(2,Math.max(2,Math.floor(height/100)));
        var pointy = Math.random() > 0.5;
        var hasCorners = Math.random() > 0.5;
        
        var firstLedge = makeBox(width+ledgeHang, ledgeHeight, depth+ledgeHang, backColor, color);
        root.add(firstLedge);
        bottom = ledgeHeight;
        
        var tiers = 0;
        while(true) {
            var remainingHeight = height-bottom;
            var sectionHeight = Math.max(remainingHeight/tierFraction, 20);
            if(remainingHeight < 20) sectionHeight = remainingHeight;
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
        var ledgeHeight = Random.integer(2,10);
        var ledgeHang = Random.integer(5,15);
        
        var windowHeight = Random.integer(10, 20);
        var wallHeight = Random.integer(3,10);
        
        while(bottom < height) {
            var window = makeBox(width, windowHeight, depth, 0x0000ff, 0x000088);
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

    
    
    var gridTex = new THREE.ImageUtils.loadTexture("gfx/grid.png");
    gridTex.wrapS = THREE.RepeatWrapping; 
    gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.anisotropy = 8;
    
        
            
    var world; 
        
    var map = new THREE.Object3D();
    
        
    var xBlocks = 3;
    var zBlocks = 3;
    var lotSize = 200;
    var roadSize = 100;
    var alleySize = 50;
    var xLots = 2;
    var zLots = 3;
    var heightFactor = 100;
    var heightPower = 1.5;
        
    var root = new THREE.Object3D();
    var blockWidth = lotSize*xLots + roadSize;
    var blockDepth = lotSize*zLots + alleySize;
    var cityWidth = xBlocks*blockWidth + roadSize;
    var cityDepth = zBlocks*blockDepth + alleySize;
        
    var ocean = makeBox(cityWidth + 2000, 0, cityDepth + 2000, 0x000022, 0x000022);
    ocean.position.set(cityWidth/2, -10, cityDepth/2);
    ocean.name = 'ocean';
    root.add(ocean);
    
    var pavement = makeBox(cityWidth, 20, cityDepth, null, gridTex);
    scaleUv(pavement.children[0].geometry, blockWidth/2, blockDepth/2);
    pavement.position.set(cityWidth/2, -20, cityDepth/2);
    root.add(pavement);
    obstacleNodes.push(pavement);
    
    for(var z = 0; z < zBlocks; z++) {
        for(var x = 0; x < xBlocks; x++) {
            var height = Math.pow(Math.max(Math.abs(x-xBlocks/2)/xBlocks,Math.abs(z-xBlocks/2)/zBlocks),heightPower)*heightFactor;
            var block = makeBlock(xLots,zLots,lotSize,height,x,z);
            block.position.z = z*blockDepth + alleySize;
            block.position.x = x*blockWidth + roadSize;
            root.add(block);
        }
    }
    var intersections = {};
    for(var z = 0; z <= zBlocks; z++) {
        intersections[z] = {};
        for(var x = 0; x <= xBlocks; x++) {
            intersections[z][x] = (new THREE.Vector3(x*blockWidth + roadSize/2, 0.0, z*blockDepth + alleySize/2));
            /*var marker = makeMarker();
            marker.position.set(intersections[z][x].x, intersections[z][x].z, 1);
            map.add(marker);*/
        }
    }
    world = root;
    
    world.updateMatrixWorld();
    
    var mapbg = makeLineBox(cityWidth, cityDepth, 0x00ff00, 0x000000);
    mapbg.position.set(cityWidth/2, cityDepth/2, 0);
    
    map.add(mapbg);
    
    buildings.forEach(function(building){
        var box = makeBox(150,150,1,0x00ff00, 0x00ff00);
        box.children[0].position.y = 0;
        building.obj.localToWorld(box.position);
        box.position.y = box.position.z;
        box.position.z = 1;
        map.add(box);
    });
    
    map.scale.set(1/cityWidth, 1/cityDepth, 1);
    
    obstacles = obstacleNodes.map(function(wall){
        //var bbox = new THREE.BoundingBoxHelper(wall, 0xaa88ff);
        //bbox.update();
        //world.add(bbox);
        var box = new THREE.Box3();
        box.setFromObject(wall);
        return box;
    });



    var startRoom;

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
        
    Random.shuffle(programs);
    Random.shuffle(buildings);

    buildings.forEach(function(building, i) {
        var room = Random.choose(building.leafRooms);
        var mainframe = makeMainframe();
        var back = room.userData.size.z/2 - 5;
        mainframe.position.z -= back;
        room.add(mainframe);
        obstacles.push(new THREE.Box3().setFromObject(mainframe));
        
        if(i == 0) {
            terminals.push({
                id:mainframe.id,
                body:mainframe, 
                name:"Cyber 1", 
                contents:[hackerKey], 
                locked:false,
                hasScreen:true,
                readOnly: 1
            }); 
            startRoom = Random.choose(building.rooms.filter(function(r2){
                return r2.id != room.id;
            }));
            building.rooms.splice(building.rooms.indexOf(startRoom), 1);
            building.leafRooms.splice(building.leafRooms.indexOf(startRoom), 1);
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
                room.add(table);
                obstacles.push(new THREE.Box3().setFromObject(table));
            }
            building.rooms.splice(building.rooms.indexOf(room),1);
        });
        building.rooms.forEach(function(room){
            if(room.userData.size.x >= 40 && room.userData.size.z >= 30) {
                var table = makeTable();
                room.add(table);
                obstacles.push(new THREE.Box3().setFromObject(table));
            }
        });
    });


    function makeMarker() {
        var box = makeBox(50,50,1,SCREEN_COLORS[0],SCREEN_COLORS[0]);
        box.children[0].position.y = 0;
        return box;
    }

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


    function spawnGuard(position, patrol) {
        var shape = makeGuard();
        shape.body.position.copy(position);
        pathers.push({
            id:shape.id,
            body:shape.body,
            speed:20,
            face:true,
            index:0,
            path:patrol
        });
        world.add(shape.body);
    }
    
    var sx = Random.integer(0,xBlocks-1);
    var sz = Random.integer(0,zBlocks-1);

    spawnGuard(intersections[sx][sz],
        [
            intersections[sx][sz],
            intersections[sx+1][sz],
            intersections[sx+1][sz+1],
            intersections[sx][sz+1]
        ]
    );

    var startPos = new THREE.Vector3(0,0,0);
    startRoom.localToWorld(startPos);
    (function(){
        var shape = makeRizzo();
        var id = shape.body.id;
        var nick = Random.choose(['Rizzo', 'Chuckie', 'Jerry']);
        shape.body.position.copy(startPos);
        world.add(shape.body);
        terminals.push({
            id:id,
            name:nick, 
            body:shape.body, 
            contents:[],
            locked:false,
            hasScreen:false
        });
        bots.push({
            id:id,
            body:shape.body, 
            eye:shape.eye, 
            radius:3, //used for shooting, should move
            canShoot:true,
            speed:400.0,
            vspeed:0.0,
            spawn: startPos,
            name:'R.A.T.',
            nick:nick
        });
        colliders.push({
            id:id, 
            body:shape.body,
            radius:3,
            g:9.8,
            dy:0
        });
        
        botMarkers.push({id:id, blip:makeMarker(), body:shape.body});
        
    })();

    (function(){
        var shape = (function() {
            var body = new THREE.Object3D();
            var eye = new THREE.Object3D();
            
            var top = makeBox(5,5,5, 0xff0000,0xffff00);
            pointify(top.children[0].geometry, 5, 1, 1);
            var bottom = makeBox(5,5,5, 0xff0000,0xffff00);
            pointify(bottom.children[0].geometry, 5, 1, 1);
            bottom.rotation.x = Math.PI;
            top.position.y = 5;
            bottom.position.y = 5;

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
            rotors.position.y = 5;
            spinners.push(rotors);
            eye.add(rotors);
            
            body.add(eye);
            
            return {body:body,eye:eye};
        })();
        var id = shape.body.id;
        
        var sx = Random.integer(0,xBlocks-1);
        var sz = Random.integer(0,zBlocks-1);

        shape.body.position.y = 10;
        shape.body.position.add(intersections[sx][sz]);
        world.add(shape.body);
        var nick = Random.choose(['Amelia', 'Kiki', 'Anneka', 'Glenda']);
        
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
            speed:400.0,
            vspeed:400.0,
            spawn: shape.body.position.clone(),
            resetOwner: true,
            name:'Flying Eye',
            nick:nick
        });
        pathers.push({
            id:id,
            body:shape.body,
            speed:30,
            face:false,
            index:0,
            device:bot,
            path:[
                new THREE.Vector3(0.0,100.0,0.0).add(intersections[sx][sz]),
                intersections[sx][sz],
                new THREE.Vector3(0.0,100.0,0.0).add(intersections[sx][sz]),
            
                new THREE.Vector3(0.0,100.0,0.0).add(intersections[sx][sz+1]),
                intersections[sx][sz+1],
                new THREE.Vector3(0.0,100.0,0.0).add(intersections[sx][sz+1]),
            
                new THREE.Vector3(0.0,100.0,0.0).add(intersections[sx+1][sz+1]),
                intersections[sx+1][sz+1],
                new THREE.Vector3(0.0,100.0,0.0).add(intersections[sx+1][sz+1]),
                
                new THREE.Vector3(0.0,100.0,0.0).add(intersections[sx+1][sz]),
                intersections[sx+1][sz],
                new THREE.Vector3(0.0,100.0,0.0).add(intersections[sx+1][sz])
            ]
        });
        stunnable.push({id:id, body:shape.body});
        potentialTerminals.push({
            id:id,
            name:nick, 
            body:shape.body, 
            contents:[], 
            locked:true, 
            hasScreen:false,
            key:eyeKey
        });
        botMarkers.push({id:id, blip:makeMarker(), body:shape.body});
    })();

    (function(){
        var shape = makeIgor();
        var id = shape.body.id;
        
        var nick = Random.choose(['Conky', 'Igor', 'Data']);
        
        var sx = Random.integer(0,xBlocks-1);
        var sz = Random.integer(0,zBlocks-1);
        
        world.add(shape.body);
        shape.body.position.copy(intersections[sx][sz]);
        rogueBots.push({
            id:id,
            body:shape.body,
            eye:shape.eye,
            hacker:true,
            speed:200.0,
            vspeed:0.0,
            spawn:intersections[sx][sz],
            resetOwner: true,
            name:'Hacker',
            nick:nick
        });
        
        
        pathers.push({
            id:id,
            body:shape.body, 
            face:true,
            path:[
                intersections[sx][sz],
                intersections[sx+1][sz],
                intersections[sx+1][sz+1],
                intersections[sx][sz+1]
            ],
            index:0,
            speed:20,
            device:bot
        })
        stunnable.push({id:id, body:shape.body});
        potentialTerminals.push({
            id:id,
            name:nick, 
            body:shape.body, 
            contents:[], 
            locked:true, 
            hasScreen:false,
            key:hackerKey
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
        
    botMarkers.forEach(function(marker){
        map.add(marker.blip);
    });
    
    var safeZone = new THREE.Box3(new THREE.Vector3(0,-30,0), new THREE.Vector3(cityWidth, 500, cityDepth));

    return {
        doors:doors, 
        world:world, 
        buildings:buildings, 
        intersections:intersections, 
        portalDoors:portalDoors, 
        obstacles:obstacles, 
        map:map, bots:bots, 
        botMarkers:botMarkers,
        spinners:spinners,
        terminals:terminals,
        potentialTerminals:potentialTerminals,
        colliders:colliders,
        pathers:pathers,
        stunnable:stunnable,
        safeZone:safeZone,
        bots:bots,
        rogueBots:rogueBots
    };
}

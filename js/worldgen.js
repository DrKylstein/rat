function makeWorld(ENV_COLORS, BUILDING_COLORS) {
    
    var doors = [];
    var rooms = [];
    var devices = [];
    
    var gridTex = new THREE.ImageUtils.loadTexture("gfx/grid.png");
    gridTex.wrapS = THREE.RepeatWrapping; 
    gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.anisotropy = 8;
    
    var intersections = {};
    
    var world = makeCity(2, 200, 100, 50, 2, 3);
    
    function makeCity(radius, lotSize, roadSize, alleySize, buildWide, buildDeep) {
        /*var map = [];
        for(var z = 1-radius; z < radius; z++) {
            map.push([])
            for(var x = 1-radius; x < radius; x++) {
                map[map.length-1].push(0);
            }
        }
        
        for(var i = 0; i < 10; i++) {
            z = Math.floor(Math.random()*map.length);
            x = Math.floor(Math.random()*map[z].length);
            map[z][x] = 1;
        }*/
        
        var root = new THREE.Object3D();
        var blockWidth = lotSize*buildWide + roadSize;
        var blockDepth = lotSize*buildDeep + alleySize;
        
        var ocean = makeBox(radius*2*blockWidth + 2000, 0, radius*2*blockDepth + 2000, 0x000022, 0x000022);
        ocean.position.y = -10;
        ocean.name = 'ocean';
        root.add(ocean);
        
        var pavement = makeBox(radius*2*blockWidth, 20, radius*2*blockDepth, 
            null, gridTex);
        scaleUv(pavement.children[0].geometry, blockWidth/2, blockDepth/2);
        pavement.position.y = -20;
        root.add(pavement);
        
        
        for(var z = 1-radius; z < radius; z++) {
            for(var x = 1-radius; x < radius; x++) {
                var height = Math.pow(radius-Math.max(Math.abs(x),Math.abs(z)),1.5)*100;
                var block = makeBlock(buildWide,buildDeep,lotSize,height,x,z);
                block.position.z = z*blockDepth;
                block.position.x = x*blockWidth;
                root.add(block);
            }
        }
        for(var z = -radius; z < radius; z++) {
            intersections[z] = {};
            for(var x = -radius; x < radius; x++) {
                intersections[z][x] = (new THREE.Vector3(x*blockWidth + lotSize*buildWide - roadSize/2, 0.0, z*blockDepth + lotSize*buildDeep - alleySize/2 - roadSize/2));
            }
        }
        return root;
    }

    var adTex = new THREE.ImageUtils.loadTexture("gfx/ad1.png");

    
    function makeBlock(width, depth, lotSize, height, bx,bz) {
        var root = new THREE.Object3D();
        var sz = [width*lotSize, depth*lotSize];
        var sidewalk = makeBox(sz[0], 3, sz[1], ENV_COLORS[0], ENV_COLORS[1]);
        sidewalk.position.x = (sz[0] - lotSize)/2;
        sidewalk.position.z = (sz[1] - lotSize)/2;
        root.add(sidewalk);
        
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
                    building.position.z = z*lotSize;
                    building.position.x = x*lotSize;
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
        if(Math.random() > 0.75) {
            root.rotation.x = Random.normal(0, Math.PI/8);
            root.rotation.z = Random.normal(0, Math.PI/8);
        }
        return root;
    }
    
    function makeBuilding(diameter, height, color, backColor, x, z) {
        var root = new THREE.Object3D();
        
        var startHeight = 20;// + Math.random()*50;
        var topHeight = height - startHeight;
        
        var groundFloor = makeGroundFloor(diameter, startHeight, color, backColor, true);
                root.add(groundFloor);

        var interior = makeInterior(diameter-2, color, color & 0x444444);
        interior.userData.diameter = diameter - 2;
        interior.userData.x = x;
        interior.userData.z = z;
        interior.userData.height = height;
        rooms.push(interior);
        root.add(interior);
        
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
        root.add(top);
        
        return root;
    }

    
    function makeGroundFloor(diameter, height, color, backColor, doDoor) {
        var root = new THREE.Object3D();
        var north, south, east, west;
        
        north = makeBox(diameter, height, 0.1, color, backColor);
        south = makeWall(diameter, height, color, backColor);
        east = makeBox(diameter, height, 0.1, color, backColor);
        west = makeBox(diameter, height, 0.1, color, backColor);
        
        if(doDoor) {
            var door = makeBox(10, 20, 0.8, 0xff0000, 0x880000);
            door.name = "door";
            door.position.z = -0.5;
            doors.push(door);
            south.add(door);
        }
        
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
        
        var cieling = makeBox(diameter, 0.1, diameter, color, backColor);
        cieling.position.y = height;
        root.add(cieling);
        
        return root;
    }
    
    function makeWall(length, height, color, backColor) {
        var root = new THREE.Object3D();
        var left = makeBox(length/2 - 5, height, 0.1, color, backColor);
        var right = makeBox(length/2 - 5, height, 0.1, color, backColor);
        var middle = makeBox(10, height-20, 0.1, color, backColor);
        left.position.x = -length/4 - 2.5;
        right.position.x = length/4 + 2.5;
        middle.position.y = 20;
        root.add(left);
        root.add(right);
        root.add(middle);
        return root;
    }
    
    function makeInteriorWall(length, color, backColor) {
        var root = new THREE.Object3D();
        var left = makeBox(length/2 - 5, 20, 0.1, color, backColor);
        var right = makeBox(length/2 - 5, 20, 0.1, color, backColor);
        //scaleUv(left.children[0].geometry, 4, 1);
        //scaleUv(right.children[0].geometry, 4, 1);
        left.position.x = -length/4 - 2.5;
        right.position.x = length/4 + 2.5;
        root.add(left);
        root.add(right);
        return root;
    }

    function makeInterior(diameter, color, backColor) {
        var root = new THREE.Object3D();
        var north, south, east, west;
        
        north = makeBox(diameter, 20, 0.1, color, backColor);
        south = makeInteriorWall(diameter, color, backColor);
        east = makeBox(diameter, 20, 0.1, color, backColor);
        west = makeBox(diameter, 20, 0.1, color, backColor);
        
        var jam = makeBox(0,20,1,color,backColor);
        jam.position.x = -5;
        jam.position.z = 0.5;
        south.add(jam);
        
        var topjam = makeBox(10,0,1,color,backColor);
        topjam.position.y = 20 - 0.1;
        topjam.position.z = 0.5;
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
        
        var layout = makeInnerLayout(diameter, 20-0.1, diameter, color, backColor);
        if(Math.random() > 0.5)
            layout.rotation.y = Math.PI;
        root.add(layout);
        
        return root;
    }
    
    function makeInnerLayout(width, height, depth, color, backColor) {
        var root = new THREE.Object3D();
        var backLeftWall = makeBox(width*1/3 - 5, height, 2.5, color, backColor);
        var backRightWall = makeBox(width*1/3 - 5, height, 2.5, color, backColor);
        var leftWall = makeBox(2.5,height,depth/3,color,backColor);
        var rightWall = makeBox(2.5,height,depth/3,color,backColor);
        backLeftWall.position.z = depth/6 + 1.25 - 2.5;
        backRightWall.position.z = depth/6 + 1.25 - 2.5;
        backLeftWall.position.x = -width/4 + 5 + 1.5;
        backRightWall.position.x = +width/4 - 5 - 1.5;
        leftWall.position.x = -width/3;
        rightWall.position.x = width/3
        leftWall.position.z = depth/2 - depth/6;
        rightWall.position.z = depth/2 - depth/6;
        
        var leftHallWall = makeBox(2.5,height,depth/3 - 5,color,backColor);
        leftHallWall.position.x = -5 - 2.5;
        var rightHallWall = makeBox(2.5,height,depth/3 - 5,color,backColor);
        rightHallWall.position.x = 5 + 2.5;

        var leftBackHallWall = makeBox(2.5,height,depth/4 - 5,color,backColor);
        leftBackHallWall.position.x = -5 - 2.5;
        var rightBackHallWall = makeBox(2.5,height,depth/4 - 5,color,backColor);
        rightBackHallWall.position.x = 5 + 2.5;
        leftBackHallWall.position.z = -depth/2 + depth/8 - 2.5;
        rightBackHallWall.position.z = -depth/2 + depth/8 - 2.5;

        
        root.add(backLeftWall);
        root.add(backRightWall);
        root.add(leftWall);
        root.add(rightWall);
        root.add(leftHallWall);
        root.add(rightHallWall);
        root.add(leftBackHallWall);
        root.add(rightBackHallWall);
        return root;
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
    

    
    
    return {doors:doors, world:world, rooms:rooms, intersections:intersections};
}

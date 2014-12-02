function makeWorld(ENV_COLORS, BUILDING_COLORS) {
    
    var doors = [];
    var portalDoors = [];
    var rooms = [];
    var devices = [];
    
    var gridTex = new THREE.ImageUtils.loadTexture("gfx/grid.png");
    gridTex.wrapS = THREE.RepeatWrapping; 
    gridTex.wrapT = THREE.RepeatWrapping;
    gridTex.anisotropy = 8;
    
    var intersections = {};
        
    var wallObjects = [];
    
    var world = makeCity(2, 200, 100, 50, 2, 3); 
    
    function makeCity(radius, lotSize, roadSize, alleySize, buildWide, buildDeep) {        
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
        wallObjects.push(pavement);
        
        
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
        wallObjects.push(sidewalk);
        
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
        
        wallObjects.push(root);
        
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
            wallObjects.push(northC);
            wallObjects.push(eastC);
            wallObjects.push(westC);
            
            return root;
        })();
        //groundFloor.visible = false;
        root.add(groundFloor);

        var interior = makeInterior(diameter-wD*2, color, color & 0x444444);
        root.add(interior);
        //interior.visible = false;
        
        var layout = makeInnerLayout(diameter-wD*2, 20 - 0.1, diameter-wD, 2, color, color & 0x444444, x == 0 && z == 0);
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
        wallObjects.push(top);
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
            wallObjects.push(left);
            wallObjects.push(right);
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
        
    function makeInnerLayout(width, height, depth, wallThickness, color, backColor, isStart) {
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
        
        var meta = {isStart:isStart, rooms:[], leafRooms:[]};
        
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
                wallObjects.push(leftWall);
            }
        });
        
        rooms.push(meta);
        
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
        
    return {doors:doors, world:world, rooms:rooms, intersections:intersections, 
        portalDoors:portalDoors, wallObjects:wallObjects};
}

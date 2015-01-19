function makeShaderMat(color, backColor) {
    return new THREE.ShaderMaterial({
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib['lights'],
            {
                color:{
                    type:'c', 
                    value:new THREE.Color(color)
                },
                backColor:{
                    type:'c', 
                    value:new THREE.Color(backColor)
                },
                fogColor:{type:'c'},
                fogNear:{type:'f'},
                fogFar:{type:'f'},
            }
        ]),
        useFog:true,
        fog:true,
        lights:true
    });
}
function makeBox(w, h, d, color, backColor) {
    var geometry = new THREE.BoxGeometry(w, h, d);
    var material;
    if(color === null) {
        material = new THREE.MeshBasicMaterial({map:backColor});
    } else {
        material = makeShaderMat(color, backColor);
    }
    
    var mesh = new THREE.Mesh(geometry, material);
    var root = new THREE.Object3D();
    mesh.position.y = h/2;
    
    root.add(mesh);
    return root;
}

function pointify(geometry, h, px, pz) {
    for(var i = 0; i < geometry.vertices.length; i++) {
        geometry.vertices[i].x *= 1.0 - px*(geometry.vertices[i].y + h/2)/h;
        geometry.vertices[i].z *= 1.0 - pz*(geometry.vertices[i].y + h/2)/h;
    }
    geometry.verticesNeedUpdate = true;
    return geometry;
}

function scaleUv(geometry, us, vs) {
    var uvs = geometry.faceVertexUvs;
    for(var i = 0; i < uvs.length; i++) {
        for(var j = 0; j < uvs[i].length; j++) {
            for(var k = 0; k < uvs[i][j].length; k++) {
                uvs[i][j][k].x *= us || 1;
                uvs[i][j][k].y *= vs || 1;
            }
        }
    }
    geometry.uvsNeedUpdate = true;
    return geometry;
}
function modUv(geometry, u, v) {
    var uvs = geometry.faceVertexUvs;
    for(var i = 0; i < uvs.length; i++) {
        for(var j = 0; j < uvs[i].length; j++) {
            for(var k = 0; k < uvs[i][j].length; k++) {
                if(u) {
                    var x = uvs[i][j][k].x;
                    while(x > 1.0) {
                        x -= 1.0;
                    }
                    uvs[i][j][k].x = x;
                }
                    
                if(v) {
                    var y = uvs[i][j][k].y;
                    while(y > 1.0) {
                        y -= 1.0;
                    }
                    uvs[i][j][k].y = y;
                }
            }
        }
    }
    geometry.uvsNeedUpdate = true;
    return geometry;
}

function makeSprite(tex) {
    var material = new THREE.SpriteMaterial( {map:tex} ); 
    var sprite = new THREE.Sprite(material);
    return sprite;
}

var font = document.getElementById('font');

function makeStaticLabel(text, height, color) {
    var hudCanvas = document.createElement('canvas');
    hudCanvas.width = 8*text.length;
    hudCanvas.height = 16;
    var hudCtx = hudCanvas.getContext('2d');
    var hudTex = new THREE.Texture(hudCanvas);
    hudTex.magFilter = THREE.NearestFilter;
    var hudSprite = makeSprite(hudTex);
    hudSprite.scale.set(height*text.length/2, height);
    hudSprite.position.z = 1;
    hudCtx.imageSmoothingEnabled = false;
    hudCtx.clearRect(0,0,hudCanvas.width,hudCanvas.height);
    text = text.toUpperCase();
    for(var i = 0; i < text.length; i++) {
        var index = text.charCodeAt(i)-32;
        hudCtx.globalCompositeOperation = 'source-over';
        hudCtx.drawImage(font, (index%16)*8,Math.floor(index/16)*16, 8,16,  i*8,0, 8,16);
        hudCtx.globalCompositeOperation = 'source-in';
        hudCtx.fillStyle = new THREE.Color(color).getStyle();
        hudCtx.fillRect(0,0, hudCanvas.width, hudCanvas.height);
    }
    hudTex.needsUpdate = true;
    return hudSprite;
}

function makeSign(text, height, color) {
    var hudCanvas = document.createElement('canvas');
    hudCanvas.width = 8*text.length;
    hudCanvas.height = 16;
    var hudCtx = hudCanvas.getContext('2d');
    var hudTex = new THREE.Texture(hudCanvas);
    hudTex.magFilter = THREE.NearestFilter;
    var box = makeBox(text.length*height/2, height, 0, null, hudTex);
    hudCtx.imageSmoothingEnabled = false;
    hudCtx.clearRect(0,0,hudCanvas.width,hudCanvas.height);
    text = text.toUpperCase();
    for(var i = 0; i < text.length; i++) {
        var index = text.charCodeAt(i)-32;
        hudCtx.globalCompositeOperation = 'source-over';
        hudCtx.drawImage(font, (index%16)*8,Math.floor(index/16)*16, 8,16,  i*8,0, 8,16);
        hudCtx.globalCompositeOperation = 'source-in';
        hudCtx.fillStyle = new THREE.Color(color).getStyle();
        hudCtx.fillRect(0,0, hudCanvas.width, hudCanvas.height);
    }
    hudTex.needsUpdate = true;
    box.children[0].material.transparent = true;
    return box;
}


function Label(height, color) {
    var hudCanvas = document.createElement('canvas');
    var hudCtx = hudCanvas.getContext('2d');
    var hudTex = new THREE.Texture(hudCanvas);
    hudTex.magFilter = THREE.NearestFilter;
    var hudSprite = makeSprite(hudTex);
    hudSprite.position.z = 1;
    hudCtx.imageSmoothingEnabled = false;
    hudCtx.clearRect(0,0,hudCanvas.width,hudCanvas.height);
    this.setText = function (text) {
        hudCanvas.width = 8*text.length;
        hudCanvas.height = 16;
        hudCtx.clearRect(0,0,hudCanvas.width,hudCanvas.height);
        text = text.toUpperCase();
        hudSprite.scale.set(height*text.length/2, height);
        for(var i = 0; i < text.length; i++) {
            var index = text.charCodeAt(i)-32;
            hudCtx.globalCompositeOperation = 'source-over';
            hudCtx.drawImage(font, (index%16)*8,Math.floor(index/16)*16, 8,16,  i*8,0, 8,16);
            hudCtx.globalCompositeOperation = 'source-in';
            hudCtx.fillStyle = new THREE.Color(color).getStyle();
            hudCtx.fillRect(0,0, hudCanvas.width, hudCanvas.height);
        }
        hudTex.needsUpdate = true;
    }
    this.sprite = hudSprite;
}

function makeLines(color, mode, points) {
    var material = new THREE.LineBasicMaterial({ color: color }); 
    var geometry = new THREE.Geometry(); 
    geometry.vertices = points; 
    return new THREE.Line( geometry, material, mode );
}

function makeLineBox(w, h, color) {
    return makeLines(color, THREE.LineStrip, [
        new THREE.Vector3(-w/2, -h/2, 0),
        new THREE.Vector3(w/2, -h/2, 0),
        new THREE.Vector3(w/2, h/2, 0),
        new THREE.Vector3(-w/2, h/2, 0),
        new THREE.Vector3(-w/2, -h/2, 0)
    ]);
}

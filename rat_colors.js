var SCREEN_COLORS = [0x9dfafb, 0x0d3034];
var ENV_COLORS = [0x1197b2, 0x0d1b34, 0x9dfafb];
var IMPORTANT_COLORS = [0xffa297,0x34120d];//[0xffffff,0x232323];
var GOOD_COLORS = [0xfbff97,0x34280d]
var START_COLORS = GOOD_COLORS;
var REPAIR_COLORS = GOOD_COLORS;
var DOOR_COLORS = [ENV_COLORS[2],ENV_COLORS[0]];
var DANGER_COLORS = [0xffa297,0x34120d];
var BAR_COLORS = [SCREEN_COLORS[0], 0xfbff97, 0xffa297];

var gridTex = (function () {
    var hudCanvas = document.createElement('canvas');
    hudCanvas.width = 128;
    hudCanvas.height = 128;
    var hudCtx = hudCanvas.getContext('2d');
    var hudTex = new THREE.Texture(hudCanvas);

    hudCtx.imageSmoothingEnabled = false;
    hudCtx.globalCompositeOperation = 'source-over';
    
    hudCtx.fillStyle = new THREE.Color(ENV_COLORS[0]).getStyle();
    hudCtx.fillRect(0,0, hudCanvas.width, hudCanvas.height);
    
    hudCtx.fillStyle = new THREE.Color(ENV_COLORS[1]).getStyle();
    hudCtx.fillRect(1,1, hudCanvas.width-1, hudCanvas.height-1);
    hudTex.needsUpdate = true;
    
    hudTex.wrapS = THREE.RepeatWrapping;
    hudTex.wrapT = THREE.RepeatWrapping;
    hudTex.anisotropy = 8;
    
    return hudTex;
})()

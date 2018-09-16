var map = (x, min_x, max_x, min_y, max_y) => {
    return (x-min_x) / (max_x-min_x) * (max_y-min_y) + min_y;
}
    
function getRandom(maxSize) {
    return Math.floor(Math.random() * maxSize) % maxSize;
}

function randomGaussian() {
	var x1, x2, rad, y1;
	do {
		x1 = 2 * Math.random() - 1;
		x2 = 2 * Math.random() - 1;
		rad = x1 * x1 + x2 * x2;
	} while(rad >= 1 || rad == 0);
	var c = Math.sqrt(-2 * Math.log(rad) / rad);
	return x1 * c;
}

const b2Vec2 = Box2D.Common.Math.b2Vec2
, b2BodyDef = Box2D.Dynamics.b2BodyDef
, b2Body = Box2D.Dynamics.b2Body
, b2FixtureDef = Box2D.Dynamics.b2FixtureDef
, b2World = Box2D.Dynamics.b2World
, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

var PTM_RATIO = 32;

var _enableDebugDraw = (world) => {        
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

    var oldDebugDrawCanvas = document.getElementById("debugDrawCanvas");
    if(oldDebugDrawCanvas){
        document.getElementById("Cocos2dGameContainer").removeChild(oldDebugDrawCanvas);
    }
    var testCanvas = document.createElement("canvas");
    var styleString = document.getElementById("gameCanvas").style;

    testCanvas.id = 'debugDrawCanvas';
    testCanvas.height = document.getElementById("gameCanvas").height;
    testCanvas.width = document.getElementById("gameCanvas").width;
    testCanvas.style.height = styleString.height;
    testCanvas.style.width = styleString.width;

    testCanvas.style.position = "absolute";
    testCanvas.style.top = "0px";
    testCanvas.style.outline = "none";
    testCanvas.style.left = "0px";
    testCanvas.style.top = document.getElementById('Cocos2dGameContainer').style.paddingTop;
    testCanvas.style["-webkit-transform"] = "rotate(180deg) scale(-1, 1)";
    testCanvas.style["pointer-events"] = "none";
    document.getElementById("Cocos2dGameContainer").appendChild(testCanvas);
    var _debugDraw = new Box2D.Dynamics.b2DebugDraw();
    _debugDraw.SetSprite(testCanvas.getContext("2d")); // test is the id of another canvas which debugdraw works on
    var scale = PTM_RATIO * cc.EGLView._getInstance().getViewPortRect().width / cc.EGLView._getInstance().getDesignResolutionSize().width;
    _debugDraw.SetDrawScale(scale);

    _debugDraw.SetFillAlpha(0.3);
    _debugDraw.SetLineThickness(1.0);
    _debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_edgeShape);
    world.SetDebugDraw(_debugDraw);
}

Array.prototype.remove = function(element) {
    const index = this.indexOf(element);
    this.splice(index, 1);
}
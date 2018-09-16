class RepeatingBackground {
    constructor(scene) {   
        this.scene = scene; 
        this.node = cc.Node.create();

        this.bg_layers = [];
        for(var i = 0; i < 4; i++) {
            var bg = cc.Sprite.create(res.bg);
            bg.x += (i*bg.width)-2;
            this.node.addChild(bg);
            this.bg_layers.push(bg);
        }

        this.node.y = 400;

        scene.addChild(this.node, -1);  
        
        //this.node.schedule((dt) => this.onUpdate(dt));      
    }
    onUpdate(dt) {
        var sceneX = -this.scene.getPositionX();
        this.bg_layers.forEach((bg) => {
            if(bg.x < sceneX - bg.width) {
                bg.x += bg.width * this.bg_layers.length;
            }
        });
    }
    getNode() {
        return this.node;
    }
}

class Ground {
    constructor(scene) {   
        this.scene = scene; 
        this.node = cc.Node.create();
        
        this.bg_layers = [];
        for(var i = 0; i < 4; i++) {
            var bg = cc.Sprite.create(res.ground);	
            bg.x += (i*bg.width)-2;
            this.node.addChild(bg);
            this.bg_layers.push(bg);
        }

        scene.addChild(this.node, 2);     
        
        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_staticBody;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(40, 4);
        bodyDef.position.Set(0, -1.8);

        this.body = scene.world.CreateBody(bodyDef);
        this.body.CreateFixture(fixDef);          
        this.body.name = "ground";
        
        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;
        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_staticBody;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(40, 1);
        bodyDef.position.Set(0, winSize.height / PTM_RATIO + 2);

        this.body2 = scene.world.CreateBody(bodyDef);
        this.body2.CreateFixture(fixDef);          
        this.body2.name = "ground";
        
        
        this.node.setPosition(350, -75);
        this.node.schedule((deltaTime) => this.onUpdate(deltaTime));         
    }

    onUpdate(dt) {
        var sceneX = -this.scene.getPositionX();
        this.bg_layers.forEach((bg) => {
            if(bg.x < sceneX - bg.width) {
                bg.x += bg.width * this.bg_layers.length;
            }
        });
        this.body.SetPosition(new b2Vec2(-this.scene.x / PTM_RATIO, -1.8));
        this.body2.SetPosition(new b2Vec2(-this.scene.x / PTM_RATIO, winSize.height / PTM_RATIO + 2));
    }
    getNode() {
        return this.node;
    }

    destroy() {
        this.scene.removeChild(this.node);
        this.node.release();
        this.scene.world.DestroyBody(this.body);
        this.scene.world.DestroyBody(this.body2);
    }
}

class Hose {
    constructor(scene, x) {   
        this.scene = scene; 
        this.node = cc.Node.create();
        
        var winSize = cc.director.getWinSize();

        var hoseHeight = 830;
        var acrossHeight = 300;
        var downHeight = 100 + getRandom(300);
        var upHeight = winSize.height + 100 - downHeight - acrossHeight;
    
        var hoseX = x;        
    
        var ccSpriteDown = cc.Sprite.create("#holdback1.png");
        ccSpriteDown.setLocalZOrder(1);
        ccSpriteDown.setAnchorPoint(cc.p(0, 0));
        ccSpriteDown.setPosition(cc.p(hoseX, 0));
        ccSpriteDown.setScaleY(downHeight / hoseHeight);
    
        var ccSpriteUp = cc.Sprite.create("#holdback2.png");
        ccSpriteUp.setLocalZOrder(1);
        ccSpriteUp.setAnchorPoint(cc.p(0, 0));
        ccSpriteUp.setPosition(cc.p(hoseX, downHeight + acrossHeight));
        ccSpriteUp.setScaleY(upHeight / hoseHeight);
    
        this.node.addChild(ccSpriteDown);
        this.node.addChild(ccSpriteUp);

        scene.addChild(this.node, 1);     
        
        var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_staticBody;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(2, upHeight / PTM_RATIO );

        bodyDef.position.Set(ccSpriteUp.x / PTM_RATIO + 2, (ccSpriteUp.y + upHeight) / PTM_RATIO);
        this.body1 = scene.world.CreateBody(bodyDef);
        this.body1.CreateFixture(fixDef);  
        
        this.body1.name = "hose";
        
        fixDef.shape.SetAsBox(2, downHeight / PTM_RATIO );
        bodyDef.position.Set(ccSpriteDown.x / PTM_RATIO + 2, (ccSpriteDown.y) / PTM_RATIO);
        this.body2 = scene.world.CreateBody(bodyDef);
        this.body2.CreateFixture(fixDef);  
        
        this.body2.name = "hose";

        this.x = bodyDef.position.x;
        this.down_y = (ccSpriteDown.y - downHeight) / PTM_RATIO;
        this.up_y = (ccSpriteUp.y) / PTM_RATIO;
    }

    destroy() {
        this.scene.removeChild(this.node);
        this.node.release();
        this.scene.world.DestroyBody(this.body1);
        this.scene.world.DestroyBody(this.body2);
    }

    getNode() {
        return this.node;
    }
}
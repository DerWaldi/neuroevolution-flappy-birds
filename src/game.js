var winSize;
var curScene;

const POPULATION_SIZE = 16;

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        
        // Load Cache
        cc.spriteFrameCache.addSpriteFrames(res.flappy_packer_plist, res.flappy_packer);
        cc.animationCache.addAnimations(res.flappy_frame_plist);   
        
        winSize = cc.director.getWinSize();

        curScene = this;
        
        // GUI
        this.hud = new Hud();
        this.addChild(this.hud, 10);
        
        // pre generate hose positions
        this.hoseCounter = 0;
        this.hoseMap = [];
        for(var i = 0; i < 1000; i++) {
            this.hoseMap.push(getRandom(300));
        }      

        this.generateHose = (x) => {
            this.hoseCounter++;
            if(this.hoseCounter > 1000)
                this.hoseCounter = 0;

            this.hoses.push(new Hose(this.worldLayer, x,));// this.hoseMap[this.hoseCounter]));
        }

        this.createWorld = () => {
            this.hud.updateGeneration(this.generation);
            this.hud.updateHighScore(this.highscore);

            this.hoseCounter = 0;
            // Destroy World
            while(this.world.GetBodyCount() > 0) {
                this.world.DestroyBody(this.world.GetBodyList());
            }
            this.worldLayer.removeAllChildren();
            // respawn world
            if(this.ground) {
                this.ground.destroy();
                this.hoses.forEach((e)=> {
                    e.destroy();
                });      
            }      
            this.ground = new Ground(this.worldLayer);
            this.hoses = [];
            for(var i = 0; i < 3; i++) {
                this.generateHose(2000 + i*1000);
            }
        }  

        // World Layer
        this.worldLayer = cc.Layer.create();
        this.addChild(this.worldLayer);   
        
        // Construct a world object, which will hold and simulate the rigid bodies.
        this.world = new b2World(new b2Vec2(0, -16), true);
        this.world.SetContinuousPhysics(true);
        this.worldLayer.world = this.world;
        
        new RepeatingBackground(this);
        
        this.generation = 0;
        this.highscore = 0;
        this.population = [];
        this.createWorld();

        this.worldLayer.getClosestHose = () => {          
            this.birdX = this.population[0].body.GetPosition().x  
            if(this.hoses[0].body1.GetPosition().x < this.birdX) {
                return this.hoses[1];
            } else {
                return this.hoses[0];
            }
        }  
        
        this.fittest = [];
        for(var i = 0; i < POPULATION_SIZE; i++)
            this.population.push(new Bird(this.worldLayer, i));
            
        this.population[0].brain.visualize(document.getElementById('mynetwork'));
        this.hud.updateAliveBirds(this.population.length, 16);
            
        this.gameState = 0;

        this.evolve = () => {
            this.generation++;
            this.createWorld();
            // do evolution
            var child1 = this.fittest[0].crossover(this.fittest[1]);
            var child2 = this.fittest[1].crossover(this.fittest[0]);
            this.fittest[1].brain.visualize(document.getElementById('mynetwork'));

            var child3 = child1.clone();
            child3.brain.mutate();
            var child4 = child2.clone();
            child4.brain.mutate();
            var parent1 = this.fittest[0].clone();
            var parent2 = this.fittest[1].clone();
            var child5 = this.fittest[0].clone();
            child5.brain.mutate();
            var child6 = this.fittest[1].clone();
            child6.brain.mutate();
        
            this.population = [child1, child2, child3, child4, child5, child6, parent1, parent2];
            var popuCount = this.population.length;
            for(var i = 0; i <= popuCount; i++) {
                var b = this.population[i].clone();
                b.brain.mutate();
                this.population.push(b);
            }
            this.fittest = [];

            this.gameState = 0;
            this.hud.updateAliveBirds(this.population.length, 16);
        };

        var listener = new Box2D.Dynamics.b2ContactListener;
        listener.BeginContact = (contact) => {
            if(contact.GetFixtureA().GetBody().name == "bird" && contact.GetFixtureB().GetBody().name != "bird") {
                var bird = contact.GetFixtureA().GetBody().GetUserData();
                if(bird.alive) {
                    bird.die();
                    this.population.remove(bird);

                    if(this.population.length < 2) 
                        this.fittest.push(bird);
                    
                    this.hud.updateAliveBirds(this.population.length, 16);
                }
                if(this.population.length < 1) {
                    this.gameState = 1;        
                }
            }
        }
        this.world.SetContactListener(listener);
        
        this.scheduleUpdate();
        
        //_enableDebugDraw();
    },
    update:function (dt) { 

        //dt = dt * 1.5;

        var velocityIterations = 8;
        var positionIterations = 1;

        if(this.gameState < 1) {        
            if(this.population.length > 0) {
                this.birdX = this.population[0].body.GetPosition().x;
                this.score = Math.round(this.birdX);

                if(this.score > this.highscore)
                    this.highscore = this.score;
    
                if(this.hoses[0].body1.GetPosition().x < this.birdX - winSize.width / PTM_RATIO) {
                    var firstHose = this.hoses[0];
                    var lastHose = this.hoses[this.hoses.length - 1];
                    this.hoses.shift();
                    this.generateHose(lastHose.body1.GetPosition().x * PTM_RATIO + 1000);
                    firstHose.destroy();
                }
            }

            // Instruct the world to perform a single step of simulation. It is
            // generally best to keep the time step and iterations fixed.
            this.world.Step(dt, velocityIterations, positionIterations);

            //Iterate over the bodies in the physics world
            for (var b = this.world.GetBodyList(); b; b = b.GetNext()) {
                if (b.GetUserData() != null) {
                    //Synchronize the AtlasSprites position and rotation with the corresponding body
                    var myActor = b.GetUserData().getNode();
                    myActor.x = b.GetPosition().x * PTM_RATIO;
                    myActor.y = b.GetPosition().y * PTM_RATIO;
                    //myActor.rotation = -1 * cc.radiansToDegrees(b.GetAngle());
                }
            }
            
            //this.world.DrawDebugData();
            //this.world.ClearForces();

            this.population.forEach((bird)=> {
                bird.think();
            });

            this.hud.updateScore(this.score);
    
            if(this.population.length > 0)
                this.worldLayer.x = -this.population[0].getNode().x + winSize.width / 2;            
        } else {            
            this.evolve();     
        }
    }
});
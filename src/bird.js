class Brain {
    
    /**
     * Takes in the number of input nodes, hidden node and output nodes
     * @constructor
     * @param {number} input_nodes
     * @param {number} hidden_nodes 
     * @param {number} output_nodes 
     */
    constructor(input_nodes, hidden_nodes, output_nodes) {        
        this.input_nodes = input_nodes;
        this.hidden_nodes = hidden_nodes;
        this.output_nodes = output_nodes;

        // Initialize random weights
        this.input_weights = tf.randomNormal([this.input_nodes, this.hidden_nodes]);
        this.output_weights = tf.randomNormal([this.hidden_nodes, this.output_nodes]);
    }

    predict(inputs) {        
        let output;
        tf.tidy(() => {
            let input_layer = tf.tensor(inputs, [1, this.input_nodes]);
            let hidden_layer = input_layer.matMul(this.input_weights).sigmoid();
            let output_layer = hidden_layer.matMul(this.output_weights).sigmoid();
            output = output_layer.dataSync();
        });
        return output;
    }

    mutate() {
		function fn(x) {
			if (Math.random(1) < 0.05) {
				let offset = randomGaussian() * 0.5;
				let newx = x + offset;
				return newx;
			}
			return x;
		}

		let ih = this.input_weights.dataSync().map(fn);
		let ih_shape = this.input_weights.shape;
		this.input_weights.dispose();
		this.input_weights = tf.tensor(ih, ih_shape);
		
		let ho = this.output_weights.dataSync().map(fn);
		let ho_shape = this.output_weights.shape;
		this.output_weights.dispose();
		this.output_weights = tf.tensor(ho, ho_shape);
	}
    
    clone() {
        let clonie = new Brain(this.input_nodes, this.hidden_nodes, this.output_nodes);
        clonie.dispose();
        clonie.input_weights = tf.clone(this.input_weights);
        clonie.output_weights = tf.clone(this.output_weights);
        return clonie;
    }

    visualize(container) {
        var inputLabels = [
            "x position of closest pipe",
            "top of closest pipe opening",
            "bottom of closest pipe opening",
            "bird's y position",
            "bird's y velocity",
        ];
        var outputLabels = [
            "Idle",
            "Flap",
        ];    
        // create an array with nodes
        var nodes = [];        
        for(var i = 0; i < this.input_nodes; i++) {
            nodes.push({id: 1 + i, label: inputLabels[i], shape: 'dot', font: '18px verdana black', vadjust:"left", margin:{right: 150}});
        }       
        for(var i = 0; i < this.hidden_nodes; i++) {
            nodes.push({id: 1 + this.input_nodes + i, label: '', shape: 'dot'});
        }  
        for(var i = 0; i < this.output_nodes; i++) {
            nodes.push({id: 1 + this.input_nodes + this.hidden_nodes + i, label: outputLabels[i], shape: 'dot', font: '18px verdana black'});
        }
    
        // create an array with edges
        var edges = [];
        let ih = this.input_weights.dataSync();
        for(var i = 0; i < this.input_nodes; i++) {            
            for(var j = 0; j < this.hidden_nodes; j++) {
                edges.push({
                    from: 1 + i, 
                    to: 1 + this.input_nodes + j, 
                    value: ih[i*this.input_nodes + j]
                });
            }
        }        
        let ho = this.output_weights.dataSync();
        for(var i = 0; i < this.hidden_nodes; i++) {            
            for(var j = 0; j < this.output_nodes; j++) {
                edges.push({
                    from: 1 + this.input_nodes + i, 
                    to: 1 + this.hidden_nodes + this.input_nodes + j, 
                    value: ho[i*this.hidden_nodes + j]
                });
            }
        }
    
        // create a network
        var data = {
            nodes: nodes,
            edges: edges
        };
        var options = {
            layout: {
                hierarchical: {
                    direction: 'LR',
                    sortMethod: "directed",
                    levelSeparation: 400
                }
            }
            };
        var network = new vis.Network(container, data, options);
    }
    
    dispose() {
        this.input_weights.dispose();
        this.output_weights.dispose();
    }
}

class Bird {
    constructor(scene) {
        this.scene = scene;
        this.sprite = cc.Sprite.create("#bird3.png");
        winSize = cc.director.getWinSize();

        var p = cc.p(winSize.width / 2 - 80, winSize.height * 3 / 4);

        this.sprite.x = p.x;
        this.sprite.y = p.y;
        this.scene.addChild(this.sprite);

        // Define the dynamic body.
        //Set up a 1m squared box in the physics world
        var b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(p.x / PTM_RATIO, p.y / PTM_RATIO);
        bodyDef.userData = this;
        this.body = scene.world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox(0.5, 0.5);//These are mid points for our 1m box

        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.3;
        fixtureDef.filter.groupIndex = -2;

        this.body.CreateFixture(fixtureDef);
        this.body.name = "bird";
        
        this.body.ApplyImpulse(new b2Vec2(5, 0), this.body.GetWorldCenter())
        //this.body.ApplyForce(new b2Vec2(1,0), this.body.GetWorldCenter() );

        this.brain = new Brain(5, 6, 2);
        this.alive = true;
    }

    getNode() {
        return this.sprite;
    }

    flap() {        
        if(this.body.GetLinearVelocity().y < 10 && this.body.GetPosition().y < winSize.height / PTM_RATIO) {
            this.body.ApplyImpulse(new b2Vec2(0, 8), this.body.GetWorldCenter())
            this.sprite.runAction(cc.animate(cc.animationCache.getAnimation("fly")));
        }
    }
    
    die() {
        this.alive = false;
        this.scene.world.DestroyBody(this.body);
        this.getNode().stopAllActions();
        var birdX = this.getNode().getPositionX();
        var birdY = this.getNode().getPositionY();
        var time = birdY / 2000;
        this.getNode().runAction(cc.Sequence.create(
            cc.DelayTime.create(0.1),
            cc.Spawn.create(cc.RotateTo.create(time, 90), cc.MoveTo.create(time, cc.p(birdX, 50))))
        );
        this.getNode().setOpacity(75);      
    }    

	clone() {
		var new_bird = new Bird(this.scene);
		new_bird.brain.dispose();
        new_bird.brain = this.brain.clone();
		return new_bird;
	}

	crossover(partner) {
		let parentA_in_dna = this.brain.input_weights.dataSync();
		let parentA_out_dna = this.brain.output_weights.dataSync();
		let parentB_in_dna = partner.brain.input_weights.dataSync();
		let parentB_out_dna = partner.brain.output_weights.dataSync();

		let mid = Math.floor(Math.random() * parentA_in_dna.length);
		let child_in_dna = [...parentA_in_dna.slice(0, mid), ...parentB_in_dna.slice(mid, parentB_in_dna.length)];		
		let child_out_dna = [...parentA_out_dna.slice(0, mid), ...parentB_out_dna.slice(mid, parentB_out_dna.length)];

		let child = this.clone();
		let input_shape = this.brain.input_weights.shape;
		let output_shape = this.brain.output_weights.shape;
		
		child.brain.dispose();

		child.brain.input_weights = tf.tensor(child_in_dna, input_shape);
		child.brain.output_weights = tf.tensor(child_out_dna, output_shape);
		
		return child;
	}

    think() {
        let inputs = [];
        let closest = this.scene.getClosestHose(); 
        // x position of closest pipe
        inputs[0] = map(closest.x - this.body.GetPosition().x, 0, winSize.width, 0, 1);
        // top of closest pipe opening
        inputs[1] = map(closest.down_y, 0, winSize.height, 0, 1);
        // bottom of closest pipe opening
        inputs[2] = map(closest.up_y, 0, winSize.height, 0, 1);
        // bird's y position
        inputs[3] = map(this.body.GetPosition().y, 0, winSize.height, 0, 1);
        // bird's y velocity
        inputs[4] = map(this.body.GetLinearVelocity().y, -10, 10, 0, 1);

        // Get the outputs from the network
        let action = this.brain.predict(inputs);
        // Decide to jump or not!
        if (action[1] > action[0]) {
            this.flap();
        }
    }
}
class Hud extends cc.Layer {
    constructor() {
        super();
        this.scoreLabel = ccui.Text.create("Score");
        this.scoreLabel.setColor(cc.color.WHITE);
        this.scoreLabel.setFontSize(24)
        this.scoreLabel.setPosition(20, 628);
        this.scoreLabel.setAnchorPoint(0,0);
        this.addChild(this.scoreLabel);
    
        this.highScoreLabel = ccui.Text.create("HighScore");
        this.highScoreLabel.setColor(cc.color.WHITE);
        this.highScoreLabel.setFontSize(24)
        this.highScoreLabel.setPosition(20, 588);
        this.highScoreLabel.setAnchorPoint(0,0);
        this.addChild(this.highScoreLabel);
    
        this.generationLabel = ccui.Text.create("Generation");
        this.generationLabel.setColor(cc.color.WHITE);
        this.generationLabel.setFontSize(24)
        this.generationLabel.setPosition(20, 668);
        this.generationLabel.setAnchorPoint(0,0);
        this.addChild(this.generationLabel);

        this.liveDisplay = cc.Node.create();
        this.addChild(this.liveDisplay);
    }

    updateGeneration(generation) {        
        this.generationLabel.setString("Generation: " + generation);
    }

    updateScore(score) {        
        this.scoreLabel.setString("Score:" + score);
    }

    updateHighScore(highscore) {        
        this.highScoreLabel.setString("HighScore:" + highscore);
    }

    updateAliveBirds(alive, populationSize) {     
        this.liveDisplay.removeAllChildren();   
        for(var i = 0; i < populationSize; i++) {
            var sprite = cc.Sprite.create("#bird3.png");
            
            sprite.setPosition(winSize.width - (i- Math.floor(i/8)*8) * 40 - 20, winSize.height - 20 - Math.floor(i/8)*40);

            sprite.setAnchorPoint(1,1);
            sprite.setScale(0.5);
            if(i >= alive) {
                sprite.setOpacity(50);    
            }
            this.liveDisplay.addChild(sprite);
        }
    }
}
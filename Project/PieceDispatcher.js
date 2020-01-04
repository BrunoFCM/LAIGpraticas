/**
 * Animation
 * @constructor
 * @param scene - Reference to MyScene object
 */
//TODO comments
class PieceDispatcher {

	constructor(scene) {
        this.scene = scene;
    }

    dispatchPieces(type, amount){
        let baseObject = this.scene.graph.primitives['piece'];
        
        let basePosition;
        if(type == 1){
            basePosition = [-10,0,0];
        }
        else{
            basePosition = [10,0,0];
        }

        let material;
        if(type == 1){
            material = this.scene.graph.materials['playerMaterial1'];
        }
        else{
            material = this.scene.graph.materials['playerMaterial2'];
        }
        
        let texture;
        if(type == 1){
            texture = this.scene.graph.textures['playerTexture1'];
        }
        else{
            texture = this.scene.graph.textures['playerTexture2'];
        }

        let baseAnimation;
        let animationObject = this.scene.graph.animations.get('baseAnimation');
        if(type == 1){
            baseAnimation = this.buildAnimation(animationObject, [5,0,0], 1);
        }
        else{
            baseAnimation = this.buildAnimation(animationObject, [-5,0,0], 1);
        }

        let shaderAttributes;
        if(type == 1){
            shaderAttributes = this.scene.graph.shaders['baseShader1'];
        }
        else{
            shaderAttributes = this.scene.graph.shaders['baseShader2'];
        }
        let shader = new MyShader(this.scene, shaderAttributes, this.scene.currentInstant);

        let out = [];

        for(let i = 0; i < amount; ++i){
            basePosition[1] = i;
            let piece = new MyBoardObject(this.scene, type, baseObject, basePosition, material, texture, baseAnimation, shader);
            out.push(piece);
        }

        return out;
    }

    movePiece(Piece, endPoint){
        let startPoint = Piece.basePosition;
        if(Piece.type == 1){
            startPoint[0] = -5;
        }
        else{
            startPoint[0] = 5;
        }

        let delta = endPoint;
        delta[0] -= startPoint[0];
        delta[1] -= startPoint[1];
        delta[2] -= startPoint[2];
        
        let animationObject = this.scene.graph.animations.get('playAnimation');

        Piece.baseAnimation = this.buildAnimation(animationObject, delta, 1);
    
    }
   
    removePieces(Pieces){
        for(let i = 0; i < Pieces.length; ++i){
            let Piece = Pieces[i];

            let startPoint = Piece.basePosition;
            if(Piece.type == 1){
                startPoint[0] = -5;
            }
            else{
                startPoint[0] = 5;
            }

            let delta = startPoint;
            delta[1] += 5;

            let animationObject = this.scene.graph.animations.get('removeAnimation');
            Piece.baseAnimation = this.buildAnimation(animationObject, delta, 1);
        }
    }

    dispatchConnections(type, connectionsCoordinates){
        let baseObject = this.scene.graph.primitives['connection'];

        let material;
        if(type == 1){
            material = this.scene.graph.materials['playerMaterial1'];
        }
        else{
            material = this.scene.graph.materials['playerMaterial2'];
        }
        
        let texture;
        if(type == 1){
            texture = this.scene.graph.textures['playerTexture1'];
        }
        else{
            texture = this.scene.graph.textures['playerTexture2'];
        }
        
        let shaderAttributes;
        if(type == 1){
            shaderAttributes = this.scene.graph.shaders['connectionShader1'];
        }
        else{
            shaderAttributes = this.scene.graph.shaders['connectionShader2'];
        }
        let shader = new MyShader(this.scene, shaderAttributes, this.scene.currentInstant);

        let out = [];

        for(let i = 0; i < connectionsCoordinates.length; ++i){
            let x = connectionsCoordinates[i][0];
            let y = connectionsCoordinates[i][1];
            let z = connectionsCoordinates[i][2];

            let foundConnection = this.scene.getConnectionAt(x,y,z);
            if(foundConnection){
                let changeShaderParameters = this.scene.graph.shaders['changeShader'];
                if(changeShaderParameters){
                    let changeShader = this.buildShader(changeShaderParameters);
                    foundConnection.shader = changeShader;
                }

                let changeAnimationObject = this.scene.graph.animations.get('changeAnimation');
                if(changeAnimationObject){
                    let changeAnimation = this.buildAnimation(changeAnimationObject, [x,-1,z], 1);
                    foundConnection.basePosition = [x,y,0];
                    foundConnection.baseAnimation = changeAnimation;
                }
                
                continue;
            }

            let basePosition = [x,-1,z];            

            let animationObject = this.scene.graph.animations.get('connectionAnimation');
            let baseAnimation = this.buildAnimation(animationObject, [x,y,z], 1);

            basePosition[1] = i;
            let connection = new MyBoardObject(this.scene, type, baseObject, basePosition, material, texture, baseAnimation, shader);
            out.push(connection);
        }

        return out;
    }
    
    resetStyle(){
        //get base position / get base transformation
        //get piece object / get piece shader
        //get piece material
    }

	/**
	 * @method apply
	 * Applies animation matrix to the scene
	 */
    buildAnimation(animationObject, endPoint, duration){
        if(animationObject == undefined){
            return undefined;
        }

        let animation;
        if(animationObject.type == 'linear'){
            animation = new KeyframeAnimation(this.scene, animationObject.keyframes, true, duration, endPoint);
        }
        else if(animationObject.type == 'smooth'){
            animation = new SmoothAnimation(this.scene, animationObject.keyframes, true, duration, endPoint);
        }
        return animation;
    }
}



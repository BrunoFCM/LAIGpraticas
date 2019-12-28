/**
 * Animation
 * @constructor
 * @param scene - Reference to MyScene object
 */
class AnimationGenerator {

	constructor(scene, animations) {
        this.scene = scene;
        this.animations = animations;
	}

	/**
	 * @method apply
	 * Applies animation matrix to the scene
	 */
    buildAnimation(selectedAnimation, currentInstant, endPoint, duration){
        let animationObject = this.animations.get(selectedAnimation);
        
        let animationFrames = this.buildFrames(animationObject.frames, currentInstant, endPoint);
        if(animationObject == undefined){
            return undefined;
        }
        if(animationObject.type == 'linear'){
            animation = new KeyframeAnimation(this.scene, animationFrames);
        }
        else if(animationObject.type == 'smooth'){
            animation = new SmoothAnimation(this.scene, animationFrames);
        }
    }

    buildFrames(frames, currentInstant, endPoint){
        let newFrames = [];
        for(let i = 0; i < frames.length; ++i){
            let newTranslate = frames[i].translate;
            if(newTranslate != undefined){
                newTranslate[0] *= endPoint[0];
                newTranslate[1] *= endPoint[1];
                newTranslate[2] *= endPoint[2];
            } 
            newFrames.push(new KeyframeModel(currentInstant + frames[i].instant, newTranslate, frames[i].rotate, frames[i].scale));
        }
    }
}



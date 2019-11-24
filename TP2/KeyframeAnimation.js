/**
 * KeyFrameAnimation
 * @constructor
 * @param scene - Reference to MyScene object
 * @param keyframes - Array with KeyFrameModels
 */
class KeyframeAnimation extends Animation{

	constructor(scene, keyframes) {
        super(scene);
        this.keyframes = keyframes;
        this.instant = 0;
	}

	/**
	 * @method update
	 * Updates the animation matrix with the corresponding values to the instant t
     * @param t - Time value of the instant
	 */
    update(t){
        //Reached the end of the animation
        if(t >= this.keyframes[this.keyframes.length - 1].instant){
            this.animationMatrix = this.keyframes[this.keyframes.length - 1].toMat4();
            return;
        }

        this.instant = t;

        let newFrame;
        let leftFrame, rightFrame;
        
        let elapsed_time;

        //find keyframe that comes immediately before the given instant
        for(let i = 0; i < this.keyframes.length; ++i){
            if(this.instant < this.keyframes[i].instant){
                //Found the frames to be interpolated
                if(i == 0){
                    leftFrame = KeyframeModel.origin();
                    elapsed_time = this.instant;
                }
                else{
                    leftFrame = this.keyframes[i - 1];
                    elapsed_time = this.instant - leftFrame.instant;
                }

                rightFrame = this.keyframes[i];

                break;
            }
        }
        
        newFrame = this.interpolateKeyframes(leftFrame, rightFrame, elapsed_time);
        this.animationMatrix = newFrame.toMat4();
    }

	/**
	 * @method interpolateKeyframes
	 * Given a time value, interpolates two keyframes, returning the resulting KeyframeModel
     * @param keyframe1 - First KeyframeModel
     * @param keyframe2 - Second KeyframeModel
     * @param elapsed_time - Time passed between both Keyframes
     * @returns New KeyframeModel, interpolated between both Keyframes
	 */
    interpolateKeyframes(keyframe1, keyframe2, elapsed_time){
        let deltaTime = keyframe2.instant - keyframe1.instant;
        let timeFactor = elapsed_time / deltaTime;

        //Translation
        let translation1 = keyframe1.translate;
        let translation2 = keyframe2.translate;

        let deltaTranslate = vec3.create();
        vec3.subtract(deltaTranslate, translation2, translation1);
        vec3.scale(deltaTranslate, deltaTranslate, timeFactor);

        //Rotation
        let rotation1 = keyframe1.rotate;
        let rotation2 = keyframe2.rotate;

        let deltaRotate = vec3.create();
        vec3.subtract(deltaRotate, rotation2, rotation1);
        vec3.scale(deltaRotate, deltaRotate, timeFactor);

        //Scaling
        let scaling1 = keyframe1.scale;
        let scaling2 = keyframe2.scale;

        let deltaScale = vec3.create();
        vec3.divide(deltaScale, scaling2, scaling1);
        deltaScale[0] = Math.pow(deltaScale[0], timeFactor);
        deltaScale[1] = Math.pow(deltaScale[1], timeFactor);
        deltaScale[2] = Math.pow(deltaScale[2], timeFactor);

        //Creating the new KeyframeModel
        let newTranslate = vec3.create(), newRotate = vec3.create(), newScale =  vec3.create();

        vec3.add(newTranslate, translation1, deltaTranslate);
        vec3.add(newRotate, rotation1, deltaRotate);
        vec3.multiply(newScale, scaling1, deltaScale);

        return new KeyframeModel(0, newTranslate, newRotate, newScale);
    }
}



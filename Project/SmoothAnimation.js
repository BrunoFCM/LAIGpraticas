/**
 * KeyFrameAnimation
 * @constructor
 * @param scene - Reference to MyScene object
 * @param keyframes - Array with KeyFrameModels
 */
class SmoothAnimation extends KeyframeAnimation{

	constructor(scene, keyframes, requireBuild, duration, endpoint) {
        super(scene, requireBuild);
        this.keyframes = keyframes;

        this.requireBuild = requireBuild;
        this.built = false;
        this.duration = duration;
        this.endpoint = endpoint;
    }

	/**
	 * @method update
	 * Updates the animation matrix with the corresponding values to the instant t
     * @param t - Time value of the instant
	 */
    update(t){
        if(this.requireBuild){
            this.buildFrames();
            this.requireBuild = false;
            this.built = true;
        }

        //Reached the end of the animation
        if(t >= this.keyframes[this.keyframes.length - 1].instant){
            this.animationMatrix = this.keyframes[this.keyframes.length - 1].toMat4();
            return;
        }

        this.instant = t;

        let controlPointIndex = this.keyframes.length - 4;

        //find keyframe that comes immediately before the given instant
        for(let i = 3; i <= controlPointIndex; i += 3){
            if(this.instant < this.keyframes[i].instant){
                //Found the starting point for the interpolation
                controlPointIndex = i - 3;

                break;
            }
        }

        let newFrame = this.interpolateKeyframes(controlPointIndex);
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
    interpolateKeyframes(controlPointIndex){
        let frame1;
        if(controlPointIndex < 0){
            frame1 = KeyframeModel.origin();
        }
        else{
            frame1 = this.keyframes[controlPointIndex];
        }

        let frame2 = this.keyframes[controlPointIndex + 1];
        let frame3 = this.keyframes[controlPointIndex + 2];
        let frame4 = this.keyframes[controlPointIndex + 3];

        let deltaTime = frame4.instant - frame1.instant;
        let elapsed_time = this.instant - frame1.instant;
        let timeFactor = elapsed_time / deltaTime;

        //Translation
        let newTranslate;
        if(frame1.translate != undefined && frame2.translate != undefined && frame3.translate != undefined && frame4.translate != undefined){
            newTranslate = this.bezierInterpolation(timeFactor, frame1.translate, frame2.translate, frame3.translate, frame4.translate);
        }

        //Rotation
        let newRotate;
        if(frame1.rotate != undefined && frame2.rotate != undefined && frame3.rotate != undefined && frame4.rotate != undefined){
            newRotate = this.bezierInterpolation(timeFactor, frame1.rotate, frame2.rotate, frame3.rotate, frame4.rotate);
        }

        //Scaling
        let newScale;
        if(frame1.scale != undefined && frame2.scale != undefined && frame3.scale != undefined && frame4.scale != undefined){
            newScale = this.bezierInterpolation(timeFactor, frame1.scale, frame2.scale, frame3.scale, frame4.scale);
        }

        //Creating the new KeyframeModel
        let keyframeModel = new KeyframeModel(0, newTranslate, newRotate, newScale);

        return keyframeModel;
    }

    bezierInterpolation(t,P1,P2,P3,P4){
        let newX = (1-t)*(1-t)*(1-t)*P1[0] + 3*(1-t)*(1-t)*t*P2[0] +3*(1-t)*t*t*P3[0] + t*t*t*P4[0];
        let newY = (1-t)*(1-t)*(1-t)*P1[1] + 3*(1-t)*(1-t)*t*P2[1] +3*(1-t)*t*t*P3[1] + t*t*t*P4[1];
        let newZ = (1-t)*(1-t)*(1-t)*P1[2] + 3*(1-t)*(1-t)*t*P2[2] +3*(1-t)*t*t*P3[2] + t*t*t*P4[2];
        return vec3.fromValues(newX,newY,newZ);
    }
}



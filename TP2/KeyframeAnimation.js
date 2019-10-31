/**
* Animation
* @constructor
*/
class KeyframeAnimation extends Animation{

	constructor(scene, keyframes) {
        super(scene);
        this.keyframes = keyframes;
        this.instant = 0;

        this.currentFrame = mat4.create();
	}

    update(t){
        //Reached the end of the animation
        if(this.instant >= this.keyframes[this.keyframes.length - 1].instant){
            this.animationMatrix = toMat4(this.keyframes[this.keyframes.length - 1]);
        }

        this.instant = t;

        let newFrame;


        //find keyframe that comes immediately before the given instant
        for(let i = 0; i < this.keyframes.length; ++i){
            if(this.instant < this.keyframes[i]){
                if(i == 0){
                    //origin frame
                }
                else{

                }
                //Found the frames to be interpolated
                break;
            }
            

        let elapsed_time = t - this.instant;
        //TODO
        }

        this.instant = t;
    }

    interpolateKeyframes(keyframe1, keyframe2, elapsed_time){
        let deltaTime = keyframe2.instant - keyframe1.instant;
        let timeFactor = elapsed_time / deltaTime;

        //Translation
        let translation1 = keyframe1.translation;
        let translation2 = keyframe2.translation;

        let deltaTranslate = vec3.create();
        vec3.subtract(deltaTranslate, translation2, translation1);
        vec3.scale(deltaTranslate, deltaTranslate, timeFactor);

        //Rotation
        let rotation1 = keyframe1.rotation;
        let rotation2 = keyframe2.rotation;

        let deltaRotate = vec3.create();
        vec3.subtract(deltaRotate, rotation2, rotation1);
        vec3.scale(deltaRotate, deltaRotate, timeFactor);

        //Scaling
        let scaling1 = keyframe1.scaling;
        let scaling2 = keyframe2.scaling;

        let deltaScale = vec3.create();
        vec3.divide(deltaRotate, rotation2, rotation1);
        deltaScale[0] = Math.pow(deltaScale[0], timeFactor);
        deltaScale[1] = Math.pow(deltaScale[1], timeFactor);
        deltaScale[2] = Math.pow(deltaScale[2], timeFactor);

        //Creating the new KeyframeModel
        let newTranslate = vec3.create(), newRotate = vec3.create(), newScale =  vec3.create();

        vec3.add(newTranslate, translation1, deltaTranslate);
        vec3.add(newRotate, rotation1, deltaRotate);
        vec3.multiply(newTranslate, scaling1, deltaScale);

        return KeyframeModel(0, newTranslate, newRotate, newScale);
    }

    toMat4(model){
        let newMatrix = mat4.create();

        let translate = vec3.translate(model.translate);
        let rotate = vec3.rotate(model.rotate);
        let scale = vec3.scale(model.scale);

        mat4.multiply(newMatrix, scale, newMatrix);
        mat4.multiply(newMatrix, rotate, newMatrix);
        mat4.multiply(newMatrix, translate, newMatrix);

        return newMatrix;
    }
}



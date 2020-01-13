/**
 * KeyFrameModel
 * @constructor
 * @param instant - Instant in which the Keyframe begins
 * @param translate - vec3 object corresponding to the translate component of the frame
 * @param rotate - vec3 object corresponding to the rotate component of the frame
 * @param scale - vec3 object corresponding to the scale component of the frame
 */
class KeyframeModel {

	constructor(instant, translate, rotate, scale) {
        this.instant = instant;
        this.translate = translate;
        this.rotate = rotate;
        this.scale = scale;
    }

    /**
	 * @method origin
	 * Static function that returns the KeyframeModel in the first instant of any animation 
     * @returns Default KeyframeModel
	 */
    static origin(){
        let instant = 0;
        let translate = vec3.create();
        let rotate = vec3.create();
        let scale = vec3.fromValues(1,1,1);
    
        return new KeyframeModel(instant, translate, rotate, scale);
    }

    /**
	 * @method toMat4
	 * Returns a mat4 object corresponding to the calling KeyframeModel object
     * @returns mat4 object
	 */
    toMat4(){
        let newMat4 = mat4.create();

        mat4.translate(newMat4, newMat4, this.translate);
        mat4.rotate(newMat4, newMat4, this.rotate[0], vec3.fromValues(1,0,0));
        mat4.rotate(newMat4, newMat4, this.rotate[1], vec3.fromValues(0,1,0));
        mat4.rotate(newMat4, newMat4, this.rotate[2], vec3.fromValues(0,0,1));
        mat4.scale(newMat4, newMat4, this.scale);

        return newMat4;
    }
}
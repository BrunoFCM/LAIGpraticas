/**
 * Animation
 * @constructor
 * @param scene - Reference to MyScene object
 */
class Animation {

	constructor(scene) {
        if (this.constructor === Animation) {
            throw new TypeError('Abstract class "Animation" cannot be instantiated directly.'); 
        }

        this.scene = scene;
        this.instant = 0;
        this.animationMatrix = mat4.create();
	}

	/**
	 * @method update
	 * "Virtual" function for every Animation (does nothing)
     * @param t - Time value of the instant
	 */
    update(t){}

	/**
	 * @method apply
	 * Applies animation matrix to the scene
	 */
    apply(){
        this.scene.multMatrix(this.animationMatrix);
    }
}



/**
* Animation
* @constructor
*/
class Animation {

	constructor(scene) {
        if (this.constructor === Animation) {
            throw new TypeError('Abstract class "Animation" cannot be instantiated directly.'); 
        }

        this.scene = scene;
        this.animationMatrix = mat4.create();
	}

    update(t){}

    apply(){
        this.scene.multMatrix(this.animationMatrix);
    }
}



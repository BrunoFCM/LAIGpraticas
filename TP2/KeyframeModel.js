/**
* KeyframeModel
* @constructor
*/
class KeyframeModel {

	constructor(instant, translate, rotate, scale) {
        this.instant = instant;
        this.translate = translate;
        this.rotate = rotate;
        this.scale = scale;
    }

    static origin(){
        let instant = 0;
        let translate = vec3.create();
        let rotate = vec3.create();
        let scale = vec3.fromValues(1,1,1);
    
        return new KeyframeModel(instant, translate, rotate, scale);
    }

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
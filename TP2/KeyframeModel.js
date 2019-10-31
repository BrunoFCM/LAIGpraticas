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
    
    origin(){
        let instant = 0;
        let translate = vec3.create();
        let rotate = vec3.create();
        let scale = vec3.fromValues(1,1,1);

        return new KeyframeModel(instant, translate, rotate, scale);
    }
}



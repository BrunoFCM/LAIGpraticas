/**
* MyTorus
* @constructor
*/
class MyTorus extends CGFobject {
    constructor(scene, id, inner, outer, slices, loops) {
        super(scene);

        this.id = id;
        
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var innerAng = 0;
        var outerAng = 0;

        var innerAngInc = 2 * Math.PI / this.slices;
        var outerAngInc = 2 * Math.PI / this.loops;

        for(var i = 0; i < this.loops; ++i){
            var startX = this.outer * Math.cos(outerAng);
            var startY = this.outer * Math.sin(outerAng);

            for(var j = 0; j < this.slices; ++j){
                let innerX = Math.cos(outerAng) * Math.cos(innerAng);
                let innerY = Math.sin(outerAng) * Math.cos(innerAng);
                let innerZ = Math.sin(innerAng);

                this.normals.push(innerX,innerY,innerZ);
                
                //this.texCoords.push(thetaAng / Math.PI / 2 * Math.cos(alphaAng), thetaAng / Math.PI / 2 * Math.sin(alphaAng));

                let x = startX + this.inner * innerX;
                let y = startY + this.inner * innerY;
                let z = this.inner * innerZ;

                this.vertices.push(x,y,z);
                
                this.indices.push(this.slices * i + j,
                                    (this.slices * (i - 1) + j + this.slices * this.loops) % (this.slices * this.loops),
                                    this.slices * i + (j - 1 + this.slices) % this.slices);
            
                this.indices.push(this.slices * i + j,
                    (this.slices * (i + 1) + j) % (this.slices * this.loops),
                    this.slices * i + (j + 1) % this.slices);
                    
                innerAng += innerAngInc;
            }

            innerAng = 0;
            outerAng += outerAngInc;
        }

        

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}


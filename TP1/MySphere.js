/**
* MySphere
* @constructor
*/
class MySphere extends CGFobject {
    constructor(scene, id, radius, slices, stacks) {
        super(scene);

        this.id = id;
        
        this.slices = slices;
        this.stacks = stacks;
        this.radius = radius;
        this.initBuffers();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var alphaAng = 0;
        var thetaAng = 0;

        var alphaAngInc = 2 * Math.PI / this.slices;
        var thetaAngInc = Math.PI / 2 / this.stacks;

        for(var i = 0; i <= this.stacks * 2; ++i){
            for(var j = 0; j < this.slices; ++j){
                let x = Math.sin(thetaAng) * Math.cos(alphaAng);
                let y = Math.sin(thetaAng) * Math.sin(alphaAng);
                let z = Math.cos(thetaAng);

                this.normals.push(x,y,z);
                
                this.texCoords.push(thetaAng / Math.PI / 2 * Math.cos(alphaAng), thetaAng / Math.PI / 2 * Math.sin(alphaAng));

                x *= this.radius;
                y *= this.radius;
                z *= this.radius;

                this.vertices.push(x,y,z);

                if(i == 0 || i == this.stacks * 2){
                    break;
                }
                
                this.indices.push(i == 1 ? 0 : (i - 2) * this.slices + j + 1,
                                    (i - 1) * this.slices + j + 1,
                                    (i - 1) * this.slices + (j + 1) % this.slices + 1);
            

                this.indices.push((i - 1) * this.slices + j + 1,
                                    (i - 1) * this.slices + (j - 1) % this.slices + 1,
                                    i == this.stacks * 2 - 1 ? this.stacks * 2 : this.i * this.slices + j + 1);
            

                alphaAng += alphaAngInc;
            }

            alphaAng = 0;
            thetaAng += thetaAngInc;
        }

        

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}



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

        for(var i = 0; i <= this.stacks; ++i){
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

                if(thetaAng == 0){
                    break;
                }
                
                this.indices.push(i == 1 ? 0 : (i - 2) * this.slices + j + 1,
                                    (i - 1) * this.slices + j + 1,
                                    (i - 1) * this.slices + (j + 2) % (this.slices + 1));
                
                if(i != 1){
                    this.indices.push(i == 1 ? 0 : (i - 2) * this.slices + (j + 2) % (this.slices + 1),
                                        (i - 2) * this.slices + j + 1,
                                        (i - 1) * this.slices + (j + 2) % (this.slices + 1));
                }

                alphaAng += alphaAngInc;
            }

            alphaAng = 0;
            thetaAng += thetaAngInc;
        }

        

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

        /*
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var alphaAng = 0;
        var thetaAng = 0;

        var alphaAngInc = 2 * Math.PI / this.slices;
        var thetaAngInc = Math.PI / this.stacks;

        this.vertices.push(Math.sin(thetaAng) * Math.cos(alphaAng), Math.cos(thetaAng), Math.sin(thetaAng) * Math.sin(alphaAng));
        this.normals.push(Math.sin(thetaAng) * Math.cos(alphaAng), Math.cos(thetaAng), Math.sin(thetaAng) * Math.sin(alphaAng));
        this.texCoords.push(0, 0);

        thetaAng += thetaAngInc;
        //TODO FIX THE TEXCOORDS

        for(var i = 1; i < this.stacks; ++i){
            alphaAng = 0;

            for(var j = 1; j <= this.slices; ++j){
                this.vertices.push(Math.sin(thetaAng) * Math.cos(alphaAng), Math.cos(thetaAng), Math.sin(thetaAng) * Math.sin(alphaAng));
                this.normals.push(Math.sin(thetaAng) * Math.cos(alphaAng), Math.cos(thetaAng), Math.sin(thetaAng) * Math.sin(alphaAng));
                this.texCoords.push(alphaAng / (Math.PI * 2),
                                    thetaAng / (Math.PI));

                this.indices.push((this.slices + 1) * (i - 1) + j,
                                  (i == 1) ? 0 : (this.slices + 1) * (i - 2) + j,
                                  (this.slices + 1) * (i - 1) + j + 1);
          
                                  
                this.indices.push((this.slices + 1) * (i - 1) + j,
                                  (this.slices + 1) * (i - 1) + j + 1,
                                  (i == this.stacks - 1) ? (this.stacks - 1) * (this.slices + 1) + 1 : (this.slices + 1) * i + j + 1);

                alphaAng += alphaAngInc;
            }

            this.vertices.push(Math.sin(thetaAng) * Math.cos(0), Math.cos(thetaAng), Math.sin(thetaAng) * Math.sin(0));
            this.normals.push(Math.sin(thetaAng) * Math.cos(0), Math.cos(thetaAng), Math.sin(thetaAng) * Math.sin(0));
            this.texCoords.push(1, thetaAng / (Math.PI));

            thetaAng += thetaAngInc;
        }

        this.vertices.push(0, -1, 0);
        this.normals.push(0 , -1 ,0);
        this.texCoords.push(0, 1);
    }
    */
}



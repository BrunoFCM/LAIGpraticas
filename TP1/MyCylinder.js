/**
* MyCylinder
* @constructor
*/
class MyCylinder extends CGFobject {
    constructor(scene, slices, stacks) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var ang = 0;
        var alphaAng = 2 * Math.PI/this.slices;

        for(var i = 0; i < 2 * this.slices; ++i){

            this.vertices.push(Math.cos(ang), 0, -Math.sin(ang));
            this.vertices.push(Math.cos(ang), 1, -Math.sin(ang));

            this.normals.push(Math.cos(ang), Math.cos(Math.PI/4.0), -Math.sin(ang));
            this.normals.push(Math.cos(ang), Math.cos(Math.PI/4.0), -Math.sin(ang));

            this.texCoords.push(i / 2 / this.slices, 1);
            this.texCoords.push(i / 2 / this.slices, 0);

            this.indices.push(i, i+2, i+1);

            ++i;

            this.indices.push(i, i+1, i+2);

            ang += alphaAng;
            texAng += texAlpha;
        }
        this.vertices.push(1,0,0);  this.texCoords.push(1, 1);   this.normals.push(1,0,0);
        this.vertices.push(1,1,0);  this.texCoords.push(1, 0);   this.normals.push(1,0,0);

        this.vertices.push(0,0,0);
        this.vertices.push(0,1,0);
        this.normals.push(0,-1,0);
        this.normals.push(0,1,0);
        this.texCoords.push(0.5,0.5);
        this.texCoords.push(0.5,0.5);

        ang = 0;
        
        var texAng = 0;
        var texAlpha = Math.PI * 2 / this.slices;

        for(var i = 2 * this.slices + 4; i < 4 * this.slices + 4; ++i){

            this.vertices.push(Math.cos(ang), 0, -Math.sin(ang));
            this.vertices.push(Math.cos(ang), 1, -Math.sin(ang));

            this.normals.push(0,-1,0);
            this.normals.push(0,1,0);

            this.texCoords.push(0.5 + Math.cos(texAng) / 2,0.5 + Math.sin(texAng) / 2);
            this.texCoords.push(0.5 + Math.cos(texAng) / 2,0.5 + Math.sin(texAng) / 2);

            this.indices.push(i, 2 * this.slices + 2, i + 2);

            ++i;

            this.indices.push(i, i + 2, 2 * this.slices + 3);

            ang+=alphaAng;
            texAng += texAlpha;
        }

        this.vertices.push(1,0,0);  this.texCoords.push(0.5 + Math.cos(texAng) / 2,0.5 + Math.sin(texAng) / 2);   this.normals.push(0,-1,0);
        this.vertices.push(1,1,0);  this.texCoords.push(0.5 + Math.cos(texAng) / 2,0.5 + Math.sin(texAng) / 2);   this.normals.push(0,1,0);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
    
    updateBuffers(complexity){
        this.slices = 3 + Math.round(9 * complexity); //complexity varies 0-1, so slices varies 3-12

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}



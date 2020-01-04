/**
* MySphere
* @constructor
 * @param scene - Reference to MyScene object
 * @param id - Id of the object
 * @param radius - Radius of the sphere
 * @param slices - Slices in the object
 * @param stacks - Stacks in the object
*/
//TODO COmments
class MyCircle extends CGFobject {
    constructor(scene, radius, slices) {
        super(scene);
        
        this.slices = slices;
        this.radius = radius;
        this.initBuffers();
    }

	/**
	 * @method initBuffers
	 * Sets values for vertices, normals and texCoords
	 */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var alphaAng = Math.PI / 8;

        var alphaAngInc = 2 * Math.PI / this.slices;
        
        this.normals.push(0,0,1);
        this.texCoords.push(0.5, 0.5);
        this.vertices.push(0,0,0);

        for(var i = 0; i <= this.slices; ++i){
            //Normalized distances in the different axis (used in the normals and texCoords)
            let x = Math.cos(alphaAng);
            let y = Math.sin(alphaAng);

            this.normals.push(0,0,1);
            
            this.texCoords.push(x / 2 + 0.5, y / 2 + 0.5);

            //Actual distances in the different axis (for the vertices)
            x *= this.radius;
            y *= this.radius;

            this.vertices.push(x,y,0);
            
            this.indices.push(0, i, i + 1);

            alphaAng += alphaAngInc;
        }

        

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}



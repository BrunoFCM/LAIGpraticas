/**
* MyTorus
* @constructor
 * @param scene - Reference to MyScene object
 * @param id - Id of the object
 * @param inner - Inner radius of the torus
 * @param outer - Outer radius of the torus
 * @param slices - Slices in the object
 * @param loops - Loops in the object
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

	/**
	 * @method initBuffers
	 * Sets values for vertices, normals and texCoords
	 */
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        var innerAng = 0;
        var outerAng = 0;

        var innerAngInc = 2 * Math.PI / this.slices;
        var outerAngInc = 2 * Math.PI / this.loops;

        for(var i = 0; i <= this.loops; ++i){
            var startX = this.outer * Math.cos(outerAng);
            var startY = this.outer * Math.sin(outerAng);

            for(var j = 0; j <= this.slices; ++j){
                //Normalized distances in each axis of the inner circle (for the normals and texCoords)
                let innerX = Math.cos(outerAng) * Math.cos(innerAng);
                let innerY = Math.sin(outerAng) * Math.cos(innerAng);
                let innerZ = Math.sin(innerAng);

                this.normals.push(innerX,innerY,innerZ);
                
                this.texCoords.push((outerAng / Math.PI > 1) ? 2 - outerAng / Math.PI : outerAng / Math.PI, (innerAng / Math.PI > 1) ? 2 - innerAng / Math.PI : innerAng / Math.PI);

                //Actual distances of the vertexes
                let x = startX + this.inner * innerX;
                let y = startY + this.inner * innerY;
                let z = this.inner * innerZ;

                this.vertices.push(x,y,z);
                
                innerAng += innerAngInc;

                //Skip the the last loop and last vertex of every other loop 
                if(j == this.slices || i == this.loops){
                    continue;
                }
                
                this.indices.push((this.slices + 1) * i + j,
                    (this.slices + 1) * (i + 1) + j,
                    (this.slices + 1) * i + j + 1);
            
                this.indices.push((this.slices + 1) * i + j + 1,
                    (this.slices + 1) * (i + 1) + j,
                    (this.slices + 1) * (i + 1) + j + 1);
                    
            }

            innerAng = 0;
            outerAng += outerAngInc;
        }

        

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}



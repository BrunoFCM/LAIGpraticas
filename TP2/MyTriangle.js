/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of Triangle in X
 * @param y - Scale of Triangle in Y
 */
class MyTriangle extends CGFobject {
	constructor(scene, id, x1, x2, x3, y1, y2, y3, z1, z2, z3) {
		super(scene);

		this.id = id;

		this.x1 = x1;
        this.x2 = x2;
        this.x3 = x3;
		this.y1 = y1;
        this.y2 = y2;
        this.y3 = y3;
        this.z1 = z1;
        this.z2 = z2;
        this.z3 = z3;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3   //2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
		];


        let vector1 = vec3.fromValues(this.x1 - this.x2, this.y1 - this.y2, this.z1 - this.z2);
        let vector2 = vec3.fromValues(this.x2 - this.x3, this.y2 - this.y3, this.z2 - this.z3);

        let normal = vec3.create();

        vec3.cross(normal, vector1, vector2);

        vec3.normalize(normal, normal);

		this.normals = [
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2]
		];
		
		/*
		Texture coords (s,t)
		+----------> s
        |
        |
		|
		v
        t
        */

		this.texCoords = [
			0, 0,
			1, 1,
			0, 0.5
		]
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
    }
	
	/**
	 * @method updateTexCoords
	 * Updates texCoords according to the length_s/length_t parameters
	 * @param length_s - horizontal length of the texture
	 * @param length_t - vertical length of the texture
	 */
    updTexCoords(length_s, length_t){
        let aVec = vec3.fromValues(this.x1 - this.x2, this.y1 - this.y2, this.z1 - this.z2);
        let bVec = vec3.fromValues(this.x2 - this.x3, this.y2 - this.y3, this.z2 - this.z3);
        let cVec = vec3.fromValues(this.x3 - this.x1, this.y3 - this.y1, this.z3 - this.z1);

        let a = vec3.length(aVec);
        let b = vec3.length(bVec);
        let c = vec3.length(cVec);

        let alphaCos = (a*a - b*b + c*c) / (2*a*c);
        
        let s1 = a / length_s;

        let s2 = c * alphaCos / length_s;
        let t2 = c * Math.sqrt(1 - alphaCos * alphaCos) / length_t;

        let newTexCoords = [
            0,0,
            s1,0,
            s2,t2
		];
		
		this.updateTexCoords(newTexCoords);
    }
}


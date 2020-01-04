/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MyRectangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2) {
		super(scene);

		this.id = id;

		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;

		this.initBuffers();
	}
	
	/**
	 * @method initBuffers
	 * Sets values for vertices, normals and texCoords
	 */
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y1, 0,	//1
			this.x1, this.y2, 0,	//2
			this.x2, this.y2, 0		//3
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
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
			1, 0,
			0, 1,
			1, 1
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
		let length = -Math.abs(this.x2 - this.x1);
		let height = -Math.abs(this.y2 - this.y1);
		
		let newTexCoords = [
			0,0,
			length / length_s, 0,
			0, height / length_t,
			length / length_s, height / length_t	
        ];
        this.updateTexCoords(newTexCoords);
    }
}

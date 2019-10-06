/**
* MyCylinder
* @constructor
*/
class MyCylinder extends CGFobject {

	constructor(scene, id, base, top, height, slices, stacks) {
		super(scene);
		this.height = height;
		this.bradius = base;
		this.tradius = top;
		this.slices = slices;
		this.stacks = stacks;
		this.id = id;
		this.initBuffers();
	};

	initBuffers() {

		var ang = 2 * Math.PI / this.slices;
		var currRadius = this.bradius;
		var radiusInc = (this.tradius - this.bradius) / this.stacks;

		this.vertices = new Array();
		this.indices = new Array();
		this.normals = new Array();
		this.texCoords = new Array();

		var deltaS = 1 / this.slices;
		var deltaT = 1 / this.stacks;

		var depth = this.height / this.stacks;

		for (let i = 0; i <= this.stacks; i++) {
			for (let j = 0; j <= this.slices; j++) {
				this.vertices.push(currRadius * Math.cos(j * ang), currRadius * Math.sin(j * ang), i * depth);
				this.normals.push(currRadius * Math.cos(j * ang), currRadius * Math.sin(j * ang), 0);
				this.texCoords.push(j * deltaS, i * deltaT);

				if (i < this.stacks) {
					this.indices.push((i * this.slices) + j + i, (i * this.slices) + this.slices + j + 1 + i, i * (this.slices) + this.slices + j + i);
					this.indices.push((i * this.slices) + j + i, (i * this.slices) + j + 1 + i, i * (this.slices) + this.slices + j + 1 + i);
				}
			}
			currRadius += radiusInc;
		}

		//------------------LIDS-----------------------------------------------------

		// if (true) { //Z++
		// 	this.vertices.push(0, 0, this.height);
		// 	this.normals.push(0, 0, 1);
		// 	this.texCoords.push(0.5, 0.5);

		// 	let centerVertIdx = this.vertices.length / 3 - 1;


		// 	for (let i = 0; i < this.slices; i++) {
		// 		this.vertices.push(this.tradius * Math.cos(i * ang), this.tradius * Math.sin(i * ang), this.height);
		// 		this.normals.push(0, 0, 1);
		// 		this.texCoords.push(Math.cos(i * ang) / 2 + 0.5, 1 - (Math.sin(i * ang) / 2 + 0.5));

		// 		this.indices.push(centerVertIdx + 0, centerVertIdx + i + 1, centerVertIdx + i + 2);
		// 	}


		// 	this.vertices.push(this.tradius * 1, 0, this.height);
		// 	this.normals.push(0, 0, 1);
		// 	this.texCoords.push(1, 0.5);

		// }

		// if (true) { //Z--
		// 	this.vertices.push(0, 0, 0);
		// 	this.normals.push(0, 0, -1);
		// 	this.texCoords.push(0.5, 0.5);

		// 	let centerVertIdx = this.vertices.length / 3 - 1;


		// 	for (let i = 0; i < this.slices; i++) {
		// 		this.vertices.push(this.bradius * Math.cos(i * ang), this.bradius * Math.sin(i * ang), 0);
		// 		this.normals.push(0, 0, -1);
		// 		this.texCoords.push(Math.cos(i * ang) / 2 + 0.5, 1 - (Math.sin(i * ang) / 2 + 0.5));

		// 		this.indices.push(centerVertIdx + 0, centerVertIdx + i + 2, centerVertIdx + i + 1);
		// 	}

		// 	this.vertices.push(this.bradius * 1, 0, 0);
		// 	this.normals.push(0, 0, -1);
		// 	this.texCoords.push(1, 0.5);

		// }

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	};
    
    updateBuffers(complexity){
        this.slices = 3 + Math.round(9 * complexity); //complexity varies 0-1, so slices varies 3-12

        // reinitialize buffers
        this.initBuffers();
        this.initNormalVizBuffers();
    }
}



/**
 * Plane
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class Cylinder2 extends CGFobject {
	constructor(scene, base, top, height, slices, stacks) {
		super(scene);

        this.slices = slices;
        this.stacks = stacks;
        this.base = base;
        this.top = top;
        this.height = height;

		this.initBuffers();
	}
	
	initBuffers() {
        let extendedBase = 1.33 * this.base;
        let extendedTop = 1.33 * this.top;

        this.controlPoints1 = [
			[
                [0, -this.base, 0, 1],	    //0
                [-extendedBase, -this.base, 0, 1],	//1
                [-extendedBase, this.base, 0, 1],	//2
                [0, this.base, 0, 1]	    //3
            ],
            [
                [0, -this.top, this.height, 1],	    //0
                [-extendedTop, -this.top, this.height, 1],	//1
                [-extendedTop, this.top, this.height, 1],	//2
                [0, this.top, this.height, 1]	    //3
            ]
		];
        this.controlPoints2 = [
			[
                [0, this.base, 0, 1],	    //0
                [extendedBase, this.base, 0, 1],	//1
                [extendedBase, -this.base, 0, 1],	//2
                [0, -this.base, 0, 1]	    //3
            ],
            [
                [0, this.top, this.height, 1],	    //0
                [extendedTop, this.top, this.height, 1],	//1
                [extendedTop, -this.top, this.height, 1],	//2
                [0, -this.top, this.height, 1]	    //3
            ]
		];

        this.surface1 = new CGFnurbsSurface(1,3,this.controlPoints1);

        this.object1 = new CGFnurbsObject(this.scene, this.stacks, this.slices / 2, this.surface1);

        this.surface2 = new CGFnurbsSurface(1,3,this.controlPoints2);

        this.object2 = new CGFnurbsObject(this.scene, this.stacks, this.slices / 2, this.surface2);
    }
    
    display(){
        this.object1.display();
        this.object2.display();
    }
}


/**
 * Cylinder2
 * @constructor
 * @param scene - Reference to MyScene object
 * @param base - Radius of the base lid
 * @param top - Radius of the top lid
 * @param height - Height of the cylinder
 * @param slices - Number of slices in the cylinder
 * @param stacks - Number of stacks in the cylinder
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
	
	/**
	 * @method initBuffers
	 * Initializes the surfaces with the correct control points and creates the corresponding nurbsObject's
	 */
	initBuffers() {
        let extendedBase = 1.33 * this.base;
        let extendedTop = 1.33 * this.top;

        this.controlPoints1 = [
			[
                [-this.base, 0, 0, 1],	    //0
                [-this.base, extendedBase, 0, 1],	//1
                [this.base, extendedBase, 0, 1],	//2
                [this.base, 0, 0, 1]	    //3
            ],
            [
                [-this.base, 0, this.height, 1],	    //0
                [-this.base, extendedBase, this.height, 1],	//1
                [this.base, extendedBase, this.height, 1],	//2
                [this.base, 0, this.height, 1]	    //3
            ]
		];
        this.controlPoints2 = [
			[
                [this.top, 0, 0, 1],	    //3
                [this.top, -extendedTop, 0, 1],	//2
                [-this.top, -extendedTop, 0, 1],	//1
                [-this.top, 0, 0, 1]	    //0
            ],
            [
                [this.top, 0, this.height, 1],	    //3
                [this.top, -extendedTop, this.height, 1],	//2
                [-this.top, -extendedTop, this.height, 1],	//1
                [-this.top, 0, this.height, 1]	    //0
            ]
		];

        this.surface1 = new CGFnurbsSurface(1,3,this.controlPoints1);

        this.object1 = new CGFnurbsObject(this.scene, this.stacks, this.slices / 2, this.surface1);

        this.surface2 = new CGFnurbsSurface(1,3,this.controlPoints2);

        this.object2 = new CGFnurbsObject(this.scene, this.stacks, this.slices / 2, this.surface2);
    }

    /**
	 * @method display
	 * Displays the cylinder in the scene
	 */
    display(){
        this.object1.display();
        this.object2.display();
    }
}


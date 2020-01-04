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
class MyDefaultConnection extends CGFobject {
    constructor(scene) {
        super(scene);
        
        //Formulas taken from https://rechneronline.de/pi/octagon.php
        this.edgeLength = 1 / (1 + Math.sqrt(2));
        this.initObjects();
    }
    
    initObjects(){
        this.top = new MyRectangle(this.scene, 0, 0, this.edgeLength, 0, this.edgeLength);
        this.side = new MyRectangle(this.scene, 0, 0, this.edgeLength, 0, 0.4);
    }

    display(){
        this.scene.pushMatrix()
        this.scene.translate(0,0,0.2);
        this.scene.rotate(Math.PI / 4, 0, 0, 1);

        this.scene.pushMatrix();
        this.scene.translate(-this.edgeLength / 2, -this.edgeLength / 2,0.2);
        this.top.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-this.edgeLength / 2, this.edgeLength / 2,-0.2);
        this.scene.rotate(Math.PI, 1, 0, 0);
        this.top.display();
        this.scene.popMatrix();

        for(let i = 0; i < 4; ++i){
            this.scene.pushMatrix();
            this.scene.rotate(Math.PI / 2 * i, 0, 0, 1);
            this.scene.translate(0,this.edgeLength / 2,0);
            this.scene.rotate(-Math.PI / 2, 1, 0, 0);
            this.scene.translate(-this.edgeLength / 2, -0.2, 0);
            this.side.display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }
}



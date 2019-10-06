var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var COMPONENTS_INDEX = 8;

/**
 * MySceneGraph class, representing the scene graph.
 */
class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "lxs")
            return "root tag <lxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }

        this.log("all parsed");
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        // Get default of the views.
        var viewsDefault = this.reader.getString(viewsNode, 'default')
        if (viewsDefault == null)
            return "no default defined for views";

        this.idDefault = viewsDefault;

        var children = viewsNode.children;

        this.views = [];

        var grandChildren = [];

        if(children.length <= 0) {
            return "There must be at least one defined view";
        }

        // Any number of views.
        for (var i = 0; i < children.length; i++) {

            // Validate the view type
            if (children[i].nodeName != 'perspective' && children[i].nodeName != 'ortho') {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current view.
            var viewId = this.reader.getString(children[i], 'id');
            if (viewId == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.views[viewId] != null)
                return "ID must be unique for each view (conflict: ID = " + viewId + ")";

            var viewType = children[i].nodeName;
            grandChildren = children[i].children;

            // Retrieves the view parameters.
            // near
            var near = this.reader.getFloat(children[i], 'near');
            if (!(near != null && !isNaN(near)))
                return "unable to parse near of the view parameters for ID = " + viewId;

            // far
            var far = this.reader.getFloat(children[i], 'far');
            if (!(far != null && !isNaN(far)))
                return "unable to parse far of the view parameters for ID = " + viewId;

            if (grandChildren.length < 2 || 
                (grandChildren.length > 2 && viewType == 'perspective') || 
                (grandChildren.length > 3 && viewType == 'ortho')){

                this.onXMLMinorError("unexpected number of grandchildren of the view for ID = " + viewId);
                continue;
            }
            
            //check for "from"
            if (grandChildren[0].nodeName != "from") {
                this.onXMLMinorError("unexpected tag \"" + grandChildren[0].nodeName + "\" of grandchild of the view for ID = " + viewId);
                continue;
            }

            // x from
            var xFrom = this.reader.getFloat(grandChildren[0], 'x');
            if (!(xFrom != null && !isNaN(xFrom)))
                return "unable to parse xFrom of the view parameters for ID = " + viewId;
        
            // y from
            var yFrom = this.reader.getFloat(grandChildren[0], 'y');
            if (!(yFrom != null && !isNaN(yFrom)))
                return "unable to parse yFrom of the view parameters for ID = " + viewId;
                
            // z from
            var zFrom = this.reader.getFloat(grandChildren[0], 'z');
            if (!(zFrom != null && !isNaN(zFrom)))
                return "unable to parse zFrom of the view parameters for ID = " + viewId;

            var fromVec = new vec4.fromValues(xFrom, yFrom, zFrom);

            //check for "to"
            if (grandChildren[1].nodeName != "to") {
                this.onXMLMinorError("unexpected tag \"" + grandChildren[1].nodeName + "\" of grandchild of the view for ID = " + viewId);
                continue;
            }

            // x to
            var xTo = this.reader.getFloat(grandChildren[1], 'x');
            if (!(xTo != null && !isNaN(xTo)))
                return "unable to parse xTo of the view parameters for ID = " + viewId;
        
            // y to
            var yTo = this.reader.getFloat(grandChildren[1], 'y');
            if (!(yTo != null && !isNaN(yTo)))
                return "unable to parse yTo of the view parameters for ID = " + viewId;
                
            // z to
            var zTo = this.reader.getFloat(grandChildren[1], 'z');
            if (!(zTo != null && !isNaN(zTo)))
                return "unable to parse zTo of the view parameters for ID = " + viewId;
                
            var toVec = new vec4.fromValues(xTo, yTo, zTo);

            // Specifications for the current view.
            if (viewType == 'perspective'){
                // angle
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the view parameters for ID = " + viewId;

                var persp = new CGFcamera(angle, near, far, fromVec, toVec);
    
                this.views[this.views.length < 1 ? 1 : this.views.length] = persp;
            }
            else {
                // left
                var left = this.reader.getFloat(children[i], 'left');
                if (!(left != null && !isNaN(left)))
                    return "unable to parse left of the view parameters for ID = " + viewId;

                // right
                var right = this.reader.getFloat(children[i], 'right');
                if (!(right != null && !isNaN(right)))
                    return "unable to parse right of the view parameters for ID = " + viewId;
                    
                // top
                var top = this.reader.getFloat(children[i], 'top');
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the view parameters for ID = " + viewId;
                    
                // bottom
                var bottom = this.reader.getFloat(children[i], 'bottom');
                if (!(bottom != null && !isNaN(bottom)))
                    return "unable to parse bottom of the view parameters for ID = " + viewId;

                var up;
                //Checks for "up" grandchild
                if (grandChildren.length == 3){
                    // x up
                    var xUp = this.reader.getFloat(grandChildren[2], 'x');
                    if (!(xUp != null && !isNaN(xUp)))
                        return "unable to parse xTo of the view parameters for ID = " + viewId;
                
                    // y up
                    var yUp = this.reader.getFloat(grandChildren[2], 'y');
                    if (!(yUp != null && !isNaN(yUp)))
                        return "unable to parse yUp of the view parameters for ID = " + viewId;
                        
                    // z up
                    var zUp = this.reader.getFloat(grandChildren[2], 'z');
                    if (!(zUp != null && !isNaN(zUp)))
                        return "unable to parse zUp of the view parameters for ID = " + viewId;
                        
                    up = new vec3.fromValues(xUp, yUp, zUp);
                }
                else {
                    //default up value
                    up = new vec3.fromValues(0,1,0);
                }

                var orth = new CGFcameraOrtho( left, right, bottom, top, near, far, from, to, up );

                this.views[this.views.length < 1 ? 1 : this.views.length].push(orth);
            }

            this.scene.viewList[viewId] = this.views.length - 1;
        }

        this.log("Parsed views");
        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");

            enableLight = aux || 1;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[i] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        let children = texturesNode.children;

        this.textures = [];
        let numTextures = 0;

        if(children.length == 0){
            this.onXMLMinorError("No Textures.");
        }

        for (let i = 0; i < children.length; i++){
            let textureId = this.reader.getString(children[i], 'id');
            let textureFile = this.reader.getString(children[i], 'file');
            let png = textureFile.search(".png");
            let jpg = textureFile.search(".jpg");
            if (png == -1 && jpg == -1){
                return "Texture must be either a PNG or a JPG";
            }
            if (textureId == null){
                return "no ID defined for texture";
            }

            // Checks for repeated IDs.
            if (this.textures[textureId] != null){
                return "ID must be unique for each light (conflict: ID = " + textureId + ")";
            }

            let filep = children[i].getAttribute("file");
            //this.textures[textureId] = textureFile;
            this.textures[textureId] = new CGFtexture(this.scene, filep);
            console.log(this.textures[textureId]);
        }
            

        //For each texture in textures block, check ID and file URL
        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * Material = [shininess, emission values, ambient values, difuse values, specular values]
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = [];

        var grandChildren = [];
        var nodeNames = [];

        if(children.length == 0){
            this.onXMLMinorError("No Materials.");
        }

        // Any number of materials.
        for (let i = 0; i < children.length; i++) {
            let global = [];

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            let materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            //Continue here
            this.materials[materialID] = new CGFappearance(this.scene);
            let materialShininess = this.reader.getFloat(children[i], 'shininess');
            this.materials[materialID].setShininess(materialShininess);

            grandChildren = children[i].children;

            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < grandChildren.length; j++) {
                if (grandChildren[j].nodeName != "emission" && grandChildren[j].nodeName != "diffuse" && grandChildren[j].nodeName != "specular" && grandChildren[j].nodeName != "ambient") {
                this.onXMLMinorError("unknown tag <" + grandChildren[j].nodeName + ">");
                continue;
                }
                switch(grandChildren[j].nodeName){
                    case "emission":
                        this.materials[materialID].setEmission(parseFloat(grandChildren[j].getAttribute("r")), parseFloat(grandChildren[j].getAttribute("g")), parseFloat(grandChildren[j].getAttribute("b")), parseFloat(grandChildren[j].getAttribute("a")));
                        break;
                    case "ambient":
                        this.materials[materialID].setAmbient(parseFloat(grandChildren[j].getAttribute("r")), parseFloat(grandChildren[j].getAttribute("g")), parseFloat(grandChildren[j].getAttribute("b")), parseFloat(grandChildren[j].getAttribute("a")));
                        break;
                    case "diffuse":
                        this.materials[materialID].setDiffuse(parseFloat(grandChildren[j].getAttribute("r")), parseFloat(grandChildren[j].getAttribute("g")), parseFloat(grandChildren[j].getAttribute("b")), parseFloat(grandChildren[j].getAttribute("a")));
                        break;
                    case "specular":
                        this.materials[materialID].setSpecular(parseFloat(grandChildren[j].getAttribute("r")), parseFloat(grandChildren[j].getAttribute("g")), parseFloat(grandChildren[j].getAttribute("b")), parseFloat(grandChildren[j].getAttribute("a")));
                        break;
                
                }
            }
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = [];

        var grandChildren = [];

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            grandChildren = children[i].children;
            // Specifications for the current transformation.

            var transfMatrix = mat4.create();

            for (var j = 0; j < grandChildren.length; j++) {
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                    let x = parseFloat(grandChildren[j].getAttribute("x"));
                    let y = parseFloat(grandChildren[j].getAttribute("y"));
                    let z = parseFloat(grandChildren[j].getAttribute("z"));
                    if (x == null || y == null || z == null) {
                        this.onXMLMinorError(currChild.getAttribute("id") + " has one or more invalid '" + currGrandchild.nodeName + "' xyz values, using default value x = y = z = " + DEFAULT_SCALE_VALUE);
                        grandChildren[j].setAttribute("x", DEFAULT_SCALE_VALUE);
                        grandChildren[j].setAttribute("y", DEFAULT_SCALE_VALUE);
                        grandChildren[j].setAttribute("z", DEFAULT_SCALE_VALUE);
                    }
                    let vector1 = vec3.fromValues(parseFloat(grandChildren[j].getAttribute("x")), parseFloat(grandChildren[j].getAttribute("y")), parseFloat(grandChildren[j].getAttribute("z")));
                    mat4.scale(transfMatrix, transfMatrix, vector1);               
                        
                        break;
                    case 'rotate':{
                        // angle
                         let angle = parseFloat(grandChildren[j].getAttribute("angle"));
                         let axis = grandChildren[j].getAttribute("axis");
                         if (angle == null) {
                            let defAngle = 0;
                            this.onXMLMinorError(children[i].getAttribute("id") + " has an invalid angle value, using default value angle = " + defAngle);
                            grandChildren[j].setAttribute("angle", defAngle);
                         }
                         if (axis != "x" && axis != "y" && axis != "z") {
                           let defAxis = "x";
                           this.onXMLMinorError(children[i].getAttribute("id") + " has an invalid axis value, using default value axis = " + defAxis);
                           grandChildren[j].setAttribute("angle", defAxis);
                         }

                        let vector2 = vec3.create();
                        switch (grandChildren[j].getAttribute("axis")) {
                            case "x":
                            {
                                  vector2 = vec3.fromValues(1, 0, 0);
                                  break;
                            }
                            case "y":
                            {
                                  vector2 = vec3.fromValues(0, 1, 0);
                                  break;
                            }
                            case "z":
                            {
                                  vector2 = vec3.fromValues(0, 0, 1);
                                  break;
                            }
                        }
                        angle = parseFloat(grandChildren[j].getAttribute("angle")) * DEGREE_TO_RAD;
                        mat4.rotate(transfMatrix, transfMatrix, angle, vector2);
                        break;
                    }
                }
            }
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = [];

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus')) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                var rect = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

                this.primitives[primitiveId] = rect;
            }
            else if (primitiveType == 'sphere'){
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius)))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)) && slices > 2)
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks > 0))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);

                this.primitives[primitiveId] = sphere;
            }
            else if (primitiveType == 'cylinder'){
                // base
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base)))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;
                
                // top
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height)))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)) && slices > 2)
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getFloat(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks > 0))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                var cylinder = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);

                this.primitives[primitiveId] = cylinder;
            }
            else if (primitiveType == 'torus'){
                // inner radius
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner)))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;
                    
                // outer radius
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer)))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getFloat(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices)) && slices > 2)
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // loops
                var loops = this.reader.getFloat(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops) && loops > 0))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                var torus = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);

                this.primitives[primitiveId] = torus;
            }
            else if (primitiveType == 'triangle'){
                let x1 = parseFloat(grandChildren[0].getAttribute("x1"));
                let y1 = parseFloat(grandChildren[0].getAttribute("y1"));
                let z1 = parseFloat(grandChildren[0].getAttribute("z1"));
                let x2 = parseFloat(grandChildren[0].getAttribute("x2"));
                let y2 = parseFloat(grandChildren[0].getAttribute("y2"));
                let z2 = parseFloat(grandChildren[0].getAttribute("z2"));
                let x3 = parseFloat(grandChildren[0].getAttribute("x3"));
                let y3 = parseFloat(grandChildren[0].getAttribute("y3"));
                let z3 = parseFloat(grandChildren[0].getAttribute("z3"));
                if (x1 == null || y1 == null || z1 == null || x2 == null || y2 == null || z2 == null || x3 == null || y3 == null || z3 == null) {
                    this.onXMLMinorError(currChild.getAttribute("id") + " has one or more invalid '" + currGrandchild.nodeName + "' xyz values");
                    return;
                }
                this.primitives[primitiveId] = new MyTriangle(this.scene, primitiveId, x1, x2, x3, y1, y2, y3, z1, z2, z3);
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = {};

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (let i = 0; i < children.length; i++) {

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null && this.components[componentID] != undefined)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");

            if(transformationIndex == -1 || childrenIndex == -1 || textureIndex == -1 || materialsIndex == -1){
                this.onXMLMinorError("missing block(s) from " + componentID);
                continue;
            }
            
            var newComponent = {
                "transformations": [],
                "materials": [],
                "children": []
            };
            
            // Transformations
            grandgrandChildren = grandChildren[transformationIndex].children;

            for (let j = 0; j < grandgrandChildren.length; j++) {

                if (grandgrandChildren[j].nodeName != "transformationref" && 
                grandgrandChildren[j].nodeName != "translate" &&
                grandgrandChildren[j].nodeName != "scale" &&
                grandgrandChildren[j].nodeName != "rotate") {
                    this.onXMLMinorError("unknown tag <" + grandgrandChildren[j].nodeName + ">");
                    continue;
                }
    
                // Reference to another transformation
                if (grandgrandChildren[j].nodeName == "transformationref"){
                    var referencedTransformation = this.reader.getString(grandgrandChildren[j], "id");
                    
                    if (referencedTransformation == null){
                        this.onXMLMinorError("no ID defined for transformation");
                        continue;
                    }

                    // Checks for a missing ID.
                    if(this.transformations[referencedTransformation] == null){
                        this.onXMLMinorError("reference to unknown transformation " + referencedTransformation);
                        continue;
                    }

                    newComponent.transformations.push(this.transformations[referencedTransformation]);
                }

                // Specifications for the current transformation.
                var transfMatrix = mat4.create();
                    
                switch (grandgrandChildren[j].nodeName) {
                    case "translate":{
                        let x = parseFloat(grandgrandChildren[j].getAttribute("x"));
                        let y = parseFloat(grandgrandChildren[j].getAttribute("y"));
                        let z = parseFloat(grandgrandChildren[j].getAttribute("z"));

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, vec3.fromValues(x,y,z));

                        if (x == null || y == null || z == null) {
                            this.onXMLMinorError("a transformation (" + children[i].componentID + ") has one or more invalid xyz values");
                            continue;
                        }
                        
                        newComponent.transformations.push(transfMatrix);

                        break;
                    }
                    case 'scale':{
                        let x = parseFloat(grandgrandChildren[j].getAttribute("x"));
                        let y = parseFloat(grandgrandChildren[j].getAttribute("y"));
                        let z = parseFloat(grandgrandChildren[j].getAttribute("z"));

                        if (x == null || y == null || z == null) {
                            this.onXMLMinorError("a transformation (" + children[i].componentID + ") has one or more invalid xyz values");
                            continue;
                        }

                        let vector1 = vec3.fromValues(x,y,z);
                        mat4.scale(transfMatrix, transfMatrix, vector1);      
                        
                        newComponent.transformations.push(transfMatrix);
                        
                        break;
                    }
                    case 'rotate':{
                        let angle = parseFloat(grandgrandChildren[j].getAttribute("angle"));
                        let axis = grandgrandChildren[j].getAttribute("axis");
                        if (isNaN(angle)) {
                            this.onXMLMinorError("a transformation has an invalid angle value");
                            continue;
                        }
                        if (axis != "x" && axis != "y" && axis != "z") {
                        let defAxis = "x";
                        this.onXMLMinorError("a rotation in " + children[i].componentID + " has an invalid axis value, using default value axis = " + defAxis);
                        grandgrandChildren[j].setAttribute("angle", defAxis);
                        }

                        let vector2 = vec3.create();
                        switch (grandgrandChildren[j].getAttribute("axis")) {
                            case "x":
                            {
                                    vector2 = vec3.fromValues(1, 0, 0);
                                    break;
                            }
                            case "y":
                            {
                                    vector2 = vec3.fromValues(0, 1, 0);
                                    break;
                            }
                            case "z":
                            {
                                    vector2 = vec3.fromValues(0, 0, 1);
                                    break;
                            }
                        }
                        angle = angle * DEGREE_TO_RAD;
                        mat4.rotate(transfMatrix, transfMatrix, angle, vector2);

                        newComponent.transformations.push(transfMatrix);
                        break;
                    }
                }
            }

            // Materials
            grandgrandChildren = grandChildren[materialsIndex].children;

            for (let j = 0; j < grandgrandChildren.length; j++) {
                if(grandgrandChildren[j].nodeName != "material"){
                    this.onXMLMinorError("unknown tag <" + grandgrandChildren[j].nodeName + ">");
                    continue;
                }

                //material id
                var materialID = grandgrandChildren[j].getAttribute("id");
                if(materialID == null){
                    this.onXMLMinorError("a material in " + componentID + " wasn't properly identified (" + materialID + ")");
                    continue;
                }

                if(materialID == "inherit"){
                    newComponent.materials.push(null);
                    continue;
                }

                //check for an existing material
                var material = this.materials[materialID];
                if(material == null){
                    this.onXMLMinorError("a material in " + componentID + " wasn't properly identified (" + materialID + ")");
                    continue;
                }

                newComponent.materials.push(material);
            }

            // Texture
            let textureChild = grandChildren[textureIndex];

            //texture id
            var textureID = textureChild.getAttribute("id");
            if(textureID == null){
                this.onXMLMinorError("a texture in " + componentID + " wasn't properly defined (" + textureID + ")");
            }

            var texture;

            if(textureID == "inherit" || textureID == null){
                var noTexture = {};
                noTexture.type = "inherit";
                texture = noTexture;
            }
            else
            if(textureID == "none"){
                texture = {};
                texture.type = "none";
            }
            else {
                //check for an existing texture
                texture = this.textures[textureID];
                if(texture == null){
                    this.onXMLMinorError("a texture in " + componentID + " wasn't properly identified (" + textureID + ")");
                    return;
                }
                let length_s = parseFloat(textureChild.getAttribute("length_s"));
                let length_t = parseFloat(textureChild.getAttribute("length_t"));
    
                if(length_t == null || length_s == null){
                    this.onXMLMinorError("a texture in " + componentID + " doesn't have proper s/t length paremeters");
                    return;
                }

                if(isNaN(length_s) || isNaN(length_t)){
                    this.onXMLMinorError("a texture in " + componentID + " has invalid s/t length paremeters");
                    length_s = 1;
                    length_t = 1;
                }
    
                texture.length_s = length_s;
                texture.length_t = length_t;
                texture.type = "normal";
            }
            
            newComponent.texture = texture;

            var childrenComponents = grandChildren[childrenIndex].children;

            for (let j = 0; j < childrenComponents.length; j++) {
                if(childrenComponents[j].nodeName != "componentref" && childrenComponents[j].nodeName != "primitiveref"){
                    this.onXMLMinorError("unknown tag <" + childrenComponents[j].nodeName + ">");
                    continue;
                }

                //material id
                var refID = childrenComponents[j].getAttribute("id");
                if(refID == null){
                    this.onXMLMinorError("a reference in " + componentID + " wasn't properly defined (" + refID + ")");
                    continue;
                }

                if(childrenComponents[j].nodeName == "componentref"){
                    if(this.components[refID] == null || this.components[refID] == undefined){
                        this.onXMLMinorError("a component reference in " + componentID + " wasn't properly identified (" + refID + ")");
                        continue;
                    }
                    let childComponent = this.components[refID];
                    childComponent.type = "component";
                    newComponent.children.push(childComponent);
                }

                if(childrenComponents[j].nodeName == "primitiveref"){
                    if(this.primitives[refID] == null){
                        this.onXMLMinorError("a primitive reference in " + componentID + " wasn't properly identified (" + refID + ")");
                        continue;
                    }
                    let childComponent = this.primitives[refID];
                    childComponent.type = "primitive";
                    newComponent.children.push(childComponent);
                }
            }

            if(newComponent.transformations.length < 1){
                this.onXMLMinorError("no component transformation found in " + componentID);
                continue;
            }
            
            if(newComponent.children.length < 1){
                this.onXMLMinorError("no component children found in " + componentID);
                continue;
            }
            
            if(newComponent.materials.length < 1){
                this.onXMLMinorError("no component materials found in " + componentID);
                continue;
            }
            
            if(newComponent.texture == null){
                this.onXMLMinorError("no component texture found in " + componentID);
                continue;
            }

            this.components[componentID] = newComponent;
        }

        this.log("Parsed components");
        
        if(this.components[this.idRoot] == null || this.components[this.idRoot] == undefined){
            return "root component not found";
        }

        return null;
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        var position = [];

        // x
        var x = this.reader.getFloat(node, 'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, 'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, 'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;

        color.push(...[r, g, b, a]);

        return color;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.processNode(this.components[this.idRoot], null, null);   
    }

    processNode(componentNode, parentMaterial, parentTexture){
        this.scene.pushMatrix();

        for(let i = 0; i < componentNode.transformations.length; ++i){
            this.scene.multMatrix(componentNode.transformations[i]);
        }

        let currentMaterial = componentNode.materials[0];
        let currentTexture = componentNode.texture;

        if(currentMaterial == null){
            currentMaterial = parentMaterial;
        }

        if(currentTexture.type == "inherit"){
            //currentMaterial.setTexture(parentTexture);
            //set s and t
        }
        else{
            if(currentTexture.type == "none"){
                //currentTexture.unbind(0);
                //currentMaterial.setTexture(currentTexture);
            }
            else{
                //currentMaterial.setTexture(currentTexture);
                //set s and t
            }
        }

        currentMaterial.apply();

        for(let i = 0; i < componentNode.children.length; ++i){
            if(componentNode.children[i].type == "component"){
                this.processNode(componentNode.children[i], currentMaterial, currentTexture);
            }
            else{
                componentNode.children[i].display();
            }
        }

        if(parentMaterial != null){
            parentMaterial.apply();
        }
    
        this.scene.popMatrix();
    }
}
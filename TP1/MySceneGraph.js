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

        var children = texturesNode.children;

        this.textures = [];
        var numTextures = 0;

        if(children.length == 0){
            this.onXMLMinorError("No Textures.");
        }

        for (var i = 0; i < children.length; i++){
            var textureId = this.reader.getString(children[i], 'id');
            var textureFile = this.reader.getString(children[i], 'file');
            var png = textureFile.search(".png");
            var jpg = textureFile.search(".jpg");
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

            this.textures[textureId] = textureFile;
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
        for (var i = 0; i < children.length; i++) {
            var global = [];

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each light (conflict: ID = " + materialID + ")";

            //Continue here
            var materialShininess = this.reader.getFloat(children[i], 'shininess');
            global.push(materialShininess);

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var i = 0; i < grandChildren.length; i++) {
                if (grandChildren[i].nodeName != "emission" && grandChildren[i].nodeName != "diffuse" && grandChildren[i].nodeName != "specular" && grandChildren[i].nodeName != "ambient") {
                this.onXMLMinorError("unknown tag <" + grandChildren[i].nodeName + ">");
                continue;
                }

                var aux = this.parseColor(grandChildren[i], grandChildren[i].nodeName + " for ID" + materialID)
                global.push(aux);
            }
            this.materials[materialID] = global;
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
                    let x = parseFloat(currGrandchild.getAttribute("x"));
                    let y = parseFloat(currGrandchild.getAttribute("y"));
                    let z = parseFloat(currGrandchild.getAttribute("z"));
                    if (!this.isValidNumber(x) || !this.isValidNumber(y) || !this.isValidNumber(z)) {
                        this.onXMLMinorError(currChild.getAttribute("id") + " has one or more invalid '" + currGrandchild.nodeName + "' xyz values, using default value x = y = z = " + DEFAULT_SCALE_VALUE);
                        currGrandchild.setAttribute("x", DEFAULT_SCALE_VALUE);
                        currGrandchild.setAttribute("y", DEFAULT_SCALE_VALUE);
                        currGrandchild.setAttribute("z", DEFAULT_SCALE_VALUE);
                    }
                    let vector1 = vec3.fromValues(parseFloat(currGrandchild.getAttribute("x")), parseFloat(currGrandchild.getAttribute("y")), parseFloat(currGrandchild.getAttribute("z")));
                    mat4.scale(matrix, matrix, vector1);               
                        
                        break;
                    case 'rotate':
                        // angle
                         let angle = parseFloat(currGrandchild.getAttribute("angle"));
                         let axis = currGrandchild.getAttribute("axis");
                         if (!this.isValidNumber(angle)) {
                            let defAngle = 0;
                            this.onXMLMinorError(currChild.getAttribute("id") + " has an invalid angle value, using default value angle = " + defAngle);
                            currGrandchild.setAttribute("angle", defAngle);
                         }
                         if (axis != "x" && axis != "y" && axis != "z") {
                           let defAxis = "x";
                           this.onXMLMinorError(currChild.getAttribute("id") + " has an invalid axis value, using default value axis = " + defAxis);
                           currGrandchild.setAttribute("angle", defAxis);
                         }

                        let vector2 = vec3.create();
                        switch (currGrandchild.getAttribute("axis")) {
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
                        angle = parseFloat(currGrandchild.getAttribute("angle")) * DEGREE_TO_RAD;
                        mat4.rotate(matrix, matrix, angle, vector2);
                        break;
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
            else {
                console.warn("To do: Parse other primitives.");
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

        this.components = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {
            var newComponent;

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");

            this.onXMLMinorError("To do: Parse components.");
            
            // Transformations
            grandgrandChildren = grandChildren[transformationIndex].children;

            for (var j = 0; j < grandgrandchildren.length; j++) {

                if (grandgrandchildren[j].nodeName != "transformationref" || 
                grandgrandchildren[j].nodeName != "translate" ||
                grandgrandchildren[j].nodeName != "scale" ||
                grandgrandchildren[j].nodeName != "rotate") {
                    this.onXMLMinorError("unknown tag <" + grandgrandchildren[j].nodeName + ">");
                    continue;
                }
    
                // Reference to another transformation
                if (grandgrandchildren[j].nodeName == "transformationref"){
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
                    
                switch (grandChildren[j].nodeName) {
                    case 'translate':
                        var coordinates = this.parseCoordinates3D(grandgrandChildren[j], "translate transformation for ID " + transformationID);
                        if (!Array.isArray(coordinates))
                            return coordinates;

                        transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                        break;
                    case 'scale':
                    let x = parseFloat(currGrandchild.getAttribute("x"));
                    let y = parseFloat(currGrandchild.getAttribute("y"));
                    let z = parseFloat(currGrandchild.getAttribute("z"));
                    if (!this.isValidNumber(x) || !this.isValidNumber(y) || !this.isValidNumber(z)) {
                        this.onXMLMinorError(currChild.getAttribute("id") + " has one or more invalid '" + currGrandchild.nodeName + "' xyz values, using default value x = y = z = " + DEFAULT_SCALE_VALUE);
                        currGrandchild.setAttribute("x", DEFAULT_SCALE_VALUE);
                        currGrandchild.setAttribute("y", DEFAULT_SCALE_VALUE);
                        currGrandchild.setAttribute("z", DEFAULT_SCALE_VALUE);
                    }
                    let vector1 = vec3.fromValues(parseFloat(currGrandchild.getAttribute("x")), parseFloat(currGrandchild.getAttribute("y")), parseFloat(currGrandchild.getAttribute("z")));
                    mat4.scale(matrix, matrix, vector1);               
                        
                        break;
                    case 'rotate':
                        // angle
                            let angle = parseFloat(currGrandchild.getAttribute("angle"));
                            let axis = currGrandchild.getAttribute("axis");
                            if (!this.isValidNumber(angle)) {
                            let defAngle = 0;
                            this.onXMLMinorError(currChild.getAttribute("id") + " has an invalid angle value, using default value angle = " + defAngle);
                            currGrandchild.setAttribute("angle", defAngle);
                            }
                            if (axis != "x" && axis != "y" && axis != "z") {
                            let defAxis = "x";
                            this.onXMLMinorError(currChild.getAttribute("id") + " has an invalid axis value, using default value axis = " + defAxis);
                            currGrandchild.setAttribute("angle", defAxis);
                            }

                        let vector2 = vec3.create();
                        switch (currGrandchild.getAttribute("axis")) {
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
                        angle = parseFloat(currGrandchild.getAttribute("angle")) * DEGREE_TO_RAD;
                        mat4.rotate(matrix, matrix, angle, vector2);
                        break;
                }

            // Materials


            // Texture


            // Children
        }
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
        //To do: Create display loop for transversing the scene graph

        //To test the parsing/creation of the primitives, call the display function directly
        this.primitives['demoRectangle'].display();
    }
}
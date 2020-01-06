#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform float timeFactor;
uniform float startingInstant;
uniform float duration;

void main() {
    vec4 color1 = texture2D(uSampler, vTextureCoord);
    vec4 color2 = texture2D(uSampler2, vTextureCoord);

    if(startingInstant == 0.0){
        gl_FragColor = color1;
    }
    else{
        float progressFactor = timeFactor - startingInstant;
        if(progressFactor > 1.0){
            progressFactor = 1.0;
        }

        float radialBorder = progressFactor * 0.75;

        float x = vTextureCoord.x - 0.5;
        float y = vTextureCoord.y - 0.5;
        float radius = sqrt(x * x + y * y);

        if(radius < radialBorder){
            gl_FragColor = color2;
        }
        else{
            gl_FragColor = color1;
        }
    }
}

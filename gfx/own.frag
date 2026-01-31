precision mediump float;
precision mediump int;

varying vec4 vColor;
varying vec2 vPosition;
varying vec2 vUV;
varying float vIndex;
uniform int uCurrentIndex;
uniform int uMaxVisiblePoints;
uniform sampler2D uTexture;

void main() {
     vec4 color = vColor;
     color.a = (float(uCurrentIndex)-(float(uCurrentIndex)-10.0)/10.0);
     if (int(vIndex) > uCurrentIndex-10 ) {
          color.a = 1.0 - 0.1*(vIndex - (float(uCurrentIndex)-10.0));
     } else if (int(vIndex) < uCurrentIndex-uCurrentIndex || int(vIndex) > uCurrentIndex ) {
          color.a = 0.0;
     }


     gl_FragColor = texture2D(uTexture, vUV);
     gl_FragColor.rgb *= color.a;
     gl_FragColor.a = 0.0;
}
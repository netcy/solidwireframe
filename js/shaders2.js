var  normalVS = `
 	attribute vec4 aPosition;
 	attribute vec4 aColor;
 	attribute vec3 aBarycentric;
 	attribute vec3 aNormal;
 	varying vec3 vNormal;
 	varying vec3 vPosition;
 	varying vec4 vColor;
 	varying vec4 vPositionMVP;
 	varying vec3 vBarycentric;
  	uniform mat4 uMVPMatrix;
 	void main(){
 		gl_Position = uMVPMatrix* aPosition;	
 		vPosition = vec3(aPosition);
 		vNormal = aNormal;
 		vColor = aColor;
 		vBarycentric = aBarycentric;
 	}
`;
var normalFS = `
	#extension GL_OES_standard_derivatives : enable
	precision mediump float;
	uniform vec3 uLightColor;
	uniform vec3 uLightPosition;
	uniform vec3 uAmbientLightColor;
	varying vec3 vNormal;
	varying vec3 vPosition;
	varying vec4 vColor;
	varying vec3 vBarycentric;
	float edgeFactor(){
	    vec3 d = fwidth(vBarycentric);
	    vec3 a3 = smoothstep(vec3(0.0), d*1.5, vBarycentric);
	    return min(min(a3.x, a3.y), a3.z);
	}
	void main(){
		vec3 normal = normalize(vNormal);
		vec3 lightDirection = normalize(uLightPosition - vPosition);
		float normalDotDirection = max(dot(normal,lightDirection),0.0);
		vec3 diffuse = uLightColor * vec3(vColor) * 1.0;
		vec3 ambient = uAmbientLightColor * vec3(vColor);
		vec4 color = vec4(ambient + diffuse * normalDotDirection,vColor.a);
		gl_FragColor.rgb = mix(vec3(1.0,1.0,1.0), color.rgb, edgeFactor());
	}
`;

var utils = {};

utils.getCanvas= function (id) {
	if(id instanceof HTMLCanvasElement){
		return id;
	}
	var canvas =  document.getElementById(id);
	if(canvas instanceof HTMLCanvasElement){
		return canvas;
	}
	return null;
}
utils.getWebGLContext = function(id){
	var canvas = utils.getCanvas(id);
	var options = {
		antialias:true,
	}
	if(canvas != null){
		return canvas.getContext('webgl',options) || canvas.getContext('experimental-webgl',options);
	}
	throw 'expect canvas but find none';
}

utils.buildProgram = function(gl,vertexSource,fragmentSource){
	var vertexShader = utils.createShader(gl,gl.VERTEX_SHADER,vertexSource);
	var fragmentShader = utils.createShader(gl,gl.FRAGMENT_SHADER,fragmentSource);
	var program = gl.createProgram(); // 创建程序
	// 程序绑定着色器
      gl.attachShader(program,vertexShader);
      gl.attachShader(program,fragmentShader);
      // 链接程序
	gl.linkProgram(program)
	if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
  		var info = gl.getProgramInfoLog(program);
  		console.log("Could not initialise shader\n" + "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + ", gl error [" + gl.getError() + "]");
  		throw 'Could not compile WebGL program. \n\n' + info;
	}
	// 使用程序
	gl.useProgram(program)
	return program;
}

utils.createShader = function(gl,type,source){
	var shader = gl.createShader(type); // 创建着色器对象
       gl.shaderSource(shader,source); // 将着色器源码写入对象
       gl.compileShader(shader); // 编译着色器

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
		var info = gl.getShaderInfoLog(shader);
		console.error(info);
		throw 'Could not compile shader program. ' + info;
	}
       return shader;
}

utils.createVertexBufferObject = function(gl,vertices){
    var vertexBuffer = gl.createBuffer(); // 创建缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); //绑定缓冲区
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW); //给缓冲区填充数据
    return vertexBuffer;
}

utils.initVertexBufferObject = function(gl,vertices,size,location){
    var vertexBuffer = gl.createBuffer(); // 创建缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); //绑定缓冲区
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW); //给缓冲区填充数据
    if(size && location != null){
    	   gl.vertexAttribPointer(location,size,gl.FLOAT,false,0,0); // 把缓冲区分配给attribute变量
    }
   
    return vertexBuffer;
}

utils.getVariableLocation = function(gl,program,name,attribute){
	var location;
	if(attribute){ // 是attribute变量
		location = gl.getAttribLocation(program,name);
		 if(location < 0){
     	   		throw "Get attribute variable "+name+"'s location fail";
      		}
	}else{ // 表示是uniform 变量
		location = gl.getUniformLocation(program,name);
		if(location == null){
			throw "Failed get unifrom variable "+name+"'s location"
		}
	}
	return location;
}

utils.getProgramVariableLocations = function(gl,program,variableNames){
   	var len = variableNames.length;
   	for(var i = 0; i < len;i ++){
   		var variableName = variableNames[i];
   		if(variableName.startsWith('a')){ // attribute 变量
   			var location = program[variableName] =  utils.getVariableLocation(gl,program,variableName,true);
   		}else{// uniform 变量
   			program[variableName] = utils.getVariableLocation(gl,program,variableName,false);
   		}	
   	}
}

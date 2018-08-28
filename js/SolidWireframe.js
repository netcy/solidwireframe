function load(){
    var gl = window.gl= utils.getWebGLContext('webgl');
    if(gl == null){
      console.log("Get WebGL Context fail");
      return;
    }

    // 
    gl.getExtension("OES_standard_derivatives");

     // 创建正常场景着色器程序
     var normalProgram = utils.buildProgram(gl,normalVS,normalFS);
   
     utils.getProgramVariableLocations(gl,normalProgram,['aPosition','aColor','aNormal','aBarycentric','uMVPMatrix','uLightColor','uLightPosition','uAmbientLightColor']);
    //创建立方体数据
    var verticesColorsNormals = new Float32Array([
           // 前面四个顶点
             -5,  5,  5, 1,0,0, 0,0,1,//v0  红色 法线向量 0,0,1
            -5, -5,  5, 1,0,0,0,0,1,// v1 红色
              5,  5,  5,  1,0,0,0,0,1,// v2 红色
              5,  -5, 5,  1,0,0,0,0,1,// v3 红色
           // 右面四个顶点
             5,5,5, 0,1,0, 1,0,0,//v4 绿色 法线向量 1,0,0
             5,-5,5, 0,1,0,1,0,0,//v5 绿色
             5,5,-5, 0,1,0,1,0,0,//v6 绿色
             5,-5,-5, 0,1,0,1,0,0,//v7 绿色
           // 上面四个顶点
             -5,5,-5,0,1,1, 0,1,0,//v8 青色 法线向量 0,1,0
             -5,5,5,0,1,1, 0,1,0,//v9 青色 
             5,5,-5,0,1,1,0,1,0,//v10 青色 
             5,5,5,0,1,1,0,1,0,//v11 青色 
           // 下面四个顶点
              -5,-5,5,1,1,1,0,-1,0,//v12 白色 法线向量 0,-1,0
             -5,-5,-5,1,1,1,0,-1,0,//v13 白色
             5,-5,5,1,1,1,0,-1,0,//v14 白色 
             5,-5,-5,1,1,1,0,-1,0,//v15 白色
           // 左面的四个顶点
            -5,5,-5,1,1,0,-1,0,0,//v16 黄色  法线向量 -1,0,0
            -5,-5,-5,1,1,0,-1,0,0,//v17 黄色
            -5,5,5,1,1,0,-1,0,0,//v18黄色
            -5,-5,5,1,1,0,-1,0,0,//v19 黄色
           // 后面的四个顶点
            5,5,-5,1,0,1,0,0,-1,//v20 红蓝 法线向量 0,0,-1
            5,-5,-5,1,0,1,0,0,-1,//v21 红蓝
            -5,5,-5,1,0,1,0,0,-1,//v22 红蓝
            -5,-5,-5,1,0,1,0,0,-1,//v23 红蓝
      ]);
    
     var indices = new Uint8Array([
            0,1,2 ,2,1,3, // 前表面索引
            4,5,6,6,5,7, //右
            8,9,10,10,9,11, //上
            12,13,14,14,13,15, // 下
            16,17,18,18,17,19,//左
             20,21,22,22,21,23,//后
      ]);

     var barycentrics =new Float32Array(computeBarycentric(indices));


      var floatSize = verticesColorsNormals.BYTES_PER_ELEMENT;
      var verticesColorsNormalBuffer = utils.initVertexBufferObject(gl,verticesColorsNormals);

      var barycentricBuffer = utils.initVertexBufferObject(gl,barycentrics);
     

      var indexBuffer = gl.createBuffer(); // 创建缓冲区
     
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer); //绑定缓冲区
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW); //给缓冲区填充数据


      var radius = 20,angle = 1.5;
      var lightColor = [1.0,1.0,1.0],lightPosition = [0.01,20,0],ambientLightColor = [0.3,0.3,0.3];
      gl.enable(gl.DEPTH_TEST); 
       var viewMatrix = mat4.create(), projectMatrix = mat4.create(),
            mvpMatrix = mat4.create();
      setInterval(draw,100);
      function draw(){   
         var cameraPos = [radius * Math.sin(angle),-40 * Math.sin(angle) +20,radius * Math.cos(angle)],
            center = [0.0,0,0],up = [0,1,0],near = 1,far = 100;
            mat4.lookAt(viewMatrix,cameraPos,center,up);
            mat4.perspective(projectMatrix,Math.PI/2,1,near,far);
            mat4.mul(mvpMatrix,projectMatrix,viewMatrix);     
              gl.viewport(0,0,300,300);// 设置视口大小
              gl.clearColor(0.0,0.0,1.0,1.0);//设置背景色为蓝色
              gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//清空  
              drawNormal(); // 绘制正常场景
            angle += 0.1;       
      }

      function drawNormal(){
          gl.useProgram(normalProgram);// 使用正常着色器程序
          // 设置着色器程序uniform变量
          gl.uniform3fv(normalProgram.uLightColor,lightColor);
          gl.uniform3fv(normalProgram.uLightPosition,lightPosition);
          gl.uniform3fv(normalProgram.uAmbientLightColor,ambientLightColor)
          gl.uniformMatrix4fv(normalProgram.uMVPMatrix,false,mvpMatrix);

          gl.enableVertexAttribArray(normalProgram.aPosition);
          gl.enableVertexAttribArray(normalProgram.aColor);
          gl.enableVertexAttribArray(normalProgram.aNormal);
          gl.enableVertexAttribArray(normalProgram.aBarycentric);
           gl.bindBuffer(gl.ARRAY_BUFFER,verticesColorsNormalBuffer); //绑定缓冲区
           // 把缓冲区分配给attribute变量  
           gl.vertexAttribPointer(normalProgram.aPosition,3,gl.FLOAT,false,floatSize * 9 ,0); 
           gl.vertexAttribPointer(normalProgram.aColor,3,gl.FLOAT,false,floatSize * 9 ,floatSize * 3); 
           gl.vertexAttribPointer(normalProgram.aNormal,3,gl.FLOAT,false,floatSize * 9 ,floatSize * 6);

           gl.bindBuffer(gl.ARRAY_BUFFER,barycentricBuffer);
           gl.vertexAttribPointer(normalProgram.aBarycentric,3,gl.FLOAT,false,0,0)

           gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);    
           gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_BYTE,0);

      }

      // if ( face instanceof THREE.Face3 ) {

      //       values[ f ] = [ new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ) ];

      //     } else {

      //       values[ f ] = [ new THREE.Vector3( 1, 0, 0 ), new THREE.Vector3( 1, 1, 0 ), new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 0 ) ];

      //     }

      function computeBarycentric(indices){
          var barycentric = [
              1,0,0,  0,1,0, 0,0, 1,  1,0,0,
              1,0,0,  0,1,0, 0,0, 1,  1,0,0,
              1,0,0,  0,1,0, 0,0, 1,  1,0,0,
              1,0,0,  0,1,0, 0,0, 1,  1,0,0,
              1,0,0,  0,1,0, 0,0, 1,  1,0,0,
              1,0,0,  0,1,0, 0,0, 1,  1,0,0,
          ];

           var barycentric = [
              1,0,0,  1,1,0, 0,0, 1,  0,0,0,  //前
              1,0,0,  1,1,0, 0,0, 1,  0,0,0,  //右
              1,0,0,  1,1,0, 0,0, 1,  0,0,0,  //上
              1,0,0,  1,1,0, 0,0, 1,  0,0,0,  //下
              1,0,0,  1,1,0, 0,0, 1,  0,0,0,  //坐
              1,0,0,  1,1,0, 0,0, 1,  0,0,0,  //后
          ];

          return barycentric;
      }
}
class Transform
		{
			constructor()
			{
				this.forward = [0,0,1];
				this.right = [1,0,0];
				this.up = [0,1,0];
			}
		
			doRotations(RotAngles)
			{
				this.xRot = [
							[1,0,0,0],
							[0,Math.cos(RotAngles[0]),-1*Math.sin(RotAngles[0]),0],
							[0,Math.sin(RotAngles[0]),Math.cos(RotAngles[0]),0],
							[0,0,0,1]
						];		
				this.yRot = [
						[Math.cos(RotAngles[1]),0,Math.sin(RotAngles[1]),0],
						[0,1,0,0],
						[-1*Math.sin(RotAngles[1]),0,Math.cos(RotAngles[1]),0],
						[0,0,0,1]	
						];
				this.zRot = [
							[Math.cos(RotAngles[2]),-1*Math.sin(RotAngles[2]),0,0],
							[Math.sin(RotAngles[2]),Math.cos(RotAngles[2]),0,0],
							[0,0,1,0],
							[0,0,0,1]
						]
				//this.forward = this.crossMultiply(xRot,[0,0,1,0]);		
				this.forward = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[0,0,1,0])))
				this.right = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[1,0,0,0])))
				this.up = this.crossMultiply(this.zRot,this.crossMultiply(this.yRot,this.crossMultiply(this.xRot,[0,1,0,0])))
			}			
			crossMultiply(M,V)
			{
			console.log(M[0][3]);
			console.log(V[3]);
			var temp = [
						M[0][0]*V[0]+M[0][1]*V[1]+M[0][2] * V[2]+ M[0][3]*V[3],
						M[1][0]*V[0]+M[1][1]*V[1]+M[1][2] * V[2]+ M[1][3]*V[3],
						M[2][0]*V[0]+M[2][1]*V[1]+M[2][2] * V[2]+ M[2][3]*V[3],
						M[3][0]*V[0]+M[3][1]*V[1]+M[3][2] * V[2]+ M[3][3]*V[3]
						]
			console.log(temp);
				return temp;
			}
			
		}


class GameObject
{
	constructor() 
	{
		this.loc = [0,0,0];
		this.rot = [0,0,0];
		this.isTrigger = false;
		this.collissionRadius = 1.0;
		this.velocity = [0,0,0];
		this.angVelocity = [0,0,0];
		this.name = "default";
		this.id = 0;
		this.prefab;
		this.transform = new Transform();
	}
	
	Move()
	{
		var tempP = [0,0,0]
		for(var i =0; i< 3;i ++)
		{
			tempP[i] = this.loc[i];
			tempP[i] += this.velocity[i];
			this.rot[i] += this.angVelocity[i];
		}
		if(!this.isTrigger)
		{
			var clear = true;
			for(var so in m.Solid)
			{
				if(m.Solid[so] != this)
				{
					if(m.CheckCollision(tempP,this.collissionRadius,m.Solid[so].loc,m.Solid[so].collissionRadius))
					{
						clear = false;
					}
				}
			} 
			if(clear)
			{
			this.loc = tempP;
			}
		}
		else
		{
			this.loc = tempP;
		}
		for(var tr in m.trigger)
			{
				if(m.trigger[tr] != this && this.id != 'ID0')
				{
					if(_main.checkCollision(tempP,this.collisionRadius,m.trigger[tr].loc,_main.trigger[tr].collisionRadius))
					{
						this.onTrigger(m.trigger[tr])
						clear = false;
					}
				}
			} 
	}
	onCollision(other)
		{
			//overwrite this to insert code to handle on collision
			other.velocity = [0,0,0];
		}
		onTrigger(other)
		{
			//overwrite this to insert code to handle trigger collisions.
			console.log(this);
			this.hp--;
			_main.destroyObject(other.id);
		}
	
	Update()
	{
		console.error(this.name +" update() is NOT IMPLEMENTED!");
	}
	Render(program)
	{
		console.error(this.name + " render() is NOT IMPLEMENTED!");
	}	
}
class Ground extends GameObject
{
	constructor()
	{
		super();
		this.buffer=gl.createBuffer();
		this.colorBuffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[
			-1000,0,-1000,0,1,0,
			1000,0, -1000,0,1,0,
			-1000,0,1000,0,1,0,
			1000, 0,1000,0,1,0
			
		];
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}
	Update()
	{
		//Do Nothing
	}
	Render(program)
	{
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 6*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		
		//Now we have to do this for color
		var colorAttributeLocation = gl.getAttribLocation(program,"vert_color");
		//We don't have to bind because we already have the correct buffer bound.
		size = 3;
		type = gl.FLOAT;
		normalize = false;
		stride = 6*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
				
		var tranLoc  = gl.getUniformLocation(program,'transform');
		gl.uniform3fv(tranLoc,new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program,'rotation');
		gl.uniform3fv(thetaLoc,new Float32Array(this.rot));
	 
	 //var ibuffer = gl.createBuffer();
	 //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
	 //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
	 //gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);
	 gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}
}
class Hex extends GameObject
{
	constructor()
	{
		super();
		this.angVelocity = [0,.025,0];
		this.isTrigger = false;
		this.buffer=gl.createBuffer();
		this.colorBuffer = gl.createBuffer();
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		this.vertices =
		[
			-.5,-.5,-.25,.54,.27,.07,
			-.5, .5,-.25,.54,.27,.07,
			-.25,-.5,-.5,.54,.27,.07,
			-.25, .5,-.5,.54,.27,.07,
			.25,-.5,-.5,.54,.27,.07,
			.25,.5,-.5,.54,.27,.07,
			.5,-.5,-.25,.54,.27,.07,
			.5, .5,-.25,.54,.27,.07,
			.5,-.5,.25,.54,.27,.07,
			.5, .5,.25,.54,.27,.07,
			.25,-.5,.5,.54,.27,.07,
			.25, .5,.5,.54,.27,.07,
			-.25,-.5,.5,.54,.27,.07,
			-.25, .5,.5,.54,.27,.07,
			-.5,-.5,.25,.54,.27,.07,
			-.5, .5,.25,.54,.27,.07,
			-.5, -.5,-.25,.54,.27,.07,
			-.5, .5,-.25,.54,.27,.07
		];
	
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc=[0,0,0];
		this.rot=[0,0,0];
	}
	Update()
	{
		this.Move();
	}
	Render(program)
	{
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 6*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
		
		//Now we have to do this for color
		var colorAttributeLocation = gl.getAttribLocation(program,"vert_color");
		//We don't have to bind because we already have the correct buffer bound.
		size = 3;
		type = gl.FLOAT;
		normalize = false;
		stride = 6*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
				
		var tranLoc  = gl.getUniformLocation(program,'transform');
		gl.uniform3fv(tranLoc,new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program,'rotation');
		gl.uniform3fv(thetaLoc,new Float32Array(this.rot));
	 
	 //var ibuffer = gl.createBuffer();
	 //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
	 //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
	 //gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);
	 gl.drawArrays(gl.TRIANGLE_STRIP, 0, 18);
	}
}

class Projectile extends GameObject
	{
		constructor()
		{
			super();
			this.buffer=gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			this.vertices = [	
							0,0.75,0,0.6,0.6,0.6,
							0.5,0,0.5,0.6,0.6,0.6,
							0.5,0,-0.5,0.6,0.6,0.6,
							
							0,0.75,0,0.6,0.6,0.6,
							0.5,0,-0.5,0.6,0.6,0.6,
							-0.5,0,-0.5,0.6,0.6,0.6,
							
							0,0.75,0,0.6,0.6,0.6,
							-0.5,0,-0.5,0.6,0.6,0.6,
							-0.5,0,0.5,0.6,0.6,0.6,
							
							0,0.75,0,0.6,0.6,0.6,
							-0.5,0,0.5,0.6,0.6,0.6,
							0.5,0,0.5,0.6,0.6,0.6,
							
							0,-0.75,0,0.6,0.6,0.6,
							0.5,0,0.5,0.6,0.6,0.6,
							0.5,0,-0.5,0.6,0.6,0.6,
							
							0,-0.75,0,0.6,0.6,0.6,
							0.5,0,-0.5,0.6,0.6,0.6,
							-0.5,0,-0.5,0.6,0.6,0.6,
							
							0,-0.75,0,0.6,0.6,0.6,
							-0.5,0,-0.5,0.6,0.6,0.6,
							-0.5,0,0.5,0.6,0.6,0.6,
							
							0,-0.75,0,0.6,0.6,0.6,
							-0.5,0,0.5,0.6,0.6,0.6,
							0.5,0,0.5,0.6,0.6,0.6
							];
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
			this.loc = [0.0,0.0,0.0];
			this.rot = [0.0,0.0,0.0];
			this.collisionRadius = 0.05;
			this.scale = [0.05,0.05,0.05];
		}
		Update()
		{
			this.Move()
		}
		Render(program)
		{	
			gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
			var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
			var size = 3;          
			var type = gl.FLOAT;   
			var normalize = false; 
			var stride = 6*Float32Array.BYTES_PER_ELEMENT;	
			var offset = 0;
			gl.enableVertexAttribArray(positionAttributeLocation);
			gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
			var colorAttributeLocation = gl.getAttribLocation(program,"vert_color");
			size = 3;
			type = gl.FLOAT;
			normalize = false;
			stride = 6*Float32Array.BYTES_PER_ELEMENT;	
			offset = 3*Float32Array.BYTES_PER_ELEMENT;	
			gl.enableVertexAttribArray(colorAttributeLocation);
			gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
			var tranLoc  = gl.getUniformLocation(program,'translation');
			gl.uniform3fv(tranLoc,new Float32Array(this.loc));
			var thetaLoc = gl.getUniformLocation(program,'rotation');
			gl.uniform3fv(thetaLoc,new Float32Array(this.rot));
			var scaleLoc = gl.getUniformLocation(program,'scale');
			gl.uniform3fv(scaleLoc,new Float32Array(this.scale));
			var primitiveType = gl.TRIANGLES;
			offset = 0;
			var count = 24;
			gl.drawArrays(primitiveType, offset, count);
	 
	 //var ibuffer = gl.createBuffer();
	 //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuffer);
	 //gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint8Array(this.indexOrder),gl.STATIC_DRAW);
	 //gl.drawElements(gl.TRIANGLES,this.indexOrder.length,gl.UNSIGNED_BYTE,0);
	 	
		}
	}

class Camera extends GameObject
{
	constructor()
	{
			super();
			this.collisionRadius = 0.3;
			this.canFire = true;
	}
	Update()
	{
		var deltaX = 0;
		var deltaZ = 0;
		var deltaR = 0;
		if( "A" in m.Keys && m.Keys["A"])
		{
			this.rot[1] -=.1;
		}
		if("D" in m.Keys && m.Keys["D"])
		{
			this.rot[1] +=.1;
		}
		if("W" in m.Keys && m.Keys["W"])
		{
			this.transform.doRotations(this.rot);
			deltaX += this.transform.forward[0]*.25;
			deltaZ += this.transform.forward[2]*.25;
		}
		if("S" in m.Keys && m.Keys["S"])
		{
			this.transform.doRotations(this.rot);
			deltaX -= this.transform.forward[0]*.25;
			deltaZ -= this.transform.forward[2]*.25;
		}
		if("E" in m.Keys && m.Keys["E"] && this.canFire == true )
		{
			this.transform.doRotations(this.rot);
			var temp = m.CreateObject(2, Projectile, [this.loc[0], this.loc[1], -this.loc[2]], [0,0,0]);
			
			for(let i =0; i < 2; i++){
				//temp.velocity[i] = this.transform.forward[i] * .5;

				temp.velocity[i] = .01;
				
				temp.velocity[i] = (this.transform.forward[i] * .2) ;
			}
			temp.isTrigger=true;
			this.canFire = false;
			
		}
		this.Move()
		this.loc[0] += deltaX;
		this.loc[2] += deltaZ;
	}
	Render(program)
	{
				var camLoc  = gl.getUniformLocation(program,'worldLoc');
				gl.uniform3fv(camLoc,new Float32Array(this.loc));
				var worldLoc = gl.getUniformLocation(program,'worldRotation');
				gl.uniform3fv(worldLoc,new Float32Array(this.rot));
	}
	
	
}



class D4 extends GameObject
{
	constructor()
	{
		super();
		this.isTrigger = true;
		this.buffer=gl.createBuffer();
		 gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		 
		 //Now we want to add color to our vertices information.
		 this.vertices =
		 [	
		 -.5,-.5,0,0,0,0,
		 .5,-.5,0,1,0,0,
		 0,.5,0,1,0,0,
		 
		 -.5,-.5,0,0,1,0,
		 0,0,-.5,0,1,0,
		 .5,-.5,0,0,1,0,
		 
		 0,0,-.5,0,0,1,
		 .5,-.5,0,0,0,1,
		 0,.5,0,0,0,1,
		 
		 0,.5,0,1,1,0,
		 0,0,-.5,1,1,0,
		 -.5,-.5,0,1,1,0
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
		this.loc = [0.0,0.0,0.0];
		this.rot = [0.0,0.0,0.0];
		this.angVelocity = [0,.01,0];
	}
	Render(program)
	{
		//First we bind the buffer for triangle 1
		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		var size = 3;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 6*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element     // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.enableVertexAttribArray(positionAttributeLocation);
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
			
		
		//Now we have to do this for color
		var colorAttributeLocation = gl.getAttribLocation(program,"vert_color");
		//We don't have to bind because we already have the correct buffer bound.
		size = 3;
		type = gl.FLOAT;
		normalize = false;
		stride = 6*Float32Array.BYTES_PER_ELEMENT;	//Size in bytes of each element
		offset = 3*Float32Array.BYTES_PER_ELEMENT;									//size of the offset
		gl.enableVertexAttribArray(colorAttributeLocation);
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
				
		var tranLoc  = gl.getUniformLocation(program,'transform');
		gl.uniform3fv(tranLoc,new Float32Array(this.loc));
		var thetaLoc = gl.getUniformLocation(program,'rotation');
		gl.uniform3fv(thetaLoc,new Float32Array(this.rot));
		
		
		var primitiveType = gl.TRIANGLES;
		offset = 0;
		var count = 12;
		gl.drawArrays(primitiveType, offset, count);
	}
	Update()
	{
		this.Move();
	}
	
}


/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function (camera, body, eye) {

	var scope = this;

	camera.rotation.set( 0, 0, 0 );
	
	var yawObject, pitchObject, speed, vspeed;
	this.attach = function(body, eye, sp, vs) {
		yawObject = body;
		pitchObject = eye;
		pitchObject.add(camera);
		speed = sp;
		vspeed = vs;
	}
	
	this.attach(body, eye);
	

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;
	
	this.objectInFront = false;
	this.objectInBack = false;
	this.objectOnLeft = false;
	this.objectOnRight = false;

	this.velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				event.preventDefault();
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; break;
				event.preventDefault();

			case 40: // down
			case 83: // s
				moveBackward = true;
				event.preventDefault();
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				event.preventDefault();
				break;

			case 32: // space
				moveUp = true;
				event.preventDefault();
				break;

			case 16: // shift
				moveDown = true;
				event.preventDefault();
				break;

		}

	};

	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				event.preventDefault();
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				event.preventDefault();
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				event.preventDefault();
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				event.preventDefault();
				break;

			case 32: // space
				moveUp = false;
				event.preventDefault();
				break;
				
			case 16: // shift
				moveDown = false;
				event.preventDefault();
				break;
		}
	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( 0/*pitchObject.rotation.x*/, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		}

	}();
	
	this.getLookVector = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		}

	}();
	
	this.update = function (delta) {

		if ( scope.enabled === false ) return;

		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.z -= this.velocity.z * 10.0 * delta;
		this.velocity.y -= this.velocity.y * 10.0 * delta;
		
		if ( this.velocity.z < 0 && this.objectInFront) this.velocity.z = 0;
		if ( this.velocity.z > 0 && this.objectInBack ) this.velocity.z = 0;
		if ( this.velocity.x < 0 && this.objectOnLeft) this.velocity.x = 0;
		if ( this.velocity.x > 0 && this.objectOnRight) this.velocity.x = 0;

		
		if ( moveForward && !this.objectInFront) this.velocity.z -= speed * delta;
		if ( moveBackward && !this.objectInBack ) this.velocity.z += speed * delta;
		if ( moveLeft && !this.objectOnLeft) this.velocity.x -= speed * delta;
		if ( moveRight && !this.objectOnRight) this.velocity.x += speed * delta;


		if (moveDown) this.velocity.y -= vspeed * delta;
		if (moveUp) this.velocity.y += vspeed * delta;

		
		yawObject.translateX( this.velocity.x * delta );
		yawObject.translateY( this.velocity.y * delta ); 
		yawObject.translateZ( this.velocity.z * delta );
	};

};

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function (camera, body, eye) {

	var scope = this;

	var DECEL = 5.0;
	var A_DECEL = 5.0;
	
	var yawObject, pitchObject, speed, vspeed, angSpeed;
	this.attach = function(body, eye, sp, vs, as) {
		yawObject = body;
		pitchObject = eye;
		pitchObject.add(camera);
		camera.rotation.set( 0, 0, 0 );
		speed = sp;
		vspeed = vs;
		angSpeed = (as || 10);
	}
	
	this.attach(body, eye);
	

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;
	
	this.velocity = new THREE.Vector3();
	
	this.angVelocity = new THREE.Vector2();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		scope.angVelocity.x -= movementX * 0.002;
		scope.angVelocity.y -= movementY * 0.002;
		
		//yawObject.rotation.y -= movementX * 0.002;
		//pitchObject.rotation.x -= movementY * 0.002;

		//pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

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

		yawObject.rotation.y += this.angVelocity.x * angSpeed * delta;
		pitchObject.rotation.x += this.angVelocity.y * angSpeed * delta;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

		this.angVelocity.x -= this.angVelocity.x * A_DECEL * delta;
		this.angVelocity.y -= this.angVelocity.y * A_DECEL * delta;
		
		this.velocity.x -= this.velocity.x * DECEL * delta;
		this.velocity.z -= this.velocity.z * DECEL * delta;
		this.velocity.y -= this.velocity.y * DECEL * delta;
		
		if ( moveForward) this.velocity.z -= speed * delta;
		if ( moveBackward) this.velocity.z += speed * delta;
		if ( moveLeft) this.velocity.x -= speed * delta;
		if ( moveRight) this.velocity.x += speed * delta;
		if (moveDown) this.velocity.y -= vspeed * delta;
		if (moveUp) this.velocity.y += vspeed * delta;
		
		yawObject.translateX( this.velocity.x * delta );
		yawObject.translateY( this.velocity.y * delta ); 
		yawObject.translateZ( this.velocity.z * delta );
		
	};

};

const GAME_SETTING = new GameSetting();
const GAME = new Game();
const ADD_PLANET_SETTING = new AddPlanetSetting();


function Game() {
	const self = this;
	self.universe = new Universe(document.getElementById("universe_frame", -1, -1));
	self.add_planet = add_planet;
	self.universeRunning = false;
	self.universeSlowness = 10;
	function add_planet() {
		ADD_PLANET_SETTING.reloadSettings();
		var planet = new Planet(
			"no-id",
			self.universe,
			ADD_PLANET_SETTING.mass,
			new Vector2D(
				ADD_PLANET_SETTING.spawn_location_x,
				ADD_PLANET_SETTING.spawn_location_y
			),
			new Vector2D(
				ADD_PLANET_SETTING.spawn_velocity_x,
				ADD_PLANET_SETTING.spawn_velocity_y
			),
			ADD_PLANET_SETTING.color
		);
		self.universe.addPlanet(planet);
		planet.draw();
	}
	self.game_time_flow_switch = game_time_flow_switch;
	function game_time_flow_switch() {
		self.universeRunning = !(self.universeRunning);
		var button_time_flow_switch = document.getElementById("game_time_flow_switch");
		if (self.universeRunning) {
			button_time_flow_switch.style.backgroundColor = "#00FF00";
			threadRun(universeEngine, universeRunning, universeWaiting);
		}
		else {
			button_time_flow_switch.style.backgroundColor = "#FF0000";
		}
	}
	function universeEngine() {
		self.universe.draw();
		self.universe.updatePlanets();
	}
	function universeRunning() {
		return self.universeRunning;
	}
	function universeWaiting() {
		return self.universeSlowness;
	}
}

function GameSetting() {
	const self = this;
	self.constant_gravity_n = 1;
	self.constant_gravity_d = 1
	self.constant_dansity_n = 1;
	self.constant_dansity_d = 1;
	self.background_color = "#000000";
	reloadSettings();
	self.reloadSettings = reloadSettings;
	function reloadSettings() {
		console.log("Game Settings Reloaded");
		var input_constant_gravity_n = document.getElementById("universal_constant_gravity_n");
		var input_constant_gravity_d = document.getElementById("universal_constant_gravity_d");
		var input_constant_dansity_n = document.getElementById("universal_constant_dansity_n");
		var input_constant_dansity_d = document.getElementById("universal_constant_dansity_d");
		var input_background_color = document.getElementById("universal_background_color");
		self.constant_gravity_n = getNumberFromInput(input_constant_gravity_n, self.constant_gravity_n);
		self.constant_gravity_d = getNumberFromInput(input_constant_gravity_d, self.constant_gravity_d, function(value) {
			return value > 0;
		});
		self.constant_dansity_n = getNumberFromInput(input_constant_dansity_n, self.constant_dansity_n);
		self.constant_gravity_d = getNumberFromInput(input_constant_dansity_d, self.constant_dansity_d, function(value) {
			return value > 0;
		});
		self.background_color = getColorFromInput(input_background_color, self.background_color);
	}
}

function AddPlanetSetting() {
	const self = this;
	self.mass = 0;
	self.spawn_location_x = 0;
	self.spawn_location_y = 0;
	self.spawn_velocity_x = 0;
	self.spawn_velocity_y = 0;
	self.color = "#ffffff";
	reloadSettings();
	self.reloadSettings = reloadSettings;
	function reloadSettings() {
		var input_mass = document.getElementById("add_planet_mass");
		var input_spawn_location_x = document.getElementById("add_planet_spawn_location_x");
		var input_spawn_location_y = document.getElementById("add_planet_spawn_location_y");
		var input_spawn_velocity_x = document.getElementById("add_planet_spawn_velocity_x");
		var input_spawn_velocity_y = document.getElementById("add_planet_spawn_velocity_y");
		var input_color = document.getElementById("add_planet_color");
		self.mass = getNumberFromInput(input_mass, self.mass, function(v) {
			return v > 0;
		});
		self.spawn_location_x = getNumberFromInput(input_spawn_location_x, self.spawn_location_x);
		self.spawn_location_y = getNumberFromInput(input_spawn_location_y, self.spawn_location_y);
		self.spawn_velocity_x = getNumberFromInput(input_spawn_velocity_x, self.spawn_velocity_x);
		self.spawn_velocity_y = getNumberFromInput(input_spawn_velocity_y, self.spawn_velocity_y);
		self.color = getColorFromInput(input_color, self.color);
	}
}

function Universe(frame, width, height) {
	const self = this;
	const DEFAULT_WIDTH_RATE = 31 / 32;
	const DEFAULT_HEIGHT_RATE = 3 / 4;
	self.frame = frame;
	self.width = width;
	self.height = height;
	self.planets = [];
	self.center = []; //
	{
		// init
		draw();
	}
	self.draw = draw;
	function draw() {
		if (isNumber(self.width) && self.width >= 0) {
			frame.witth = self.width;
		}
		else {
			self.width = Math.floor(window.innerWidth * DEFAULT_WIDTH_RATE);
			frame.width = self.width;
		}
		if (isNumber(self.height) && self.height >= 0) {
			frame.height = self.height;
		}
		else {
			self.height = Math.floor(window.innerHeight * DEFAULT_HEIGHT_RATE);
			frame.height = self.height;
		}
		var ctx = self.frame.getContext("2d");
		ctx.beginPath();
		ctx.fillStyle = GAME_SETTING.background_color;
		ctx.fillRect(0, 0, self.width, self.height);
		for (var i = 0; i < self.planets.length; i++) {
			self.planets[i].draw();
		}
	}
	self.updatePlanets = updatePlanets;
	function updatePlanets() {
		self.planets.forEach(function(planet) {
			planet.updateLocation();
		});
		for (var i = 0; i < self.planets.length; i++) {
			pi = self.planets[i];
			if (!pi.existing) {
				continue;
			}
			for (var j = i + 1; j < self.planets.length; j++) {
				pj = self.planets[j];
				if (!pj.existing) {
					continue;
				}
				if (pi.isColliding(pj)) {
					if (pi.mass >= pj) {
						pi.collide(pj);
					}
					else {
						pj.collide(pi);
					}
				}
			}
		}
		for (var i = 0; i < self.planets.length; i++) {
			var planet = self.planets[i];
			planet.updateVelocity();
		}
	}
	self.addPlanet = addPlanet;
	function addPlanet(planet) {
		addElementInArray(self.planets, planet);
	}
	self.removePlanet = removePlanet;
	function removePlanet(planet) {
		removeElementInArray(self.planets, planet);
	}
}

function Planet(id, universe, mass, location, velocity, color) {
	const self = this;
	self.id = id;
	self.universe = universe;
	self.mass = mass;
	self.location = location;
	self.velocity = velocity;
	self.color = color;
	self.existing = true;
	console.log("new Planet(): mass = " + mass + ", location = " + location + ", velocity = " + velocity + ", color = " + color);
	this.draw = draw;
	function draw() {
		var ctx = universe.frame.getContext("2d");
		ctx.beginPath();
		ctx.fillStyle = self.color;
		ctx.arc(Math.floor(self.location.x + universe.width / 2), Math.floor(self.location.y + universe.height / 2), getRadius(), 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
	}
	this.getRadius = getRadius;
	function getRadius() {
		var constantDansity = GAME_SETTING.constant_dansity_n / GAME_SETTING.constant_dansity_d;
		return Math.ceil(Math.cbrt(self.mass / constantDansity))
	}
	self.updateLocation = updateLocation;
	function updateLocation() {
		self.location.meAddAnother(self.velocity);
	}
	self.updateVelocity = updateVelocity;
	function updateVelocity() {
		// self.velocity = self.velocity.addAnother(getAcceleration());
		self.velocity.meAddAnother(getAcceleration());
		function getGravityFromAnotherPlanet(another) {
			if (isColliding(another)) {
				return new Vector2D(0, 0);
			}
			var constantGravity = GAME_SETTING.constant_gravity_n / GAME_SETTING.constant_dansity_d;
			var distanceVector = another.location.minusAnother(self.location);
			var distanceScalar = distanceVector.getScalar();
			var forceScalar = constantGravity * self.mass * another.mass / Math.pow(distanceScalar, 2);
			var forceVector = distanceVector.vectorlizeScalar(forceScalar);
			return forceVector;
		}
		function getGravityFromAllOtherPlanets() {
			var totalForceVector = new Vector2D(0, 0);
			for (var i = 0; i < self.universe.planets.length; i++) {
				var planet = self.universe.planets[i];
				if (self === planet) {
					continue;
				}
				if (!planet.existing) {
					continue;
				}
				totalForceVector = totalForceVector.addAnother(getGravityFromAnotherPlanet(planet));
			}
			return totalForceVector;
		}
		function getAcceleration() {
			return getGravityFromAllOtherPlanets().multiplyScalar(1 / self.mass);
		}
	}
	self.collide = collide;
	function collide(another) {
		console.log("collide happened between planets: " + self + ", " + another);
		var m1 = self.mass, m2 = another.mass;
		var M1 = self.getMomentum(), M2 = another.getMomentum();
		var m = m1 + m2;
		var M = M1.addAnother(M2);
		var v = M.multiplyScalar(1 / m);
		var l = findMassCenter([self, another]);
		self.mass = m;
		self.location = l
		self.velocity = v;
		self.universe.removePlanet(another);
		another.existing = false;
		self.justCollided = true;
	}
	self.isColliding = isColliding;
	function isColliding(another) {
		if (!another.existing) {
			return false;
		}
		var distanceVector = another.location.minusAnother(self.location);
		var distanceScalar = distanceVector.getScalar();
		var flag = distanceScalar <= self.getRadius() + another.getRadius();
		return flag;
	}
	self.getMomentum = getMomentum;
	function getMomentum() {
		return self.velocity.multiplyScalar(self.mass);
	}
	self.toString = toString;
	function toString() {
		return "Planet: [id = " + self.id + ", mass = " + self.mass + ", location = " + self.location + ", velocity = " + self.velocity + ", color = " + self.color + "]";
	}
}

// below are the util methods:
function addElementInArray(arr, ele) {
	var index = arr.length;
	arr[index] = ele;
}

function removeElementInArray(arr, ele) {
	var index = arr.indexOf(ele);
	if (index !== -1) {
		arr.splice(index, 1);
	}
}

function isColor(strColor) {
	var s = new Option().style;
	s.color = strColor;
	var flag = s.color.length > 0;
	return flag;
}

function isNumber(number) {
	return typeof number === "number" && isFinite(number);
}

function getNumberFromInput(input, defaultValue, extraTestMethod) {
	if (!extraTestMethod) {
		extraTestMethod = function(value) {
			return true;
		}
	}
	function testMethod(value) {
		return isNumber(value) && extraTestMethod(value);
	}
	return getValueFromInput(input, defaultValue, testMethod, Number);
}

function getColorFromInput(input, defaultValue, extraTestMethod) {
	if (!extraTestMethod) {
		extraTestMethod = function(value) {
			return true;
		}
	}
	function testMethod(value) {
		return isColor(value) && extraTestMethod(value);
	}
	return getValueFromInput(input, defaultValue, testMethod);
}

function getValueFromInput(input, defaultValue, testMethod, transformMethod) {
	var value = input.value;
	if (transformMethod) {
		value = transformMethod(value);
	}
	if (testMethod(value)) {
		return value;
	}
	else {
		input.value = defaultValue;
		return defaultValue;
	}
}

function threadRun(code, keepRunning, wait) {
	var fuc = function() {
		code();
		if (keepRunning()) {
			threadRun(code, keepRunning, wait);
		}
	}
	setTimeout(fuc, wait);
}

function findMassCenter(planets) {
	var center = new Vector2D(0, 0);
	var massCounted = 0;
	for (var i = 0; i < planets.length; i++) {
		var planet = planets[i];
		var m = planet.mass;
		var l = planet.location;
		var dx = l.x - center.x, dy = l.y - center.y;
		var ax = 0, ay = 0;
		if (dx !== 0) {
			ax = dx * m / (massCounted + m);
		}
		if (dy !== 0) {
			ay = dy * m / (massCounted + m);
		}
		center.x = center.x + ax;
		center.y = center.y + ay;
		massCounted = massCounted + massCounted;;
	}
	return center;
}

function Vector2D(x, y) {
	const self = this;
	self.x = x;
	self.y = y;
	self.getScalar = getScalar;
	function getScalar() {
		var calResult = Math.sqrt(Math.pow(self.x, 2) + Math.pow(self.y, 2));
		return calResult
	}
	self.addAnother = addAnother;
	function addAnother(another) {
		return new Vector2D(self.x + another.x, self.y + another.y);
	}
	self.meAddAnother = meAddAnother;
	function meAddAnother(another) {
		self.x += another.x;
		self.y += another.y;
	}
	self.minusAnother = minusAnother;
	function minusAnother(another) {
		return new Vector2D(self.x - another.x, self.y - another.y);
	}
	self.meMinusAnother = meMinusAnother;
	function meMinusAnother(another) {
		self.x -= another.x;
		self.y -= another.y;
	}
	self.multiplyScalar = multiplyScalar;
	function multiplyScalar(scalar) {
		return new Vector2D(self.x * scalar, self.y * scalar);
	}
	self.meMultiplyScalar = meMultiplyScalar;
	function meMultiplyScalar(scalar) {
		self.x *= scalar;
		self.y *= scalar;
	}
	self.getDistanceFromAnother = getDistanceFromAnother;
	function getDistanceFromAnother(another) {
		var dx = another.x - self.x;
		var dy = another.y - self.y;
		return Math.sqrt(Math.pow(dx, 2), Math.pow(dy, 2));
	}
	self.vectorlizeScalar = vectorlizeScalar;
	function vectorlizeScalar(scalar) {
		var base = getScalar();
		if (base === 0) {
			return new Vector2D(0, 0);
		}
		return new Vector2D(scalar * self.x / base, scalar * self.y / base);
	}
	self.toString = toString;
	function toString() {
		return "[x = " + self.x + ", y = " + self.y + "]";
	}
}
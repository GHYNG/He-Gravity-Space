var info_logging = false; // true if logging some information, false will not output info to console

const GAME_SETTING = new GameSetting();
const GAME = new Game();
const ADD_PLANET_SETTING = new AddPlanetSetting();
const ADD_RANDOM_PLANETS_SETTING = new AddRandomPlanetsSetting();

function Game() {
	const self = this;
	self.universe = new Universe(document.getElementById("universe_frame", -1, -1));
	self.universeRunning = false;
	self.universeSlowness = 200;
	self.add_planet = add_planet;
	function add_planet() {
		ADD_PLANET_SETTING.reloadSettings();
		var id = "no-id";
		{
			// init id
			var defaultId = ADD_PLANET_SETTING.id === "";
			if (defaultId) {
				var idNum = 0;
				id = "planet" + idNum;
				while (self.universe.getPlanetById(id)) {
					idNum++;
					id = "planet" + idNum;
				}
			}
			else {
				id = ADD_PLANET_SETTING.id;
			}
		}
		var planet = new Planet(
			id,
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
	self.add_random_planets = add_random_planets;
	function add_random_planets() {
		ADD_RANDOM_PLANETS_SETTING.reloadSettings();
		var count = ADD_RANDOM_PLANETS_SETTING.count;
		for (var i = 0; i < count; i++) {
			var id = "planet";
			var setting = ADD_RANDOM_PLANETS_SETTING;
			var mass = rangeRandom(setting.mass_min, setting.mass_max);
			var lx = rangeRandom(setting.spawn_location_min_x, setting.spawn_location_max_x);
			var ly = rangeRandom(setting.spawn_location_min_y, setting.spawn_location_max_y);
			var l = new Vector2D(lx, ly);
			var vx = rangeRandom(setting.spawn_velocity_min_x, setting.spawn_velocity_max_y);
			var vy = rangeRandom(setting.spawn_velocity_min_y, setting.spawn_velocity_max_y);
			var v = new Vector2D(vx, vy);
			var color = rgbColor(rangeRandomInt(0, 256), rangeRandomInt(0, 256), rangeRandomInt(0, 256));
			var planet = new Planet(id, GAME.universe, mass, l, v, color);
			GAME.universe.addPlanet(planet);
			planet.draw();
		}

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
		logInfo("game settings reloading");
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
		logInfo("game settings reloaded")
	}
}

function AddPlanetSetting() {
	const self = this;
	self.id = "";
	self.mass = 0;
	self.spawn_location_x = 0;
	self.spawn_location_y = 0;
	self.spawn_velocity_x = 0;
	self.spawn_velocity_y = 0;
	self.color = "#ffffff";
	reloadSettings();
	self.reloadSettings = reloadSettings;
	function reloadSettings() {
		var input_id = document.getElementById("id");
		var input_mass = document.getElementById("add_planet_mass");
		var input_spawn_location_x = document.getElementById("add_planet_spawn_location_x");
		var input_spawn_location_y = document.getElementById("add_planet_spawn_location_y");
		var input_spawn_velocity_x = document.getElementById("add_planet_spawn_velocity_x");
		var input_spawn_velocity_y = document.getElementById("add_planet_spawn_velocity_y");
		var input_color = document.getElementById("add_planet_color");
		self.id = getValueFromInput(input_id, self.id, function(value) {
			return typeof value === "string" && value.length > 0;
		})
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

function AddRandomPlanetsSetting() {
	const self = this;
	self.count = 1;
	self.mass_min = 1;
	self.mass_max = 2;
	self.spawn_location_min_x = - GAME.universe.width;
	self.spawn_location_min_y = - GAME.universe.height;
	self.spawn_location_max_x = GAME.universe.width;
	self.spawn_location_max_y = GAME.universe.height;
	self.spawn_velocity_min_x = -1;
	self.spawn_velocity_min_y = -1;
	self.spawn_velocity_max_x = 1;
	self.spawn_velocity_max_y = 1;
	reloadSettings();
	self.reloadSettings = reloadSettings;
	function reloadSettings() {
		var input_count = document.getElementById("add_random_planets_count");
		var input_mass_min = document.getElementById("add_random_planets_mass_min");
		var input_mass_max = document.getElementById("add_random_planets_mass_max");
		var input_spawn_location_min_x = document.getElementById("add_random_planets_spawn_location_min_x");
		var input_spawn_location_min_y = document.getElementById("add_random_planets_spawn_location_min_y");
		var input_spawn_location_max_x = document.getElementById("add_random_planets_spawn_location_max_x");
		var input_spawn_location_max_y = document.getElementById("add_random_planets_spawn_location_max_y");
		var input_spawn_velocity_min_x = document.getElementById("add_random_planets_spawn_velocity_min_x");
		var input_spawn_velocity_min_y = document.getElementById("add_random_planets_spawn_velocity_min_y");
		var input_spawn_velocity_max_x = document.getElementById("add_random_planets_spawn_velocity_max_x");
		var input_spawn_velocity_max_y = document.getElementById("add_random_planets_spawn_velocity_max_y");
		self.count = getNumberFromInput(input_count, self.count, function(value) {
			return value > 0;
		});
		self.mass_min = getNumberFromInput(input_mass_min, self.mass_min, function(value) {
			return value > 0;
		});
		self.mass_max = getNumberFromInput(input_mass_max, self.mass_max, function(value) {
			return value > 0;
		});
		self.spawn_location_min_x = getNumberFromInput(input_spawn_location_min_x, self.spawn_location_min_x);
		self.spawn_location_min_y = getNumberFromInput(input_spawn_location_min_y, self.spawn_location_min_y);
		self.spawn_location_max_x = getNumberFromInput(input_spawn_location_max_x, self.spawn_location_max_x);
		self.spawn_location_max_y = getNumberFromInput(input_spawn_location_max_y, self.spawn_location_max_y);
		self.spawn_velocity_min_x = getNumberFromInput(input_spawn_velocity_min_x, self.spawn_velocity_min_x);
		self.spawn_velocity_min_y = getNumberFromInput(input_spawn_velocity_min_y, self.spawn_velocity_min_y);
		self.spawn_velocity_max_x = getNumberFromInput(input_spawn_velocity_max_x, self.spawn_velocity_max_x);
		self.spawn_velocity_max_y = getNumberFromInput(input_spawn_velocity_max_y, self.spawn_velocity_max_y);
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
					if (pi.mass >= pj.mass) {
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
		if (getPlanetById(planet.id)) {
			var newIndex = 0;
			var id = planet.id + " " + newIndex;
			while (getPlanetById(id)) {
				console.log("repeated id found in while");
				newIndex++;
				id = planet.id + " " + newIndex;
				console.log("id = " + id);
			}
			planet.id = id;
		}
		addElementInArray(self.planets, planet);
		return true;
	}
	self.removePlanet = removePlanet;
	function removePlanet(planet) {
		return removeElementInArray(self.planets, planet);
	}
	self.getPlanetById = getPlanetById;
	function getPlanetById(id) {
		var planets = self.planets;
		for (var i = 0; i < planets.length; i++) {
			var planet = planets[i];
			if (planet.id === id) {
				return planet;
			}
		}
		return null;
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
		self.velocity.meAddAnother(getAcceleration());
		function getGravityFromAnotherPlanet(another) {
			if (isColliding(another)) {
				return new Vector2D(0, 0);
			}
			var constantGravity = GAME_SETTING.constant_gravity_n / GAME_SETTING.constant_gravity_d;
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
		logInfo("collide happened between planets: \n    " + self + "\n    " + another);
		var m1 = self.mass, m2 = another.mass;
		var M1 = self.getMomentum(), M2 = another.getMomentum();
		var m = m1 + m2;
		var M = M1.addAnother(M2);
		var v = M.multiplyScalar(1 / m);
		var l = findMassCenter([self, another]); // this method is not working well
		self.mass = m;
		// self.location = l
		self.velocity = v;
		self.universe.removePlanet(another);
		another.existing = false;
		self.justCollided = true;
		logInfo("collide result: \n    " + self);
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
	logInfo("planet created: " + self)
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
		return true;
	}
	return false;
}

function rangeRandom(min, max) {
	return Math.random() * (max - min) + min;
}

function rangeRandomInt(min, max) {
	return Math.floor(rangeRandom(min, max));
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

function rgbColor(r, g, b) {
	return "rgb(" + r + ", " + g + ", " + b + ")";
}

// Logging System
function logInfo(message) {
	if (info_logging) {
		var completeMessage = "[info]: " + message;
		console.log(completeMessage);
	}
}
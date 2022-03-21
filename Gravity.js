let info_logging = false; // true if logging some information, false will not output info to console

const GAME_SETTING = new GameSetting();
const GAME = new Game();
const ADD_PLANET_SETTING = new AddPlanetSetting();
const ADD_RANDOM_PLANETS_SETTING = new AddRandomPlanetsSetting();

function Game() {
	const self = this;
	self.universe = new Universe(document.getElementById("universe_frame", -1, -1));
	self.universeRunning = false;
	self.universeSlowness = 20;
	self.universe_resize = universe_resize;
	function universe_resize() {
		self.universe.width = Math.floor(window.innerWidth * 31 / 32);
		self.universe.height = Math.floor(window.innerHeight * 3 / 4);
	}
	self.add_planet = add_planet;
	function add_planet() {
		ADD_PLANET_SETTING.reloadSettings();
		let id = ADD_PLANET_SETTING.id;
		{
			// init id
			if (id === "") {
				id = "planet";
			}
		}
		let planet = new Planet(
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
		let count = ADD_RANDOM_PLANETS_SETTING.count;
		for (let i = 0; i < count; i++) {
			let id = "planet";
			let setting = ADD_RANDOM_PLANETS_SETTING;
			let mass = rangeRandom(setting.mass_min, setting.mass_max);
			let lx = rangeRandom(setting.spawn_location_min_x, setting.spawn_location_max_x);
			let ly = rangeRandom(setting.spawn_location_min_y, setting.spawn_location_max_y);
			let l = new Vector2D(lx, ly);
			let vx = rangeRandom(setting.spawn_velocity_min_x, setting.spawn_velocity_max_y);
			let vy = rangeRandom(setting.spawn_velocity_min_y, setting.spawn_velocity_max_y);
			let v = new Vector2D(vx, vy);
			let color = rgbColor(rangeRandomInt(0, 255), rangeRandomInt(0, 255), rangeRandomInt(0, 255));
			let planet = new Planet(id, GAME.universe, mass, l, v, color);
			GAME.universe.addPlanet(planet);
			planet.draw();
		}

	}
	self.game_time_flow_switch = game_time_flow_switch;
	function game_time_flow_switch() {
		self.universeRunning = !(self.universeRunning);
		let button_time_flow_switch = document.getElementById("game_time_flow_switch");
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
		let input_constant_gravity_n = document.getElementById("universal_constant_gravity_n");
		let input_constant_gravity_d = document.getElementById("universal_constant_gravity_d");
		let input_constant_dansity_n = document.getElementById("universal_constant_dansity_n");
		let input_constant_dansity_d = document.getElementById("universal_constant_dansity_d");
		let input_background_color = document.getElementById("universal_background_color");
		self.constant_gravity_n = getNumberFromInput(input_constant_gravity_n, self.constant_gravity_n);
		self.constant_gravity_d = getNumberFromInput(input_constant_gravity_d, self.constant_gravity_d, function(value) {
			return value > 0;
		});
		self.constant_dansity_n = getNumberFromInput(input_constant_dansity_n, self.constant_dansity_n);
		self.constant_dansity_d = getNumberFromInput(input_constant_dansity_d, self.constant_dansity_d, function(value) {
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
		let input_id = document.getElementById("id");
		let input_mass = document.getElementById("add_planet_mass");
		let input_spawn_location_x = document.getElementById("add_planet_spawn_location_x");
		let input_spawn_location_y = document.getElementById("add_planet_spawn_location_y");
		let input_spawn_velocity_x = document.getElementById("add_planet_spawn_velocity_x");
		let input_spawn_velocity_y = document.getElementById("add_planet_spawn_velocity_y");
		let input_color = document.getElementById("add_planet_color");
		let input_color_r = document.getElementById("add_planet_color_r");
		let input_color_g = document.getElementById("add_planet_color_g");
		let input_color_b = document.getElementById("add_planet_color_b");
		let inputBlock_color = new InputBlock_Color(input_color, input_color_r, input_color_g, input_color_b);
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
		let input_count = document.getElementById("add_random_planets_count");
		let input_mass_min = document.getElementById("add_random_planets_mass_min");
		let input_mass_max = document.getElementById("add_random_planets_mass_max");
		let input_spawn_location_min_x = document.getElementById("add_random_planets_spawn_location_min_x");
		let input_spawn_location_min_y = document.getElementById("add_random_planets_spawn_location_min_y");
		let input_spawn_location_max_x = document.getElementById("add_random_planets_spawn_location_max_x");
		let input_spawn_location_max_y = document.getElementById("add_random_planets_spawn_location_max_y");
		let input_spawn_velocity_min_x = document.getElementById("add_random_planets_spawn_velocity_min_x");
		let input_spawn_velocity_min_y = document.getElementById("add_random_planets_spawn_velocity_min_y");
		let input_spawn_velocity_max_x = document.getElementById("add_random_planets_spawn_velocity_max_x");
		let input_spawn_velocity_max_y = document.getElementById("add_random_planets_spawn_velocity_max_y");
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
			frame.width = self.width;
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
		let ctx = self.frame.getContext("2d");
		ctx.beginPath();
		ctx.fillStyle = GAME_SETTING.background_color;
		ctx.fillRect(0, 0, self.width, self.height);
		for (let i = 0; i < self.planets.length; i++) {
			self.planets[i].draw();
		}
	}
	// self.updatePlanetsLastRan = Date.now(); // this is for test purpose only. disable this for formal release.
	self.updatePlanets = updatePlanets;
	function updatePlanets() {
		// console.log("updatePlanets(): " + (Date.now() - self.updatePlanetsLastRan));
		self.updatePlanetsLastRan = Date.now();
		let planets = self.planets;
		// process new location
		planets.forEach(function(planet) {
			planet.updateLocation();
		});
		// process collide
		// the 1/2 complaxity algorithm should not be applied here
		for (let i = 0; i < planets.length; i++) {
			let pi = planets[i];
			for (let j = i + 1; j < planets.length; j++) {
				let pj = planets[j];
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
		// process new velocity
		/*
			// this is old algorithm
			for (let i = 0; i < planets.length; i++) {
				let pi = planets[i];
				setTimeout(function() {
					for (let j = i + 1; j < planets.length; j++) {
						let pj = planets[j];
						pi.adjustVelocityWithAnotherPlanet(pj);
					}
				});
			}
		*/
		// process new velocity new algorithm
		updateVelocity(0, planets.length - 1);
		function updateVelocity(begIndex, endIndex) {
			if(endIndex - begIndex > 1) {
				let midIndex = Math.floor((endIndex + begIndex) / 2);
				updateVelocity(begIndex, midIndex);
				updateVelocity(midIndex + 1, endIndex);
				return;
			}
			else {
				setTimeout(loop, 0, begIndex);
				if(begIndex !== endIndex) {
					setTimeout(loop, 0, endIndex);
				}
			}
			function loop(indexi) {
				for(let indexj = indexi + 1; indexj < planets.length; indexj++) {
					planets[indexi].adjustVelocityWithAnotherPlanet(planets[indexj]);
				}
			}
		}
	}
	self.addPlanet = addPlanet;
	function addPlanet(planet) {
		if (getPlanetById(planet.id)) {
			let newIndex = 0;
			let id = planet.id + " " + self.planets.length;
			while (getPlanetById(id)) {
				newIndex++;
				id = planet.id + " " + newIndex;
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
		let planets = self.planets;
		for (let i = 0; i < planets.length; i++) {
			let planet = planets[i];
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
		let ctx = universe.frame.getContext("2d");
		ctx.beginPath();
		ctx.fillStyle = self.color;
		ctx.arc(Math.floor(self.location.x + universe.width / 2), Math.floor(self.location.y + universe.height / 2), getRadius(), 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
	}
	this.getRadius = getRadius;
	function getRadius() {
		let constantDansity = GAME_SETTING.constant_dansity_n / GAME_SETTING.constant_dansity_d;
		return Math.ceil(Math.cbrt(self.mass / constantDansity))
	}
	self.updateLocation = updateLocation;
	function updateLocation() {
		self.location.meAddAnother(self.velocity);
	}
	self.adjustVelocityWithAnotherPlanet = adjustVelocityWithAnotherPlanet;
	function adjustVelocityWithAnotherPlanet(another) {
		let force = getGravityFromAnotherPlanet(another);
		self.applyForce(force);
		another.applyForce(force.multiplyScalar(-1));
		function getGravityFromAnotherPlanet(another) {
			let constantGravity = GAME_SETTING.constant_gravity_n / GAME_SETTING.constant_gravity_d;
			let distanceVector = another.location.minusAnother(self.location);
			let distanceScalar = distanceVector.getScalar();
			let forceScalar = constantGravity * self.mass * another.mass / Math.pow(distanceScalar, 2);
			let forceVector = distanceVector.vectorlizeScalar(forceScalar);
			return forceVector;
		}
	}
	self.applyForce = applyForce;
	function applyForce(force) {
		let acce = force.multiplyScalar(1 / self.mass);
		self.velocity.meAddAnother(acce);
	}
	self.collide = collide;
	function collide(another) {
		logInfo("collide happened between planets: \n    " + self + "\n    " + another);
		let m1 = self.mass, m2 = another.mass;
		let M1 = self.getMomentum(), M2 = another.getMomentum();
		let m = m1 + m2;
		let M = M1.addAnother(M2);
		let v = M.multiplyScalar(1 / m);
		let l = findMassCenter([self, another]); // this method is not working well
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
		let distanceVector = another.location.minusAnother(self.location);
		let distanceScalar = distanceVector.getScalar();
		let flag = distanceScalar <= self.getRadius() + another.getRadius();
		return flag;
	}
	self.getMomentum = getMomentum;
	function getMomentum() {
		return self.velocity.multiplyScalar(self.mass);
	}
	self.toString = toString;
	function toString() {
		return "Planet: [id = " + self.id + ", mass = " + self.mass.toFixed(2) + ", location = " + self.location + ", velocity = " + self.velocity + ", color = " + self.color + "]";
	}
	logInfo("planet created: " + self)
}

// below are the util methods:
function addElementInArray(arr, ele) {
	let index = arr.length;
	arr[index] = ele;
}

function removeElementInArray(arr, ele) {
	let index = arr.indexOf(ele);
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
	let s = new Option().style;
	s.color = strColor;
	let flag = s.color.length > 0;
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
	let value = input.value;
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
	let fuc = function() {
		code();
		if (keepRunning()) {
			threadRun(code, keepRunning, wait);
		}
	}
	setTimeout(fuc, wait);
}

function findMassCenter(planets) {
	let center = new Vector2D(0, 0);
	let massCounted = 0;
	for (let i = 0; i < planets.length; i++) {
		let planet = planets[i];
		let m = planet.mass;
		let l = planet.location;
		let dx = l.x - center.x, dy = l.y - center.y;
		let ax = 0, ay = 0;
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
		let calResult = Math.sqrt(Math.pow(self.x, 2) + Math.pow(self.y, 2));
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
		let dx = another.x - self.x;
		let dy = another.y - self.y;
		return Math.sqrt(Math.pow(dx, 2), Math.pow(dy, 2));
	}
	self.vectorlizeScalar = vectorlizeScalar;
	function vectorlizeScalar(scalar) {
		let base = getScalar();
		if (base === 0) {
			return new Vector2D(0, 0);
		}
		return new Vector2D(scalar * self.x / base, scalar * self.y / base);
	}
	self.toString = toString;
	function toString() {
		return "[x = " + self.x.toFixed(2) + ", y = " + self.y.toFixed(2) + "]";
	}
}

function InputBlock_Color(inputColor, inputR, inputG, inputB) {
	const self = this;
	self.inputColor = inputColor;
	self.inputR = inputR;
	self.inputG = inputG;
	self.inputB = inputB;
	inputColor.addEventListener("input", function() {
		let hex = inputColor.value;
		let rgb = hexToRGBComponents(hex);
		inputR.value = rgb[0];
		inputG.value = rgb[1];
		inputB.value = rgb[2];
	});
	self.inputR.addEventListener("input", adjustRGBInput);
	self.inputG.addEventListener("input", adjustRGBInput);
	self.inputB.addEventListener("input", adjustRGBInput);
	function adjustRGBInput() {
		let r = getNumberFromInput(self.inputR, 255, goodRange);
		let g = getNumberFromInput(self.inputG, 255, goodRange);
		let b = getNumberFromInput(self.inputB, 255, goodRange);
		inputColor.value = rgbComponentsToHex(r, g, b);
		function goodRange(value) {
			return value <= 255 && value >= 0;
		}
	}
}

function rgbColor(r, g, b) {
	return "rgb(" + r + ", " + g + ", " + b + ")";
}

function rgbComponentsToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
	function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}
}

function hexToRgb(hex) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function hexToRGBComponents(hex) {
	let arr = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	let result = [];
	result[0] = parseInt(arr[1], 16);
	result[1] = parseInt(arr[2], 16);
	result[2] = parseInt(arr[3], 16);
	return result;
}


// Logging System
function logInfo(message) {
	if (info_logging) {
		let completeMessage = "[info]: " + message;
		console.log(completeMessage);
	}
}
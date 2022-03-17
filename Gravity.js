var programRunning = false;
var timeSpeed = 10;

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
const universe = new Universe(document.getElementById("universe_frame"), Math.floor(windowWidth * 31 / 32), Math.floor(windowHeight * 3 / 4), "rgb(0, 0, 0)");
var planets = new Array();

const inputBox_uni_g = document.getElementById("universal_gravity");
const inputBox_uni_d = document.getElementById("universal_density");
const inputBox_uni_ag = document.getElementById("universal_anti_gravity");
const inputBox_uni_ad = document.getElementById("universal_anti_density");
const inputBox_uni_color = document.getElementById("universal_background_color");

universe.uni_g = inputBox_uni_g.value;
universe.uni_d = inputBox_uni_d.value;
universe.uni_ag = inputBox_uni_ag.value;
universe.uni_ad = inputBox_uni_ad.value;


function Universe(frame, width, height, bgc) {
	this.frame = frame;
	this.width = width;
	this.height = height;
	this.bgc = bgc;
	resize(width, height);
	recolor(bgc);
	function resize(width, height) {
		if(width === null) {
			width = Math.floor(windowWidth * 31 / 32);
		}
		if(height === null) {
			height = Math.floor(windowHeight * 3 / 4);
		}
		this.width = width;
		this.height = height;
		frame.width = width;
		frame.height = height;
	}
	this.resize = resize;
	function recolor(color) {
		var ctx = frame.getContext("2d");
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, width, height);
	}
	this.recolor = recolor;
}

function reset() {
	onWindowResized();
	universe.resize(null, null);
	universe.recolor(inputBox_uni_color.value);
	universe.uni_g = inputBox_uni_g.value;
	universe.uni_d = inputBox_uni_d.value;
	planets = [];
	if(programRunning) {
		power_switch();
	}
}

function onWindowResized() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
}

const inputBox_obj_m = document.getElementById("object_mass");
const inputBox_obj_lx = document.getElementById("object_loc_x");
const inputBox_obj_ly = document.getElementById("object_loc_y");
const inputBox_obj_vx = document.getElementById("object_vel_x");
const inputBox_obj_vy = document.getElementById("object_vel_y");
const inputBox_obj_color = document.getElementById("object_color");

function create_object() {
	var planet = new Planet(inputBox_obj_m.value, inputBox_obj_lx.value, inputBox_obj_ly.value, inputBox_obj_vx.value, inputBox_obj_vy.value, inputBox_obj_color.value);
	var index = planets.length;
	planets[index] = planet;
	planet.draw();
}

function Planet(mass, lx, ly, vx, vy, color) {
	var self = this;
	self.mass = parseInt(mass);
	self.lx = parseInt(lx);
	self.ly = parseInt(ly);
	self.vx = parseInt(vx);
	self.vy = parseInt(vy);
	self.color = color;
	self.r = Math.ceil(Math.cbrt(mass / universe.uni_d));
	function draw() {
		var ctx = universe.frame.getContext("2d");
		ctx.beginPath(); // 绝命换行
		ctx.fillStyle = color;
		ctx.arc(self.lx + Math.floor(universe.frame.width / 2), self.ly + Math.floor(universe.frame.height / 2), self.r, 0, 2 * Math.PI);
		ctx.fill();
		ctx.restore();
		// console.log("drawing new body at: x = " + self.lx + ", y = " + self.ly);
	}
	self.draw = draw;
	function calculateNewLocation() {
		return [self.lx + self.vx, self.ly + self.vy];
	}
	self.calculateNewLocation = calculateNewLocation;
	function forceFromAnotherPlanet(another) {
		if(isColliding(another)) {
			return [0, 0];
		}
		var am = another.mass;
		var ax = another.lx;
		var ay = another.ly;
		var dx = ax - self.lx;
		var dy = ay - self.ly;
		if(dx == 0 && dy == 0) {
			return [0, 0];
		}
		var distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		var forceScale = universe.uni_g * self.mass * am / Math.pow(distance, 2);
		var forceX = forceScale * dx / distance;
		var forceY = forceScale * dy / distance;
		return [forceX / universe.uni_ag, forceY / universe.uni_ag];
	}
	self.forceFromAnotherPlanet = forceFromAnotherPlanet;
	function forceFromAllPlanets() {
		var forceTotalVector = [0, 0];
		for(var i = 0; i < planets.length; i++) {
			var another = planets[i];
			if(self === another) {
				continue;
			}
			var forceVector = forceFromAnotherPlanet(another);
			forceTotalVector[0] = forceTotalVector[0] + forceVector[0];
			forceTotalVector[1] = forceTotalVector[1] + forceVector[1];
		}
		return forceTotalVector;
	}
	self.forceFromAllPlanets = forceFromAllPlanets;
	function calculateNewVelocity() {
		var forceTotalVector = forceFromAllPlanets();
		var fx = forceTotalVector[0];
		var fy = forceTotalVector[1];
		var ax = fx / self.mass;
		var ay = fy / self.mass;
		return [self.vx + ax, self.vy + ay]
	}
	self.calculateNewVelocity = calculateNewVelocity;
	function isColliding(another) {
		if(another === null) {
			return false;
		}
		var distance = getDistanceFromAnotherPlanet(another);
		var r1 = self.r; r2 = another.r;
		return r1 + r2 >= distance;
	}
	self.isColliding = isColliding;
	function getDistanceFromAnotherPlanet(another) {
		if(another === null) {
			return 0;
		}
		var x1 = self.lx, y1 = self.ly;
		var x2 = another.lx, y2 = another.ly;
		return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
	}
}

function mainEngine() {
	universe.recolor(universe.bgc);
	// collide engine
	for(var i = 0; i < planets.length; i++) {
		var planeti = planets[i];
		for(var j = i + 1; j < planets.length; j++) {
			var planetj = planets[j];
			var colliding = planeti.isColliding(planetj);
			if(colliding) {
				var mi = planeti.mass, mj = planetj.mass;
				var vi = [planeti.vx, planeti.vy], vj = [planeti.vx, planeti.vy];
				var Mi = [vi[0] * mi, vi[1] * mi], Mj = [vj[0] * mj, vj[1] * mj];
				console.log("vi = " + vi);
				console.log("Mi = " + Mi);
				console.log("vj = " + vj);
				console.log("Mj = " + Mj);
				var m = mi + mj;
				var M = [Mi[0] + Mj[0], Mi[1] + Mj[1]];
				var v = [M[0] / m, M[1] / m];
				var color = mi >= mj ? planeti.color : planetj.color;
				var l = mi >= mj ? [planeti.lx, planeti.ly] : [planetj.lx, planetj.ly];
				var newPlanet = new Planet(m, l[0], l[1], v[0], v[1], color);
				console.log("l = " + l);
				console.log("v = " + v);
				console.log("m = " + m);
				console.log("M = " + M);
				removeElementInArray(planets, planeti);
				removeElementInArray(planets, planetj);
				addElementInArray(planets, newPlanet);
			}
		}
	}
	// location and velocity re-calculation
	for(var i = 0; i < planets.length; i++) {
		var planet = planets[i];
		var newLocation = planet.calculateNewLocation();
		planet.lx = newLocation[0];
		planet.ly = newLocation[1];
		planet.draw();
		var newVelocity = planet.calculateNewVelocity();
		planet.vx = newVelocity[0];
		planet.vy = newVelocity[1];
	}
	if(programRunning) {
		setTimeout(mainEngine, timeSpeed);
	}
}

setTimeout(mainEngine, timeSpeed);

function power_switch() {
	programRunning = !programRunning;
	var button = document.getElementById("power_switch");
	if(programRunning) {
		button.style.backgroundColor = "#00FF00";
		setTimeout(mainEngine, timeSpeed);
	}
	else {
		button.style.backgroundColor = "#FF0000";
	}
}

// below are the util methods:
function addElementInArray(arr, ele) {
	var index = arr.length;
	arr[index] = ele;
}

function removeElementInArray(arr, ele) {
	var index = arr.indexOf(ele);
	if(index !== -1) {
		arr.splice(index, 1);
	}
}

function threadRun(code, keepRunning, wait) {
	code();
	if(keepRunning()) {
		setTimeout(code, wait());
	}
}
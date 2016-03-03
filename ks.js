 "use strict";

function add_w(c, w) {
	var t = '';
	for (var i = 0; i <= w; i++) {
		t += c;
	}
	return t;
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function invert_pos(pos) {
	pos.x = pos.x != 0 ? pos.x * -1 : 0;
	pos.y = pos.y != 0 ? pos.y * -1 : 0;
	return pos;
}

function safe_pos(x, y) {
	if (x < -6 || x > 6 || y < -6 || y > 6) return false;
	else return true;
}

function pos_eq(pos1, pos2) {
	return (pos1.x == pos2.x && pos1.y == pos2.y);
}

function next_move(pos1, pos2) {
	var new_pos = clone(pos1);
	if (pos2.x > pos1.x) {
		new_pos.x++;
	}
	else if (pos2.x < pos1.x) {
		new_pos.x--;
	}
	if (pos2.y > pos1.y) {
		new_pos.y++;
	}
	else if (pos2.y < pos1.y) {
		new_pos.y--;
	}

	if (pos_eq(new_pos, pos1)) return false;

	return new_pos;
}

function coord_diff(pos1, pos2) {
	var d = {};
	if (pos1.x > pos2.x) {
		d.x = pos1.x-pos2.x;
	}
	else {
		d.x = pos2.x-pos1.x;
	}
	if (pos1.y > pos2.y) {
		d.y = pos1.y-pos2.y;
	}
	else {
		d.y = pos2.y-pos1.y;
	}
	return d;
}

function apply_diff(d, pos) {
	pos.x += d.x;
	pos.y += d.y;
	return pos;
}

function fly_dist(pos1, pos2) {
	var diff = coord_diff(pos1, pos2);
	return Math.sqrt((diff.x*diff.x)+(diff.y*diff.y));
}

function Matrix(team_1, team_2, ball, goal_1, goal_2) {
	var spots = [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];
	for (var i in spots) {
		var y = spots[i];
		this[y] = {};
		for (var i2 in spots) {
			var x = spots[i2];
			this[y][x] = {x: x, y: y, o: []};
		}
	}
	if (team_1) this.apply_objects(team_1);
	if (team_2) this.apply_objects(team_2);
	if (ball) this.apply_object(ball);
	if (goal_1) this.apply_object(goal_1);
	if (goal_1) this.apply_object(goal_1.post1);
	if (goal_1) this.apply_object(goal_1.post2);
	if (goal_2) this.apply_object(goal_2);
	if (goal_1) this.apply_object(goal_2.post1);
	if (goal_1) this.apply_object(goal_2.post2);
}

Matrix.prototype.apply_objects = function(objects) {
	for (var id in objects) {
		if (objects[id].pos) this[objects[id].pos.y][objects[id].pos.x].o.push(objects[id]);
	}
	return this;
}

Matrix.prototype.apply_object = function(object) {
	if (object.pos) this[object.pos.y][object.pos.x].o.push(object);
	return this;
}

Matrix.prototype.close_to = function(pos) {
	if (this[pos.y][pos.x].o.length > 1) {
		return this[pos.y][pos.x].o;
	}
	else {
		var objects = [];
		var done = false;
		var d = 0;
		while (done == false) {
			
			var positions = {};
			for (var i = 0; i <= d; i++) {
				if (d > 0) {
					for (var y = pos.y-d; y <= pos.y+d; y++) {
						for (var x = pos.x-d; x <= pos.x+d; x++) {
							if (!positions[x+','+y] && safe_pos(x, y)) {
								positions[x+','+y] = {x: x, y: y};
								positions[x+','+y].d = fly_dist(positions[x+','+y], pos);
							} 
						}
					} 
				} else {
					positions[pos.x+','+pos.y] = pos;
					positions[pos.x+','+pos.y].d = 0;
				}
			}

			for (var id in positions) {
				var m = this[positions[id].y][positions[id].x];
				if (m.o.length) {
					for (var i in m.o) {
						if (m.o[i].k != 'b') {
							var o = m.o[i];
							o.dist = positions[id].d;
							objects.push(o);
						}
					}
				}
			}

			d++;
			if (objects.length) {
				return objects;
			}
		}

		return objects;
	}
}

Matrix.prototype.to_text = function() {
	var spots = [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];
	var text = "\r\n";
	for (var i in spots) {
		var y = spots[i];
		for (var i2 in spots) {
			var x = spots[i2];
			var m = this[y][x];
			if (m.o.length) {
				var l = m.o.length;
				var p = 7-l;
				var pl = Math.ceil(p/2);
				var pr = Math.floor(p/2);

				var r = '';
				r += add_w(' ', pl);
				for (var i3 in m.o) {
					r += m.o[i3].d;
				}
				r += add_w(' ', pr);

				text += r;
			}
			else {
				text += '    .    ';
			}
		}
		text += "\r\n\r\n\r\n";
	}
	return text;
}

function Player(p) {
	for (var k in p) {
		this[k] = p[k];
	}
	this.command = [];
}

Player.prototype.distFrom = function(pos) {
	var d = Math.floor(fly_dist(pos, this.pos));
	return d;
}

var OUT_OF_RANGE = -1;
var BALL_HELD = -2;
var NEEDS_BALL = -3;
Player.prototype.moveTo = function(pos) {
	if (pos == this.pos) return false;

	this.command = [{c: 'move', t: pos}];
	return true;
};

Player.prototype.dribbleTo = function(pos) {
	if (!this.has_ball) {
		return NEEDS_BALL;
	}
	if (pos == this.pos) return false;

	this.command = [{c: 'dribble', t: pos}];
	return true;
};

Player.prototype.gather = function(ball) {
	if (!pos_eq(ball.pos, this.pos)) {
		return OUT_OF_RANGE;
	}
	else if (ball.holder) {
		return BALL_HELD;
	}
	this.command = [{c: 'gather'}];
	return true;
};

Player.prototype.pass = function(p) {
	this.command = [{c: 'pass', t: p}];
	return true;
}

Player.prototype.shoot = function(ball) {
	if (!this.has_ball) {
		return NEEDS_BALL;
	}
	else if (!pos_eq(this.pos, ball.pos)) {
		return OUT_OF_RANGE;
	}
	this.command = [{c: 'shoot'}];
	return true;
}

Player.prototype.tackle = function(p) {
	var d = fly_dist(p.pos, this.pos);
	if (d > 0) {
		return OUT_OF_RANGE;
	}
	this.command = [{c: 'tackle', t: p}];
	return true;
};

Player.prototype.slide = function(p) {
	var d = fly_dist(p.pos, this.pos);
	if (d >= 1.8) {
		return OUT_OF_RANGE;
	}
	this.command = [{c: 'slide', t: p}];
	return true;
};

Player.prototype.foul = function(p) {
	var d = fly_dist(p.pos, this.pos);
	if (d > 1.8) {
		return OUT_OF_RANGE;
	}
	this.command = [{c: 'foul', t: p}];
	return true;
};

Player.prototype.clearance = function(ball) {
	var d = fly_dist(ball.pos, this.pos);
	
	if (d > 0) {
		return OUT_OF_RANGE;
	}
	this.command = [{c: 'clearance', t: ball}];
	return true;
};

function Ball(pos, holder) {
	this.pos = pos;
	this.sp = pos;
	this.p = 0;
	this.k = 'b';
	this.d = 'B';
	if (holder) this.holder = holder;
}

Ball.prototype.invalid = function() {
	return (this.pos.x < -6 || this.pos.x > 6 || this.pos.y < -6 || this.pos.y > 6)
}

function Goal(pos) {
	this.pos = pos;
	this.d = '';
	this.post1 = {
		pos: {
			x: pos.x-2,
			y: pos.y,
		},
		d: 'P'
	};
	this.post2 = {
		pos: {
			x: pos.x+2,
			y: pos.y,
		},
		d: 'P'
	};
}

function Team(n) {
	if (typeof n === "Team" || typeof n === "object") {
		var team_base = n;
		n = n.c['g'].p;
	}
	else {
		var team_base = {
			'g': {
				p: n,
				k: 'g',
				d: 'K',
				pos: n == 2 ? invert_pos({x: 0, y: -6}) : {x: 0, y: -6},
				sp: n == 2 ? invert_pos({x: 0, y: -6}) : {x: 0, y: -6},
			},
			'd1': {
				p: n,
				k: 'd1',
				d: 'D',
				pos: n == 2 ? invert_pos({x: -3, y: -5}) : {x: -3, y: -5},
				sp: n == 2 ? invert_pos({x: -3, y: -5}) : {x: -3, y: -5},
			},
			'd2': {
				p: n,
				k: 'd2',
				d: 'D',
				pos: n == 2 ? invert_pos({x: 0, y: -5}) : {x: 0, y: -5},
				sp: n == 2 ? invert_pos({x: 0, y: -5}) : {x: 0, y: -5},
			},
			'd3': {
				p: n,
				k: 'd3',
				d: 'D',
				pos: n == 2 ? invert_pos({x: 3, y: -5}) : {x: 3, y: -5},
				sp: n == 2 ? invert_pos({x: 3, y: -5}) : {x: 3, y: -5},
			},
			'm1': {
				p: n,
				k: 'm1',
				d: 'M',
				pos: n == 2 ? invert_pos({x: -5, y: -3}) : {x: -5, y: -3},
				sp: n == 2 ? invert_pos({x: -5, y: -3}) : {x: -5, y: -3},
			},
			'm2': {
				p: n,
				k: 'm2',
				d: 'M',
				pos: n == 2 ? invert_pos({x: 0, y: -3}) : {x: 0, y: -3},
				sp: n == 2 ? invert_pos({x: 0, y: -3}) : {x: 0, y: -3},
			},
			'm3': {
				p: n,
				k: 'm3',
				d: 'M',
				pos: n == 2 ? invert_pos({x: 5, y: -3}) : {x: 5, y: -3},
				sp: n == 2 ? invert_pos({x: 5, y: -3}) : {x: 5, y: -3},
			},
			's1': {
				p: n,
				k: 's1',
				d: 'S',
				pos: n == 2 ? invert_pos({x: -2, y: -1}) : {x: -2, y: -1},
				sp: n == 2 ? invert_pos({x: -2, y: -1}) : {x: -2, y: -1},
			},
			's2': {
				p: n,
				k: 's2',
				d: 'S',
				pos: n == 2 ? invert_pos({x: 2, y: -1}) : {x: 2, y: -1},
				sp: n == 2 ? invert_pos({x: 2, y: -1}) : {x: 2, y: -1},
			},
		};
	}
	this.c = {};
	for (var id in team_base) {
		team_base[id].p = n;
		this.c[id] = new Player(team_base[id]);
		//if (this[id].pos) this[id].sp = {x: this[id].pos.x, y: this[id].pos.y};
	}
}

Team.prototype.reset_pos = function() {
	for (var id in this.c) {
		if (this.c[id].sp) {
			if (!pos_eq(this.c[id].pos, clone(this.c[id].sp))) {
				console.log('reset', this.c[id].k, this.c[id].k, this.c[id].pos, clone(this.c[id].sp));
			}
			
			this.c[id].pos = clone(this.c[id].sp);
		}
		else {
			console.log('failed');
		}
	}
}

Team.prototype.move = function(k, pos) {
	var p = this.c[k];
	if (!p) return false;
	this.c[k].pos = next_move(p.pos, pos);
}

// tackle / dispossess
Team.prototype.tackle = function(k, t) {
	var p = this.c[k];
	if (p.pos === t.pos) {
		if (t.has_ball && Math.random() <= 0.8) {
			return true;
		}
		else {
			this.foul(k, t, true);
			return false;
		}
	}
	return false;
}

Team.prototype.slide = function(k, t) {
	var p = this.c[k];
	if (!t.has_ball || (fly_dist(p.pos, t.pos) == 0 && Math.random() <= 0.8)) {
		// auto foul if no ball, or 80% chance when on same square
		this.foul(k, t);
		return false;
	}
	else {
		if (Math.random() <= 0.2) { // still 20% of foul
			this.foul(k, t);
			return false;
		}
		else {
			return true;
		}
	}
}

Team.prototype.gather = function(k) {
	if (pos_eq(this.c[k].pos, global_obj.ball.pos) && Math.random() >= 0.1) {
		this.c[k].has_ball = true;
		global_obj.ball.holder = {p: this.c[k].p, k: k};
		return true;
	}
	return false;
}

Team.prototype.clearance = function(k) {
	if (pos_eq(this.c[k].pos, global_obj.ball.pos) && Math.random() >= 0.2) {
		delete this.c[k].has_ball;
		delete global_obj.ball.holder;
		return true;
	}
	return false;
}

Team.prototype.pass = function(k, t) {
	var p = this.c[k];
	if (p.has_ball) {
		delete this.c[k].has_ball;
		delete global_obj.ball.holder;
		if (fly_dist(p.pos, t.pos) > 4) {
			return 0.5;
		}
		else {
			return 1;
		}
		return true;
	}
	return false;
}

Team.prototype.shoot = function(k) {
	if (this.c[k].has_ball && pos_eq(this.c[k].pos, global_obj.ball.pos)) {
		delete this.c[k].has_ball;
		return true;
	}
	return false;
}

Team.prototype.dispossessed = function(k) {
	if (this.c[k].has_ball) {
		delete this.c[k].has_ball;
		if (global_obj.ball.holder && global_obj.ball.holder.k == k) delete global_obj.ball.holder;
		return true;
	}
	return false;
}

Team.prototype.foul = function(k, t, force) {
	if (Math.random() <= 0.9 || force) {
		return true;
	}
	else {
		return false;
	}
}

Team.prototype.fouled = function(k, t, force) {
	if (this.c[k].has_ball) {
		delete this.c[k];
		return true;
	}
	return false;
}

var global_obj = {
	team_1: new Team(1),
	team_2: new Team(2),
	ball: new Ball({x: 0, y: Math.random() > 0.5 ? 1 : -1}),
	goal_1: new Goal({x: 0, y: -6}),
	goal_2: new Goal({x: 0, y: 6}),
};

var game = {};

var p1 = require("./p1.js");
var p2 = require("./p2.js");

game.p1 = p1;
game.p2 = p2;

function reset_field() {
	console.log('reset field');
	global_obj.team_1.reset_pos();
	global_obj.team_2.reset_pos();
	global_obj.ball = new Ball({x: 0, y: Math.random() > 0.5 ? 1 : -1});
}

function get_holder(state) {
	if (state.ball.holder) {
		if (state.team.c[state.ball.holder.k]) return state.team.c[state.ball.holder.k];
		else return state.opponent.c[state.ball.holder.k]
	}
}

// return actions after this method, then run them
function take_turn(state, n) {
	var passive_actions = {};
	var ball_actions = {};
	for (var id in state.team) {
		var p = state.team[id];
		if (p.command && p.command.length) {
			for (var i in p.command) {
				var op = (n == 1 ? global_obj.team_1.c[p.k] : global_obj.team_2.c[p.k]);
				//console.log(p.p, p.k, p.command[i].c);
				switch (p.command[i].c) {
					case 'move':
						passive_actions[op.k] = {c: p.command[i].c, p: op, t: p.command[i].t};
					break;
					case 'dribble':
						var h = get_holder(state);
						if (op.dribbleTo(p.command[i].t)) {
							ball_actions[op.k] = {c: p.command[i].c, p: op, t: p.command[i].t};
						}
					break;
					case 'tackle':
						if (op.tackle(h.pos)) {
							ball_actions[op.k] = {c: p.command[i].c, p: op, t: h};
						}
					break;
					case 'slide':
						if (p.slide(h)) {
							ball_actions[op.k] = {c: p.command[i].c, p: op, t: h};
						}
					break;
					case 'gather':
						if (p.gather(global_obj.ball)) {
							ball_actions[op.k] = {c: p.command[i].c, p: op, t: global_obj.ball};
						}
					break;
					case 'foul':
						if (op.foul(h.pos)) {
							ball_actions[op.k] = {c: p.command[i].c, p: op, t: h};
						}
					case 'clearance':
						if (p.clearance(global_obj.ball)) {
							ball_actions[op.k] = {c: p.command[i].c, p: op, t: global_obj.ball};
						}
					break;
					case 'pass':
						if (p.shoot(global_obj.ball)) {
							ball_actions[op.k] = {c: p.command[i].c, p: op, t: global_obj.ball};
						}
					break;
					case 'shoot':
						if (p.shoot(global_obj.ball)) {
							ball_actions[op.k] = {c: p.command[i].c, p: op, t: global_obj.ball};
						}
					break;
				}
			}
		}
	}

	return {p: passive_actions, b: ball_actions};
}

function do_action(c, p, k, t) {
	console.log('do_action', c, p, k, t);
	var my_team = (p == 1 ? global_obj.team_1 : global_obj.team_2);
	var other_team = (p == 2 ? global_obj.team_1 : global_obj.team_2);
	var my_goal = (p == 2 ? global_obj.goal_1 : global_obj.goal_2);
	var other_goal = (p == 2 ? global_obj.goal_1 : global_obj.goal_2);
	var p = my_team.c[k];

	switch (c) {
		case 'move':
			my_team.move(p.k, t);
			return true;
		break;
		case 'dribble':
			my_team.move(p.k, other_goal.pos);
			global_obj.ball.pos = clone(my_team.c[p.k].pos);
			return true;
		break;
		case 'tackle':
			if (my_team.tackle(p.k, t)) {
				other_team.dispossessed(t.k);
				my_team.gather(p.k);
				return true;
			}
		break;
		case 'slide':
			if (my_team.slide(p.k, t)) {
				other_team.dispossessed(t.k);
				if (Math.random() > 0.5) {
					console.log('gather after tackle');
					my_team.c[p.k].pos = clone(global_obj.ball.pos);
					my_team.gather(p.k);
				}
				else {
					console.log('ball goes flying');
					global_obj.ball.pos = apply_diff(global_obj.ball.pos, coord_diff(p.pos, p.command[i].t.pos));
					if (global_obj.ball.invalid()) {
						console.log('ball out of bounds');
						reset_field(); return true;
					}
				}
				return true;
			}
		break;
		case 'gather':
			if (my_team.gather(p.k)) {
				console.log(p.p, p.k, 'ball gathered');
				// ball.pos = apply_diff(ball.pos, coord_diff(p.pos, {x: 0, y: (p.p == 1 ? 4 : -4)}));
				return true;
			}
		break;
		case 'foul':
			my_team.foul(p.k, t);
			return true;
		break;
		case 'clearance':
			if (my_team.clearance(p.k)) {
				console.log('ball cleared');
				global_obj.ball.pos = apply_diff(global_obj.ball.pos, {x: 0, y: (p.p == 1 ? 4 : -4)});
				if (global_obj.ball.invalid()) {
					console.log('ball out of bounds');
					reset_field(); return true;
				}
				return true;
			}
		break;
		case 'pass':
			var acc = my_team.pass(p.k, t);
			if (acc) {
				console.log('ball passed', acc);

				var deflect = false;
				for (var k2 in other_team.c) {
					if (pos_eq(p.pos, other_team.c[k2].pos)) {
						deflect = p.pos;
					}
					else {
						var nm = false;
						while (nm = next_move(p.pos, t.pos)) {
							if (pos_eq(nm, other_team.c[k2].pos)) {
								deflect = other_team.c[k2].pos;
							}
						}
					}
				}

				if (deflect) {
					console.log('deflect', deflect);
				}

				if (acc == 1) {
					global_obj.ball.pos = clone(t.pos);
				}
				else {
					var new_pos = t.pos;
					if (Math.random() > acc) new_pos.x += 1;
					if (Math.random() > acc) new_pos.x -= 1;
					if (Math.random() > acc) new_pos.y += 1;
					if (Math.random() > acc) new_pos.y -= 1;
					global_obj.ball.pos = clone(new_pos);
				}

				if (global_obj.ball.invalid()) {
					console.log('ball out of bounds');
					reset_field(); return true;
				}
				return true;
			}
		break;
		case 'shoot':
			if (my_team.shoot(p.k)) {
				var deflect = false;
				for (var k2 in other_team.c) {
					if (pos_eq(p.pos, other_team.c[k2].pos)) {
						deflect = p.pos;
					}
					else {
						// need to step through each move..
						var nm = false;
						while (nm = next_move(p.pos, t.pos)) {
							console.log('nm', nm);
							if (pos_eq(nm, other_team.c[k2].pos)) {
								deflect = other_team.c[k2].pos;
							}
						}
					}
				}

				if (deflect) {
					console.log('deflect', deflect);
				}

				// how far is ball from goal?
				var d = fly_dist(global_obj.ball.pos, other_goal.pos);
				if (d > 5) {
					// long range (25% on target, 80% difficulty)
					if (Math.random() > 0.80) {
						console.log('shot on target');
						if (Math.random() <= 0.15) {
							console.log('goal');
							global_obj.ball.pos = clone(other_goal.pos);
							reset_field(); return true;
						}
						else {
							console.log('saved');
							other_team.c['g'].has_ball = true;
							global_obj.ball.holder = {p: other_team.c['g'].p, k: other_team.c['g'].k};
							global_obj.ball.pos = clone(other_team.c['g'].pos);
						}
					}
					else {
						console.log('shot missed');
						other_team.c['g'].has_ball = true;
						global_obj.ball.holder = {p: other_team.c['g'].p, k: other_team.c['g'].k};
						global_obj.ball.pos = clone(other_team.c['g'].pos);
						my_team.reset_pos();
						other_team.reset_pos();
					}
				}
				else if (d > 3) {
					// mid range (60% on target, 60% difficulty)
					if (Math.random() <= 0.50) {
						console.log('shot on target');
						if (Math.random() > 0.6) {
							console.log('goal');
							global_obj.ball.pos = clone(other_goal.pos);
							reset_field(); return true;
						}
						else {
							console.log('saved');
							other_team.c['g'].has_ball = true;
							global_obj.ball.holder = {p: other_team.c['g'].p, k: other_team.c['g'].k};
							global_obj.ball.pos = clone(other_team.c['g'].pos);
						}
					}
					else {
						console.log('shot missed');
						other_team.c['g'].has_ball = true;
						global_obj.ball.holder = {p: other_team.c['g'].p, k: other_team.c['g'].k};
						global_obj.ball.pos = clone(other_team.c['g'].pos);
						my_team.reset_pos();
						other_team.reset_pos();
					}
				}
				else {
					// short range (85% on target, 40% difficulty)
					if (Math.random() <= 0.85) {
						console.log('shot on target');
						if (Math.random() <= 0.40) {
							console.log('goal');
							global_obj.ball.pos = clone(other_goal.pos);
							reset_field(); return true;
						}
						else {
							console.log('saved');
							other_team.c['g'].has_ball = true;
							global_obj.ball.holder = {p: other_team.c['g'].p, k: other_team.c['g'].k};
							global_obj.ball.pos = clone(other_team.c['g'].pos);
						}
					}
					else {
						console.log('shot missed');
						other_team.c['g'].has_ball = true;
						global_obj.ball.holder = {p: other_team.c['g'].p, k: other_team.c['g'].k};
						global_obj.ball.pos = clone(other_team.c['g'].pos);
						my_team.reset_pos();
						other_team.reset_pos();
					}
				}

				//ball.pos = apply_diff(ball.pos, coord_diff(p.pos, {x: 4, y: 0}));
				return true;
			}
		break;
	}

	return false;
}

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

var matrix = null;
for (var i = 0; i < 20; i++) {
	console.log('turn', i);
	sleep(1000, function() {
		var state1 = {
			team: clone(global_obj.team_1.c),
			opponent: clone(global_obj.team_2.c),
			ball: new Ball(global_obj.ball.pos, global_obj.ball.holder),
			my_goal: new Goal(global_obj.goal_1.pos),
			other_goal: new Goal(global_obj.goal_2.pos),
		};
		game.p1.loop(state1);

		var state2 = {
			team: clone(global_obj.team_2.c),
			opponent: clone(global_obj.team_1.c),
			ball: new Ball(global_obj.ball.pos, global_obj.ball.holder),
			my_goal: new Goal(global_obj.goal_2.pos),
			other_goal: new Goal(global_obj.goal_1.pos),
		};

		game.p2.loop(state2);

		var actions_1 = take_turn(state1, 1);
		var actions_2 = take_turn(state2, 2);

		for (var k in actions_1.p) { // passive actions
			var a = actions_1.p[k];
			if (a) do_action(a.c, a.p.p, a.p.k, a.t);
		}
		for (var k in actions_2.p) { // passive actions
			var a = actions_1.p[k];
			if (a) do_action(a.c, a.p.p, a.p.k, a.t);
		}

		var ball_actions = {1: [], 2: []};
		for (var k in actions_1.b) { // ball actions
			ball_actions[1].push(actions_1.b[k]);
		}
		for (var k in actions_2.b) { // ball actions
			ball_actions[2].push(actions_2.b[k]);
		}

		// shuffle for initiative
		ball_actions[1] = shuffle(ball_actions[1]);
		ball_actions[2] = shuffle(ball_actions[2]);

		// whoever has first player goes first
		if (ball_actions[1].length > ball_actions[2].length) {
			for (var i in ball_actions[1]) {
				if (a_done===true) continue;
				var a = ball_actions[1][i];
				a_done = do_action(a.c, a.p.p, a.p.k, a.t);
				if (a_done===true) continue;
				if (ball_actions[2][i]) {
					var a = ball_actions[2][i];
					do_action(a.c, a.p.p, a.p.k, a.t);
				}
			}
		}
		else if (ball_actions[2].length > ball_actions[2].length) {
			for (var i in ball_actions[2]) {
				if (a_done===true) continue;
				var a = ball_actions[2][i];
				a_done = do_action(a.c, a.p.p, a.p.k, a.t);
				if (a_done===true) continue;
				if (ball_actions[1][i]) {
					var a = ball_actions[1][i];
					do_action(a.c, a.p.p, a.p.k, a.t);
				}
			}
		}
		else {
			var a_done = false;
			if (Math.random() > 0.5) {
				for (var i in ball_actions[1]) {
					if (a_done===true) continue;
					var a = ball_actions[1][i];
					a_done = do_action(a.c, a.p.p, a.p.k, a.t);
					if (a_done===true) continue;
					if (ball_actions[2][i]) {
						var a = ball_actions[2][i];
						do_action(a.c, a.p.p, a.p.k, a.t);
					}
				}
			}
			else {
				for (var i in ball_actions[2]) {
					if (a_done===true) continue;
					var a = ball_actions[2][i];
					a_done = do_action(a.c, a.p.p, a.p.k, a.t);
					if (a_done===true) continue;
					if (ball_actions[1][i]) {
						var a = ball_actions[1][i];
						do_action(a.c, a.p.p, a.p.k, a.t);
					}
				}
			}
		}

		matrix = new Matrix(global_obj.team_1.c, global_obj.team_2.c, global_obj.ball, global_obj.goal_1, global_obj.goal_2);
		var text = matrix.to_text();
		console.log(text);
	});
}

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
function fly_dist(pos1, pos2) {
	var diff = coord_diff(pos1, pos2);
	return Math.sqrt((diff.x*diff.x)+(diff.y*diff.y));
}
function pos_eq(pos1, pos2) {
	return (pos1.x == pos2.x && pos1.y == pos2.y);
}

var OUT_OF_RANGE = -1;
var BALL_HELD = -2;
module.exports = {

	loop: function(State) {

		for (var k in State.team) {
			var p = State.team[k];
			if (p.d == 'S') {

				if (fly_dist(State.ball.pos, p.pos) < 3) {
					if (p.has_ball) {
						p.shoot(State.ball);
					}
					else if (p.gather(State.ball) == OUT_OF_RANGE) {
						if (State.ball.holder && State.ball.holder.p != p.p) {
							var t = p.tackle(State.opponent[State.ball.holder.k]);
							if (t == OUT_OF_RANGE) {
								var s = p.slide(State.opponent[State.ball.holder.k]);
								if (s == OUT_OF_RANGE) {
									p.moveTo(State.ball.pos);
								}
							}
						}
						else {
							p.moveTo(State.ball.pos);
						}
						
					}
				}
				else {
					if (!pos_eq(p.pos, p.sp)) p.moveTo(p.sp);
				}

			}
			else if (p.d == 'D') {
				if (fly_dist(State.ball.pos, State.my_goal.pos) < 3) {
					if (p.clearance(State.ball) == OUT_OF_RANGE) {
						p.moveTo(State.ball.pos);
					}
				}
				else {
					if (!pos_eq(p.pos, p.sp)) p.moveTo(p.sp);
				}
			}
			else if (p.d == 'K') {
				if (fly_dist(State.ball.pos, State.my_goal.pos) < 2) {
					if (p.clearance(State.ball) == OUT_OF_RANGE) {
						p.moveTo(State.ball.pos);
					}
				}
				else {
					if (!pos_eq(p.pos, p.sp)) p.moveTo(p.sp);
				}
			}
			else if (p.d == 'M') {

				if (fly_dist(State.ball.pos, p.pos) < 4) {
					if (p.has_ball) {
						if (Math.random() > 0.5) {
							p.pass(State.team['s1']);
						}
						else {
							p.pass(State.team['s2']);
						}
					}
					else if (p.gather(State.ball) == OUT_OF_RANGE) {
						if (State.ball.holder && State.ball.holder.p != p.p) {
							var t = p.tackle(State.opponent[State.ball.holder.k]);
							if (t == OUT_OF_RANGE) {
								var s = p.slide(State.opponent[State.ball.holder.k]);
								if (s == OUT_OF_RANGE) {
									p.moveTo(State.ball.pos);
								}
							}
						}
						else {
							p.moveTo(State.ball.pos);
						}
					}
				}
				else {
					if (!pos_eq(p.pos, p.sp)) p.moveTo(p.sp);
				}

			}
		}

	},

}
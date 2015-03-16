// Contains helpful box2D things

var b2Vec2 = Box2D.Common.Math.b2Vec2
,	b2BodyDef = Box2D.Dynamics.b2BodyDef
,	b2Body = Box2D.Dynamics.b2Body
,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
,	b2Fixture = Box2D.Dynamics.b2Fixture
,	b2World = Box2D.Dynamics.b2World
,	b2MassData = Box2D.Collision.Shapes.b2MassData
,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
,   b2RayCastInput = Box2D.Collision.b2RayCastInput
,   b2RayCastOutput = Box2D.Collision.b2RayCastOutput
,   b2FilterData = Box2D.Dynamics.b2FilterData
;

// Scale of pixels to meters (box2D units)
var scale = 20.0;

var toRadians = Math.PI / 180;
var toDegrees = 180 / Math.PI;

function raycast(output, input, obstacles) {
	var closestFraction = input.maxFraction;
	var closestPoint = new b2Vec2(0, 0);
	for (i in obstacles) {
		var s = obstacles[i];

		if (s instanceof Obstacle) {
			var fixture = s.body.GetFixtureList();

			if (!fixture.RayCast(output, input)) {
				continue;
			} else if (output.fraction < closestFraction) {
				closestFraction = output.fraction;
			}
		}
	}

	var p1 = input.p1, p2 = input.p2;
	p2.Subtract(p1); p2.Multiply(closestFraction); p2.Add(p1);

	return p2;
}


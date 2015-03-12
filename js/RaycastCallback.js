var RaycastCallback = function() {
    this.m_hit = false;
}

RaycastCallback.prototype.ReportFixture = function(fixture, point, normal, fraction) {
    this.hit = true;
    this.point = point;
    this.normal = normal;
    return fraction;
};

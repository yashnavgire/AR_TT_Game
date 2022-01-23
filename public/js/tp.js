function draw()
{
    var pose={};
    pose.position={};
    pose.position.x=9;
    // pose.position.y=10;

    return pose.position;
}

 pose=draw();

console.log(pose.x)
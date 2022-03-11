Instructions on how to play our game.
    1) start the server by running the host.bat file or typing 'python3 server.py' in a console running in the working directory.
    2) open a web browser (recommmend using chrome) and go to 'localhost:8000' 
    3) It may take a while for the scene to fully render initially. this is fine just wait.
    4) upon entering the game you will be in control of the vehicle
    5) The controls are quite simple:
        - q: moves left
        - e: moves right
        - o: increase speed
        - l: decrease speed
        - c: change camera perspective
        - k: show collision boxes
    6) The objective of the game is to reach the finish line at the end of the road. If you collide with an object you will be reset
    to the start of the track. There is no time limit so you could go as slow as you need to. your first step in achieving this goal
    is to move forward using the 'o' key. use the 'q' & 'e' keys to manuever around the obstacles. note trees and streetlights count as
    obstacles too so be sure not to hit those either.
    7) reaching the end will prompt you a victory pop up where you could choose to restart or not.

That includes everything I hope. Thank you.





Info for my group members:

How to do Collision Detection

    Step 1: Get an objects position in world space.
        This is done for the car already. here is the function call

        //Object_to_World_Space(car_hit_box, this.shapes.hitbox.arrays.position)

        Here we pass in the transformation matrix (car_hit_box) and the array of positions for the objects shape.
        this function applies the transformation matrix to every vertice in the positions array. 

    Step 2: Create an Axis Aligned Bounding Box (AABB)
        Call the function Get_Dimensions_Of_Collision_Box()
        this function takes 1 argument, the world space positions of the vertices.
        You can nest the function calls so that you dont have to create temp variables.

        // let carAABB = Get_Dimensions_Of_Collision_Box(Object_to_World_Space(car_hit_box, this.shapes.hitbox.arrays.position))

    Step 3: Check for a Collision
        to check for a collision between to AABB's you can just use the checkCollision function
        this function takes in two AABB and returns true if they are colliding.
            
            //if (checkCollision(carAABB, obsticleAABB))
            //    console.log("Hit Obsticle")
        
Some things to note about using this.
You might want to create a different transformation matrix then the one you are applying to the draw function
this is because the normal transformation matrix might not be a tight fit for the object you are trying to check collisions for
If you notice I use a different transformation between for the car's draw function and the cars AABB. 
This is because the car is longer around the Z axis so I used an approprietely scaled matrix to create the AABB for the car.
this ensures a tighter bounding box encloses the car.
    
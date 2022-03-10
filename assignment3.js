import { defs, tiny } from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
import {
  checkCollision,
  Distance,
  Find_Center_Of_Cube,
  Get_Dimensions_Of_Collision_Box,
  Object_to_World_Space,
} from './collision-detection.js';

const {
  Vector,
  Vector3,
  vec,
  vec2,
  vec3,
  vec4,
  color,
  hex_color,
  Shader,
  Matrix,
  Mat4,
  Light,
  Shape,
  Material,
  Scene,
  Texture,
} = tiny;

class Cube_Outline extends Shape {
  constructor() {
    super('position', 'color');
    this.arrays.position = Vector3.cast(
      [-1, -1, -1],
      [1, -1, -1],
      [-1, -1, -1],
      [-1, -1, 1],
      [-1, -1, -1],
      [-1, 1, -1],
      [-1, 1, -1],
      [-1, 1, 1],
      [-1, 1, -1],
      [1, 1, -1],
      [1, 1, 1],
      [1, 1, -1],
      [1, 1, 1],
      [-1, 1, 1],
      [1, 1, 1],
      [1, -1, 1],
      [1, -1, 1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, -1, -1],
      [-1, 1, 1],
      [-1, -1, 1],
      [1, 1, -1],
      [1, -1, -1],
    );

    this.arrays.color = [
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(1, 1, 1, 1),
    ];
    this.indices = false;
  }
}


export class Assignment3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.

        super();

        //Car Variables
        this.cary = 0;
        this.carx = 0;
        this.carx_speed = .15 //Car's horizontal speed
        this.cary_speed = 0.0 //Car's Vertical Speed (not yet implemented)
        this.acceleration = .05 //Car's acceleration. this changes the cary_speed.

        //Camera
        this.camera_view = 2;
        //0: Back of Car Facing Forward
        //1: Driver Side
        //2: Front of Car Facing Backward

        //Obsticles
        this.obsticle_transforms = []
        for (let i = 1; i < 21; i++) {
            this.obsticle_transforms.push(Mat4.identity())
        }

        //Building Transforms
        this.number_of_buildings = 38
        this.building_transforms = []
        for (let i = 0; i < this.number_of_buildings; i+=2) {
            let temp_scale_left = Math.random()*7
            let temp_left = Mat4.identity()
            temp_left = temp_left.times(Mat4.translation(-10, temp_scale_left*1.8, 90-(i*5)))
            temp_left = temp_left.times(Mat4.scale(3, 6+temp_scale_left, 3))
            this.building_transforms.push(temp_left)

            let temp_scale_right = Math.random()*7
            let temp_right = Mat4.identity()
            temp_right = temp_right.times(Mat4.translation(10, temp_scale_right*1.8, 90-(i*5)))
            temp_right = temp_right.times(Mat4.scale(3, 6+temp_scale_right, 3));
            this.building_transforms.push(temp_right)
        }

        //Tree Transforms
        this.number_of_trees = 20
        this.tree_transforms = []
        for (let i = 0; i < this.number_of_trees; i+=2) {
            let random_rotation_left = Math.random*Math.PI
            let temp_left = Mat4.identity()
            //temp_left = temp_left.times(Mat4.rotation(random_rotation_left,0,1,0))

            temp_left = temp_left.times(Mat4.translation(-5.5, 2, 90-(i*10)))
            //temp_left = temp_left.times(Mat4.rotation(random_rotation_left,0,1,0))
            this.tree_transforms.push(temp_left)

            let temp_right = Mat4.identity()
            let random_rotation_right = Math.random*Math.PI
            //temp_right = temp_right.times(Mat4.rotation(random_rotation_right,0,1,0))
            temp_right = temp_right.times(Mat4.translation(5.5, 2, 90-(i*10)))
            //temp_right = temp_right.times(Mat4.rotation(random_rotation_right,0,1,0))
            this.tree_transforms.push(temp_right)
        }

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            building: new defs.Cube(),
            floor: new defs.Cube(),
            car: new Shape_From_File("assets/camero.obj"),
            tree: new Shape_From_File("assets/tree.obj"),
            fox: new Shape_From_File("assets/fox.obj"),
            teapot: new Shape_From_File("assets/teapot.obj"),
            lion: new Shape_From_File("assets/lion-cub.obj"),
            lamp: new Shape_From_File("assets/lamp.obj"),
            streetlight: new Shape_From_File('assets/street_lamp.obj'),
            obstacle: new defs.Cube(),
            hitbox: new Cube_Outline(),
            circle: new defs.Regular_2D_Polygon(1, 15),
            road: new defs.Cube(),
            skybox: new defs.Subdivision_Sphere(4),
            sidewalk: new defs.Cube(),
            finishline: new defs.Cube(),
            wall: new defs.Cube(),
            sidewalls: new defs.Cube(),
        };

        // *** Materials
        this.materials = {
            floor: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            car: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: 1, specularity: 1, color: color(0,0,0,1),
                    texture: new Texture("assets/camero.png", "LINEAR_MIPMAP_LINEAR")}),
            building: new Material(new defs.Textured_Phong(), {
                    ambient: 1,
                    diffusivity: 0.1,
                    specularity: 1, //0.3,
                    color: color(0, 0, 0, 1),
                    texture: new Texture('assets/building.jpeg', 'LINEAR_MIPMAP_LINEAR'),
                  }),
            obstacle: new Material(new defs.Textured_Phong(),
                { ambient:0.5, diffusivity: 0.1, color: hex_color("#33F4FF"),
                texture: new Texture("assets/danger.jpeg")}),
            teapot: new Material(new defs.Phong_Shader(),
                {ambient: 0.7, diffusivity: 1, color: hex_color("#DFFF00")}),
            fox: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: .1, specularity: .1, color: color(0,0,0,1),
                    texture: new Texture("assets/foxtexture.png", "LINEAR_MIPMAP_LINEAR")}),
            fox2: new Material(new defs.Textured_Phong(),
                {ambient: 0.7, diffusivity: .1, specularity: .1, color: hex_color("#FF00FF"),
                    texture: new Texture("assets/foxtexture.png", "LINEAR_MIPMAP_LINEAR")}),
            road: new Material(new defs.Fake_Bump_Map(),
                {ambient: 1, diffusivity: .1, specularity: 0, color: color(0,0,0,1),
                    texture: new Texture("assets/asphalt.jpg", "LINEAR_MIPMAP_LINEAR")}),
            skybox: new Material(new defs.Textured_Phong(),
                {ambient: .4, diffusivity: .1, specularity: 0, color: color(0,0,0,1),
                    texture: new Texture("assets/skybox.png", "LINEAR_MIPMAP_LINEAR")}),
            sidewalk: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: .1, specularity: 0, color: color(0,0,0,1),
                    texture: new Texture("assets/sidewalk.jpg")}),
            tree: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: .1, specularity: 0, color: color(0,0,0,1),
                    texture: new Texture("assets/tree.jpg")}),
            finishline: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: 0.1, specularity: 0.2, color: color(0,0,0,1),
                    texture: new Texture("assets/fin.png", "LINEAR_MIPMAP_LINEAR")}),
            lion: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: color(0,0,0,1),
                    texture: new Texture("assets/lion.jpg", "LINEAR_MIPMAP_LINEAR")}),
            lamp: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: 1, specularity: 0, color: color(0,0,0,1),
                    texture: new Texture("assets/lamp.jpg", "LINEAR_MIPMAP_LINEAR")}),
            wall: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: 0.1, specularity: 0.1, color: color(0,0,0,1),
                    texture: new Texture("assets/brickwall.jpeg", "LINEAR_MIPMAP_LINEAR")}),
            streetlight: new Material(new defs.Phong_Shader(), {
                    ambient: 1,
                    diffusivity: 0.1,
                    specularity: 0,
              }),
        }
        this.white = new Material(new defs.Basic_Shader());

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Turn Left", ["q"], () => {
            //press event
                this.move = 1;
        }, '#6E6460', () => {
            //release event
            this.move = 0;
        })
        this.key_triggered_button("Turn Right", ["e"], () => {
            //press event
            this.move = -1;
        }, '#6E6460', () => {
            //release event
            this.move = 0;
        })
        this.key_triggered_button("Throttle Up", ["o"], () => {
            //press event
            this.cary_speed += this.acceleration;
            this.cary_speed = Math.min(.2, this.cary_speed)
        }, '#6E6460', () => {
            //release event

        })
        this.key_triggered_button("Throttle Down", ["l"], () => {
            //press event
            this.cary_speed -= this.acceleration;
            this.cary_speed = Math.max(0, this.cary_speed)
        }, '#6E6460', () => {
            //release event
        })
        this.key_triggered_button("Change Camera View", ["c"], () => {
            this.camera_view = (this.camera_view+1)%3;
        }, '#6E6460', () => {
            //release event
        })
        this.key_triggered_button("Show Collision Boxes", ["k"], () => {
            this.show_collision_boxes = this.show_collision_boxes ? false : true;
        }, '#6E6460', () => {
            //release event
        })
    }

    reset_car () {
        this.carx = 0
        this.cary = 0
        this.cary_speed = 0
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }


        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;


        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        const light_position = vec4(0, 2, 2, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [
            new Light(
            vec4(this.lamp_on % 2 == 0 ? -5 : 5, 10, 100 - this.lamp_on * 10, 1),
            color(1, 1, 0, 1),
            100,
            ),
            this.lamp_on > 1
            ? new Light(
                vec4(
                    this.lamp_on - (1 % 2) == 0 ? -5 : 5,
                    10,
                    100 - (this.lamp_on - 1) * 10,
                    1,
                ),
                color(1, 1, 0, 1),
                100,
                )
            : new Light(
                vec4(
                    this.lamp_on % 2 == 0 ? -5 : 5,
                    10,
                    100 - this.lamp_on * 10,
                    1,
                ),
                color(1, 1, 0, 1),
                0,
                ),
            ];

        //Floor
        let floor_transform = Mat4.identity();
        floor_transform = floor_transform.times(Mat4.scale(100,.25,100));
        floor_transform = floor_transform.times(Mat4.translation(0,-2,0));
        this.shapes.floor.draw(context, program_state, floor_transform, this.materials.floor);

        //Road
        this.shapes.road.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] *= 2
                v[1] *= 30
            }
        )

        let road_transform = Mat4.identity();
        road_transform = road_transform.times(Mat4.scale(6,.25,100));
        road_transform = road_transform.times(Mat4.translation(0,-1.95,0));
        this.shapes.road.draw(context,program_state, road_transform, this.materials.road);

        //Sidewalk
        this.shapes.sidewalk.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] *= 1
                v[1] *= 1
            }
        )

        let sidewalk_left_transform = Mat4.identity();
        sidewalk_left_transform = sidewalk_left_transform.times(Mat4.scale(1,.25,100));
        sidewalk_left_transform = sidewalk_left_transform.times(Mat4.translation(6,-1.70, 0));
        this.shapes.road.draw(context, program_state, sidewalk_left_transform, this.materials.sidewalk)

        let sidewalk_right_transform = Mat4.identity();
        sidewalk_right_transform = sidewalk_right_transform.times(Mat4.scale(1,.25,100));
        sidewalk_right_transform = sidewalk_right_transform.times(Mat4.translation(-6,-1.70, 0));
        this.shapes.road.draw(context, program_state, sidewalk_right_transform, this.materials.sidewalk)

        //Car

        //Car's Position Control Logic
        if (this.move > 0){
            this.carx -= this.carx_speed
            this.carx = Math.max(-6, this.carx)
        }
        if (this.move < 0){
            this.carx += this.carx_speed
            this.carx = Math.min(6, this.carx)
        }

        this.cary -= this.cary_speed
        
        Math.hypot()
        //Car Transformations
        let car_transform = Mat4.identity();
        //car_transform = car_transform.times(Mat4.rotation(Math.PI, 0,1,0))
        car_transform = car_transform.times(Mat4.translation(0,-.05,95));
        car_transform = car_transform.times(Mat4.translation(this.carx, .15, this.cary));
        car_transform = car_transform.times(Mat4.rotation(Math.PI, 0,1,0))
        let car_hit_box = car_transform
        car_hit_box = car_hit_box.times(Mat4.scale(1,1,1.5))
        let carAABB = Get_Dimensions_Of_Collision_Box(Object_to_World_Space(car_hit_box, this.shapes.hitbox.arrays.position))
        this.shapes.car.draw(context, program_state, car_transform, this.materials.car, "LINE_STRIP")
        if (this.show_collision_boxes)
            this.shapes.hitbox.draw(context,program_state, car_hit_box, this.white, "LINES")
        
        //Obstacles
        let o1 = Mat4.identity();
        let rotMatrix = Mat4.identity().times(Mat4.rotation(-Math.PI/4, 1, 0, 0))
        o1 = o1.times(Mat4.translation(4*Math.sin(t),5*Math.sin(t),-6));
        let temp = Object_to_World_Space(o1, this.shapes.hitbox.arrays.position)
        let center = Find_Center_Of_Cube(temp);
        for (let i = 0; i < 4; i++) {
            //1
            this.obsticle_transforms[i*4+1] = Mat4.identity()
            this.obsticle_transforms[i*4+1] = this.obsticle_transforms[i*4+1].times(Mat4.translation(4*Math.sin(t*((i*4+1)%10)/3),.75,100-((i*4+1)*10)))
            let obsticleAABB = Get_Dimensions_Of_Collision_Box(Object_to_World_Space(this.obsticle_transforms[i*4+1], this.shapes.hitbox.arrays.position))
            if (checkCollision(carAABB, obsticleAABB)) {
                console.log("Hit Obsticle", i)
                this.reset_car()
            }
            this.shapes.obstacle.draw(context, program_state, this.obsticle_transforms[i*4+1].times(rotMatrix), this.materials.obstacle);
            if (this.show_collision_boxes)
                this.shapes.hitbox.draw(context,program_state, this.obsticle_transforms[i*4+1], this.white, "LINES")
            rotMatrix = rotMatrix.times(Mat4.rotation(-Math.PI/4, 1, 0, 0))
            //2 
            this.obsticle_transforms[i*4+2] = Mat4.identity()
            this.obsticle_transforms[i*4+2] = this.obsticle_transforms[i*4+2].times(Mat4.translation(4*Math.sin(t*((i*4+2)%10)/3),.75,100-((i*4+2)*10)))
            obsticleAABB = Get_Dimensions_Of_Collision_Box(Object_to_World_Space(this.obsticle_transforms[i*4+2], this.shapes.hitbox.arrays.position))
            if (checkCollision(carAABB, obsticleAABB)) {
                console.log("Hit Obsticle", i)
                this.reset_car()
            }
            this.shapes.lion.draw(context, program_state, this.obsticle_transforms[i*4+2], this.materials.lion);
            if (this.show_collision_boxes)
                this.shapes.hitbox.draw(context,program_state, this.obsticle_transforms[i*4+2], this.white, "LINES")
            rotMatrix = rotMatrix.times(Mat4.rotation(-Math.PI/4, 1, 0, 0))
            //3
            this.obsticle_transforms[i*4+3] = Mat4.identity()
            this.obsticle_transforms[i*4+3] = this.obsticle_transforms[i*4+3].times(Mat4.translation(4*Math.sin(t*((i*4+3)%10)/3),.75,100-((i*4+3)*10)))
            obsticleAABB = Get_Dimensions_Of_Collision_Box(Object_to_World_Space(this.obsticle_transforms[i*4+3], this.shapes.hitbox.arrays.position))
            if (checkCollision(carAABB, obsticleAABB)) {
                console.log("Hit Obsticle", i)
                this.reset_car()
            }
            this.shapes.teapot.draw(context, program_state, this.obsticle_transforms[i*4+3].times(rotMatrix), this.materials.teapot);
            if (this.show_collision_boxes)
                this.shapes.hitbox.draw(context,program_state, this.obsticle_transforms[i*4+3], this.white, "LINES")
            rotMatrix = rotMatrix.times(Mat4.rotation(-Math.PI/4, 1, 0, 0))
            //4
            this.obsticle_transforms[i*4+4] = Mat4.identity()
            this.obsticle_transforms[i*4+4] = this.obsticle_transforms[i*4+4].times(Mat4.translation(4*Math.sin(t*((i*4+4)%10)/3),.25,100-((i*4+4)*10)))
            obsticleAABB = Get_Dimensions_Of_Collision_Box(Object_to_World_Space(this.obsticle_transforms[i*4+4], this.shapes.hitbox.arrays.position))
            if (checkCollision(carAABB, obsticleAABB)) {
                console.log("Hit Obsticle", i)
                this.reset_car()
            }
            this.shapes.lamp.draw(context, program_state, this.obsticle_transforms[i*4+4], this.materials.lamp);
            if (this.show_collision_boxes)
                this.shapes.hitbox.draw(context,program_state, this.obsticle_transforms[i*4+4], this.white, "LINES")
            rotMatrix = rotMatrix.times(Mat4.rotation(-Math.PI/4, 1, 0, 0))
        }
        
        // Lamps (Streetlights)
        for (let i = 1; i < 21; i++) {
            let lamp_color = color(0, 0, 0, 1);
            if (i * 10 + this.cary <= 12.5) {
            lamp_color = color(0.75, 0.75, 0, 1);
            this.lamp_on = i;
            }

            if (i % 2 == 0) {
            this.shapes.streetlight.draw(
                context,
                program_state,
                Mat4.identity().times(Mat4.translation(-5, 2, 100 - i * 10)),
                this.materials.streetlight.override({ color: lamp_color }),
            );
            } else {
            this.shapes.streetlight.draw(
                context,
                program_state,
                Mat4.identity().times(Mat4.translation(5, 2, 100 - i * 10)),
                this.materials.streetlight.override({ color: lamp_color }),
            );
            }
        }

        //Fox (ex driver)
        let fox_transform = Mat4.identity()
        fox_transform = fox_transform.times(Mat4.scale(.25,.25,.25));
        fox_transform = fox_transform.times(Mat4.translation(-25,0,-380))
        fox_transform = fox_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        this.shapes.fox.draw(context, program_state, fox_transform, this.materials.fox)
        
        //Buildings
        this.shapes.building.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] *= 3
                v[1] *= 3
            }
        )

        for (let i = 0; i < this.number_of_buildings; i++) {
            this.shapes.building.draw(context, program_state, this.building_transforms[i], this.materials.building)
        }



        //Trees
        for (let i = 0; i < this.number_of_trees; i++) {
            this.shapes.tree.draw(context, program_state, this.tree_transforms[i], this.materials.tree, "LINE_STRIP")
        }
        
        //Walls
        this.shapes.wall.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] *= 5
                v[1] *= 1
            }
        )
        let wall_transform_end = Mat4.identity()
        wall_transform_end = wall_transform_end.times(Mat4.translation(0, 0, -100))
        wall_transform_end = wall_transform_end.times(Mat4.scale(12, 5, 1))
        this.shapes.wall.draw(context, program_state, wall_transform_end, this.materials.wall)

        let wall_transform_start = Mat4.identity()
        wall_transform_start = wall_transform_start.times(Mat4.translation(0, 0, 101))
        wall_transform_start = wall_transform_start.times(Mat4.scale(12, 5, 1))
        this.shapes.wall.draw(context, program_state, wall_transform_start, this.materials.wall)

        this.shapes.sidewalls.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] *= 60
                v[1] *= 1
            }
        )
        let wall_transform_left = Mat4.identity()
        wall_transform_left = wall_transform_left.times(Mat4.translation(-12, 0, 0))
        wall_transform_left = wall_transform_left.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        wall_transform_left = wall_transform_left.times(Mat4.scale(100, 5, 1))
        this.shapes.sidewalls.draw(context, program_state, wall_transform_left, this.materials.wall)

        let wall_transform_right = Mat4.identity()
        wall_transform_right = wall_transform_right.times(Mat4.translation(12, 0, 0))
        wall_transform_right = wall_transform_right.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        wall_transform_right = wall_transform_right.times(Mat4.scale(100, 5, 1))
        this.shapes.sidewalls.draw(context, program_state, wall_transform_right, this.materials.wall)

        
        //finish line
        this.shapes.finishline.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] *= 10
                v[1] *= 1
            }
        )
        let finish_line_transformation = Mat4.identity();
        finish_line_transformation = finish_line_transformation.times(Mat4.scale(10,.25, 1));
        finish_line_transformation = finish_line_transformation.times(Mat4.translation(0, -1.9, -80));
        let finish_line_hitbox = finish_line_transformation
        finish_line_hitbox = finish_line_hitbox.times(Mat4.translation(0,1,0))
        let finish_lineAABB = Get_Dimensions_Of_Collision_Box(Object_to_World_Space(finish_line_hitbox, this.shapes.hitbox.arrays.position))
        this.shapes.finishline.draw(context, program_state, finish_line_transformation, this.materials.finishline);
        if (checkCollision(finish_lineAABB, carAABB))
            console.log("Reached The Finish")
        if (this.show_collision_boxes)
            this.shapes.hitbox.draw(context,program_state, finish_line_hitbox, this.white, "LINES")
        
        //Sky Box (Sphere)
        //this.shapes.skybox.arrays.texture_coord.forEach(
        //    (v, i, l) => {
        //        v[0] *= 25
        //        v[1] *= 25
        //    }
        //)

        let sky_box_transform = Mat4.identity()
        sky_box_transform = sky_box_transform.times(Mat4.scale(120,120,120))
        sky_box_transform = sky_box_transform.times(Mat4.rotation(2*Math.PI*Math.sin(t/100),.2,1.1,.2))
        this.shapes.skybox.draw(context, program_state, sky_box_transform, this.materials.skybox)
        
        /////Camera/////
        let desired;
        switch (this.camera_view){
            case 0://Camera To Face Back of Car.
                desired = Mat4.inverse(car_transform.times(Mat4.translation(0,1,5-this.cary_speed)));
                desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, .5));
                break
            case 1: //Camera To Face Drivers Side of Car.
                desired = Mat4.inverse(car_transform.times(Mat4.translation(-3,.5,0-this.cary_speed)).times(Mat4.rotation(-Math.PI/2,0,1,0)));
                desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, .5));
                break
            case 2:
                desired = Mat4.inverse(car_transform.times(Mat4.translation(0,1,-4+this.cary_speed)).times(Mat4.rotation(-Math.PI,0,1,0)));
                desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, .5));
        }
        program_state.set_camera(desired)
    }
}

/*
  constructor() {
    // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.

    super();

    //Car Variables
    this.cary = 0;
    this.carx = 0;
    this.carx_speed = 0.15; //Car's horizontal speed
    this.cary_speed = 0.0; //Car's Vertical Speed (not yet implemented)
    this.acceleration = 0.05; //Car's acceleration. this changes the cary_speed.

    //Camera
    this.camera_view = 0;
    //0: Back of Car Facing Forward
    //1: Driver Side
    //2: Front of Car Facing Backward

    // Lamps
    // to determine which lamps are lit
    this.lamp_on = 1;

    //Obsticles
    this.obsticle_transforms = [];
    for (let i = 1; i < 21; i++) {
      this.obsticle_transforms.push(Mat4.identity());
    }

    //Building Transforms
    this.number_of_buildings = 38;
    this.building_transforms = [];
    for (let i = 0; i < this.number_of_buildings; i += 2) {
      let temp_scale_left = Math.random() * 7;
      let temp_left = Mat4.identity();
      temp_left = temp_left.times(
        Mat4.translation(-10, temp_scale_left * 1.8, 90 - i * 5),
      );
      temp_left = temp_left.times(Mat4.scale(3, 6 + temp_scale_left, 3));
      this.building_transforms.push(temp_left);

      let temp_size_right = Math.random() * 7;
      let temp_right = Mat4.identity();
      temp_right = temp_right.times(
        Mat4.translation(10, temp_scale_left * 1.8, 90 - i * 5),
      );
      temp_right = temp_right.times(Mat4.scale(3, 6 + temp_scale_left, 3));
      this.building_transforms.push(temp_right);
    }

    // At the beginning of our program, load one of each of these shape definitions onto the GPU.
    this.shapes = {
      building: new defs.Cube(),
      floor: new defs.Cube(),
      car: new Shape_From_File('assets/ford.obj'),
      fox: new Shape_From_File('assets/fox.obj'),
      obstacle: new defs.Cube(),
      hitbox: new Cube_Outline(),
      circle: new defs.Regular_2D_Polygon(1, 15),
      road: new defs.Cube(),
      skybox: new defs.Subdivision_Sphere(4),
      sidewalk: new defs.Cube(),
      lamp: new Shape_From_File('assets/street_lamp.obj'),
    };

    // *** Materials
    this.materials = {
      floor: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 0.6,
        color: hex_color('#ffffff'),
      }),
      car: new Material(new defs.Textured_Phong(), {
        ambient: 0.4,
        diffusivity: 0.1,
        specularity: 1,
        color: color(0, 0, 0, 1),
        texture: new Texture('assets/car.png', 'LINEAR_MIPMAP_LINEAR'),
      }),
      building: new Material(new defs.Textured_Phong(), {
        ambient: 1,
        diffusivity: 0.1,
        specularity: 1, //0.3,
        color: color(0, 0, 0, 1),
        texture: new Texture('assets/building.jpeg', 'LINEAR_MIPMAP_LINEAR'),
      }),
      obstacle: new Material(new defs.Phong_Shader(), {
        ambient: 0.4,
        diffusivity: 1, //0.6,
        color: hex_color('#ffffff'),
      }),
      fox: new Material(new defs.Textured_Phong(), {
        ambient: 1,
        diffusivity: 0.1,
        specularity: 0.1,
        color: color(0, 0, 0, 1),
        texture: new Texture('assets/foxtexture.png', 'LINEAR_MIPMAP_LINEAR'),
      }),
      road: new Material(new defs.Fake_Bump_Map(), {
        ambient: 1,
        diffusivity: 0.1,
        specularity: 0,
        color: color(0, 0, 0, 1),
        texture: new Texture('assets/asphalt.jpg', 'LINEAR_MIPMAP_LINEAR'),
      }),
      skybox: new Material(new defs.Textured_Phong(), {
        ambient: 0.4,
        diffusivity: 0.1,
        specularity: 0,
        color: color(0, 0, 0, 1),
        texture: new Texture('assets/skybox.png', 'LINEAR_MIPMAP_LINEAR'),
      }),
      sidewalk: new Material(new defs.Textured_Phong(), {
        ambient: 1,
        diffusivity: 0.1,
        specularity: 0,
        color: color(0, 0, 0, 1),
        texture: new Texture('assets/sidewalk.jpg'),
      }),
      lamp: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0.1,
        specularity: 0,
      }),
    };
    this.white = new Material(new defs.Basic_Shader());

    this.initial_camera_location = Mat4.look_at(
      vec3(0, 10, 20),
      vec3(0, 0, 0),
      vec3(0, 1, 0),
    );
  }

  make_control_panel() {
    // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
    this.key_triggered_button(
      'Turn Left',
      ['q'],
      () => {
        //press event
        this.move = 1;
      },
      '#6E6460',
      () => {
        //release event
        this.move = 0;
      },
    );
    this.key_triggered_button(
      'Turn Right',
      ['e'],
      () => {
        //press event
        this.move = -1;
      },
      '#6E6460',
      () => {
        //release event
        this.move = 0;
      },
    );
    this.key_triggered_button(
      'Throttle Up',
      ['o'],
      () => {
        //press event
        this.cary_speed += this.acceleration;
      },
      '#6E6460',
      () => {
        //release event
      },
    );
    this.key_triggered_button(
      'Throttle Down',
      ['l'],
      () => {
        //press event
        this.cary_speed -= this.acceleration;
      },
      '#6E6460',
      () => {
        //release event
      },
    );
    this.key_triggered_button(
      'Change Camera View',
      ['c'],
      () => {
        this.camera_view = (this.camera_view + 1) % 3;
      },
      '#6E6460',
      () => {
        //release event
      },
    );
    this.key_triggered_button(
      'Show Collision Boxes',
      ['k'],
      () => {
        this.show_collision_boxes = this.show_collision_boxes ? false : true;
      },
      '#6E6460',
      () => {
        //release event
      },
    );
  }

  display(context, program_state) {
    // display():  Called once per frame of animation.
    // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls()),
      );
      // Define the global camera and projection matrices, which are stored in program_state.
      program_state.set_camera(this.initial_camera_location);
    }

    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4,
      context.width / context.height,
      0.1,
      1000,
    );

    // The parameters of the Light are: position, color, size
    program_state.lights = [
      new Light(
        vec4(this.lamp_on % 2 == 0 ? -5 : 5, 10, 100 - this.lamp_on * 10, 1),
        color(1, 1, 0, 1),
        100,
      ),
      this.lamp_on > 1
        ? new Light(
            vec4(
              this.lamp_on - (1 % 2) == 0 ? -5 : 5,
              10,
              100 - (this.lamp_on - 1) * 10,
              1,
            ),
            color(1, 1, 0, 1),
            100,
          )
        : new Light(
            vec4(
              this.lamp_on % 2 == 0 ? -5 : 5,
              10,
              100 - this.lamp_on * 10,
              1,
            ),
            color(1, 1, 0, 1),
            0,
          ),
    ];

    //Floor
    let floor_transform = Mat4.identity();
    floor_transform = floor_transform.times(Mat4.scale(100, 0.25, 100));
    floor_transform = floor_transform.times(Mat4.translation(0, -2, 0));
    this.shapes.floor.draw(
      context,
      program_state,
      floor_transform,
      this.materials.floor,
    );

    //Road
    this.shapes.road.arrays.texture_coord.forEach((v, i, l) => {
      v[0] *= 2;
      v[1] *= 30;
    });

    let road_transform = Mat4.identity();
    road_transform = road_transform.times(Mat4.scale(6, 0.25, 100));
    road_transform = road_transform.times(Mat4.translation(0, -1.95, 0));
    this.shapes.road.draw(
      context,
      program_state,
      road_transform,
      this.materials.road,
    );

    //Sidewalk
    this.shapes.sidewalk.arrays.texture_coord.forEach((v, i, l) => {
      v[0] *= 1;
      v[1] *= 1;
    });

    let sidewalk_left_transform = Mat4.identity();
    sidewalk_left_transform = sidewalk_left_transform.times(
      Mat4.scale(1, 0.25, 100),
    );
    sidewalk_left_transform = sidewalk_left_transform.times(
      Mat4.translation(6, -1.7, 0),
    );
    this.shapes.road.draw(
      context,
      program_state,
      sidewalk_left_transform,
      this.materials.sidewalk,
    );

    let sidewalk_right_transform = Mat4.identity();
    sidewalk_right_transform = sidewalk_right_transform.times(
      Mat4.scale(1, 0.25, 100),
    );
    sidewalk_right_transform = sidewalk_right_transform.times(
      Mat4.translation(-6, -1.7, 0),
    );
    this.shapes.road.draw(
      context,
      program_state,
      sidewalk_right_transform,
      this.materials.sidewalk,
    );

    //Car

    //Car's Position Control Logic
    if (this.move > 0) {
      this.carx -= this.carx_speed;
    }
    if (this.move < 0) {
      this.carx += this.carx_speed;
    }

    this.cary -= this.cary_speed;

    Math.hypot();
    //Car Transformations
    let car_transform = Mat4.identity();
    car_transform = car_transform.times(Mat4.translation(0, 0.05, 95));
    car_transform = car_transform.times(
      Mat4.translation(this.carx, 0.15, this.cary),
    );
    let car_hit_box = car_transform;
    car_hit_box = car_hit_box.times(Mat4.scale(1, 1, 1.5));
    let carAABB = Get_Dimensions_Of_Collision_Box(
      Object_to_World_Space(car_hit_box, this.shapes.hitbox.arrays.position),
    );
    this.shapes.car.draw(
      context,
      program_state,
      car_transform,
      this.materials.car,
      'LINE_STRIP',
    );
    if (this.show_collision_boxes)
      this.shapes.hitbox.draw(
        context,
        program_state,
        car_hit_box,
        this.white,
        'LINES',
      );

    //Obstacles
    let o1 = Mat4.identity();
    o1 = o1.times(Mat4.translation(5 * Math.sin(t), 5 * Math.sin(t), -6));
    let temp = Object_to_World_Space(o1, this.shapes.hitbox.arrays.position);
    let center = Find_Center_Of_Cube(temp);
    for (let i = 1; i < 21; i++) {
      this.obsticle_transforms[i] = Mat4.identity();
      this.obsticle_transforms[i] = this.obsticle_transforms[i].times(
        Mat4.translation(5 * Math.sin((t * (i % 10)) / 3), 0.75, 100 - i * 10),
      );

      let obsticleAABB = Get_Dimensions_Of_Collision_Box(
        Object_to_World_Space(
          this.obsticle_transforms[i],
          this.shapes.hitbox.arrays.position,
        ),
      );
      if (checkCollision(carAABB, obsticleAABB)) console.log('Hit Obsticle', i);
      this.shapes.obstacle.draw(
        context,
        program_state,
        this.obsticle_transforms[i],
        this.materials.obstacle,
      );
    }
    // Lamps
    for (let i = 1; i < 21; i++) {
      let lamp_color = color(0, 0, 0, 1);
      if (i * 10 + this.cary <= 12.5) {
        lamp_color = color(0.75, 0.75, 0, 1);
        this.lamp_on = i;
      }

      if (i % 2 == 0) {
        this.shapes.lamp.draw(
          context,
          program_state,
          Mat4.identity().times(Mat4.translation(-5, 2, 100 - i * 10)),
          this.materials.lamp.override({ color: lamp_color }),
        );
      } else {
        this.shapes.lamp.draw(
          context,
          program_state,
          Mat4.identity().times(Mat4.translation(5, 2, 100 - i * 10)),
          this.materials.lamp.override({ color: lamp_color }),
        );
      }
    }

    //Fox (driver)
    let fox_transform = car_transform;
    fox_transform = fox_transform.times(Mat4.scale(0.25, 0.25, 0.25));
    fox_transform = fox_transform.times(Mat4.translation(-1, 0, 0));
    fox_transform = fox_transform.times(Mat4.rotation(Math.PI, 0, 1, 0));
    fox_transform = fox_transform.times(Mat4.rotation(-Math.PI / 2, 1, 0, 0));
    this.shapes.fox.draw(
      context,
      program_state,
      fox_transform,
      this.materials.fox,
    );

    //Buildings
    this.shapes.building.arrays.texture_coord.forEach((v, i, l) => {
      v[0] *= 3;
      v[1] *= 3;
    });

    for (let i = 0; i < this.number_of_buildings; i++) {
      this.shapes.building.draw(
        context,
        program_state,
        this.building_transforms[i],
        this.materials.building.override({
          color: i % 3 == 0 ? color(0.2, 0.13, 0.2, 1) : color(0, 0, 0, 1),
        }),
      );
    }

    //Sky Box (Sphere)
    //this.shapes.skybox.arrays.texture_coord.forEach(
    //    (v, i, l) => {
    //        v[0] *= 25
    //        v[1] *= 25
    //    }
    //)

    let sky_box_transform = Mat4.identity();
    sky_box_transform = sky_box_transform.times(Mat4.scale(120, 120, 120));
    sky_box_transform = sky_box_transform.times(
      Mat4.rotation(2 * Math.PI * Math.sin(t / 100), 0.2, 1.1, 0.2),
    );
    this.shapes.skybox.draw(
      context,
      program_state,
      sky_box_transform,
      this.materials.skybox,
    );

    /////Camera/////
    let desired;
    switch (this.camera_view) {
      case 0: //Camera To Face Back of Car.
        desired = Mat4.inverse(
          car_transform.times(Mat4.translation(0, 1, 5 - this.cary_speed)),
        );
        desired = desired.map((x, i) =>
          Vector.from(program_state.camera_inverse[i]).mix(x, 0.5),
        );
        break;
      case 1: //Camera To Face Drivers Side of Car.
        desired = Mat4.inverse(
          car_transform
            .times(Mat4.translation(-3, 0.5, 0 - this.cary_speed))
            .times(Mat4.rotation(-Math.PI / 2, 0, 1, 0)),
        );
        desired = desired.map((x, i) =>
          Vector.from(program_state.camera_inverse[i]).mix(x, 0.5),
        );
        break;
      case 2:
        desired = Mat4.inverse(
          car_transform
            .times(Mat4.translation(0, 1, -4 + this.cary_speed))
            .times(Mat4.rotation(-Math.PI, 0, 1, 0)),
        );
        desired = desired.map((x, i) =>
          Vector.from(program_state.camera_inverse[i]).mix(x, 0.5),
        );
    }
    program_state.set_camera(desired);
  }
}
*/

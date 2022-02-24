import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from "./examples/obj-file-demo.js";

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

export class Assignment3 extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.

        super();

        this.building_positions = [
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
            [Math.random() * 100, Math.random() * 100],
        ]

        this.carx = 0;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            building: new defs.Cube(),
            floor: new defs.Cube(),
            car: new Shape_From_File("assets/car2.obj"),
            obstacle: new defs.Cube(),
            circle: new defs.Regular_2D_Polygon(1, 15),
            road: new defs.Cube(),
        };

        // *** Materials
        this.materials = {
            floor: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            car: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            building: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: .1, specularity: .1, color: color(0,0,0,1),
                    texture: new Texture("assets/skyscrapper.jpg", "LINEAR_MIPMAP_LINEAR")}),
            obstacle: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            road: new Material(new defs.Textured_Phong(),
                {ambient: 1, diffusivity: .1, specularity: .1, color: color(0,0,0,1),
                    texture: new Texture("assets/asphalt.jpg", "LINEAR_MIPMAP_LINEAR")}),
        }

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
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 10000)];

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
        road_transform = road_transform.times(Mat4.scale(3,.25,100));
        road_transform = road_transform.times(Mat4.translation(0,-1.95,0));
        this.shapes.road.draw(context,program_state, road_transform, this.materials.road);

        //Car

        //Car's Position Control Logic
        let carx_speed = .15 //Car's horizontal speed
        let cary_speed = 1 //Car's Vertical Speed (not yet implemented)

        if (this.move > 0){
            this.carx += carx_speed
        }
        if (this.move < 0){
            this.carx -= carx_speed
        }

        //Car Transformation Matrix
        let car_transform = Mat4.identity();
        car_transform = car_transform.times(Mat4.rotation(Math.PI,0,1,0));
        car_transform = car_transform.times(Mat4.translation(0,.05,0));
        car_transform = car_transform.times(Mat4.translation(this.carx,0,0));
        this.shapes.car.draw(context, program_state, car_transform, this.materials.car);

        //Obstacles
        let o1 = Mat4.identity();
        o1 = o1.times(Mat4.translation(5*Math.sin(t),.75,-6));
        this.shapes.obstacle.draw(context, program_state, o1, this.materials.obstacle);

        let o2 = Mat4.identity();
        o2 = o2.times(Mat4.translation(5*Math.sin(t/2),.75,-12));
        this.shapes.obstacle.draw(context, program_state, o2, this.materials.obstacle);

        let o3 = Mat4.identity();
        o3 = o3.times(Mat4.translation(5*Math.sin(t/3),.75,-18));
        this.shapes.obstacle.draw(context, program_state, o3, this.materials.obstacle);

        let o4 = Mat4.identity();
        o4 = o4.times(Mat4.translation(5*Math.sin(t/4),.75,-24));
        this.shapes.obstacle.draw(context, program_state, o4, this.materials.obstacle);

        //Buildings
        this.shapes.building.arrays.texture_coord.forEach(
            (v, i, l) => {
                v[0] *= 3
                v[1] *= 3
            }
        )


        let building_transform_left = Mat4.identity()
        building_transform_left = building_transform_left.times(Mat4.translation(-10,8,0))
        building_transform_left = building_transform_left.times(Mat4.scale(3,10,3));
        let building_transform_right = Mat4.identity()
        building_transform_right = building_transform_right.times(Mat4.translation(10,8,0))
        building_transform_right = building_transform_right.times(Mat4.scale(3,10,3));
        for (let i = 0; i < 10; i++) {
            building_transform_left = building_transform_left.times(Mat4.translation(0,0,-3))
            this.shapes.building.draw(context, program_state, building_transform_left, this.materials.building)
        }
        for (let i = 0; i < 10; i++) {
            building_transform_right = building_transform_right.times(Mat4.translation(0,0,-3))
            this.shapes.building.draw(context, program_state, building_transform_right, this.materials.building)
        }

        //Camera
        //let desired = Mat4.inverse(car_transform.times(Mat4.rotation(Math.PI,0,1,0)).times(Mat4.translation(0,1,4)));
        //desired = desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 1));
        //program_state.set_camera(desired);
    }
}





import {tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec2, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

export function Object_to_World_Space(transformation, points){
    let verts = []
    let temp;
    for (let i = 0; i < points.length; i++){
        temp = vec4(points[i][0], points[i][1], points[i][2], 1)
        verts.push(Apply_Matrix_To_Point(transformation, temp))
    }
    return verts;
}

export function Apply_Matrix_To_Point(transformation, point) {
    let vert = []
    for (let i = 0; i < transformation.length; i++){
        let sum = 0
        for ( let j = 0; j < point.length; j++) {
            sum += transformation[i][j] * point[j];
        }
        vert.push(sum);
    }
    return vert;
}

export function Find_Center_Of_Cube(points) {
    let result = [0, 0, 0]
    for (let i = 0; i < points.length; i++) {
        result[0] += points[i][0]/points.length
        result[1] += points[i][1]/points.length
        result[2] += points[i][2]/points.length
    }
    return result
}

export function Distance(point1, point2) {
    return Math.sqrt(((point1[0]-point2[0])**2) + ((point1[1]-point2[1])**2) + ((point1[2]-point2[2])**2))
}
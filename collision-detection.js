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

export function Get_Dimensions_Of_Collision_Box(points) {
    let min_x = null
    let max_x = null
    let min_y = null
    let max_y = null
    let min_z = null
    let max_z = null
    for (let i = 0; i < points.length; i++){
        if (min_x == null) {
            min_x = points[i][0]
            max_x = points[i][0]
            min_y = points[i][1]
            max_y = points[i][1]
            min_z = points[i][2]
            max_z = points[i][2]
        }
        else {
            min_x = Math.min(points[i][0], min_x)
            max_x = Math.max(points[i][0], max_x)
            min_y = Math.min(points[i][1], min_y)
            max_y = Math.max(points[i][1], max_y)
            min_z = Math.min(points[i][2], min_z)
            max_z = Math.max(points[i][2], max_z)
        }
    }
    let results = [min_x, max_x, min_y, max_y, min_z, max_z]
    return results
}

export function checkCollision(pointsA, pointsB) {
    return (pointsA[0] <= pointsB[1] && pointsA[1] >= pointsB[0]) &&
        (pointsA[2] <= pointsB[3] && pointsA[3] >= pointsB[2]) &&
        (pointsA[4] <= pointsB[5] && pointsA[5] >= pointsB[4])
}


export function Distance(point1, point2) {
    return Math.sqrt(((point1[0]-point2[0])**2) + ((point1[1]-point2[1])**2) + ((point1[2]-point2[2])**2))
}
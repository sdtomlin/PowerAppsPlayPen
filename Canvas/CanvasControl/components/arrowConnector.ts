import Konva from "konva";
import { Vector2d } from "konva/lib/types";

export default function ArrowConnectorFieldControl(start: Vector2d, end: Vector2d): Konva.Arrow
{
    const arrow = new Konva.Arrow({
        points: [start.x, start.y, end.x, end.y],
        fill: 'black',
        stroke: 'black',
        draggable: true
    } as Konva.ArrowConfig);        

    return arrow;
}
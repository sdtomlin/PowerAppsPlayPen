import Konva from "konva";
import { Stage } from "konva/lib/Stage";
import { Circle } from "konva/lib/shapes/Circle";

export default function CircularTextFieldControl(stage: Stage, parent: Circle) {
    const group = new Konva.Group({
        x: stage.width() / 2,
        y: stage.height() / 2,
        name: 'trend',
        class: 'center-circle',
        draggable: false
    });

    const rectangle = new Konva.Rect({
        x: -(50*Math.SQRT2/2),
        y: -(50*Math.SQRT2/2),
        stroke: 'black',
        strokeWidth: 1,
        height: 50*Math.SQRT2,
        width:50*Math.SQRT2
    });

    const circle = new Konva.Circle ({
        //x: stage.width() / 2,
        //y: stage.height() / 2,
        radius: 50,
        fill: '#146CFD',
        stroke: '#146CFD',
        strokeWidth: 0,
        name: 'content-circle'
    });

    const label = new Konva.Label({
        
    });

    const textBox = new Konva.Text({
        x: -50,
        y: -50,
        fontSize: 12,
        align: 'center',
        verticalAlign: 'center',        
        text: '',
        width: 100,
        height: 100,
        class: 'center-circle'
    });
    group.add(rectangle);
    group.add(circle);

    group.add(textBox);
    
    return group;
}
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import Konva from "konva"
import  CircularTextFieldControl from "./components/circularTextField";
import { Vector2d } from "konva/lib/types";
import ArrowConnectorFieldControl from "./components/arrowConnector";
import { Circle } from "konva/lib/shapes/Circle";

const CanvasMode = {
    'ADD': 'add',
    'EDIT': 'edit',
    'CONNECT': 'connect',
}

export class CanvasControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private container: HTMLDivElement;
    private stage: Konva.Stage;
    private _zoomLevel: number = 1;
    private _canvasMode: string = CanvasMode.ADD;

    /**
     * Empty constructor.
     */
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        let target: null | Konva.Arrow;

        this.container = container;
        this._canvasMode = context.parameters.operation.raw?.toString() ?? CanvasMode.ADD;

        // first we need to create a stage
        this.stage = new Konva.Stage({
            container: this.container,   // id of container <div>
            width: 1000,
            height: 1000
        });
  
        // then create layer
        const trendLayer = new Konva.Layer();
  
        // create our shape
        const circle = new Konva.Circle({
            x: this.stage.width() / 2,
            y: this.stage.height() / 2,
            radius: 100,
            fill: '#EBEBEB',
            stroke: '#EBEBEB',
            strokeWidth: 0
        });

        const test = CircularTextFieldControl(this.stage, circle);
         
        const transformer = new Konva.Transformer();
        // add the shape to the layer
        trendLayer.add(circle);
        trendLayer.add(test);
        trendLayer.add(transformer);

        const selectionRectangle = new Konva.Rect({
            fill: 'rgba(0,0,255,0.5)',
            visible: false,
            // disable events to not interrupt with events
            listening: false,
          });

        trendLayer.add(selectionRectangle);

        const level1Layer = new Konva.Layer();

        const layerCircle = new Konva.Circle({
            x: this.stage.width() / 2,
            y: this.stage.height() / 2,
            radius: 300,
            fill: '#CBEDFD',
            stroke: '#CBEDFD',
            strokeWidth: 0
        });
        
        level1Layer.add(layerCircle);
        
        const radius = 300;
        const increment = 360/8;

        const circularDragFunc = (pos: Vector2d) => {
            const center: Vector2d = { x: this.stage.width()/2, y: this.stage.height()/2 };
            const starting: Vector2d = { x: layerCircle.getAbsolutePosition().x, y: layerCircle.getAbsolutePosition().y - layerCircle.radius()};
            
            const distance = Math.sqrt(Math.pow((center.x - pos.x), 2) + Math.pow((center.y - pos.y), 2));

            let angle = 0;
            let offset = 90;
            const xOffet = layerCircle.getAbsolutePosition().x;
            const yOffset = layerCircle.getAbsolutePosition().y;
            if(pos.y <= this.stage.height()/2){
                angle = (Math.atan((center.x - pos.x)/(pos.y - center.y))*180)/Math.PI;
            }else{
                offset = -90;
                angle = (Math.atan((pos.x - center.x)/(center.y - pos.y))*180)/Math.PI;
            }

            console.log(`Angle: ${ angle }`);

            const newX = radius*Math.cos((angle-offset)*Math.PI/180) + xOffet;
            const newY = radius*Math.sin((angle-offset)*Math.PI/180) + yOffset;

            return { x: newX, y: newY };
        };

        for(let i=0; i<8;i++)
        {
            const theta = (i*increment-90)*Math.PI/180;
            const circle = new Konva.Circle({
                x: radius*Math.cos(theta) + layerCircle.getAbsolutePosition().x,
                y: radius*Math.sin(theta) + layerCircle.getAbsolutePosition().y,
                radius: 50,
                fill: 'red',
                stroke: 'red',
                strokeWidth: 0,
                draggable: true,
                dragBoundFunc: circularDragFunc
            });

            const label = new Konva.Text({
                x: circle.getAbsolutePosition().x,
                y: circle.getAbsolutePosition().y,
                /*text: `${i.toString()} - ${circle.getAbsolutePosition().x} - ${circle.getAbsolutePosition().y} - ${layerCircle.getAbsolutePosition().x} - ${layerCircle.getAbsolutePosition().y}`*/
            });

            level1Layer.add(circle);
            level1Layer.add(label);

        }

        /*const testDrag = new Konva.Circle({
            x: this.stage.width()/2,
            y: layerCircle.getAbsolutePosition().y - layerCircle.radius(),
            radius: 50,
            fill: 'red',
            stroke: 'red',
            strokeWidth: 0,
            draggable: true,

        });
        level1Layer.add(testDrag);*/



        const label = new Konva.Label({
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            draggable: true
          });
          
          // add a tag to the label
          label.add(new Konva.Tag({
            fill: '#bbb',
            stroke: '#333',
            lineJoin: 'round',
            pointerDirection: 'none',
            pointerWidth: 20,
            pointerHeight: 20,
            cornerRadius: 100
          }));
          

          /*const labelText = new Konva.Text({
            width: 85,
            height: 85,
            text: 'Hello some really long text to try and fit so lets see if we can break it',
            wrap: 'true',
            fontSize: 12,
            lineHeight: 1.2,
            padding: 10,
            fill: 'green',
            align: 'center',
            verticalAlign: 'middle'
           })

          // add text to the label
          label.add(labelText);

        trendLayer.add(label);*/

       /* label.on('dblclick', () => {
            console.log('Double click');
            const textPosition = label.getAbsolutePosition();
            const stageBox = this.stage.container().getBoundingClientRect();

            const areaPosition = {
                x: stageBox.left + textPosition.x,
                y: stageBox.top + textPosition.y,
              };

            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);

            textarea.value = labelText.text();
            textarea.style.position = 'absolute';
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.style.width = label.width().toString() + 'px';
            textarea.style.height = label.height().toString() + 'px';  
            textarea.focus();

            textarea.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    labelText.text(textarea.value);
                    document.body.removeChild(textarea);
                }else if(e.key === 'Escape'){
                    document.body.removeChild(textarea);
                }
            })
        });*/


        // add the layer to the stage
        this.stage.add(level1Layer);
        this.stage.add(trendLayer);
  
        // draw the image
        level1Layer.draw();
        trendLayer.draw();

        let drawing:boolean = false;

        this.stage.on('mousedown', (e) => {

            console.log(this._canvasMode);

            if(drawing) return;
            e.evt.preventDefault();

            drawing = true;

            const x1 = this.stage.getPointerPosition()?.x ?? 0;
            const y1 = this.stage.getPointerPosition()?.y ?? 0;
            //target = ArrowConnectorFieldControl({ x: x1, y: y1 }, { x: x1, y: y1 });            
            //trendLayer.add(target);

            if (this._canvasMode == CanvasMode.CONNECT){
                const shapes = this.stage.find('Circle');
                const selected = shapes.filter((shape) => shape.index > 0 && Konva.Util.haveIntersection(e.target.getClientRect(), shape.getClientRect()));

                target = ArrowConnectorFieldControl({ x: selected[0].getAbsolutePosition().x, y: selected[0].getAbsolutePosition().y }, { x: selected[0].getAbsolutePosition().x, y: selected[0].getAbsolutePosition().y });            
                trendLayer.add(target);
            }
        });

        this.stage.on('mousemove touchmove', (e) => {
            e.evt.preventDefault();

            const x2 = this.stage.getPointerPosition()?.x ?? 0;
            const y2 = this.stage.getPointerPosition()?.y ?? 0;

            if(target != null) {
                const points = target.points().slice();
                points[2] = x2;
                points[3] = y2;
                target.points(points);
            }

            selectionRectangle.setAttrs({
              visible: true,
              x: x2,
              y: y2,
              width: 1,
              height: 1,
            });
          });

        this.stage.on('mouseup', (e) => {
            drawing = false;
            e.evt.preventDefault();
            
     

            if(this._canvasMode == CanvasMode.CONNECT){
                const shapes = this.stage.find('Circle');
                const selected = shapes.filter((shape) => shape.index > 0 && Konva.Util.haveIntersection(e.target.getClientRect(), shape.getClientRect()));
                console.log(selected);

                if(target != null){
                    const points = target?.points().slice();
                    points[2] = selected[0].getAbsolutePosition().x;
                    points[3] = selected[0].getAbsolutePosition().y;
                    target.points(points);

                    const distance = Math.sqrt(Math.pow((target.points()[0] - target.points()[2]), 2) + Math.pow((target.points()[1] - target.points()[3]), 2));
    
                    const shapes = this.stage.find('.content-circle');
                    const source = shapes.filter((shape) => Konva.Util.haveIntersection(new Konva.Rect({ x: points[0], y: points[1], height:1, width: 1}).getClientRect(), shape.getClientRect()));

                    console.log(target.points())

                    if(Math.abs(points[0] - points[2]) < 0.001 || Math.abs(points[1] - points[3]) < 0.001){
                        if(Math.abs(points[1] - points[3]) < 0.001)
                        {
                            if(points[2] > points[0])
                            {
                                points[0] = points[0] + (source[0] as Circle).radius();
                                points[2] = points[2] - (selected[0] as Circle).radius();

                            }
                            else if(points[0] > points[2])
                            {
                                points[0] = points[0] - (source[0] as Circle).radius();
                                points[2] = points[2] + (selected[0] as Circle).radius();
                            }
                        }else{
                                if(points[3] > points[1])
                                {
                                    points[1] = points[1] + (source[0] as Circle).radius();
                                    points[3] = points[3] - (selected[0] as Circle).radius();
    
                                }
                                else if(points[1] > points[3])
                                {
                                    points[1] = points[1] - (source[0] as Circle).radius();
                                    points[3] = points[3] + (selected[0] as Circle).radius();
                                }
                        }

                        target.points(points);
                    }else{
                        const angle = (Math.atan((points[0] - points[2])/(points[3] - points[1]))*180)/Math.PI;

                        console.log(`Target Angle ${angle}`);

                        const sourceCircle = (source[0] as Circle);
                        const sourceRadius = sourceCircle.radius();
                        const targetCircle = (selected[0] as Circle);
                        const targetRadius = targetCircle.radius();

                        let sourceOffset = 90;
                        if(targetCircle.getAbsolutePosition().y > sourceCircle.getAbsolutePosition().y){
                            sourceOffset = -90;
                        }

                        const sourceX = sourceRadius*Math.cos((angle-sourceOffset)*Math.PI/180)+sourceCircle.getAbsolutePosition().x;
                        const sourceY = sourceRadius*Math.sin((angle-sourceOffset)*Math.PI/180)+sourceCircle.getAbsolutePosition().y;
            
                        console.log(`New X: ${sourceX}  New Y: ${sourceY}`);

                        points[0] = sourceX;
                        points[1] = sourceY;



                        console.log(`TargetX ${targetCircle.getAbsolutePosition().x}  TargetY ${targetCircle.getAbsolutePosition().y}`);

                        let targetOffset = 90;
                        if(targetCircle.getAbsolutePosition().y > sourceCircle.getAbsolutePosition().y){
                            targetOffset = -90;
                        }

                        const targetX = targetRadius*Math.cos((angle+targetOffset)*Math.PI/180) + targetCircle.getAbsolutePosition().x;
                        const targetY = targetRadius*Math.sin((angle+targetOffset)*Math.PI/180) + targetCircle.getAbsolutePosition().y;

                        console.log(`Target X: ${targetX}  Target Y: ${targetY}`);

                        points[2] = targetX;
                        points[3] = targetY;

                        target.points(points);
                    }

                }

                

                target = null;
            }
            else{

                // update visibility in timeout, so we can check it in click event
                selectionRectangle.visible(false);
                const shapes = this.stage.find('.trend');
                const box = selectionRectangle.getClientRect();
                const selected = shapes.filter((shape) =>
                Konva.Util.haveIntersection(box, shape.getClientRect())
                );

                console.log(selected);

                transformer.nodes(selected);
            }
        });
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        console.log(context.parameters.zoomValue.raw);
        console.log(context.parameters.operation.raw);
        
        const scale = context.parameters.zoomValue.raw!/100;

        switch(context.parameters.operation.raw){
            case CanvasMode.ADD:
                this._canvasMode = CanvasMode.ADD;break;
            case CanvasMode.CONNECT:
                this._canvasMode = CanvasMode.CONNECT;break;
            default:
                this._canvasMode = CanvasMode.EDIT;break;
        }
        
        this.stage.scale({ x: scale, y: scale});
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs
    {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }
}

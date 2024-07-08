import { IInputs, IOutputs } from "./generated/ManifestTypes";
import Konva from "konva"
import  CircularTextFieldControl from "./components/circularTextField";
import ArrowConnectorFieldControl from "./components/arrowConnector";

export class CanvasControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private container: HTMLDivElement;

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

        // first we need to create a stage
        const stage = new Konva.Stage({
            container: this.container,   // id of container <div>
            width: 1000,
            height: 1000
        });
  
        // then create layer
        const trendLayer = new Konva.Layer();
  
        // create our shape
        const circle = new Konva.Circle({
            x: stage.width() / 2,
            y: stage.height() / 2,
            radius: 100,
            fill: '#EBEBEB',
            stroke: '#EBEBEB',
            strokeWidth: 0
        });

        const test = CircularTextFieldControl(stage, circle);
         
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
            x: stage.width() / 2,
            y: stage.height() / 2,
            radius: 300,
            fill: '#CBEDFD',
            stroke: '#CBEDFD',
            strokeWidth: 0
        });
        
        level1Layer.add(layerCircle);

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
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: { x: 10, y: 10 },
            shadowOpacity: 0.2,
            lineJoin: 'round',
            pointerDirection: 'none',
            pointerWidth: 20,
            pointerHeight: 20,
            cornerRadius: 100
          }));
          
          // add text to the label
          label.add(new Konva.Text({
            width: 85,
            height: 85,
            text: 'Hello some really long text to try and fit',
            wrap: 'true',
            fontSize: 12,
            lineHeight: 1.2,
            padding: 10,
            fill: 'green',
            align: 'center',
            verticalAlign: 'middle'
           }));

        trendLayer.add(label);


        // add the layer to the stage
        stage.add(level1Layer);
        stage.add(trendLayer);
  
        // draw the image
        level1Layer.draw();
        trendLayer.draw();

        let drawing:boolean = false;

        stage.on('mousedown', (e) => {
            if(drawing) return;
            e.evt.preventDefault();

            drawing = true;
            const x1 = stage.getPointerPosition()?.x ?? 0;
            const y1 = stage.getPointerPosition()?.y ?? 0;
            target = ArrowConnectorFieldControl({ x: x1, y: y1 }, { x: x1, y: y1 });            
            trendLayer.add(target);
        });

        stage.on('mousemove touchmove', (e) => {
            e.evt.preventDefault();

            const x2 = stage.getPointerPosition()?.x ?? 0;
            const y2 = stage.getPointerPosition()?.y ?? 0;

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

        stage.on('mouseup', (e) => {
            drawing = false;
            e.evt.preventDefault();

            target = null;
            // update visibility in timeout, so we can check it in click event
            selectionRectangle.visible(false);
            const shapes = stage.find('.trend');
            const box = selectionRectangle.getClientRect();
            const selected = shapes.filter((shape) =>
              Konva.Util.haveIntersection(box, shape.getClientRect())
            );

            console.log(selected);

            transformer.nodes(selected);
        });
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // Add code to update control view
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

import useDrawing from "../context/DrawingContext";
import { Tool } from "../models/Action";

const ToolbarButton = ({ name, tool }: { name: string, tool: Tool }) => {
    const drawingContext = useDrawing();

    const onClick = () => {
        drawingContext.setTool(tool);
    };

    const activeStyle = drawingContext.tool === tool ? "bg-slate-200" : "";

    return (
        <button className={"transition ease-in-out px-2 py-1 rounded-md patrick-hand-regular hover:bg-slate-200 active:bg-slate-300 active:scale-90 duration-300 " + activeStyle}
            onClick={onClick}>
            {name}
        </button>
    );
};

export default ToolbarButton;
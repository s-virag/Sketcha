import useDrawing from "../context/DrawingContext";

const ColorButton = ({ color } : {color: string}) => {
    const drawingContext = useDrawing();
    const onClick = () => {
        drawingContext.setColor(color);
    };

    
    const activeStyle = drawingContext.color === color ? "bg-slate-200" : "";

    return (
        <div className={"transition ease-in-out cursor-pointer hover:bg-slate-200 rounded-md active:scale-90 active:bg-slate-300 duration-300 flex items-center p-1 " + activeStyle}>
            <button className={"w-6 h-6 rounded-full m-0"} style={{backgroundColor: color}}
                onClick={onClick}>
            </button>
        </div>
    );
}

export default ColorButton;
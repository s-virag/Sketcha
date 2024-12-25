import ColorButton from "./ColorButton";
import { Colors } from "../models/Color";

const ColorSelector = () => {
    const colors = Array.from(Colors.values());

    return (
        <div className="flex justify-center items-center gap-3 p-2 w-min mt-3 rounded-lg bg-slate-100 ">
            {colors.map((color: string, index: number) => (
                <ColorButton key={index} color={color} />
            ))}
        </div>
    );
};

export default ColorSelector;

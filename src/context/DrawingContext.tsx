import { createContext, useContext, useState } from "react";
import { ReactNode } from "react";
import { Action, Tool } from "../models/Action";
import { Colors } from "../models/Color";
import usePressedKeys from "../hooks/usePressedKeys";


const DrawingContext = createContext<{ action: Action, setAction: React.Dispatch<React.SetStateAction<Action>>, tool: Tool, setTool: React.Dispatch<React.SetStateAction<Tool>>, color: string, setColor: React.Dispatch<React.SetStateAction<string>>, pressedKeys: Set<KeyboardEvent["key"]>}>({
    action: Action.None,
    setAction: () => {},
    tool: Tool.Selection,
    setTool: () => {},
    color: Colors.get("Black")!,
    setColor: () => {},
    pressedKeys: new Set()
});

const useDrawing = () => useContext(DrawingContext);


export const DrawingProvider = ({ children }: { children: ReactNode }) => {
    const [action, setAction] = useState<Action>(Action.None);
    const [tool, setTool] = useState<Tool>(Tool.Selection);
    const [color, setColor] = useState<string>(Colors.get("Black")!);
    const pressedKeys = usePressedKeys();

    return (
        <DrawingContext.Provider value={{action, setAction, tool, setTool, color, setColor, pressedKeys}}>
            {children}
        </DrawingContext.Provider>
    );
}


export default useDrawing;
import { createContext, useContext, useState } from "react";
import { ReactNode } from "react";
import { Action, Tool } from "../models/Action";
import { Colors } from "../models/Color";


const DrawingContext = createContext<{ action: Action, setAction: React.Dispatch<React.SetStateAction<Action>>, tool: Tool, setTool: React.Dispatch<React.SetStateAction<Tool>>, color: string, setColor: React.Dispatch<React.SetStateAction<string>>}>({
    action: Action.None,
    setAction: () => {},
    tool: Tool.Move,
    setTool: () => {},
    color: Colors.get("Black")!,
    setColor: () => {}
});

const useDrawing = () => useContext(DrawingContext);


export const DrawingProvider = ({ children }: { children: ReactNode }) => {
    const [action, setAction] = useState<Action>(Action.None);
    const [tool, setTool] = useState<Tool>(Tool.Move);
    const [color, setColor] = useState<string>(Colors.get("Black")!);

    return (
        <DrawingContext.Provider value={{action, setAction, tool, setTool, color, setColor}}>
            {children}
        </DrawingContext.Provider>
    );
}


export default useDrawing;
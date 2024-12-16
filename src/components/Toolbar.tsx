import ToolbarButton from "./ToolbarButton";
import { Tool } from "../models/Action";

const Toolbar = () => {
    const tools = Object.keys(Tool)

    return (     
        <div className="flex justify-center gap-4 p-2 w-min mt-3 rounded-lg bg-slate-100">
            {
                tools.map((key, index) => {
                    return <ToolbarButton key={index} name={key} tool={Tool[key as keyof typeof Tool]} />
                })
            }
        </div>
    );
};

export default Toolbar;
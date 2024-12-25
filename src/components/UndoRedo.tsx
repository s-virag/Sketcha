const UndoRedo = ({ undo, redo }: { undo: () => void, redo: () => void }) => {

    return (
        <div className="flex justify-center gap-4 p-2 w-min mb-3 rounded-lg bg-slate-100 ">
            <button onClick={undo} className="transition ease-in-out px-2 py-1 rounded-md patrick-hand-regular hover:bg-slate-200 active:bg-slate-300 active:scale-90 duration-300 ">Undo</button>
            <button onClick={redo} className="transition ease-in-out px-2 py-1 rounded-md patrick-hand-regular hover:bg-slate-200 active:bg-slate-300 active:scale-90 duration-300 ">Redo</button>
        </div>
    );
}

export default UndoRedo;
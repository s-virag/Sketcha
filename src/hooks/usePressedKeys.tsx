import { useEffect, useState } from "react";

const usePressedKeys = () => {
    const [pressedKeys, setPressedKeys] = useState<Set<KeyboardEvent["key"]>>(new Set());

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            setPressedKeys(prevKeys => new Set(prevKeys).add(event.key));
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            setPressedKeys(prevKeys => {
                const newKeys = new Set(prevKeys);
                newKeys.delete(event.key);
                return newKeys;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [pressedKeys]);

    return pressedKeys;
};

export default usePressedKeys;
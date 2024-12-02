import React from "react";
import { LayoutContext } from "./LayouContext";

const useLayoutContext = () => {
    const context = React.useContext(LayoutContext);

    if (context === undefined) {
        throw new Error("useLayoutContext must be used within a LayoutProvider");
    }
    return context;
};

export default useLayoutContext;

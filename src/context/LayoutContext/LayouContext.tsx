import { LayoutType } from "@/types";
import { createContext } from "react";

export const LayoutContext = createContext<LayoutType | undefined>(undefined);

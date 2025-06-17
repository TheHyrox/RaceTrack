import { formulaData } from "./formula-data";
import { motodata } from "./moto-data";
import { wecdata } from "./wec-data";

export const trackData = {
    ...formulaData,
    ...motodata,
    ...wecdata
};
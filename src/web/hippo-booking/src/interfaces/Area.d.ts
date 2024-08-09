import {AreaTypeEnum} from "../enums/AreaTypeEnum.ts";

interface Area {
    id: number;
    name: string;
    locationId: number;
    areaTypeId: AreaTypeEnum;
}

interface NewArea {
    name: string;
    description: string;
    areaTypeId: AreaTypeEnum;
}
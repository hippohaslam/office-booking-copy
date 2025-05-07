import { AreaTypeEnum } from "../enums/AreaTypeEnum.ts";
import type { BookableObject } from "./Desk";

interface Area {
  id: number;
  name: string;
  locationId: number;
  areaTypeId: AreaTypeEnum;
  floorPlanJson: string;
  bookableObjects: Array<BookableObject>;
}

interface NewArea {
  name: string;
  description: string;
  areaTypeId: AreaTypeEnum;
}

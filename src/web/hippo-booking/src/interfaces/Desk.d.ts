import { BookableObjectTypeEnum } from "../enums/BookableObjectTypeEnum";

export interface BookableObject {
  id: number;
  name: string;
  description?: string;
  floorPlanObjectId?: string;
  bookableObjectTypeId: BookableObjectTypeEnum;
}

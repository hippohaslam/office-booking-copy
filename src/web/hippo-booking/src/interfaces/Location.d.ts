import { Area } from "./Area";

interface BookingLocation {
  id: number;
  name: string;
  description: string;
  areas: Area[];
}

interface NewLocation {
  name: string;
  description: string;
}

import { Area } from "./Area";

interface BookingLocation {
  id: number;
  name: string;
  description: string;
  address: string;
  slackChannel?: string;
  guideLink?: string;
  areas: Area[];
}

interface NewLocation {
  name: string;
  description: string;
  address: string;
  slackChannel?: string;
  guideLink?: string;
}

interface EditLocation extends NewLocation {
  id: number;
}

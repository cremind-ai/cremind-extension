import { Icon } from "@/lib/features";

export enum OptionCommandType {
  SETTINGS = "Settings",
}

export const moreOptions: {
  label: string;
  icon: Icon;
}[] = [
  {
    label: OptionCommandType.SETTINGS,
    icon: {
      content: "solar:settings-line-duotone",
      fontSize: "16px",
      type: "icon",
    },
  },
];

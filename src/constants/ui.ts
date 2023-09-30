import { Icon } from "@/lib/features";

export enum OptionCommandType {
  SETTINGS = "Settings",
}

export enum SidebarMenuEnum {
  CHAT = "0",
  TEXT = "1",
  PROMPT = "2",
  UPLOAD = "3",
  SETTINGS = "4",
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

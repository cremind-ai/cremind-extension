import { ChainVariableSchema } from "../chain";
import { ChainConfig } from "../chain/chain_builder";

type IconType = "icon" | "svg";

export enum CategoryFeatureEnum {
  ALL = "all",
  LANGUAGE = "language",
  CONTENT = "content",
  MARKETING = "marketing",
  DEVELOPER = "developer",
  CREATIVE = "creative",
  PRODUCTIVITY = "productivity",
  TRAINING = "training",
  ENTERTAINMENT = "entertainment",
  EDUCATION = "education",
  OTHER = "other",
}

export type Icon = {
  content: string;
  fontSize?: string;
  width?: string;
  height?: string;
  type: IconType;
};

export type AIProviderFeatureConfig = {
  Chains: ChainConfig[];
  WriteResponse?: boolean;
  Segmentation?: boolean;
  ChunkSize?: number;
};

export type FeatureType = {
  title: string;
  description: string;
  Icon: Icon;
  variableSchema: ChainVariableSchema;
  ChatGPT: AIProviderFeatureConfig | null;
  Claude: AIProviderFeatureConfig | null;
  Bard: AIProviderFeatureConfig | null;
};

export type FeatureSchema = {
  id: string;
  title: string;
  description: string;
  category: CategoryFeatureEnum;
  enabled: boolean;
  timestamp: number;
  READONLY?: FeatureType;
  EDITABLE?: FeatureType;
  PROMPT?: FeatureType;
  UPLOAD?: FeatureType;
  [key: string]: any;
};

export class Feature {}

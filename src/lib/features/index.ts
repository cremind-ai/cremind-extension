import { ChainVariableSchema } from "../chain";
import { ChainConfig } from "../chain/chain_builder";

type IconType = "icon" | "svg";

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
  Bard: AIProviderFeatureConfig | null;
};

export type FeatureSchema = {
  id: string;
  description: string;
  title: string;
  READONLY?: FeatureType;
  EDITABLE?: FeatureType;
  READONLY_CONTEXT_MENU?: FeatureType;
  EDITABLE_CONTEXT_MENU?: FeatureType;
  APP?: FeatureType;
};

export class Feature {}

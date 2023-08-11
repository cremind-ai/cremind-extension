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
export type FeatureType = {
  label: string;
  description: string;
  Icon: Icon;
  variableSchema: ChainVariableSchema;
  Chains: ChainConfig[];
  WriteResponse?: boolean;
};
export type FeatureSchema = {
  id: string;
  description: string;
  READONLY?: FeatureType;
  EDITABLE?: FeatureType;
  READONLY_CONTEXT_MENU?: FeatureType;
  EDITABLE_CONTEXT_MENU?: FeatureType;
};

export class Feature {}

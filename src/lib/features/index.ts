import { ChainVariableSchema } from "../chain";
import { ChainConfig } from "../chain/chain_builder";
type IconType = "icon" | "svg";

type Icon = {
  content: string;
  fontSize?: string;
  width?: string;
  height?: string;
  type: IconType;
};
export type FeatureType = {
  title: string;
  description: string;
  Icon: Icon;
  variableSchema: ChainVariableSchema;
  Chains: ChainConfig[];
  WriteResponse?: boolean;
};
export type FeatureSchema = {
  id: string;
  READONLY?: FeatureType;
  EDITABLE?: FeatureType;
  EDITABLE_NO_CONTENT?: FeatureType;
};

export class Feature {}

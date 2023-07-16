import { FeatureSchema } from "./index";
export const featureList: FeatureSchema[] = [
  {
    id: "e1b5a11b-d0c5-4c73-862b-e3dc9a2a7652",
    READONLY: {
      Icon: {
        content: "system-uicons:translate",
        fontSize: "20px",
        type: "icon",
      },
      variableSchema: {
        target_language: {
          options: ["Vietnamese", "English", "Japanese", "Korean", "Chinese"],
          description: "Target language",
          storage: true,
        },
      },
      Chains: [
        {
          name: "ChainTranslate",
          promptTemplate:
            "Translate to @{target_language}:\nSENTENCE:&{SELECTED_TEXT}\nTRANSLATED:",
          variableOutput: null,
        },
      ],
    },
    EDITABLE: {
      Icon: {
        content: "system-uicons:translate",
        fontSize: "20px",
        type: "icon",
      },
      variableSchema: {
        target_language: {
          options: ["Vietnamese", "English", "Japanese", "Korean", "Chinese"],
          description: "Target language",
          storage: true,
        },
      },
      Chains: [
        {
          name: "ChainTranslate",
          promptTemplate:
            "Translate to @{target_language}:\nSENTENCE:&{SELECTED_TEXT}\nTRANSLATED:",
          variableOutput: null,
        },
      ],
    },
  },
  {
    id: "bd80fcb2-a871-45f6-b14c-fa59866d592d",
    EDITABLE: {
      Icon: {
        content: "icon-park-outline:correct",
        fontSize: "20px",
        type: "icon",
      },
      variableSchema: {
        target_language: {
          options: ["English", "Japanese", "Korean", "Chinese"],
          description: "Target language",
          storage: true,
        },
      },
      Chains: [
        {
          name: "chainCorrect",
          promptTemplate:
            "Correct to standard @{target_language} grammar:\nSENTENCE:&{SELECTED_TEXT}\nCORRECTED:",
          variableOutput: null,
        },
      ],
      WriteResponse: true,
    },
  },

  {
    id: "d2d0c070-b580-4228-bc41-d6ffe87d17ee",
    READONLY: {
      Icon: {
        content: "fluent:text-grammar-checkmark-24-regular",
        fontSize: "20px",
        type: "icon",
      },
      variableSchema: {
        your_native_language: {
          options: ["English", "Vietnamese"],
          description: "Your native language",
          storage: true,
        },
      },
      Chains: [
        {
          name: "ChainCorrect",
          promptTemplate:
            "Explain the English grammar of the sentence below:\n&{SELECTED_TEXT}\nEXPLAIN (in @{your_native_language}):",
          variableOutput: null,
        },
      ],
    },
    EDITABLE: {
      Icon: {
        content: "fluent:text-grammar-checkmark-24-regular",
        fontSize: "20px",
        type: "icon",
      },
      variableSchema: {},
      Chains: [
        {
          name: "ChainCorrect",
          promptTemplate:
            "Correct this below to standard &{LANGUAGE} grammar:\n&{SELECTED_TEXT}",
          variableOutput: "sentence_corrected",
        },
        {
          name: "ChainExplain",
          promptTemplate:
            "Explain the grammar mistakes, why correct them in detail\nSENTENCE:&{SELECTED_TEXT}\nCORRECTED:@{sentence_corrected}\nEXPLAIN (in Vietnamese):",
          variableOutput: null,
        },
      ],
      WriteResponse: false,
    },
  },
  {
    id: "7cbe5f85-03f6-41a7-b68f-818f6afa2a74",
    EDITABLE_NO_CONTENT: {
      Icon: {
        content: "iconamoon:email-thin",
        fontSize: "20px",
        type: "icon",
      },
      variableSchema: {
        email_description: {
          description: "Email description",
          storage: false,
        },
        word_length: {
          description: "Word length",
          storage: true,
        },
        target_language: {
          options: ["English", "Vietnamese", "Japanese", "Korean", "Chinese"],
          description: "Target language",
          storage: true,
        },
      },
      Chains: [
        {
          name: "Email",
          promptTemplate:
            'write an email about "@{email_description}" (under @{word_length} words) in @{target_language}:',
          variableOutput: null,
        },
      ],
      WriteResponse: true,
    },
  },
];

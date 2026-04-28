export interface ModelOption {
  key: string;
  label: string;
}

// Current trained model artifacts available in model/model_output.
export const FALLBACK_MODEL_OPTIONS: ModelOption[] = [
  { key: "final_model", label: "final_model.pth" },
  { key: "archive_model_best", label: "archive_model_best.pth" },
  { key: "best_model", label: "best_model.pth" },
  { key: "best_model-1", label: "best_model-1.pth" },
  { key: "e1-train-1", label: "e1-train-1.pth" },
  { key: "e2-train-1", label: "e2-train-1.pth" },
  { key: "e5-train-1", label: "e5-train-1.pth" },
  { key: "folders_model_best", label: "folders_model_best.pth" },
];

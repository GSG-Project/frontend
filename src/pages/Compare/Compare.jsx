import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import { getModels, createComparison } from "../../services/comparisonService";
import "./Compare.css";

export default function Compare({ user, onLogout }) {
  const navigate = useNavigate();

  const [promptText, setPromptText] = useState("");
  const [modelA, setModelA] = useState("");
  const [modelB, setModelB] = useState("");
  const [executionState, setExecutionState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadModels() {
      try {
        const data = await getModels({ signal: controller.signal });
        if (!Array.isArray(data?.models)) throw new Error("The models API returned an unexpected response.");
        setModels(data.models.filter((model) => model.is_active));
      } catch (error) {
        if (error.name !== "AbortError") {
          setModelsError(error.message || "Unable to load models.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingModels(false);
        }
      }
    }

    loadModels();
    return () => controller.abort();
  }, []);

  const modelName = (id) => models.find((model) => model.id === id)?.name || "";

  const handleRunComparison = async () => {
    if (executionState === "running") return;

    if (!promptText.trim() || !modelA || !modelB) {
      setErrorMessage("Please enter a prompt and select both models.");
      return;
    }

    if (modelA === modelB) {
      setErrorMessage("Please select two different models.");
      return;
    }

    setErrorMessage("");
    setExecutionState("running");

    try {
      const comparisonResponse = await createComparison({
        prompt: promptText.trim(),
        model_ids: [modelA, modelB],
      });

      const params = new URLSearchParams({
        experiment: String(comparisonResponse.experiment_id),
        run: String(comparisonResponse.run_id),
      });
      navigate(`/results?${params}`, {
        state: { promptText: promptText.trim(), modelA, modelB, comparisonResponse },
      });
    } catch (error) {
      setExecutionState("idle");
      setErrorMessage(error.message || "Failed to run comparison.");
    }
  };

  return (
    <div className="compare-page">
      <AppHeader user={user} onLogout={onLogout} />

      <main className="compare-main">
        <div className="compare-top-section">
          <section className="compare-form-section">
            <div className="compare-form-header">
              <h1 className="compare-form-title">New Comparison</h1>
              <button
                className="compare-btn-primary"
                onClick={handleRunComparison}
                disabled={executionState === "running" || isLoadingModels || Boolean(modelsError) || models.length < 2}
              >
                {isLoadingModels ? "Loading models..." : executionState === "running" ? "Running..." : "Run Comparison"}
              </button>
            </div>

            <div className="compare-input-group">
              <label htmlFor="comparison-prompt">Prompt</label>
              <textarea
                id="comparison-prompt"
                className="compare-textarea"
                placeholder="Enter prompt..."
                value={promptText}
                onChange={(e) => {
                  setPromptText(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            <div className="compare-selectors-row">
              <div className="compare-input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="model-a">Model A</label>
                <select
                  id="model-a"
                  className="compare-select"
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  disabled={isLoadingModels || Boolean(modelsError)}
                >
                  <option value="">{isLoadingModels ? "Loading models..." : "Select model"}</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>

              <div className="compare-input-group" style={{ marginBottom: 0 }}>
                <label htmlFor="model-b">Model B</label>
                <select
                  id="model-b"
                  className="compare-select"
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  disabled={isLoadingModels || Boolean(modelsError)}
                >
                  <option value="">{isLoadingModels ? "Loading models..." : "Select model"}</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {modelsError && <p className="compare-error-message" role="alert">Could not load models: {modelsError}</p>}
            {!isLoadingModels && !modelsError && models.length === 0 && (
              <p className="compare-error-message" role="alert">No active models are currently available.</p>
            )}

            <div className="compare-evaluation-criteria" style={{ marginTop: "auto" }}>
              <span>Evaluation Criteria: Predefined rubric</span>
            </div>

            {errorMessage && <p className="compare-error-message" role="alert">{errorMessage}</p>}
          </section>
        </div>

        <section className="compare-status-section">
          <div className="compare-status-header">
            <h2 className="compare-form-title" style={{ fontSize: "1.05rem" }}>Execution Status</h2>
          </div>
          <p className="compare-status-message" role="status">
            {executionState === "running"
              ? "Both models are generating their answers, then the AI judge evaluates them. This can take up to a minute."
              : "Choose two models, enter a prompt and run the comparison."}
          </p>

          <div className="compare-results-grid">
            <div className="compare-result-card">
              <div className="compare-result-card-header">
                <strong>Model A</strong>
                {executionState === "running" && <span className="compare-badge running">Running</span>}
              </div>
              <div className="compare-result-content">
                <p className="compare-model-name">{modelName(modelA) || "No model selected"}</p>
                {executionState === "running" && <p className="compare-muted-text">Generating answer…</p>}
              </div>
            </div>

            <div className="compare-result-card">
              <div className="compare-result-card-header">
                <strong>Model B</strong>
                {executionState === "running" && <span className="compare-badge running">Running</span>}
              </div>
              <div className="compare-result-content">
                <p className="compare-model-name">{modelName(modelB) || "No model selected"}</p>
                {executionState === "running" && <p className="compare-muted-text">Generating answer…</p>}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

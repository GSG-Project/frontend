import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import { getModels, createComparison } from "../../services/comparisonService";
import { describeGeneralError, fieldErrorsFrom } from "../../services/format";
import "./Compare.css";

export default function Compare({ user, onLogout }) {
  const navigate = useNavigate();

  const [promptText, setPromptText] = useState("");
  const [modelA, setModelA] = useState("");
  const [modelB, setModelB] = useState("");
  const [executionState, setExecutionState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [modelsKey, setModelsKey] = useState(0);
  const [modelsResult, setModelsResult] = useState({ key: null, models: [], error: "" });

  useEffect(() => {
    const controller = new AbortController();
    getModels({ signal: controller.signal })
      .then((data) => {
        if (!Array.isArray(data?.models)) throw new Error("The list of models could not be read. Please try again.");
        setModelsResult({ key: modelsKey, models: data.models.filter((model) => model.is_active), error: "" });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setModelsResult({
          key: modelsKey,
          models: [],
          error: describeGeneralError(error, "The list of models could not be loaded. Please try again."),
        });
      });
    return () => controller.abort();
  }, [modelsKey]);

  const isLoadingModels = modelsResult.key !== modelsKey;
  const models = modelsResult.models;
  const modelsError = isLoadingModels ? "" : modelsResult.error;
  const retryModels = () => setModelsKey((key) => key + 1);

  const modelName = (id) => models.find((model) => model.id === id)?.name || "";

  const handleRunComparison = async () => {
    if (executionState === "running") return;

    if (!promptText.trim()) {
      setErrorMessage("Please enter a prompt.");
      return;
    }

    if (!modelA || !modelB) {
      setErrorMessage("Please choose both models.");
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

      const params = user
        ? `?${new URLSearchParams({ experiment: String(comparisonResponse.experiment_id), run: String(comparisonResponse.run_id) })}`
        : "";
      navigate(`/results${params}`, {
        state: { promptText: promptText.trim(), modelA, modelB, comparisonResponse },
      });
    } catch (error) {
      setExecutionState("idle");
      if (error?.status === 400) {
        const fields = Object.values(fieldErrorsFrom(error));
        setErrorMessage(fields.join(" ") || "Please check the prompt and the selected models, then try again.");
      } else if (error?.status >= 500) {
        setErrorMessage("The comparison could not be completed on the server. Please try again in a moment.");
      } else {
        setErrorMessage(describeGeneralError(error, "The comparison could not be completed. Please try again."));
      }
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

            {!user && (
              <p className="compare-guest-note" role="note">
                You're not signed in. You can still run a comparison, but it won't be saved to your history.{" "}
                <Link to="/login">Log in</Link> or <Link to="/register">create an account</Link> to keep your results.
              </p>
            )}

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
                  onChange={(e) => { setModelA(e.target.value); if (errorMessage) setErrorMessage(""); }}
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
                  onChange={(e) => { setModelB(e.target.value); if (errorMessage) setErrorMessage(""); }}
                  disabled={isLoadingModels || Boolean(modelsError)}
                >
                  <option value="">{isLoadingModels ? "Loading models..." : "Select model"}</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {modelsError && (
              <div className="compare-error-message compare-error-with-action" role="alert">
                <span>{modelsError}</span>
                <button type="button" className="compare-retry-btn" onClick={retryModels}>Try again</button>
              </div>
            )}
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

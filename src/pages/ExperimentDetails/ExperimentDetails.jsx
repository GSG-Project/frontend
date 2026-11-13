import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import PageState from "../../components/PageState/PageState";
import { getExperiment, rerunExperiment } from "../../services/experimentService";
import { CRITERIA, normalizeExperimentDetail } from "../../services/normalize";
import {
  describeActionError,
  describeLoadError,
  EMPTY,
  formatCost,
  formatDate,
  formatInteger,
  formatLatency,
  formatScore,
  formatStatus,
} from "../../services/format";
import "../../styles/history.css";
import "./ExperimentDetails.css";

const CRITERION_LABELS = {
  accuracy: "Accuracy",
  relevance: "Relevance",
  clarity: "Clarity",
  completeness: "Completeness",
};

function StatusBadge({ status }) {
  return <span className={`history-badge history-badge-${status || "unknown"}`}>{formatStatus(status)}</span>;
}

function RunSelector({ runs, selectedRunId, onSelect, onRunAgain, isRerunning }) {
  return (
    <section className="details-section" aria-labelledby="runs-heading">
      <div className="details-section-header">
        <h2 id="runs-heading" className="details-section-title">Runs</h2>
        <button
          type="button"
          className="history-btn-primary"
          onClick={onRunAgain}
          disabled={isRerunning}
          aria-busy={isRerunning}
        >
          {isRerunning ? "Running…" : "Run Again"}
        </button>
      </div>
      <div className="data-table-surface">
        <table className="data-table details-runs-table">
          <thead>
            <tr>
              <th scope="col">Run</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => {
              const isSelected = run.id === selectedRunId;
              return (
                <tr
                  key={run.id}
                  data-run-id={run.id}
                  className={isSelected ? "selected" : undefined}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => onSelect(run.id)}
                >
                  <th scope="row">
                    <span className="details-run-cell">
                      <button
                        type="button"
                        className="details-run-button"
                        aria-pressed={isSelected}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelect(run.id);
                        }}
                      >
                        Run #{run.number}
                      </button>
                      {isSelected && <span className="details-run-viewing">Viewing</span>}
                    </span>
                  </th>
                  <td data-label="Date">{formatDate(run.startedAt)}</td>
                  <td data-label="Status"><StatusBadge status={run.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RunStatusNotice({ run }) {
  if (run.status === "pending" || run.status === "running") {
    return <p className="history-notice">This run is still in progress. Results may be incomplete.</p>;
  }
  if (run.status === "failed") {
    return (
      <p className="history-notice history-notice-error">
        This run failed. Any answers that were saved are shown below.
      </p>
    );
  }
  return null;
}

function ModelResponses({ results }) {
  return (
    <section className="details-section" aria-labelledby="responses-heading">
      <h2 id="responses-heading" className="details-section-title">Model responses</h2>
      <div className="details-responses">
        {results.map((result) => (
          <article key={result.modelId} className="details-response history-surface">
            <header className="details-response-header">
              <div className="details-response-model">
                <strong>{result.modelName}</strong>
                {result.modelName !== result.modelId && <span className="history-muted">{result.modelId}</span>}
              </div>
              <div className="details-response-tags">
                {result.isWinner && <span className="history-winner-tag">Winner</span>}
                <StatusBadge status={result.status} />
              </div>
            </header>
            <div className="details-response-body">
              {result.status === "success" && result.answer != null ? (
                result.answer
              ) : (
                <p className="details-response-error">
                  {result.errorMessage || "This model did not return an answer."}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PerformanceTable({ results }) {
  return (
    <section className="details-section" aria-labelledby="performance-heading">
      <h2 id="performance-heading" className="details-section-title">Technical performance</h2>
      <div className="data-table-surface">
        <table className="data-table details-table">
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Latency</th>
              <th scope="col">Input tokens</th>
              <th scope="col">Output tokens</th>
              <th scope="col">Total tokens</th>
              <th scope="col">Cost</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const metrics = result.metrics;
              return (
                <tr key={result.modelId}>
                  <th scope="row">{result.modelName}</th>
                  <td data-label="Latency">{formatLatency(metrics?.latencyMs)}</td>
                  <td data-label="Input tokens">{formatInteger(metrics?.inputTokens)}</td>
                  <td data-label="Output tokens">{formatInteger(metrics?.outputTokens)}</td>
                  <td data-label="Total tokens">{formatInteger(metrics?.totalTokens)}</td>
                  <td data-label="Cost">{formatCost(metrics?.cost, metrics?.currency)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function evaluationMessage(run) {
  switch (run.evaluationStatus) {
    case "skipped":
      return "The judge did not evaluate this run because fewer than two models answered successfully.";
    case "failed":
      return "The judge could not evaluate the answers for this run.";
    case "pending":
      return run.status === "failed"
        ? "This run stopped before the judge could evaluate it."
        : "The evaluation has not finished yet.";
    default:
      return "No evaluation is available for this run.";
  }
}

function JudgeSection({ run }) {
  const isCompleted = run.evaluationStatus === "completed";
  const scored = run.results.filter((result) => result.scores.hasAnyScore);
  const hasFeedback = scored.some((result) => result.scores.strengths || result.scores.weaknesses);

  return (
    <section className="details-section" aria-labelledby="judge-heading">
      <h2 id="judge-heading" className="details-section-title">AI Judge</h2>

      {!isCompleted ? (
        <div className="history-notice history-notice-neutral">
          <p>{evaluationMessage(run)}</p>
          {run.evaluationError && <p className="details-error-detail">Details: {run.evaluationError}</p>}
        </div>
      ) : (
        <>
          <div className="details-verdict history-surface">
            <p className="details-eyebrow">Winner</p>
            <p className="details-verdict-winner">{run.winnerName || EMPTY}</p>
            <p className="details-verdict-reasoning">{run.judgeReasoning || "The judge gave no reasoning."}</p>
            {run.judgeModel && <p className="details-verdict-judge">Evaluated by {run.judgeModel}</p>}
          </div>

          {scored.length > 0 && (
            <div className="data-table-surface">
              <table className="data-table details-table">
                <thead>
                  <tr>
                    <th scope="col">Model</th>
                    {CRITERIA.map((name) => (
                      <th scope="col" key={name}>{CRITERION_LABELS[name]}</th>
                    ))}
                    <th scope="col">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {scored.map((result) => (
                    <tr key={result.modelId}>
                      <th scope="row">
                        <span className="details-score-model">
                          {result.modelName}
                          {result.isWinner && <span className="history-winner-tag">Winner</span>}
                        </span>
                      </th>
                      {CRITERIA.map((name) => (
                        <td key={name} data-label={CRITERION_LABELS[name]}>{formatScore(result.scores[name])}</td>
                      ))}
                      <td data-label="Overall">{formatScore(result.scores.overall)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="details-footnote">Scores are from 1 to 10.</p>

          {hasFeedback && (
            <div className="details-feedback">
              {scored.map((result) => (
                <div key={result.modelId} className="details-feedback-item history-surface">
                  <h3 className="details-feedback-model">{result.modelName}</h3>
                  <dl>
                    <dt>Strengths</dt>
                    <dd>{result.scores.strengths || EMPTY}</dd>
                    <dt>Weaknesses</dt>
                    <dd>{result.scores.weaknesses || EMPTY}</dd>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default function ExperimentDetails({ user, onLogout }) {
  const { experimentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSignedIn = Boolean(localStorage.getItem("accessToken"));

  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${experimentId}:${reloadKey}`;
  const [response, setResponse] = useState({ key: null, experiment: null, error: null });

  useEffect(() => {
    if (!isSignedIn) return undefined;

    const controller = new AbortController();

    getExperiment(experimentId, { signal: controller.signal })
      .then((data) => {
        if (!data || !Array.isArray(data.runs)) throw new Error("The experiment API returned an unexpected response.");
        setResponse({ key: requestKey, experiment: normalizeExperimentDetail(data), error: null });
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setResponse({ key: requestKey, experiment: null, error });
      });

    return () => controller.abort();
  }, [experimentId, requestKey, isSignedIn]);

  let status = "ready";
  if (response.key !== requestKey) status = "loading";
  else if (response.error) status = "error";
  const state = { ...response, status };

  const { experiment } = state;
  const requestedRunId = Number(searchParams.get("run"));
  const selectedRun =
    experiment?.runs.find((run) => run.id === requestedRunId) || experiment?.runs[0] || null;

  const selectRun = (runId) => {
    setSearchParams({ run: String(runId) }, { replace: true });
  };

  const [isRerunning, setIsRerunning] = useState(false);
  const [rerunMessage, setRerunMessage] = useState(null);

  const runAgain = async () => {
    if (isRerunning || !experiment) return;
    setIsRerunning(true);
    setRerunMessage(null);
    try {
      const result = await rerunExperiment(experiment.id);
      const results = Array.isArray(result?.results) ? result.results : [];
      const failed = results.filter((item) => item.status !== "success").length;

      const data = await getExperiment(experiment.id);
      setResponse({ key: requestKey, experiment: normalizeExperimentDetail(data), error: null });
      if (result?.run_id != null) setSearchParams({ run: String(result.run_id) }, { replace: true });

      if (results.length > 0 && failed === results.length) {
        setRerunMessage({ tone: "error", text: "The new run was saved, but no model returned an answer." });
      } else if (failed > 0) {
        setRerunMessage({
          tone: "warning",
          text: `The new run was saved. ${failed} of ${results.length} models failed${result.evaluation_error ? `; ${result.evaluation_error}` : "."}`,
        });
      } else if (!result?.evaluation && result?.evaluation_error) {
        setRerunMessage({ tone: "warning", text: `The new run was saved, but the judge did not evaluate it: ${result.evaluation_error}` });
      } else {
        setRerunMessage({ tone: "success", text: "The new run was saved and is shown below." });
      }
    } catch (error) {
      setRerunMessage({ tone: "error", text: describeActionError(error, "rerun") });
    } finally {
      setIsRerunning(false);
    }
  };

  function renderContent() {
    if (!isSignedIn) {
      return (
        <PageState title="Sign in to see this experiment" message="Saved experiments are linked to your account.">
          <Link to="/login" className="history-btn-primary">Sign in</Link>
        </PageState>
      );
    }

    if (state.status === "loading") {
      return <PageState title="Loading experiment…" />;
    }

    if (state.status === "error") {
      const { error } = state;
      if (error?.status === 401) {
        return (
          <PageState tone="error" title="Session expired" message={describeLoadError(error)}>
            <Link to="/login" className="history-btn-primary">Sign in again</Link>
          </PageState>
        );
      }
      if (error?.status === 404) {
        return (
          <PageState tone="error" title="Experiment not found" message={describeLoadError(error)}>
            <Link to="/experiments" className="history-btn">Back to History</Link>
          </PageState>
        );
      }
      return (
        <PageState tone="error" title="Could not load this experiment" message={describeLoadError(error)}>
          <button type="button" className="history-btn" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
        </PageState>
      );
    }

    return (
      <>
        {/* Experiment summary */}
        <header className="details-header history-surface">
          <div className="details-header-top">
            <p className="details-eyebrow">Experiment #{experiment.id}</p>
            <h1 className="details-title" title={experiment.prompt}>{experiment.title}</h1>
          </div>
          <dl className="details-meta">
            <div>
              <dt>Models</dt>
              <dd className="details-meta-models">
                {experiment.models.length === 0
                  ? EMPTY
                  : experiment.models.map((model, index) => (
                      <span key={model.id}>
                        {index > 0 && <span className="details-versus">vs</span>}
                        {model.name}
                      </span>
                    ))}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd><time dateTime={experiment.createdAt || undefined}>{formatDate(experiment.createdAt)}</time></dd>
            </div>
            <div>
              <dt>Runs</dt>
              <dd>{experiment.runs.length}</dd>
            </div>
          </dl>
          <div className="details-prompt">
            <span className="details-prompt-label">Prompt</span>
            <p>{experiment.prompt}</p>
          </div>
        </header>

        {experiment.runs.length === 0 ? (
          <PageState title="No runs yet" message="This experiment has no saved runs." />
        ) : (
          <>
            {/* Runs */}
            <RunSelector
              runs={experiment.runs}
              selectedRunId={selectedRun.id}
              onSelect={selectRun}
              onRunAgain={runAgain}
              isRerunning={isRerunning}
            />
            {isRerunning && (
              <p className="history-notice history-notice-neutral" role="status">
                Sending the prompt to both models and the judge again. This can take up to a minute or two.
              </p>
            )}
            {!isRerunning && rerunMessage && (
              <p
                className={`history-notice ${{ success: "history-notice-success", error: "history-notice-error" }[rerunMessage.tone] || ""}`}
                role={rerunMessage.tone === "error" ? "alert" : "status"}
              >
                {rerunMessage.text}
              </p>
            )}
            <RunStatusNotice run={selectedRun} />
            {selectedRun.results.length === 0 ? (
              <PageState title="No results" message="No model results were saved for this run." />
            ) : (
              <>
                {/* Run details */}
                <ModelResponses results={selectedRun.results} />
                <PerformanceTable results={selectedRun.results} />
                <JudgeSection run={selectedRun} />
              </>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <div className="history-page">
      <AppHeader user={user} onLogout={onLogout} />
      <main className="history-main">
        <nav aria-label="Breadcrumb">
          <Link to="/experiments" className="history-link details-back">← Back to History</Link>
        </nav>
        {renderContent()}
      </main>
    </div>
  );
}

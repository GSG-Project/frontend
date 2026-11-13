export const CRITERIA = ["accuracy", "relevance", "clarity", "completeness"];

const TITLE_MAX_LENGTH = 70;

const nullIfBlank = (value) => (typeof value === "string" && value.trim() === "" ? null : value ?? null);

export function titleFromPrompt(prompt) {
  const firstLine = (prompt || "").trim().split("\n")[0].replace(/\s+/g, " ");
  if (!firstLine) return "Untitled experiment";
  return firstLine.length > TITLE_MAX_LENGTH ? `${firstLine.slice(0, TITLE_MAX_LENGTH).trimEnd()}…` : firstLine;
}

function normalizeModels(models) {
  return (models || []).map((model) => ({ id: model.id, name: model.name || model.id }));
}

export function normalizeExperimentSummary(item) {
  return {
    id: item.id,
    prompt: item.prompt || "",
    title: titleFromPrompt(item.prompt),
    createdAt: item.created_at ?? null,
    models: normalizeModels(item.models),
    runCount: item.run_count ?? null,
    latestRun: item.latest_run
      ? {
          id: item.latest_run.id,
          status: item.latest_run.status ?? null,
          evaluationStatus: item.latest_run.evaluation_status ?? null,
          winnerModelId: item.latest_run.winner_model_id ?? null,
          startedAt: item.latest_run.started_at ?? null,
        }
      : null,
  };
}

function normalizeMetrics(metadata) {
  if (!metadata) return null;
  return {
    latencyMs: metadata.latency_ms ?? null,
    inputTokens: metadata.input_tokens ?? null,
    outputTokens: metadata.output_tokens ?? null,
    totalTokens: metadata.total_tokens ?? null,
    cost: metadata.cost ?? null,
    currency: metadata.cost_currency ?? null,
  };
}

function normalizeHistoryScores(result, judged) {
  const byCriterion = Object.fromEntries((result.scores || []).map((item) => [item.criterion, item.score]));
  const criteria = Object.fromEntries(
    CRITERIA.map((name) => [name, judged?.[name] ?? byCriterion[name] ?? null]),
  );
  const hasAnyScore = CRITERIA.some((name) => criteria[name] != null);

  return {
    ...criteria,
    overall: judged?.overall_score ?? null,
    strengths: nullIfBlank(judged?.strengths),
    weaknesses: nullIfBlank(judged?.weaknesses),
    label: judged?.label ?? null,
    hasAnyScore,
  };
}

function normalizeHistoryResult(result, modelNames, winnerModelId, judgedByModel) {
  return {
    modelId: result.model_id,
    modelName: modelNames[result.model_id] || result.model_id,
    status: result.status ?? null,
    answer: result.answer ?? null,
    errorMessage: result.error ? nullIfBlank(result.error.message) : null,
    metrics: normalizeMetrics(result.metadata),
    scores: normalizeHistoryScores(result, judgedByModel[result.model_id]),
    isWinner: winnerModelId != null && result.model_id === winnerModelId,
  };
}

export function normalizeExperimentDetail(data) {
  const models = normalizeModels(data.models);
  const modelNames = Object.fromEntries(models.map((model) => [model.id, model.name]));
  const runs = data.runs || [];

  return {
    id: data.id,
    prompt: data.prompt || "",
    title: titleFromPrompt(data.prompt),
    createdAt: data.created_at ?? null,
    models,
    runs: runs.map((run, index) => {
      const evaluation = run.evaluation || null;
      const winnerModelId = run.winner_model_id ?? evaluation?.winner_model_id ?? null;
      const judgedByModel = Object.fromEntries((evaluation?.evaluations || []).map((item) => [item.model_id, item]));
      return {
        id: run.id,
        number: runs.length - index,
        status: run.status ?? null,
        evaluationStatus: run.evaluation_status ?? null,
        startedAt: run.started_at ?? null,
        completedAt: run.completed_at ?? null,
        winnerModelId,
        winnerName: winnerModelId ? modelNames[winnerModelId] || winnerModelId : null,
        judgeReasoning: nullIfBlank(evaluation?.reasoning) ?? nullIfBlank(run.judge_reasoning),
        judgeModel: evaluation?.judge_model ?? null,
        winnerLabel: evaluation?.winner ?? null,
        evaluationError: nullIfBlank(run.evaluation_error),
        results: (run.results || []).map((result) => normalizeHistoryResult(result, modelNames, winnerModelId, judgedByModel)),
      };
    }),
  };
}

export const GENERIC_MODEL_ERROR = "This model could not generate a response.";

function evaluationNote(run) {
  switch (run.evaluation_status) {
    case "skipped":
      return "At least two successful model responses are required for evaluation.";
    case "failed":
      return "The Judge could not evaluate the answers.";
    case "pending":
      return run.status === "failed"
        ? "This run stopped before the judge could evaluate it."
        : "The evaluation has not finished yet.";
    default:
      return null;
  }
}

export function comparisonFromRun(detail, runId) {
  const runs = detail?.runs || [];
  const run = runs.find((item) => String(item.id) === String(runId)) || runs[0];
  if (!run) return null;
  return {
    experiment_id: detail.id,
    run_id: run.id,
    prompt: detail.prompt || "",
    results: (run.results || []).map((result) => ({
      model_id: result.model_id,
      answer: result.answer ?? null,
      metadata: result.metadata ?? null,
      status: result.status,
      error: result.status === "success" ? null : { code: result.error?.code || "provider_error", message: GENERIC_MODEL_ERROR },
    })),
    evaluation: run.evaluation || null,
    evaluation_error: run.evaluation ? null : evaluationNote(run),
  };
}

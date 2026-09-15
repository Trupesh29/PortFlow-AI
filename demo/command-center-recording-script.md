# The Watson Four — PortFlow AI Command Center recording

Deck: ../presentation/PortFlow_AI_Command_Center.pptx (the supplied 10-slide presentation).
Target: 4–5 minutes. Friend explains the PPT first; you operate and narrate the live demo.

## Understand the project first

PortFlow helps a container-terminal shift supervisor identify upcoming resource pressure and estimate vessel waiting time. A berth is where a vessel docks; cranes handle containers. Congestion can develop when arriving workload exceeds berth and crane capacity.

The working app provides a 72-hour deterministic baseline dashboard, five reproducible synthetic scenarios, API-backed schedules/resources, and trained Gradient Boosting waiting-time and congestion predictions. The separate Congestion & Wait page performs actual model inference.

Slides 7–10 include proposed architecture: runtime OR-Tools scheduling, alternate routing, and live Bob MCP are not implemented. The 14-hour saving is an illustration, not a measured result. The operations-plan and Copilot interfaces are static demonstrations. No equipment is dispatched and approvals are not production-persisted. The team reports Bob development use; exact tasks and genuine evidence are still needed.

The supplied Command Center deck is retained unchanged as a presentation reference. presentation/slides.pptx remains the corrected submission deck. Do not present the reference deck's roadmap diagrams as implemented behavior.

## Friend — PPT — approximately 2 minutes

### Slide 1 — Introduction

> Hello everyone. We are The Watson Four from DEPSTAR, CHARUSAT. Our project is PortFlow AI—a container congestion forecasting and port operations planning prototype.

### Slide 2 — Problem

> Port congestion affects more than one vessel. Delays can spread across berths, cranes, container yards, and truck operations. Supervisors need to understand how vessel arrivals and resource capacity interact before a bottleneck develops.

### Slide 3 — Existing approach

> Operational data may already exist, but it is often reviewed separately. Our goal is to bring this information into one workspace so supervisors can identify upcoming pressure and make better informed decisions.

### Slide 4 — Solution

> PortFlow combines operational visibility, scenario simulation, and trained predictions. This slide illustrates the intended command center. The actual working interface will be shown in the live demo shortly.

### Slide 5 — Workflow

> Our workflow starts with operational inputs, prepares model features, and produces predictions. The current prototype uses reproducible synthetic schedules. Generating optimized operational recommendations is a planned extension.

### Slide 6 — Forecasting

> The working application provides a 72-hour baseline congestion view and separate machine-learning predictions. The chart here illustrates the forecasting concept; our live demo will generate actual outputs.

### Slide 7 — Optimization

> This slide shows our proposed optimization stage. We plan to use OR-Tools CP-SAT to calculate berth-and-crane assignments and evaluate alternate routing. The displayed savings are illustrative; the runtime optimizer is not implemented yet.

### Slide 8 — Human approval

> The supervisor remains responsible for reviewing a proposal. Our interface demonstrates explicit approval and rejection, but currently changes local demo state rather than executing operational instructions.

### Slide 9 — Architecture

> Our implemented stack uses React, TypeScript, FastAPI, and scikit-learn Gradient Boosting models. PostgreSQL is optional for the local demo. The solver and live Bob MCP connection shown here are roadmap components.

### Slide 10 — IBM Bob and trust

> We used IBM Bob during development. Our intended architecture separates numerical calculations from language explanations, while keeping decisions with the supervisor. Live MCP explanations remain future work.
>
> My teammate will now demonstrate the working forecasting journey.

## You — live demo — approximately 2–2½ minutes

### Startup and connection

Show the backend's startup message and Vite local URL, then open http://localhost:5173. Avoid showing real environment credentials.

> Here are our running backend and frontend servers. I’m opening PortFlow locally, and the API indicator confirms that the interface is connected.

### Dashboard

Point to the KPI cards, timeline, and berth/crane resource panel.

> This dashboard shows upcoming vessels, berth occupancy, available cranes, peak congestion risk, and estimated baseline waiting time.
>
> The timeline covers 72 hours in six-hour windows. This dashboard uses a deterministic rule calculation based on arrivals, workload, resource capacity, and berth compatibility.

### Scenario changes

Click Arrival Surge, wait for the updated result, then click Crane Outage and point to resource availability.

> I’m selecting Arrival Surge. The backend recalculates the view using clustered vessel arrivals. The forecast highlights increased pressure, and the explanation identifies its contributing operational conditions.
>
> Next, Crane Outage reduces handling capacity. The resource panel reflects the unavailable cranes, allowing us to compare this disruption with normal operations.

### Waiting-time inference

Open Congestion & Wait, select a vessel schedule, and click Predict Waiting Time. Wait for the output and point at the hours, model version, and factors.

> Now I’m requesting a waiting-time prediction for this vessel. The backend prepares its features and calls our trained regression model.
>
> The result shows the estimated waiting time, model version, and contributing factors. This is actual inference output from a trained model, using synthetic inputs.

### Congestion inference

Select 12h and click Predict Congestion. Wait for the time-slot results.

> Our classification model also predicts congestion probability across this time window. Each slot displays its probability and risk category.
>
> We use a Gradient Boosting Regressor for waiting time and a Gradient Boosting Classifier for congestion. These results demonstrate the complete input-to-model-to-output pipeline.

### Optional plan preview

Open 72h Operations Plan, click Approve Plan, and Confirm Approval. Skip this preview if the recording is close to five minutes.

> This page previews supervisor plan review. Approval requires explicit confirmation.
>
> The plan is static demonstration content, and confirmation only updates the local interface. It does not dispatch equipment or save a production plan.

### Closing

Return to the Dashboard.

> Our working prototype demonstrates operational visibility, disruption scenarios, and trained predictions. The next steps are runtime optimization, live Bob explanations, and validation using real port data. Thank you.

## Recording checklist

- Rehearse once and keep the combined video between 3 and 5 minutes.
- Pause after each click until actual results appear; read changing figures from the screen.
- Do not claim the illustrated 14-hour savings, live routing, solver, or MCP connection as implemented.
- Describe actual Bob development tasks only when confirmed, and supply genuine evidence.
- Upload with public/view-only access; replace demo/demo-video-link.txt with the real video URL.

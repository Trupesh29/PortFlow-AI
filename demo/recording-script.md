# PortFlow AI — two-person submission video

Target: 4 minutes 20 seconds, leaving room for loading pauses within the guide's 3–5 minute limit.
Friend presents the PPT; you operate and narrate the live app. Read the quoted paragraphs aloud. Stage directions are not narration.

## 0:00–0:15 — Friend — Slide 1: introduction

> Hello everyone. We are The Watson Four, and our project is PortFlow AI. It helps container-terminal shift supervisors identify congestion pressure early and estimate vessel waiting times before making operational decisions.

## 0:15–0:35 — Friend — Slide 2: problem

> Port planning involves vessel arrival schedules, berth restrictions, and crane availability. When these are reviewed separately, it is difficult to see how they interact. A cluster of arrivals or an equipment outage can create a bottleneck, leaving supervisors with limited time to respond.

## 0:35–0:55 — Friend — Slides 3–4: solution

> We built a workspace with a 72-hour congestion dashboard, five operational scenarios, and trained machine-learning predictions. The working prototype focuses on visibility and forecasting. Our optimizer, operations-plan, and Copilot pages demonstrate the intended workflow, but their results are currently static demo data.

## 0:55–1:15 — Friend — Slides 5–6: proposed journey, architecture, and handover

Identify slide 4's screenshot as illustrative. Slide 5 is the proposed full journey; only seeded inputs, validation, and trained predictions are implemented. Slide 6 distinguishes working models from planned solver/MCP integration. Advance briefly so the live demo gets most of the video.

> The frontend uses React and TypeScript, and the backend uses FastAPI. Reproducible synthetic inputs feed the baseline calculation and our trained Gradient Boosting models. PostgreSQL is optional for this local demonstration. My teammate will now show the working application and generate actual prediction results.

## 1:15–1:30 — You — show startup, then Dashboard

Show the backend terminal's “Application startup complete” line and the Vite local URL, then open http://localhost:5173. If recording a fresh start, use the commands in docs/setup-guide.md. Avoid exposing real environment credentials.

> Here are our running backend and frontend servers. I’m opening PortFlow locally. The API status confirms that the interface is connected to the backend, and the dashboard loads the synthetic terminal data.

## 1:30–1:55 — You — Dashboard overview

Point at KPI cards, chart, and resources. Briefly scroll to the vessel table.

> This dashboard summarizes upcoming vessels, berth occupancy, available cranes, congestion risk, and estimated baseline waiting time. The timeline divides the next 72 hours into six-hour windows. We can also inspect vessel dimensions and berth compatibility. This view uses a transparent rule baseline; the trained-model predictions are on a separate page.

## 1:55–2:25 — You — scenario simulation

Click Arrival Surge. Wait for the chart to update. Point to the first window and rule drivers. Click Crane Outage and point to crane availability. Restore Baseline Operations before leaving.

> I’m selecting Arrival Surge. The backend recalculates the view using clustered vessel arrivals. The chart and its drivers show the pressure from arrivals, berth restrictions, and container workload. Next, Crane Outage reduces handling capacity, and the resource panel reflects the unavailable cranes. These scenario changes are calculated from synthetic inputs rather than a prerecorded chart.

## 2:25–2:55 — You — vessel waiting-time prediction

Open Congestion & Wait. Select a schedule; click Predict Waiting Time. Wait for the result. Point at the hours, model version, and contributing factors. Read the displayed number only if desired.

> Now I’m selecting a vessel schedule and clicking Predict Waiting Time. This request goes to the backend, which loads the trained regression model and runs inference. The result shows the estimated waiting time, the model version, and contributing factors. This is actual model output, although the inputs and training data are synthetic.

## 2:55–3:20 — You — congestion prediction

Select 12h for a compact result, then click Predict Congestion. Wait for the output and point to the time slots.

> I’m also requesting a congestion forecast for this time window. Our classification model returns a probability and risk category for each slot. We use a Gradient Boosting Regressor for waiting time and a Gradient Boosting Classifier for congestion. These results demonstrate the complete input-to-model-to-output pipeline, and still need validation on real port data.

## 3:20–3:35 — You — planning preview and handover

Open 72h Operations Plan. Click Approve Plan, then Confirm Approval. Do not imply a live optimizer generated this plan.

> Finally, this static plan demonstrates supervisor review and explicit approval. Confirmation updates the local demo state; it does not dispatch equipment or save a production plan. I’ll hand back to my teammate for integration status and next steps.

## 3:35–3:55 — Friend — Slide 7: IBM technology and human control

Default wording, reflecting the currently verified repository:

> We used IBM Bob during project development. Our live Bob MCP connection is a planned extension. The Copilot page currently demonstrates the intended question-and-explanation interface with predefined responses. The working prediction journey you saw runs through our FastAPI backend and trained models.

The team reports Bob development use, but exact tasks and evidence have not been supplied. Before recording, strengthen this paragraph and slide with your true task, method, and outcome, and show the matching genuine export/usage screenshot. Do not describe planned integration as implemented or work from another assistant as Bob work.

## 3:55–4:20 — Friend — Slides 9–11: architecture, impact, and conclusion

Slide 8 is an optional static planning illustration; skip it in the short recording. Briefly show slide 9's architecture, slide 10's potential impact, and slide 11's actual links and pending items. The supplied deck's artwork is retained; corrected text separates prototype behavior from roadmap claims.

> PortFlow aims to help supervisors spot future bottlenecks and compare operational conditions before deciding on a plan. Our next steps are a runtime berth-and-crane solver, live Bob explanations, and validation with real operational data. We are not claiming measured port savings from this synthetic prototype. Thank you for watching our demonstration.

## Before recording and uploading

- Rehearse once; leave pauses after clicking so actual results are visible.
- Prioritize scenario simulation and trained predictions. They are the working end-to-end feature.
- Do not claim live AIS, a working solver, automatic routing, persistent approvals, or a live LLM.
- Show real Bob evidence only if available. This is worth 10 points in the guide's rubric.
- Upload to YouTube unlisted, Loom, Box, or view-only Google Drive; check access without signing in.
- Put the real URL on the first line of demo/demo-video-link.txt. Keep the official validator unchanged.

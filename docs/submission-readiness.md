# Bobathon submission audit — 15 September 2026

Checked against F:/Project/Bobathon_Submission_Template_Guide.pdf. The document defines the submission expectations; local changes were made at the user's request. No submission form was sent and no repository was renamed.

| Guide requirement | Local status | Evidence / remaining action |
|---|---|---|
| Required root structure | Present | README, submission.yaml, CONTRIBUTING, .gitignore, unchanged .github/workflows/validate.yml |
| Source under src/ | Present | Backend, frontend, database, data, ML, tests, artifact tooling |
| src/README and dotenv example | Present | src/.env.example is a usable dotenv template; descriptions in docs/environment-variables.md |
| Four required docs | Present and aligned | Problem, solution, architecture diagram/table, setup instructions |
| Accurate implemented features | Aligned | Runtime forecasts separated from static planning/Copilot demos |
| Team metadata | Incomplete | Deep Makwana is lead; Manav Kansagara, Smit Kansagara, Trupesh Hingrajiya are members; Deep's email required |
| At least three running-app screenshots | Present | 01-home-dashboard.png, 02-arrival-surge.png, 03-ml-prediction-output.png |
| Named presentation deck | Present | presentation/slides.pptx; supplied 11-slide design retained, corrected text, matching narration |
| 3–5 minute running-app video | Pending | Record using demo/recording-script.md, upload, replace placeholder URL |
| Live-demo URL or NOT DEPLOYED | Present | demo/live-demo-url.txt contains NOT DEPLOYED; deployment is optional |
| Public repository, not a fork | Verified on GitHub | https://github.com/Trupesh29/PortFlow-AI is public and not a fork |
| Template creation and repository naming | Needs action/confirmation | Current name differs from bob-ai-hackathon-[team-name]; not-a-fork does not prove template creation |
| No committed env/dependency/build folders | Checked | Tracked path scan found no real .env, node_modules, .venv, dist, or __pycache__ paths |
| Green official validation | Pending | Latest inspected run failed; video placeholder remains, and newly corrected lead email is blank |
| Genuine IBM Bob integration/evidence | Pending | Team reports Bob use; exact tasks and real exports/usage screenshots needed; MCP not implemented |
| Setup tested by teammate on clean terminal | Pending teammate verification | Build/tests and running local model journey verified; no fresh-machine claim |
| Entry form and deadline | User action | Submit correct public repo URL before organiser's deadline |

## Finish in this order

1. Confirm Deep's email and other registration details in submission.yaml.
2. Provide actual IBM Bob tasks and genuine exports/usage screenshots; update slide 6 and its narration to those facts.
3. Review the edited copy of your supplied deck at presentation/slides.pptx. Original F:/Project/PortFlow_AI_Predictive_Port_Operations.pptx is untouched; placeholder names/links and unsupported claims are corrected in the repository copy.
4. Record a 3–5 minute combined PPT and live-demo video; show startup and actual prediction output. Upload with public/view-only access and put the real link first in demo/demo-video-link.txt.
5. Confirm required repo naming/template provenance, commit reviewed submission artifacts, push, and verify the unchanged validator is green.
6. Have a teammate follow setup-guide.md in a fresh terminal and check public artifact links without signing in. Submit through the entry form yourself.

## Recording division (proposed, not a historical contribution claim)

Friend: problem, solution, architecture, verified IBM use, impact. You: startup, dashboard, scenario changes, runtime ML predictions, optional static plan review. See demo/recording-script.md for exact timings and words.

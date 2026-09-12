# Problem Statement

## Selected Industry Challenge

**L1 - Container Congestion Predictor & Port Operations Optimiser**

## Who Experiences the Problem

The primary user is a container-terminal shift supervisor responsible for coordinating vessel arrivals, berth occupancy, crane allocation, and handover plans during an 8-12 hour shift.

## Current Pain

Operational information is frequently split across schedules, spreadsheets, and verbal handovers. A supervisor can see individual arrivals and resource availability, but cannot easily evaluate how clustered arrivals, vessel dimensions, berth constraints, and crane productivity interact over the next 72 hours.

This creates four practical failures:

1. Congestion is identified after a queue forms instead of before it forms.
2. Berth and crane decisions are optimised separately or by intuition.
3. A locally convenient assignment may increase total waiting time for the terminal.
4. Shift plans become stale and are difficult for the next supervisor to audit.

## Why Existing Approaches Are Insufficient

A spreadsheet can record a plan, but it does not learn congestion patterns or search thousands of feasible resource combinations. A prediction-only dashboard is also incomplete: it may warn that congestion is likely without recommending a physically feasible response. PortFlow AI therefore treats forecasting and operational optimisation as one decision-support loop.

## Scope and Data Ethics

The hackathon proof of concept uses seeded synthetic schedules and historical operations. It does not use client data, personal information, confidential port records, social-media data, or a live AIS feed. Synthetic records are labelled and generated reproducibly so the demo can be audited.

## Success Definition

The proof of concept succeeds when a supervisor can load a realistic scenario, identify a future congestion window, understand its causes, run a feasible berth-and-crane optimisation, compare the result with the baseline, and approve a 72-hour operations plan from the application.

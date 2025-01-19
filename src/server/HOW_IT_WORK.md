# **How Workflows are Managed**

## **Overview**

This document explains how workflows are handled in the system, detailing the key steps and functions involved in executing actions and reactions.

---

## **Workflow Execution Process**

### 1. **startAutoFetchAndCheck**
- This function is responsible for initiating the periodic workflow checks.
- Runs every **10 seconds** to call the `fetchAndCheckWorkflows` function.

---

### 2. **fetchAndCheckWorkflows**
- Fetches all active workflows from the database.
- Prepares the required parameters for each workflow action.
- Calls `checkAction` for each workflow to evaluate its conditions.

---

### 3. **checkAction**
- Retrieves detailed information about a specific workflow.
- Executes the `check` function defined in the **Action** of the workflow:
   - Verifies if the action's conditions are met.
   - Ensures the workflow logic is evaluated correctly.
- Records the execution result in the workflow's **history**.

---

### 4. **executeDependentNodes**
- Triggered when an **Action** is successfully completed.
- Executes the `execute` function of the related **Reaction** nodes.
- Handles dependent nodes recursively, ensuring the entire workflow is processed step by step.

---

## **Summary**

- Workflows are evaluated and executed through a systematic process that begins with periodic checks (`startAutoFetchAndCheck`).
- Active workflows are fetched, their conditions are checked, and actions are executed if conditions are met.
- Reactions are triggered recursively for dependent nodes, enabling complex workflows to be managed efficiently.

By following this structure, the system ensures reliable and consistent execution of workflows.

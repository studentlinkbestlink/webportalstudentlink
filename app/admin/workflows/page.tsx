"use client"

import { WorkflowManagement } from "@/components/admin/workflows/workflow-management"

export default function AdminWorkflowsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1E2A78]">Workflow Automation</h1>
        <p className="text-gray-600">Automate concern routing and escalation.</p>
      </div>
      <WorkflowManagement />
    </>
  )
}

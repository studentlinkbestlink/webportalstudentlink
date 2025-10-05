import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Play, Pause, Settings } from "lucide-react"
import { CreateEditWorkflowDialog } from "./create-edit-workflow-dialog"
import { DeleteWorkflowDialog } from "./delete-workflow-dialog"
import { apiClient } from "@/lib/api-client"

interface Workflow {
  id: string
  name: string
  description?: string
  trigger: { type: string; value: string }
  action: { type: string; value: string }
  is_active: boolean
  priority: number
  created_at: string
  last_triggered?: string
  trigger_count: number
}

// Mock data for initial implementation
const mockWorkflows: Workflow[] = [
  {
    id: "1",
    name: "Route to Cashier",
    description: "Automatically route concerns about tuition and payments to the Cashier's Office",
    trigger: { type: "keyword", value: "tuition,payment,fee,financial" },
    action: { type: "assign-department", value: "CASHIER" },
    is_active: true,
    priority: 1,
    created_at: "2024-01-15T10:00:00Z",
    last_triggered: "2024-01-20T14:30:00Z",
    trigger_count: 15
  },
  {
    id: "2",
    name: "Escalate Unanswered Concerns",
    description: "Escalate concerns that haven't been answered within 48 hours",
    trigger: { type: "time-unanswered", value: "48h" },
    action: { type: "escalate-to-head", value: null },
    is_active: true,
    priority: 2,
    created_at: "2024-01-10T09:00:00Z",
    last_triggered: "2024-01-19T16:45:00Z",
    trigger_count: 8
  },
  {
    id: "3",
    name: "Route Academic Concerns",
    description: "Route academic-related concerns to appropriate departments",
    trigger: { type: "keyword", value: "grade,exam,academic,curriculum" },
    action: { type: "assign-department", value: "REGISTRAR" },
    is_active: false,
    priority: 3,
    created_at: "2024-01-12T11:30:00Z",
    last_triggered: "2024-01-18T10:15:00Z",
    trigger_count: 23
  }
]

export function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)

  // Fetch workflows on component mount
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true)
        // For now, use mock data. In real implementation, this would be:
        // const workflows = await apiClient.getWorkflows()
        setWorkflows(mockWorkflows)
      } catch (error) {
        console.error('Failed to fetch workflows:', error)
        setWorkflows(mockWorkflows) // Fallback to mock data
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  const handleCreateWorkflow = async (workflow: Omit<Workflow, 'id' | 'created_at' | 'trigger_count'>) => {
    try {
      // In real implementation, this would be:
      // const newWorkflow = await apiClient.createWorkflow(workflow)
      const newWorkflow: Workflow = {
        ...workflow,
        id: `${Date.now()}`,
        created_at: new Date().toISOString(),
        trigger_count: 0
      }
      setWorkflows([...workflows, newWorkflow])
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  const handleUpdateWorkflow = async (updatedWorkflow: Workflow) => {
    try {
      // In real implementation, this would be:
      // const workflow = await apiClient.updateWorkflow(updatedWorkflow.id, updatedWorkflow)
      setWorkflows(
        workflows.map((workflow) => (workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow))
      )
    } catch (error) {
      console.error('Failed to update workflow:', error)
    }
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      // In real implementation, this would be:
      // await apiClient.deleteWorkflow(workflowId)
      setWorkflows(workflows.filter((workflow) => workflow.id !== workflowId))
    } catch (error) {
      console.error('Failed to delete workflow:', error)
    }
  }

  const handleToggleWorkflow = async (workflowId: string, isActive: boolean) => {
    try {
      // In real implementation, this would be:
      // await apiClient.toggleWorkflow(workflowId, isActive)
      setWorkflows(workflows.map(workflow => 
        workflow.id === workflowId ? { ...workflow, is_active: isActive } : workflow
      ))
    } catch (error) {
      console.error('Failed to toggle workflow:', error)
    }
  }

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case 'keyword': return 'Keyword Match'
      case 'time-unanswered': return 'Time Unanswered'
      case 'department': return 'Department'
      case 'priority': return 'Priority Level'
      default: return type
    }
  }

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'assign-department': return 'Assign to Department'
      case 'escalate-to-head': return 'Escalate to Head'
      case 'send-notification': return 'Send Notification'
      case 'auto-respond': return 'Auto Respond'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border p-4 rounded-md">
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-[#1E2A78]">{workflows.length}</div>
            <p className="text-sm text-muted-foreground">Total Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {workflows.filter(w => w.is_active).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {workflows.reduce((sum, w) => sum + w.trigger_count, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Triggers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {workflows.filter(w => !w.is_active).length}
            </div>
            <p className="text-sm text-muted-foreground">Inactive Rules</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-[#1E2A78]">Automation Rules</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Configure automatic routing and escalation rules for concerns
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#1E2A78] hover:bg-[#2480EA]">
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules yet</h3>
              <p className="text-gray-500 mb-4">Create your first rule to automate concern routing and escalation.</p>
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-[#1E2A78] hover:bg-[#2480EA]">
                <Plus className="h-4 w-4 mr-2" />
                Create First Rule
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-[#1E2A78]">{workflow.name}</h3>
                        <Badge variant={workflow.is_active ? "default" : "secondary"}>
                          {workflow.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">Priority {workflow.priority}</Badge>
                      </div>
                      
                      {workflow.description && (
                        <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Trigger:</span> {getTriggerTypeLabel(workflow.trigger.type)}
                          <br />
                          <span className="text-muted-foreground">Value: {workflow.trigger.value}</span>
                        </div>
                        <div>
                          <span className="font-medium">Action:</span> {getActionTypeLabel(workflow.action.type)}
                          <br />
                          <span className="text-muted-foreground">
                            {workflow.action.value ? `Value: ${workflow.action.value}` : 'No additional value'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span>Triggered {workflow.trigger_count} times</span>
                        {workflow.last_triggered && (
                          <span>Last triggered: {new Date(workflow.last_triggered).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(workflow.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={workflow.is_active}
                        onCheckedChange={(checked) => handleToggleWorkflow(workflow.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow)
                          setEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedWorkflow(workflow)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateEditWorkflowDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleCreateWorkflow}
      />

      {selectedWorkflow && (
        <CreateEditWorkflowDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setEditDialogOpen(false)
            setSelectedWorkflow(null)
          }}
          onSave={handleUpdateWorkflow}
          workflow={selectedWorkflow}
        />
      )}

      {selectedWorkflow && (
        <DeleteWorkflowDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false)
            setSelectedWorkflow(null)
          }}
          onDelete={() => {
            handleDeleteWorkflow(selectedWorkflow.id)
            setDeleteDialogOpen(false)
            setSelectedWorkflow(null)
          }}
          workflowName={selectedWorkflow.name}
        />
      )}
    </div>
  )
}

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface Workflow {
  id?: string
  name: string
  description?: string
  trigger: { type: string; value: string }
  action: { type: string; value: string }
  is_active: boolean
  priority: number
}

interface CreateEditWorkflowDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (workflow: Omit<Workflow, 'id'>) => void
  workflow?: Workflow
}

export function CreateEditWorkflowDialog({ isOpen, onClose, onSave, workflow }: CreateEditWorkflowDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [triggerType, setTriggerType] = useState("keyword")
  const [triggerValue, setTriggerValue] = useState("")
  const [actionType, setActionType] = useState("assign-department")
  const [actionValue, setActionValue] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [priority, setPriority] = useState(1)

  useEffect(() => {
    if (workflow) {
      setName(workflow.name)
      setDescription(workflow.description || "")
      setTriggerType(workflow.trigger.type)
      setTriggerValue(workflow.trigger.value)
      setActionType(workflow.action.type)
      setActionValue(workflow.action.value)
      setIsActive(workflow.is_active)
      setPriority(workflow.priority)
    } else {
      setName("")
      setDescription("")
      setTriggerType("keyword")
      setTriggerValue("")
      setActionType("assign-department")
      setActionValue("")
      setIsActive(true)
      setPriority(1)
    }
  }, [workflow, isOpen])

  const handleSave = () => {
    onSave({
      name,
      description,
      trigger: { type: triggerType, value: triggerValue },
      action: { type: actionType, value: actionValue },
      is_active: isActive,
      priority,
    })
    onClose()
  }

  const getTriggerPlaceholder = (type: string) => {
    switch (type) {
      case 'keyword': return 'e.g., tuition,payment,fee,financial'
      case 'time-unanswered': return 'e.g., 24h, 48h, 72h'
      case 'department': return 'e.g., CASHIER, REGISTRAR, LIBRARY'
      case 'priority': return 'e.g., high, urgent'
      default: return 'Enter trigger value'
    }
  }

  const getActionPlaceholder = (type: string) => {
    switch (type) {
      case 'assign-department': return 'e.g., CASHIER, REGISTRAR, LIBRARY'
      case 'escalate-to-head': return 'Leave empty for automatic escalation'
      case 'send-notification': return 'e.g., admin@bcp.edu.ph'
      case 'auto-respond': return 'e.g., Thank you for your concern...'
      default: return 'Enter action value'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{workflow ? "Edit Automation Rule" : "Create Automation Rule"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="e.g., Route to Cashier"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this rule does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Highest</SelectItem>
                  <SelectItem value="2">2 - High</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - Low</SelectItem>
                  <SelectItem value="5">5 - Lowest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="active">Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active">{isActive ? "Active" : "Inactive"}</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Trigger Conditions</Label>
              <p className="text-sm text-muted-foreground mb-3">Define when this rule should be triggered</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trigger-type">Trigger Type</Label>
                  <Select value={triggerType} onValueChange={setTriggerType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">Keyword Match</SelectItem>
                      <SelectItem value="time-unanswered">Time Unanswered</SelectItem>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="priority">Priority Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trigger-value">Trigger Value</Label>
                  <Input
                    id="trigger-value"
                    placeholder={getTriggerPlaceholder(triggerType)}
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Action to Take</Label>
              <p className="text-sm text-muted-foreground mb-3">Define what happens when the trigger conditions are met</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select value={actionType} onValueChange={setActionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign-department">Assign to Department</SelectItem>
                      <SelectItem value="escalate-to-head">Escalate to Head</SelectItem>
                      <SelectItem value="send-notification">Send Notification</SelectItem>
                      <SelectItem value="auto-respond">Auto Respond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action-value">Action Value</Label>
                  <Input
                    id="action-value"
                    placeholder={getActionPlaceholder(actionType)}
                    value={actionValue}
                    onChange={(e) => setActionValue(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#1E2A78] hover:bg-[#2480EA]">
            {workflow ? "Update Rule" : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

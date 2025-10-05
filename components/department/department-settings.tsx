"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, RefreshCw, Building, Users, Mail, Phone } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface DepartmentSettingsProps {
  department: {
    name: string
    code: string
    type: string
    headName: string
    email: string
    phone: string
    description: string
  }
  onUpdate?: () => void
}

interface DepartmentSettings {
  name: string
  code: string
  description: string
  contact_info: {
    email: string
    phone: string
    office_hours: string
    location: string
  }
  preferences: {
    auto_assign_concerns: boolean
    email_notifications: boolean
    response_time_limit: number
    allow_anonymous: boolean
  }
}

export function DepartmentSettings({ department, onUpdate }: DepartmentSettingsProps) {
  const [settings, setSettings] = useState<DepartmentSettings>({
    name: department.name,
    code: department.code,
    description: department.description,
    contact_info: {
      email: department.email,
      phone: department.phone,
      office_hours: "8:00 AM - 5:00 PM",
      location: "Main Building, 2nd Floor"
    },
    preferences: {
      auto_assign_concerns: true,
      email_notifications: true,
      response_time_limit: 24,
      allow_anonymous: true
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // TODO: Implement API call to update department settings
      // await apiClient.updateDepartmentSettings(department.code, settings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess("Settings saved successfully!")
      onUpdate?.()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to save settings. Please try again.")
      console.error('Failed to save department settings:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      name: department.name,
      code: department.code,
      description: department.description,
      contact_info: {
        email: department.email,
        phone: department.phone,
        office_hours: "8:00 AM - 5:00 PM",
        location: "Main Building, 2nd Floor"
      },
      preferences: {
        auto_assign_concerns: true,
        email_notifications: true,
        response_time_limit: 24,
        allow_anonymous: true
      }
    })
    setError(null)
    setSuccess(null)
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Department Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter department name"
              />
            </div>
            <div>
              <Label htmlFor="code">Department Code</Label>
              <Input
                id="code"
                value={settings.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="Enter department code"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter department description"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge className={department.type === 'academic' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
              {department.type === 'academic' ? 'Academic Department' : 'Administrative Department'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.contact_info.email}
                onChange={(e) => handleInputChange('contact_info.email', e.target.value)}
                placeholder="department@bcp.edu.ph"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.contact_info.phone}
                onChange={(e) => handleInputChange('contact_info.phone', e.target.value)}
                placeholder="(02) 8XXX-XXXX"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="office_hours">Office Hours</Label>
              <Input
                id="office_hours"
                value={settings.contact_info.office_hours}
                onChange={(e) => handleInputChange('contact_info.office_hours', e.target.value)}
                placeholder="8:00 AM - 5:00 PM"
              />
            </div>
            <div>
              <Label htmlFor="location">Office Location</Label>
              <Input
                id="location"
                value={settings.contact_info.location}
                onChange={(e) => handleInputChange('contact_info.location', e.target.value)}
                placeholder="Main Building, 2nd Floor"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Department Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto_assign">Auto-assign concerns to department</Label>
              <p className="text-sm text-gray-500">Automatically assign new concerns to this department</p>
            </div>
            <Switch
              id="auto_assign"
              checked={settings.preferences.auto_assign_concerns}
              onCheckedChange={(checked) => handleInputChange('preferences.auto_assign_concerns', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_notifications">Email notifications</Label>
              <p className="text-sm text-gray-500">Receive email notifications for new concerns</p>
            </div>
            <Switch
              id="email_notifications"
              checked={settings.preferences.email_notifications}
              onCheckedChange={(checked) => handleInputChange('preferences.email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow_anonymous">Allow anonymous concerns</Label>
              <p className="text-sm text-gray-500">Allow students to submit anonymous concerns</p>
            </div>
            <Switch
              id="allow_anonymous"
              checked={settings.preferences.allow_anonymous}
              onCheckedChange={(checked) => handleInputChange('preferences.allow_anonymous', checked)}
            />
          </div>

          <div>
            <Label htmlFor="response_time">Response time limit (hours)</Label>
            <Select
              value={settings.preferences.response_time_limit.toString()}
              onValueChange={(value) => handleInputChange('preferences.response_time_limit', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="72">72 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={saving}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1E2A78] hover:bg-[#2480EA]"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}


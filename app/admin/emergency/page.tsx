"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  RefreshCw,
  Bell,
  Shield,
  Activity,
  Users
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export default function AdminEmergencyPage() {
  const [emergencySettings, setEmergencySettings] = useState({
    emergencyMode: false,
    emergencyMessage: "",
    autoNotify: true,
    notifyAllUsers: true,
    notifyDepartments: true
  })
  
  const [emergencyServices, setEmergencyServices] = useState<any[]>([])
  
  const [newService, setNewService] = useState({
    name: "",
    phone: "",
    location: "",
    hours: "",
    description: "",
    type: "general",
    status: "active"
  })
  
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [emergencyStats, setEmergencyStats] = useState({
    totalAlerts: 0,
    activeServices: 0,
    responseTime: 0,
    lastAlert: null as string | null
  })

  useEffect(() => {
    const fetchEmergencyData = async () => {
      try {
        setLoading(true)
        const [contacts, protocols] = await Promise.all([
          apiClient.getEmergencyContacts(),
          apiClient.getEmergencyProtocols()
        ])
        
        // Set emergency services from real data
        setEmergencyServices(contacts)
        
        // Calculate stats from real data
        const activeServices = contacts.filter(contact => contact.status === 'active').length
        setEmergencyStats({
          totalAlerts: 0, // Will be calculated from real alert data
          activeServices,
          responseTime: 0, // Will be calculated from real response data
          lastAlert: null
        })
      } catch (error) {
        console.error('Failed to fetch emergency data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmergencyData()
  }, [])

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      await apiClient.updateEmergencySettings(emergencySettings)
    } catch (error) {
      console.error('Failed to save emergency settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBroadcastAlert = async () => {
    if (!emergencySettings.emergencyMessage.trim()) return
    
    try {
      setLoading(true)
      // Broadcast emergency alert
      await apiClient.broadcastEmergencyAlert(emergencySettings.emergencyMessage)
    } catch (error) {
      console.error('Failed to broadcast emergency alert:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddService = async () => {
    if (!newService.name.trim() || !newService.phone.trim()) return
    
    try {
      setLoading(true)
      const service = await apiClient.createEmergencyContact(newService)
      setEmergencyServices([...emergencyServices, service])
      setNewService({
        name: "",
        phone: "",
        location: "",
        hours: "",
        description: "",
        type: "general",
        status: "active"
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add emergency service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this emergency service?')) return
    
    try {
      setLoading(true)
      await apiClient.deleteEmergencyContact(id)
      setEmergencyServices(emergencyServices.filter(service => service.id !== id))
    } catch (error) {
      console.error('Failed to delete emergency service:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'medical':
        return 'bg-red-100 text-red-800'
      case 'security':
        return 'bg-blue-100 text-blue-800'
      case 'counseling':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1E2A78] mb-2">Emergency Help Management</h1>
        <p className="text-gray-600">Configure emergency services and contact information</p>
      </div>

            {/* Emergency Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                      <p className="text-2xl font-bold text-[#1E2A78]">{emergencyStats.totalAlerts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Services</p>
                      <p className="text-2xl font-bold text-[#1E2A78]">{emergencyStats.activeServices}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-[#1E2A78]">{emergencyStats.responseTime}m</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Last Alert</p>
                      <p className="text-sm font-bold text-[#1E2A78]">
                        {emergencyStats.lastAlert ? new Date(emergencyStats.lastAlert).toLocaleDateString() : 'None'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Emergency Alert Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-[#E22824]" />
                  Emergency Alert Settings
                </CardTitle>
                <CardDescription>Configure system-wide emergency notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emergency-mode">Emergency Mode</Label>
                        <p className="text-sm text-gray-500">Enable campus-wide emergency alerts</p>
                      </div>
                      <Switch 
                        id="emergency-mode" 
                        checked={emergencySettings.emergencyMode}
                        onCheckedChange={(checked) => setEmergencySettings(prev => ({ ...prev, emergencyMode: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-notify">Auto Notify</Label>
                        <p className="text-sm text-gray-500">Automatically notify all users</p>
                      </div>
                      <Switch 
                        id="auto-notify" 
                        checked={emergencySettings.autoNotify}
                        onCheckedChange={(checked) => setEmergencySettings(prev => ({ ...prev, autoNotify: checked }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-users">Notify All Users</Label>
                        <p className="text-sm text-gray-500">Send alerts to all students</p>
                      </div>
                      <Switch 
                        id="notify-users" 
                        checked={emergencySettings.notifyAllUsers}
                        onCheckedChange={(checked) => setEmergencySettings(prev => ({ ...prev, notifyAllUsers: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notify-departments">Notify Departments</Label>
                        <p className="text-sm text-gray-500">Send alerts to department heads</p>
                      </div>
                      <Switch 
                        id="notify-departments" 
                        checked={emergencySettings.notifyDepartments}
                        onCheckedChange={(checked) => setEmergencySettings(prev => ({ ...prev, notifyDepartments: checked }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency-message">Emergency Message</Label>
                  <Textarea
                    id="emergency-message"
                    placeholder="Enter emergency message to broadcast to all users..."
                    rows={3}
                    value={emergencySettings.emergencyMessage}
                    onChange={(e) => setEmergencySettings(prev => ({ ...prev, emergencyMessage: e.target.value }))}
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={handleBroadcastAlert}
                    disabled={loading || !emergencySettings.emergencyMessage.trim()}
                    className="bg-[#E22824] hover:bg-red-700 text-white"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Broadcasting...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Broadcast Emergency Alert
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setEmergencySettings(prev => ({ ...prev, emergencyMessage: "" }))}
                  >
                    Clear Alert
                  </Button>
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-[#1E2A78] hover:bg-[#2480EA]"
                  >
                    {loading ? (
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
              </CardContent>
            </Card>

            {/* Emergency Services Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Emergency Services</CardTitle>
                    <CardDescription>Manage emergency contact information and services</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-[#2480EA] hover:bg-[#1E2A78]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {showAddForm ? 'Cancel' : 'Add Service'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyServices.map((service) => (
                    <Card key={service.id} className="border-l-4 border-l-[#2480EA]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-[#1E2A78]">{service.name}</h3>
                              <Badge
                                variant={service.status === "active" ? "default" : "secondary"}
                                className={service.status === "active" ? "bg-green-100 text-green-800" : ""}
                              >
                                {service.status}
                              </Badge>
                              <Badge className={getServiceTypeColor(service.type)}>
                                {service.type}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{service.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-[#2480EA]" />
                                <span className="font-medium">{service.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-[#2480EA]" />
                                <span>{service.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-[#2480EA]" />
                                <span>{service.hours}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleDeleteService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add New Service Form */}
            {showAddForm && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Add New Emergency Service</CardTitle>
                  <CardDescription>Configure a new emergency contact service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-name">Service Name</Label>
                      <Input 
                        id="service-name" 
                        placeholder="e.g., Campus Fire Department"
                        value={newService.name}
                        onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-phone">Phone Number</Label>
                      <Input 
                        id="service-phone" 
                        placeholder="+63 2 8123-4567"
                        value={newService.phone}
                        onChange={(e) => setNewService(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-location">Location</Label>
                      <Input 
                        id="service-location" 
                        placeholder="Building and room number"
                        value={newService.location}
                        onChange={(e) => setNewService(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-hours">Operating Hours</Label>
                      <Input 
                        id="service-hours" 
                        placeholder="e.g., 24/7 or 8:00 AM - 5:00 PM"
                        value={newService.hours}
                        onChange={(e) => setNewService(prev => ({ ...prev, hours: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-type">Service Type</Label>
                      <Select 
                        value={newService.type} 
                        onValueChange={(value) => setNewService(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="counseling">Counseling</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-status">Status</Label>
                      <Select 
                        value={newService.status} 
                        onValueChange={(value) => setNewService(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="service-description">Description</Label>
                    <Textarea 
                      id="service-description" 
                      placeholder="Brief description of the service..." 
                      rows={3}
                      value={newService.description}
                      onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <Button 
                      onClick={handleAddService}
                      disabled={loading || !newService.name.trim() || !newService.phone.trim()}
                      className="bg-[#2480EA] hover:bg-[#1E2A78]"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Emergency Service
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
    </>
  )
}

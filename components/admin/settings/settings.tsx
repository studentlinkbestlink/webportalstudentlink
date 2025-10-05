import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Settings as SettingsIcon, 
  Database, 
  Bell, 
  Shield, 
  Server, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Users,
  Mail,
  Lock,
  Globe,
  FileText
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export function Settings() {
  const [settings, setSettings] = useState({
    general: {
      portalName: "StudentLink Portal",
      maintenanceMode: false,
      timezone: "Asia/Manila",
      language: "en",
      maxUsers: 1000
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      adminEmail: "admin@bcp.edu.ph",
      notificationFrequency: "immediate"
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 30,
      twoFactorAuth: false,
      ipWhitelist: "",
      maxLoginAttempts: 5
    },
    concerns: {
      allowAttachments: true,
      maxFileSize: 10,
      autoAssign: true,
      requireApproval: false,
      anonymousAllowed: true
    },
    system: {
      backupFrequency: "daily",
      logRetention: 90,
      cacheTimeout: 60,
      apiRateLimit: 1000,
      debugMode: false
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [systemInfo, setSystemInfo] = useState({
    version: "1.0.0",
    uptime: "5 days, 12 hours",
    memoryUsage: "45%",
    diskUsage: "60%",
    activeUsers: 156
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const systemSettings = await apiClient.getSystemSettings()
        
        // Ensure settings has proper structure with fallbacks
        if (systemSettings && typeof systemSettings === 'object') {
          setSettings({
            general: {
              portalName: systemSettings.general?.portalName || "StudentLink Portal",
              maintenanceMode: systemSettings.general?.maintenanceMode || false,
              timezone: systemSettings.general?.timezone || "Asia/Manila",
              language: systemSettings.general?.language || "en",
              maxUsers: systemSettings.general?.maxUsers || 1000
            },
            notifications: {
              emailNotifications: systemSettings.notifications?.emailNotifications || true,
              smsNotifications: systemSettings.notifications?.smsNotifications || false,
              pushNotifications: systemSettings.notifications?.pushNotifications || true,
              adminEmail: systemSettings.notifications?.adminEmail || "admin@bcp.edu.ph",
              notificationFrequency: systemSettings.notifications?.notificationFrequency || "immediate"
            },
            security: {
              passwordMinLength: systemSettings.security?.passwordMinLength || 8,
              requireSpecialChars: systemSettings.security?.requireSpecialChars || true,
              sessionTimeout: systemSettings.security?.sessionTimeout || 30,
              twoFactorAuth: systemSettings.security?.twoFactorAuth || false,
              ipWhitelist: systemSettings.security?.ipWhitelist || "",
              maxLoginAttempts: systemSettings.security?.maxLoginAttempts || 5
            },
            concerns: {
              allowAttachments: systemSettings.concerns?.allowAttachments || true,
              maxFileSize: systemSettings.concerns?.maxFileSize || 10,
              autoAssign: systemSettings.concerns?.autoAssign || true,
              requireApproval: systemSettings.concerns?.requireApproval || false,
              anonymousAllowed: systemSettings.concerns?.anonymousAllowed || true
            },
            system: {
              backupFrequency: systemSettings.system?.backupFrequency || "daily",
              logRetention: systemSettings.system?.logRetention || 90,
              cacheTimeout: systemSettings.system?.cacheTimeout || 60,
              apiRateLimit: systemSettings.system?.apiRateLimit || 1000,
              debugMode: systemSettings.system?.debugMode || false
            }
          })
        }
        
        // Get system info from health check
        const healthData = await apiClient.checkHealth()
        setSystemInfo({
          version: "1.0.0",
          uptime: "System running",
          memoryUsage: "N/A",
          diskUsage: "N/A",
          activeUsers: 0
        })
      } catch (error) {
        console.error('Failed to fetch settings:', error)
        // Keep default settings if API fails
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      await apiClient.updateSystemSettings(settings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setSettings({
        general: {
          portalName: "StudentLink Portal",
          maintenanceMode: false,
          timezone: "Asia/Manila",
          language: "en",
          maxUsers: 1000
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          adminEmail: "admin@bcp.edu.ph",
          notificationFrequency: "immediate"
        },
        security: {
          passwordMinLength: 8,
          requireSpecialChars: true,
          sessionTimeout: 30,
          twoFactorAuth: false,
          ipWhitelist: "",
          maxLoginAttempts: 5
        },
        concerns: {
          allowAttachments: true,
          maxFileSize: 10,
          autoAssign: true,
          requireApproval: false,
          anonymousAllowed: true
        },
        system: {
          backupFrequency: "daily",
          logRetention: 90,
          cacheTimeout: 60,
          apiRateLimit: 1000,
          debugMode: false
        }
      })
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  return (
    <div className="space-y-8">
      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1E2A78]">{systemInfo.version}</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1E2A78]">{systemInfo.uptime}</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1E2A78]">{systemInfo.memoryUsage}</div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1E2A78]">{systemInfo.diskUsage}</div>
              <div className="text-sm text-gray-600">Disk Usage</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1E2A78]">{systemInfo.activeUsers}</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="portal-name">Portal Name</Label>
              <Input 
                id="portal-name" 
                value={settings.general?.portalName || "StudentLink Portal"}
                onChange={(e) => updateSetting('general', 'portalName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select 
                value={settings.general?.timezone || "Asia/Manila"} 
                onValueChange={(value) => updateSetting('general', 'timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Manila">Asia/Manila</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Default Language</Label>
              <Select 
                value={settings.general?.language || "en"} 
                onValueChange={(value) => updateSetting('general', 'language', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fil">Filipino</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-users">Max Users</Label>
              <Input 
                id="max-users" 
                type="number"
                value={settings.general.maxUsers}
                onChange={(e) => updateSetting('general', 'maxUsers', parseInt(e.target.value))}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-gray-500">Temporarily disable the portal for maintenance</p>
            </div>
            <Switch 
              id="maintenance-mode" 
              checked={settings.general.maintenanceMode}
              onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifs">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send notifications via email</p>
                </div>
                <Switch 
                  id="email-notifs" 
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifs">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Send notifications via SMS</p>
                </div>
                <Switch 
                  id="sms-notifs" 
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifs">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Send push notifications to mobile apps</p>
                </div>
                <Switch 
                  id="push-notifs" 
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input 
                  id="admin-email" 
                  type="email" 
                  value={settings.notifications.adminEmail}
                  onChange={(e) => updateSetting('notifications', 'adminEmail', e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password-length">Minimum Password Length</Label>
                <Input 
                  id="password-length" 
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input 
                  id="session-timeout" 
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="special-chars">Require Special Characters</Label>
                  <p className="text-sm text-gray-500">Passwords must contain special characters</p>
                </div>
                <Switch 
                  id="special-chars" 
                  checked={settings.security.requireSpecialChars}
                  onCheckedChange={(checked) => updateSetting('security', 'requireSpecialChars', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Enable 2FA for admin accounts</p>
                </div>
                <Switch 
                  id="two-factor" 
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Concern Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Concern Submission Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allow-attachments">Allow File Attachments</Label>
                  <p className="text-sm text-gray-500">Students can attach files to concerns</p>
                </div>
                <Switch 
                  id="allow-attachments" 
                  checked={settings.concerns.allowAttachments}
                  onCheckedChange={(checked) => updateSetting('concerns', 'allowAttachments', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-assign">Auto-assign Concerns</Label>
                  <p className="text-sm text-gray-500">Automatically assign concerns to departments</p>
                </div>
                <Switch 
                  id="auto-assign" 
                  checked={settings.concerns.autoAssign}
                  onCheckedChange={(checked) => updateSetting('concerns', 'autoAssign', checked)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input 
                  id="max-file-size" 
                  type="number" 
                  value={settings.concerns.maxFileSize}
                  onChange={(e) => updateSetting('concerns', 'maxFileSize', parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="anonymous-allowed">Allow Anonymous Concerns</Label>
                  <p className="text-sm text-gray-500">Students can submit anonymous concerns</p>
                </div>
                <Switch 
                  id="anonymous-allowed" 
                  checked={settings.concerns.anonymousAllowed}
                  onCheckedChange={(checked) => updateSetting('concerns', 'anonymousAllowed', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleResetSettings}
          disabled={saving}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSaveSettings}
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
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

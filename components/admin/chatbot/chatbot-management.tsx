import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  Send,
  User,
  Calendar,
  TrendingUp,
  Brain,
  Zap
} from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

export function ChatbotManagement() {
  const [chatbotSettings, setChatbotSettings] = useState({
    enabled: true,
    responseTime: 2,
    personality: 'friendly',
    language: 'en',
    maxTokens: 150
  })
  
  const [trainingData, setTrainingData] = useState("")
  const [testMessage, setTestMessage] = useState("")
  const [testResponse, setTestResponse] = useState("")
  const [conversations, setConversations] = useState<any[]>([])
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    avgResponseTime: 0,
    satisfactionRate: 0,
    commonQuestions: []
  })
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const fetchChatbotData = async () => {
      try {
        setLoading(true)
        // Fetch AI sessions for conversation history
        const conversations = await apiClient.getChatbotConversations()
        setConversations(conversations)
        
        const analytics = await apiClient.getChatbotAnalytics()
        setAnalytics(analytics)
      } catch (error) {
        console.error('Failed to fetch chatbot data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChatbotData()
  }, [])

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      await apiClient.updateChatbotSettings(chatbotSettings)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrainChatbot = async () => {
    if (!trainingData.trim()) return
    
    try {
      setLoading(true)
      // Send training data to chatbot
      await apiClient.trainChatbot(trainingData)
      setTrainingData("")
    } catch (error) {
      console.error('Failed to train chatbot:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestChatbot = async () => {
    if (!testMessage.trim()) return
    
    try {
      setTesting(true)
      const response = await apiClient.sendAiMessage(testMessage)
      setTestResponse(response.message)
    } catch (error) {
      console.error('Failed to test chatbot:', error)
      setTestResponse("Error: Unable to get response from chatbot")
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Chatbot Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Chatbot Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${chatbotSettings.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {chatbotSettings.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
              <Badge variant="outline">
                {analytics.totalConversations} conversations
              </Badge>
              <Badge variant="outline">
                {analytics.avgResponseTime}s avg response
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setChatbotSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              >
                {chatbotSettings.enabled ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {chatbotSettings.enabled ? 'Pause' : 'Start'}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Restart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings">
        <TabsList className="mb-4">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="history">Conversation History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Chatbot Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="personality">Personality</Label>
                    <Select 
                      value={chatbotSettings.personality} 
                      onValueChange={(value) => setChatbotSettings(prev => ({ ...prev, personality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={chatbotSettings.language} 
                      onValueChange={(value) => setChatbotSettings(prev => ({ ...prev, language: value }))}
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
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="responseTime">Response Time (seconds)</Label>
                    <Input
                      id="responseTime"
                      type="number"
                      value={chatbotSettings.responseTime}
                      onChange={(e) => setChatbotSettings(prev => ({ ...prev, responseTime: parseInt(e.target.value) }))}
                      min="1"
                      max="10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxTokens">Max Response Length</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={chatbotSettings.maxTokens}
                      onChange={(e) => setChatbotSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      min="50"
                      max="500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
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
                    'Save Settings'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Train the Chatbot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Provide new information or conversation examples for the chatbot. The bot will learn from this and improve its responses.</p>
                <Textarea
                  placeholder="Enter training data here... e.g., Q: What are the library hours? A: The library is open from 8 AM to 5 PM, Monday to Friday."
                  rows={8}
                  value={trainingData}
                  onChange={(e) => setTrainingData(e.target.value)}
                />
                <Button 
                  onClick={handleTrainChatbot}
                  disabled={loading || !trainingData.trim()}
                  className="bg-[#1E2A78] hover:bg-[#2480EA]"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Training...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Training
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Test Chatbot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testMessage">Test Message</Label>
                  <div className="flex gap-2">
                    <Input
                      id="testMessage"
                      placeholder="Type a test message..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleTestChatbot()}
                    />
                    <Button 
                      onClick={handleTestChatbot}
                      disabled={testing || !testMessage.trim()}
                    >
                      {testing ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {testResponse && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-[#1E2A78]" />
                      <span className="font-medium">Chatbot Response:</span>
                    </div>
                    <p className="text-gray-700">{testResponse}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Conversation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No conversation history available yet.
                  </div>
                ) : (
                  conversations.map((conv: any) => (
                    <div key={conv.id} className="border p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{conv.user}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(conv.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{conv.message}</p>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-[#1E2A78]" />
                        <span className="font-medium">Chatbot:</span>
                      </div>
                      <p className="text-gray-600 ml-6">{conv.response}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">Satisfaction:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= conv.satisfaction ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-[#1E2A78]" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                    <p className="text-2xl font-bold text-[#1E2A78]">{analytics.totalConversations}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-[#1E2A78]">{analytics.avgResponseTime}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Satisfaction Rate</p>
                    <p className="text-2xl font-bold text-[#1E2A78]">{analytics.satisfactionRate}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.commonQuestions.map((question, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    <span>{question}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

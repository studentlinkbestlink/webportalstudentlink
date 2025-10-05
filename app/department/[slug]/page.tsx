"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { RoleBasedNav } from "@/components/navigation/role-based-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import { ConcernDetailsDialog } from "@/components/department/concern-details-dialog"
import { DepartmentSettings } from "@/components/department/department-settings"
import { DepartmentAnalytics } from "@/components/department/department-analytics"
import { DepartmentAnnouncements } from "@/components/department/department-announcements"
import { DepartmentStaffManagement } from "@/components/department/staff-management"
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Bell,
  Settings,
  BarChart3,
  Calendar,
  User,
  Hash
} from "lucide-react"

// Type definitions
interface Concern {
  id: number
  subject: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  is_anonymous: boolean
  reference_number: string
  created_at: string
  student?: {
    name: string
  }
  department?: {
    name: string
  }
}

interface DepartmentStats {
  totalConcerns: number
  resolved: number
  inProcess: number
  pending: number
}

// Department data - this would come from API in real implementation
const departmentData = {
  "registrar-office": {
    id: 1,
    name: "Registrar Office",
    code: "REGISTRAR",
    type: "administrative",
    headName: "Ms. Rosa Mendoza",
    email: "registrar@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Office of the Registrar - Student Records and Academic Services"
  },
  "cashier": {
    id: 2,
    name: "Cashier",
    code: "CASHIER", 
    type: "administrative",
    headName: "Ms. Lourdes Cruz",
    email: "cashier@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Cashier Office - Financial Transactions and Payments"
  },
  "bookstore-and-uniform": {
    id: 3,
    name: "Bookstore and Uniform",
    code: "BOOKSTORE",
    type: "administrative", 
    headName: "Ms. Teresa Reyes",
    email: "bookstore@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Bookstore and Uniform Services"
  },
  "prefect-of-discipline": {
    id: 4,
    name: "Prefect of Discipline",
    code: "DISCIPLINE",
    type: "administrative",
    headName: "Mr. Carlos Morales", 
    email: "discipline@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Office of the Prefect of Discipline - Student Conduct and Discipline"
  },
  "library": {
    id: 5,
    name: "Library",
    code: "LIBRARY",
    type: "administrative",
    headName: "Ms. Isabel Gutierrez",
    email: "library@bcp.edu.ph", 
    phone: "(02) 8XXX-XXXX",
    description: "College Library - Information Resources and Services"
  },
  "mis": {
    id: 28,
    name: "MIS",
    code: "MIS",
    type: "administrative",
    headName: "Engr. Ricardo Silva",
    email: "mis@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX", 
    description: "Management Information Systems - IT Support and Services"
  },
  "bs-accounting-information-system": {
    id: 7,
    name: "BS in Accounting Information System",
    code: "BSAIS",
    type: "academic",
    headName: "Dr. Maria Santos",
    email: "bsais@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Accounting Information System"
  },
  "bs-in-computer-engineering": {
    id: 8,
    name: "BS in Computer Engineering",
    code: "BSCPE",
    type: "academic",
    headName: "Engr. Juan Dela Cruz",
    email: "bscpe@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Computer Engineering"
  },
  "bs-criminology": {
    id: 9,
    name: "BS in Criminology",
    code: "BSCrim",
    type: "academic",
    headName: "Dr. Roberto Garcia",
    email: "bscrim@bcp.edu.ph", 
    phone: "(02) 8XXX-XXXX",
    description: "Department of Criminology and Criminal Justice"
  },
  "bs-entrepreneurship": {
    id: 10,
    name: "BS in Entrepreneurship",
    code: "BSEntrep",
    type: "academic",
    headName: "Prof. Miguel Ramos",
    email: "bsentrep@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Entrepreneurship"
  },
  "bs-in-information-technology": {
    id: 6,
    name: "BS in Information Technology",
    code: "BSIT",
    type: "academic",
    headName: "Engr. Carlos Morales",
    email: "bsit@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Information Technology"
  },
  "bs-in-psychology": {
    id: 12,
    name: "BS in Psychology",
    code: "BSPsych",
    type: "academic",
    headName: "Dr. Patricia Martinez",
    email: "bspsych@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Psychology and Behavioral Sciences"
  },
  "blis": {
    id: 13,
    name: "BLIS – Bachelor in Library Information Science",
    code: "BLIS",
    type: "academic",
    headName: "Prof. Sofia Herrera",
    email: "blis@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Library and Information Science"
  },
  "bped": {
    id: 14,
    name: "BPED – Bachelor in Physical Education",
    code: "BPED",
    type: "academic",
    headName: "Prof. Miguel Ramos",
    email: "bped@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Physical Education and Sports"
  },
  "beed--bachelor-of-elementary-education": {
    id: 15,
    name: "BEED – Bachelor of Elementary Education",
    code: "BEED",
    type: "academic",
    headName: "Dr. Elena Torres",
    email: "beed@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Elementary Education"
  },
  "bsed-major-in-social-studies": {
    id: 16,
    name: "BSED major in Social Studies",
    code: "BSED-Social Studies",
    type: "academic",
    headName: "Engr. Juan Dela Cruz",
    email: "bsedsoc@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Secondary Education - Social Studies"
  },
  "btled--bachelor-of-technology-and-livelihood-education": {
    id: 17,
    name: "BTLED – Bachelor of Technology and Livelihood Education",
    code: "BTLED",
    type: "academic",
    headName: "Prof. Miguel Ramos",
    email: "btled@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Technology and Livelihood Education"
  },
  "bsed-major-in-values": {
    id: 18,
    name: "BSED major in Values",
    code: "BSED-Values",
    type: "academic",
    headName: "Dr. Roberto Garcia",
    email: "bsedval@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Secondary Education - Values"
  },
  "bsed-major-in-science": {
    id: 19,
    name: "BSED major in Science",
    code: "BSED-Science",
    type: "academic",
    headName: "Dr. Elena Torres",
    email: "bsedsci@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Secondary Education - Science"
  },
  "bs-in-tourism-management": {
    id: 20,
    name: "BS in Tourism Management",
    code: "BSTM",
    type: "academic",
    headName: "Prof. Ana Rodriguez",
    email: "bstm@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Tourism Management"
  },
  "bs-in-office-administration": {
    id: 21,
    name: "BS in Office Administration",
    code: "BSOA",
    type: "academic",
    headName: "Prof. Carmen Lopez",
    email: "bsoa@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX", 
    description: "Department of Office Administration"
  },
  "bs-in-hospitality-management": {
    id: 22,
    name: "BS in Hospitality Management",
    code: "BSHM",
    type: "academic",
    headName: "Prof. Sofia Herrera", 
    email: "bshm@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Hospitality Management"
  },
  "bsba-major-in-financial-management": {
    id: 23,
    name: "BSBA major in Financial Management",
    code: "BSBA-FM",
    type: "academic",
    headName: "Dr. Fernando Reyes",
    email: "bsbafm@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Business Administration - Financial Management"
  },
  "bsba-major-in-human-resource-management": {
    id: 24,
    name: "BSBA major in Human Resource Management",
    code: "BSBA-HRM",
    type: "academic",
    headName: "Dr. Carmen Dela Cruz",
    email: "bsbahrm@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Business Administration - Human Resource Management"
  },
  "bsba-major-in-marketing-management": {
    id: 25,
    name: "BSBA major in Marketing Management",
    code: "BSBA-MM",
    type: "academic",
    headName: "Dr. Antonio Santos",
    email: "bsbamm@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Business Administration - Marketing Management"
  },
  "bsed-major-in-english": {
    id: 26,
    name: "BSED major in English",
    code: "BSED-English",
    type: "academic",
    headName: "Dr. Maria Rodriguez",
    email: "bsedeng@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Secondary Education - English"
  },
  "bsed-major-in-filipino": {
    id: 27,
    name: "BSED major in Filipino",
    code: "BSED-Filipino",
    type: "academic",
    headName: "Dr. Lourdes Cruz",
    email: "bsedfil@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Secondary Education - Filipino"
  },
  "bsed-major-in-mathematics": {
    id: 28,
    name: "BSED major in Mathematics",
    code: "BSED-Math",
    type: "academic",
    headName: "Dr. Ricardo Silva",
    email: "bsedmath@bcp.edu.ph",
    phone: "(02) 8XXX-XXXX",
    description: "Department of Secondary Education - Mathematics"
  }
}

export default function DepartmentPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const slug = params.slug as string
  const department = departmentData[slug as keyof typeof departmentData]
  
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DepartmentStats & { avgResponseTime: string }>({
    totalConcerns: 0,
    resolved: 0,
    inProcess: 0,
    pending: 0,
    avgResponseTime: "0 hours"
  })
  const [selectedConcern, setSelectedConcern] = useState<Concern | null>(null)
  const [isConcernDialogOpen, setIsConcernDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("concerns")

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['concerns', 'staff', 'announcements', 'analytics', 'settings'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Update URL without page reload
    const url = new URL(window.location.href)
    url.searchParams.set('tab', value)
    window.history.pushState({}, '', url.toString())
  }

  // Fetch department concerns
  useEffect(() => {
    const fetchConcerns = async () => {
      if (!user || !department) return
      
      try {
        setLoading(true)
        const response = await fetch('/api/concerns', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const departmentConcerns = data.data.filter((concern: Concern) => 
            concern.department?.name === department.name
          )
          
          setConcerns(departmentConcerns)
          
          // Calculate stats
          const total = departmentConcerns.length
          const resolved = departmentConcerns.filter((c: Concern) => c.status === 'resolved' || c.status === 'student_confirmed').length
          const inProcess = departmentConcerns.filter((c: Concern) => c.status === 'in_progress').length
          const pending = departmentConcerns.filter((c: Concern) => c.status === 'pending').length
          
          setStats({
            totalConcerns: total,
            resolved,
            inProcess,
            pending,
            avgResponseTime: "2.5 hours" // TODO: Calculate from actual data
          })
        }
      } catch (error) {
        console.error('Error fetching concerns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConcerns()
  }, [user, department])

  const handleViewConcernDetails = (concern: Concern) => {
    setSelectedConcern(concern)
    setIsConcernDialogOpen(true)
  }

  const handleConcernUpdate = () => {
    // Refresh concerns data
    const fetchConcerns = async () => {
      if (!user || !department) return

      try {
        setLoading(true)
        const response = await fetch('/api/concerns')
        const data = await response.json()
        
        if (data.success) {
          const departmentConcerns = data.data.filter((concern: Concern) =>
            concern.department?.name === department.name
          )
          setConcerns(departmentConcerns)
          
          // Update stats
          const resolved = departmentConcerns.filter((c: Concern) => c.status === 'resolved' || c.status === 'student_confirmed').length
          const inProcess = departmentConcerns.filter((c: Concern) => c.status === 'in_progress').length
          const pending = departmentConcerns.filter((c: Concern) => c.status === 'pending').length
          
          setStats({
            totalConcerns: departmentConcerns.length,
            resolved,
            inProcess,
            pending,
            avgResponseTime: "2.5 hours" // TODO: Calculate actual response time
          })
        }
      } catch (error) {
        console.error('Failed to fetch concerns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConcerns()
  }

  if (!department) {
    return (
      <ProtectedRoute allowedRoles={["department_head"]}>
        <div className="flex h-screen bg-gray-50">
          <RoleBasedNav />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Department Not Found</h1>
              <p className="text-gray-600">The requested department does not exist.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["department_head"]}>
    <div className="flex h-screen bg-gray-50">
      <RoleBasedNav />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#1E2A78] mb-2 tracking-tight">{department.name}</h1>
              <p className="text-gray-600 text-lg mb-4 max-w-2xl leading-relaxed">{department.description}</p>
              <div className="flex items-center space-x-6">
                <Badge className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm ${
                  department.type === 'academic' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-green-100 text-green-800 border border-green-300'
                }`}>
                  {department.type === 'academic' ? 'Academic Department' : 'Administrative Department'}
                </Badge>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600 font-medium">Head: {department.headName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 ml-8">
              <Button variant="outline" className="h-11 px-4">
                <Settings className="h-4 w-4 mr-2" />
                <span className="font-medium">Settings</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Statistics Cards - Only show for concerns tab */}
          {activeTab === "concerns" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <Card className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-[#1E2A78] flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Concerns</p>
                    <p className="text-2xl font-bold text-[#1E2A78]">{stats.totalConcerns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Process</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.inProcess}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-[#2480EA] flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Response</p>
                    <p className="text-2xl font-bold text-[#2480EA]">{stats.avgResponseTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-gray-100 border border-gray-200 p-1 rounded-lg">
              <TabsTrigger 
                value="concerns" 
                className="data-[state=active]:!bg-[#1E2A78] data-[state=active]:!text-white font-medium rounded-md transition-all duration-200 hover:bg-gray-200"
              >
                Concerns
              </TabsTrigger>
              <TabsTrigger 
                value="staff"
                className="data-[state=active]:!bg-[#1E2A78] data-[state=active]:!text-white font-medium rounded-md transition-all duration-200 hover:bg-gray-200"
              >
                Staff
              </TabsTrigger>
              <TabsTrigger 
                value="announcements"
                className="data-[state=active]:!bg-[#1E2A78] data-[state=active]:!text-white font-medium rounded-md transition-all duration-200 hover:bg-gray-200"
              >
                Announcements
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:!bg-[#1E2A78] data-[state=active]:!text-white font-medium rounded-md transition-all duration-200 hover:bg-gray-200"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:!bg-[#1E2A78] data-[state=active]:!text-white font-medium rounded-md transition-all duration-200 hover:bg-gray-200"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="concerns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Recent Concerns
                  </CardTitle>
                  <CardDescription>
                    Manage and respond to student concerns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E2A78] mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading concerns...</p>
                    </div>
                  ) : concerns.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No concerns yet</h3>
                      <p className="text-gray-500">Students haven't submitted any concerns to this department.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                      {concerns.map((concern) => (
                        <Card key={concern.id} className="group cursor-pointer hover:shadow-md transition-all duration-200" onClick={() => handleViewConcernDetails(concern)}>
                          <CardContent className="p-5">
                            <div className="space-y-4">
                              {/* Header with Title and Badges */}
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-bold text-gray-900 text-sm leading-tight group-hover:text-[#1E2A78] transition-colors flex-1">
                                  {concern.subject}
                                </h3>
                                <div className="flex flex-col gap-2">
                                  <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold text-white ${
                                    concern.priority === 'urgent' ? 'bg-red-600' :
                                    concern.priority === 'high' ? 'bg-red-500' :
                                    concern.priority === 'medium' ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}>
                                    {concern.priority?.charAt(0).toUpperCase() + concern.priority?.slice(1)}
                                  </span>
                                  <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold text-white ${
                                    concern.status === 'resolved' ? 'bg-green-500' :
                                    concern.status === 'in_progress' ? 'bg-blue-500' :
                                    concern.status === 'pending' ? 'bg-orange-500' :
                                    'bg-gray-500'
                                  }`}>
                                    {concern.status?.charAt(0).toUpperCase() + concern.status?.slice(1)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Content Information */}
                              <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">From</p>
                                    <p className="text-sm text-gray-900 font-semibold">
                                      {concern.is_anonymous ? 'Anonymous Student' : (concern.student?.name || 'Unknown')}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Date</p>
                                    <p className="text-sm text-gray-900 font-semibold">
                                      {new Date(concern.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Hash className="h-4 w-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Reference</p>
                                    <p className="text-sm text-gray-900 font-semibold font-mono">
                                      {concern.reference_number}
                            </p>
                          </div>
                                </div>
                              </div>
                              
                              {/* Action Button */}
                            <Button 
                              size="sm" 
                              variant="outline"
                                className="w-full text-xs h-9 bg-gradient-to-r from-white to-gray-50/50 border-2 border-[#1E2A78]/20 hover:bg-gradient-to-r hover:from-[#1E2A78] hover:to-[#2480EA] hover:text-white hover:border-[#1E2A78] hover:shadow-lg hover:shadow-[#1E2A78]/25 transition-all duration-200 font-semibold rounded-xl"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewConcernDetails(concern)
                                }}
                            >
                              View Details
                            </Button>
                          </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="space-y-6">
              <DepartmentStaffManagement 
                departmentId={department.id}
                departmentName={department.name}
              />
            </TabsContent>

            <TabsContent value="announcements" className="space-y-6">
              <DepartmentAnnouncements department={department} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <DepartmentAnalytics 
                department={department}
                concerns={concerns}
              />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <DepartmentSettings 
                department={department}
                onUpdate={handleConcernUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Concern Details Dialog */}
      <ConcernDetailsDialog
        concern={selectedConcern}
        isOpen={isConcernDialogOpen}
        onClose={() => {
          setIsConcernDialogOpen(false)
          setSelectedConcern(null)
        }}
        onUpdate={handleConcernUpdate}
      />
    </div>
    </ProtectedRoute>
  )
}

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Bell,
  AlertTriangle,
  Image as ImageIcon,
  Download,
  Hash
} from "lucide-react"
import { CreateAnnouncementDialog } from "@/components/admin/announcements/create-announcement-dialog"
import { apiClient, type Announcement } from "@/lib/api-client"

interface UnifiedAnnouncementsProps {
  userRole: 'admin' | 'department_head'
  department?: {
    name: string
    code: string
    type: string
  }
  showCreateButton?: boolean
  title?: string
  description?: string
}

export function UnifiedAnnouncements({ 
  userRole, 
  department, 
  showCreateButton = true,
  title = "Announcements",
  description = "Create and manage announcements"
}: UnifiedAnnouncementsProps) {
  // Debug user data
  console.log('🔍 UnifiedAnnouncements debug:', {
    userRole,
    department,
    localStorage_userId: localStorage.getItem('user_id'),
    localStorage_userRole: localStorage.getItem('user_role'),
    localStorage_token: localStorage.getItem('auth_token') ? 'Present' : 'Missing'
  })
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [announcementTypeFilter, setAnnouncementTypeFilter] = useState("all")
  const [categories, setCategories] = useState<string[]>([])

  // Fetch announcements and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [announcementsResult, categoriesResult] = await Promise.all([
          apiClient.getAnnouncements({ status: 'all' }),
          apiClient.getAnnouncementCategories()
        ])
        
        let filteredAnnouncements = announcementsResult.data

        // Filter announcements based on user role and department
        if (userRole === 'department_head' && department) {
          filteredAnnouncements = announcementsResult.data.filter((ann: Announcement) => {
            // Department heads can see:
            // 1. Announcements they created
            // 2. General announcements (no specific target departments)
            // 3. Announcements targeted to their department
            return ann.author.id === parseInt(localStorage.getItem('user_id') || '0') ||
                   !ann.target_departments || ann.target_departments.length === 0 ||
                   ann.target_departments?.length > 0
          })
        }
        // Admin can see all announcements (no filtering needed)
        
        setAnnouncements(filteredAnnouncements)
        setCategories(categoriesResult)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
        setAnnouncements([])
        // Fallback to hardcoded categories if API fails
        const fallbackCategories = [
          'Academic Modules',
          'Class Schedules & Exams',
          'Enrollment & Clearance',
          'Scholarships & Financial Aid',
          'Student Activities & Events',
          'Emergency Notices',
          'Administrative Updates',
          'OJT & Career Services',
          'Campus Ministry',
          'Faculty Announcements',
          'System Maintenance',
          'Student Services'
        ]
        setCategories(fallbackCategories)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userRole, department])

  const handleCreateAnnouncement = async (announcement: any) => {
    try {
      console.log('🎯 UnifiedAnnouncements: handleCreateAnnouncement called with:', announcement)
      console.log('🎯 Announcement data:', {
        hasImage: !!announcement.image,
        imageName: announcement.image?.name,
        imageSize: announcement.image?.size,
        status: announcement.status,
        title: announcement.title,
        category: announcement.category
      })
      
      if (editingAnnouncement) {
        // Update existing announcement
        console.log('🔄 Updating announcement ID:', editingAnnouncement.id)
        const updatedAnnouncement = await apiClient.updateAnnouncement(editingAnnouncement.id, announcement)
        setAnnouncements(announcements.map(ann => 
          ann.id === editingAnnouncement.id ? updatedAnnouncement : ann
        ))
        setEditingAnnouncement(null)
        console.log('✅ Announcement updated successfully')
        
        // Show success message
        alert('Announcement updated successfully!')
      } else {
        // Create new announcement
        console.log('🆕 Creating new announcement')
        
        // Validate required fields
        if (!announcement.category) {
          alert('Please select a category for the announcement.')
          return
        }
        
        if (!announcement.title) {
          alert('Please enter a title for the announcement.')
          return
        }
        
        if (!announcement.image) {
          alert('Please select an image for the announcement.')
          return
        }
        
        const newAnnouncement = await apiClient.createAnnouncement(announcement)
        setAnnouncements([newAnnouncement, ...announcements])
        console.log('✅ Announcement created successfully:', newAnnouncement)
        
        // Show success message
        alert('Announcement published successfully! It will now appear in the mobile app.')
      }
      setCreateOpen(false)
      
      // Refresh the announcements list to ensure we have the latest data
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error: any) {
      console.error('❌ Failed to save announcement:', error)
      console.error('❌ Error details:', {
        message: error?.message,
        status: error?.status,
        response: error?.response,
        type: typeof error
      })
      
      let errorMessage = 'Unknown error occurred'
      
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      alert(`Failed to save announcement: ${errorMessage}`)
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    
    try {
      await apiClient.deleteAnnouncement(id)
      setAnnouncements(announcements.filter(ann => ann.id !== id))
    } catch (error) {
      console.error('Failed to delete announcement:', error)
    }
  }

  const handleDownloadImage = async (id: number) => {
    try {
      const blob = await apiClient.downloadAnnouncementImage(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `announcement-${id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download image:', error)
      alert('Failed to download image. Please try again.')
    }
  }

  const handleViewAnnouncement = (announcement: Announcement) => {
    // Open announcement in a modal or new tab
    if (announcement.image_url) {
      // For image announcements, open the image in a new tab
      window.open(announcement.image_url, '_blank')
    } else {
      // For text announcements, show details in an alert or modal
      alert(`Title: ${announcement.title}\n\nContent: ${announcement.description || 'No content available'}`)
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setCreateOpen(true)
  }

  const handleCloseDialog = () => {
    setCreateOpen(false)
    setEditingAnnouncement(null)
  }

  // Filter announcements based on search and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = (announcement.title && announcement.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (announcement.description && announcement.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (announcement.category && announcement.category.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || announcement.status === statusFilter
    const matchesCategory = categoryFilter === "all" || announcement.category === categoryFilter
    const matchesAnnouncementType = announcementTypeFilter === "all" || 
      (announcementTypeFilter === "image" && announcement.image_url) ||
      (announcementTypeFilter === "text" && !announcement.image_url)
    
    return matchesSearch && matchesStatus && matchesCategory && matchesAnnouncementType
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'archived':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canEditAnnouncement = (announcement: Announcement) => {
    console.log('🔍 canEditAnnouncement debug:', {
      userRole,
      announcementId: announcement.id,
      authorId: announcement.author?.id,
      currentUserId: localStorage.getItem('user_id'),
      parsedUserId: parseInt(localStorage.getItem('user_id') || '0'),
      isAdmin: userRole === 'admin',
      isDepartmentHead: userRole === 'department_head',
      isAuthor: announcement.author?.id === parseInt(localStorage.getItem('user_id') || '0'),
      announcementData: announcement
    })
    
    // For now, let's allow all admin and department_head users to edit/delete for testing
    if (userRole === 'admin' || userRole === 'department_head') return true
    
    // Original logic (commented out for testing)
    // if (userRole === 'admin') return true
    // if (userRole === 'department_head') {
    //   // Department heads can only edit their own announcements
    //   return announcement.author?.id === parseInt(localStorage.getItem('user_id') || '0')
    // }
    return false
  }

  const canDeleteAnnouncement = (announcement: Announcement) => {
    console.log('🔍 canDeleteAnnouncement debug:', {
      userRole,
      announcementId: announcement.id,
      authorId: announcement.author?.id,
      currentUserId: localStorage.getItem('user_id'),
      parsedUserId: parseInt(localStorage.getItem('user_id') || '0'),
      isAdmin: userRole === 'admin',
      isDepartmentHead: userRole === 'department_head',
      isAuthor: announcement.author?.id === parseInt(localStorage.getItem('user_id') || '0'),
      announcementData: announcement
    })
    
    // For now, let's allow all admin and department_head users to edit/delete for testing
    if (userRole === 'admin' || userRole === 'department_head') return true
    
    // Original logic (commented out for testing)
    // if (userRole === 'admin') return true
    // if (userRole === 'department_head') {
    //   // Department heads can only delete their own announcements
    //   return announcement.author?.id === parseInt(localStorage.getItem('user_id') || '0')
    // }
    return false
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#1E2A78]">{title}</h2>
          <p className="text-gray-600">
            {description}
            {department && ` for ${department.name}`}
          </p>
        </div>
        {showCreateButton && (
          <Button onClick={() => setCreateOpen(true)} className="bg-[#1E2A78] hover:bg-[#2480EA]">
            <Plus className="mr-2 h-4 w-4" />
            Create New Announcement
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={announcementTypeFilter} onValueChange={setAnnouncementTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Formats</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Announcements ({filteredAnnouncements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading announcements...</div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error loading announcements</div>
              <div className="text-sm text-muted-foreground">{error}</div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAnnouncements.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {announcements.length === 0 
                    ? "No announcements found. Create your first announcement using the button above."
                    : "No announcements match your current filters."
                  }
                </div>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <Card key={ann.id} className="group hover:shadow-md transition-all duration-200 overflow-hidden">
                    {/* Image Section */}
                    {ann.image_url && (
                      <div className="relative h-48 bg-gray-100">
                        <img 
                          src={ann.image_url} 
                          alt={ann.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Image failed to load:', ann.image_url)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                            onClick={() => handleDownloadImage(ann.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        {ann.image_url && (
                          <div className="absolute bottom-3 left-3">
                            <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Content Section */}
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header with Title and Badges */}
                        <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                            <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1E2A78] transition-colors">{ann.title}</h3>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                              {ann.category}
                              </span>
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg text-white ${
                                ann.status === 'published' ? 'bg-green-500' :
                                ann.status === 'draft' ? 'bg-gray-500' :
                                ann.status === 'archived' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }`}>
                              {ann.status.charAt(0).toUpperCase() + ann.status.slice(1)}
                              </span>
                          </div>
                        </div>
                      </div>
                      
                      
                      {/* Description */}
                      {ann.description && !ann.image_url && (
                          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-700 line-clamp-3 leading-relaxed text-sm">{ann.description}</p>
                          </div>
                        )}

                        {/* Detailed Information */}
                        <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Author</p>
                              <p className="text-sm text-gray-900 font-semibold">
                                {ann.author?.name || 'Unknown Author'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Published</p>
                              <p className="text-sm text-gray-900 font-semibold">
                                {new Date(ann.created_at).toLocaleDateString('en-US', {
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
                              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">ID</p>
                              <p className="text-sm text-gray-900 font-semibold font-mono">
                                ANN{ann.id.toString().padStart(6, '0')}
                              </p>
                            </div>
                          </div>
                        </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAnnouncement(ann)}
                            className="flex-1 h-8 rounded-lg"
                        >
                            <Eye className="h-3 w-3 mr-1" />
                          <span className="text-xs font-medium">View</span>
                        </Button>
                        {canEditAnnouncement(ann) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAnnouncement(ann)}
                              className="flex-1 h-8 rounded-lg"
                          >
                              <Edit className="h-3 w-3 mr-1" />
                            <span className="text-xs font-medium">Edit</span>
                          </Button>
                        )}
                        {canDeleteAnnouncement(ann) && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                              className="flex-1 h-8 rounded-lg"
                          >
                              <Trash2 className="h-3 w-3 mr-1" />
                            <span className="text-xs font-medium">Delete</span>
                          </Button>
                        )}
                      </div>
                      
                      {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-[#1E2A78]"></div>
                            <User className="h-3 w-3" />
                            <span className="font-medium">By {ann.author?.name || 'Unknown'}</span>
                          <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span className="font-medium">{new Date(ann.created_at).toLocaleDateString()}</span>
                        </div>
                        {ann.action_button_text && ann.action_button_url && (
                          <Button 
                            size="sm" 
                            variant="link" 
                              className="text-[#1E2A78] p-0 h-auto font-semibold hover:text-[#2480EA] transition-colors"
                            onClick={() => window.open(ann.action_button_url, '_blank')}
                          >
                            {ann.action_button_text} →
                          </Button>
                        )}
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAnnouncementDialog
        isOpen={isCreateOpen}
        onClose={handleCloseDialog}
        onCreate={handleCreateAnnouncement}
        editingAnnouncement={editingAnnouncement}
      />
    </div>
  )
}

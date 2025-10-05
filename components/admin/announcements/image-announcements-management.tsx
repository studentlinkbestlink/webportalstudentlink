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
  Image as ImageIcon,
  Download,
  Share2,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X
} from "lucide-react"
import { SimpleImageAnnouncementDialog } from "./simple-image-announcement-dialog"
import { apiClient, type Announcement } from "@/lib/api-client"
import { useWebSocket } from "@/lib/hooks/use-websocket"

interface ImageAnnouncementsManagementProps {
  userRole: 'admin' | 'department_head'
  department?: {
    id: number
    name: string
    code: string
    type: string
  }
  showCreateButton?: boolean
  title?: string
  description?: string
}

export function ImageAnnouncementsManagement({ 
  userRole, 
  department, 
  showCreateButton = true,
  title = "Image Announcements",
  description = "Create and manage image-only announcements"
}: ImageAnnouncementsManagementProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null)
  const [viewingAnnouncement, setViewingAnnouncement] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Fetch image-only announcements from API
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiClient.getAnnouncements({ 
          status: 'all'
        })
        
        let filteredAnnouncements = result.data

        // Filter announcements based on user role and department
        if (userRole === 'department_head' && department) {
          filteredAnnouncements = filteredAnnouncements.filter((ann: Announcement) => {
            // Department heads can see:
            // 1. Announcements they created
            // 2. General announcements
            // 3. Announcements targeted to their department
            // 4. Announcements of their department type
            return ann.author.id === parseInt(localStorage.getItem('user_id') || '0') ||
                   ann.target_departments?.some((dept: any) => dept.name === department.name) ||
                   !ann.target_departments || ann.target_departments.length === 0
          })
        }
        // Admin can see all announcements (no filtering needed)
        
        setAnnouncements(filteredAnnouncements)
      } catch (error) {
        console.error('Failed to fetch announcements:', error)
        setError(error instanceof Error ? error.message : 'Failed to load announcements')
        setAnnouncements([])
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [userRole, department])

  // Real-time updates via WebSocket
  const handleAnnouncementUpdate = (data: any) => {
    console.log('📢 Real-time announcement update received:', data)
    
    if (data.type === 'announcement_created') {
      // Add new announcement to the list
      setAnnouncements(prev => [data.announcement, ...prev])
    } else if (data.type === 'announcement_updated') {
      // Update existing announcement
      setAnnouncements(prev => 
        prev.map(ann => 
          ann.id === data.announcement.id ? data.announcement : ann
        )
      )
    } else if (data.type === 'announcement_deleted') {
      // Remove deleted announcement
      setAnnouncements(prev => 
        prev.filter(ann => ann.id !== data.announcement_id)
      )
    }
  }

  // Set up WebSocket connection for real-time updates
  useWebSocket({
    onConcernUpdate: handleAnnouncementUpdate, // Reusing the same handler for now
    departmentId: department?.id,
    autoConnect: true
  })

  const handleCreateAnnouncement = async (announcement: any) => {
    console.log('🎯 ImageAnnouncementsManagement: handleCreateAnnouncement called with:', announcement)
    console.log('🔐 Auth check:', {
      token: localStorage.getItem('auth_token'),
      userId: localStorage.getItem('user_id'),
      userRole: localStorage.getItem('user_role')
    })
    
    try {
      if (editingAnnouncement) {
        // Update existing announcement
        console.log('🔄 Updating announcement ID:', editingAnnouncement.id)
        console.log('📝 Update data:', announcement)
        
        const updatedAnnouncement = await apiClient.updateAnnouncement(editingAnnouncement.id, announcement)
        console.log('✅ Update successful:', updatedAnnouncement)
        console.log('🖼️ Updated image URL:', updatedAnnouncement.image_url)
        console.log('🖼️ Updated image path:', updatedAnnouncement.image_path)
        
        setAnnouncements(announcements.map(ann => 
          ann.id === editingAnnouncement.id ? updatedAnnouncement : ann
        ))
        setEditingAnnouncement(null)
        
        // Show success message
        alert('Announcement updated successfully!')
      } else {
        // Create new announcement using simplified endpoint
        console.log('🎯 ImageAnnouncementsManagement: Creating new announcement with data:', announcement)
        const newAnnouncement = await apiClient.createAnnouncement(announcement)
        setAnnouncements([newAnnouncement, ...announcements])
      }
      setCreateOpen(false)
    } catch (error) {
      console.error('❌ Failed to save announcement:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      })
      alert(`Failed to save announcement: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    
    console.log('🔐 Auth check for delete:', {
      token: localStorage.getItem('auth_token'),
      userId: localStorage.getItem('user_id'),
      userRole: localStorage.getItem('user_role')
    })
    
    try {
      console.log('🗑️ Deleting announcement ID:', id)
      await apiClient.deleteAnnouncement(id)
      console.log('✅ Delete successful')
      
      // Update UI immediately
      setAnnouncements(announcements.filter(ann => ann.id !== id))
      
      // Show success message
      alert('Announcement deleted successfully!')
    } catch (error) {
      console.error('❌ Failed to delete announcement:', error)
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      })
      
      // Only show error if it's not a session expiration (which redirects automatically)
      if (error.status !== 401) {
        alert(`Failed to delete announcement: ${error.message || 'Unknown error'}`)
      }
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
    setViewingAnnouncement(announcement)
  }

  const handleCloseViewDialog = () => {
    setViewingAnnouncement(null)
  }

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement)
    setCreateOpen(true)
  }

  const handleCloseDialog = () => {
    setCreateOpen(false)
    setEditingAnnouncement(null)
  }

  // Filter announcements based on search and filters
  const filteredAnnouncements = announcements.filter(announcement => {
    // For image-only announcements, search by ID, internal title, or author name
    const searchText = `announcement #${announcement.id} ${announcement.internal_title || ''} ${announcement.author?.name || ''}`.toLowerCase()
    const matchesSearch = searchTerm === '' || searchText.includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || announcement.status === statusFilter
    // Remove priority and type filters since they don't exist for image-only announcements
    
    return matchesSearch && matchesStatus
  })



  const getStatusIcon = (announcement: Announcement) => {
    const now = new Date()
    const publishedAt = announcement.published_at ? new Date(announcement.published_at) : null
    const expiresAt = announcement.expires_at ? new Date(announcement.expires_at) : null
    const scheduledAt = announcement.scheduled_at ? new Date(announcement.scheduled_at) : null

    // Check if scheduled
    if (scheduledAt && scheduledAt > now) {
      return <Clock className="h-3 w-3 text-blue-500" />
    }

    // Check if expired
    if (expiresAt && expiresAt < now) {
      return <XCircle className="h-3 w-3 text-red-500" />
    }

    // Check status
    switch (announcement.status) {
      case 'published':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'draft':
        return <Clock className="h-3 w-3 text-yellow-500" />
      case 'archived':
        return <XCircle className="h-3 w-3 text-gray-500" />
      default:
        return <AlertTriangle className="h-3 w-3 text-orange-500" />
    }
  }

  const getStatusText = (announcement: Announcement) => {
    const now = new Date()
    const publishedAt = announcement.published_at ? new Date(announcement.published_at) : null
    const expiresAt = announcement.expires_at ? new Date(announcement.expires_at) : null
    const scheduledAt = announcement.scheduled_at ? new Date(announcement.scheduled_at) : null

    // Check if scheduled
    if (scheduledAt && scheduledAt > now) {
      return `Scheduled for ${scheduledAt.toLocaleDateString()}`
    }

    // Check if expired
    if (expiresAt && expiresAt < now) {
      return 'Expired'
    }

    // Check status
    switch (announcement.status) {
      case 'published':
        return 'Active'
      case 'draft':
        return 'Draft'
      case 'archived':
        return 'Archived'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (announcement: Announcement) => {
    const now = new Date()
    const publishedAt = announcement.published_at ? new Date(announcement.published_at) : null
    const expiresAt = announcement.expires_at ? new Date(announcement.expires_at) : null
    const scheduledAt = announcement.scheduled_at ? new Date(announcement.scheduled_at) : null

    // Check if scheduled
    if (scheduledAt && scheduledAt > now) {
      return 'bg-blue-100 text-blue-800'
    }

    // Check if expired
    if (expiresAt && expiresAt < now) {
      return 'bg-red-100 text-red-800'
    }

    // Check status
    switch (announcement.status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-orange-100 text-orange-800'
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
      isAuthor: announcement.author?.id === parseInt(localStorage.getItem('user_id') || '0')
    })
    
    // Temporarily make buttons always visible for debugging
    return true
    
    // Original logic (commented out for debugging)
    // if (userRole === 'admin') return true
    // if (userRole === 'department_head') {
    //   // Department heads can only edit their own announcements
    //   return announcement.author?.id === parseInt(localStorage.getItem('user_id') || '0')
    // }
    // return false
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
      isAuthor: announcement.author?.id === parseInt(localStorage.getItem('user_id') || '0')
    })
    
    // Temporarily make buttons always visible for debugging
    return true
    
    // Original logic (commented out for debugging)
    // if (userRole === 'admin') return true
    // if (userRole === 'department_head') {
    //   // Department heads can only delete their own announcements
    //   return announcement.author?.id === parseInt(localStorage.getItem('user_id') || '0')
    // }
    // return false
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#1E2A78] flex items-center">
            <ImageIcon className="h-6 w-6 mr-2" />
            {title}
          </h2>
          <p className="text-gray-600">
            {description}
            {department && ` for ${department.name}`}
          </p>
        </div>
        {showCreateButton && (
          <Button 
            onClick={() => setCreateOpen(true)} 
            className="bg-[#1E2A78] hover:bg-[#2480EA] flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Image Announcement
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-[#1E2A78]">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, ID, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#1E2A78] focus:ring-[#1E2A78]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-300 focus:border-[#1E2A78] focus:ring-[#1E2A78]">
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
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center text-[#1E2A78]">
            <Bell className="h-5 w-5 mr-2" />
            Image Announcements ({filteredAnnouncements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E2A78] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading announcements...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-2">Error loading announcements</div>
              <div className="text-sm text-muted-foreground">{error}</div>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4 border-gray-300"
              >
                Retry
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAnnouncements.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Image Announcements</h3>
                  <p className="text-sm">
                    {announcements.length === 0 
                      ? "Create your first image announcement using the button above."
                      : "No announcements match your current filters."
                    }
                  </p>
                </div>
              ) : (
                filteredAnnouncements.map((ann) => (
                  <div key={ann.id} className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-colors flex flex-col">
                    {/* Header with title and action button */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-[#1E2A78] mb-2 truncate">
                          {ann.internal_title || `Image Announcement #${ann.id}`}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getStatusColor(ann)} flex items-center gap-1 text-xs`}>
                            {getStatusIcon(ann)}
                            {getStatusText(ann)}
                          </Badge>
                          <Badge variant="outline" className="border-[#1E2A78] text-[#1E2A78] text-xs">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Image Only
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewAnnouncement(ann)}
                        className="border-gray-300 hover:border-[#1E2A78] hover:text-[#1E2A78] flex-shrink-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Image Display */}
                    <div className="mb-3 flex-1">
                      {ann.image_url && (
                        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                                  <img 
                                    src={`${ann.image_url}?t=${new Date(ann.updated_at).getTime()}`} 
                                    alt={`Image Announcement #${ann.id}`}
                                    className="w-full h-full object-cover"
                                  />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadImage(ann.id)}
                              className="bg-white/90 hover:bg-white border-gray-300 h-7 w-7 p-0"
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/90 hover:bg-white border-gray-300 h-7 w-7 p-0"
                            >
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Analytics */}
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{ann.view_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          <span>{ann.download_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          <span>{ann.share_count}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        <span>{ann.bookmark_count}</span>
                      </div>
                    </div>
                    
                    {/* Author and Date */}
                    <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="truncate">{ann.author?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {/* Action buttons for edit/delete */}
                    {(canEditAnnouncement(ann) || canDeleteAnnouncement(ann)) && (
                      <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100">
                        {canEditAnnouncement(ann) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditAnnouncement(ann)}
                            className="border-[#1E2A78] text-[#1E2A78] hover:bg-[#1E2A78] hover:text-white flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                        {canDeleteAnnouncement(ann) && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="flex-1"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SimpleImageAnnouncementDialog
        isOpen={isCreateOpen}
        onClose={handleCloseDialog}
        onCreate={handleCreateAnnouncement}
        editingAnnouncement={editingAnnouncement}
      />

      {/* View Announcement Dialog */}
      {viewingAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-[#1E2A78] truncate">
                  {viewingAnnouncement.internal_title || `Image Announcement #${viewingAnnouncement.id}`}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseViewDialog}
                  className="border-gray-300 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Image Display */}
              {viewingAnnouncement.image_url && (
                <div className="mb-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={`${viewingAnnouncement.image_url}?t=${new Date(viewingAnnouncement.updated_at).getTime()}`}
                              alt={`Image Announcement #${viewingAnnouncement.id}`}
                              className="w-full h-auto max-h-96 object-contain"
                              onError={(e) => {
                                console.error('Image failed to load:', viewingAnnouncement.image_url)
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                  </div>
                </div>
              )}
              
              {/* Announcement Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Details</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingAnnouncement)}`}>
                        {getStatusText(viewingAnnouncement)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Author:</span>
                      <span className="font-medium truncate">{viewingAnnouncement.author?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{new Date(viewingAnnouncement.created_at).toLocaleDateString()}</span>
                    </div>
                    {viewingAnnouncement.published_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published:</span>
                        <span>{new Date(viewingAnnouncement.published_at).toLocaleDateString()}</span>
                      </div>
                    )}
                    {viewingAnnouncement.expires_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span>{new Date(viewingAnnouncement.expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Analytics</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{viewingAnnouncement.view_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downloads:</span>
                      <span className="font-medium">{viewingAnnouncement.download_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shares:</span>
                      <span className="font-medium">{viewingAnnouncement.share_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bookmarks:</span>
                      <span className="font-medium">{viewingAnnouncement.bookmark_count}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image Metadata */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Image Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600">Dimensions:</span>
                    <div className="font-medium">{viewingAnnouncement.image_width} × {viewingAnnouncement.image_height}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">File Size:</span>
                    <div className="font-medium">{(viewingAnnouncement.image_size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Format:</span>
                    <div className="font-medium">{viewingAnnouncement.image_mime_type}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Filename:</span>
                    <div className="font-medium text-xs truncate">{viewingAnnouncement.image_filename}</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadImage(viewingAnnouncement.id)}
                  className="border-[#1E2A78] text-[#1E2A78] hover:bg-[#1E2A78] hover:text-white"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseViewDialog}
                  className="border-gray-300"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

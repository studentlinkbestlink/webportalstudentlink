import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, X, Image as ImageIcon, AlertCircle, Save, Send, Calendar, Clock, Trash2, Plus, Eye, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface SimpleImageAnnouncementDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (announcement: any) => void
  editingAnnouncement?: any
}

export function SimpleImageAnnouncementDialog({ 
  isOpen, 
  onClose, 
  onCreate, 
  editingAnnouncement 
}: SimpleImageAnnouncementDialogProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageErrors, setImageErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [internalTitle, setInternalTitle] = useState('')
  
  // Scheduling options
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleAction, setScheduleAction] = useState<'publish' | 'update' | 'delete'>('publish')
  
  // Expiry options
  const [hasExpiry, setHasExpiry] = useState(false)
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryTime, setExpiryTime] = useState('')
  
  // Bulk upload mode
  const [isBulkMode, setIsBulkMode] = useState(false)

  // Load editing announcement data
  useEffect(() => {
    if (editingAnnouncement) {
      // Clear any existing selections when editing
      setSelectedImages([])
      setImageErrors([])
      
      // Set image preview if editing an announcement
      if (editingAnnouncement.image_url) {
        setImagePreviews([editingAnnouncement.image_url])
      }
      // Set internal title if editing
      setInternalTitle(editingAnnouncement.internal_title || '')
      // Set expiry data if editing
      if (editingAnnouncement.expires_at) {
        setHasExpiry(true)
        const expiryDate = new Date(editingAnnouncement.expires_at)
        setExpiryDate(expiryDate.toISOString().split('T')[0])
        setExpiryTime(expiryDate.toTimeString().slice(0, 5))
      }
    } else {
      // Reset form for new announcement
      setSelectedImages([])
      setImagePreviews([])
      setImageErrors([])
      setInternalTitle('')
      setIsBulkMode(false)
      setIsScheduled(false)
      setScheduleDate('')
      setScheduleTime('')
      setScheduleAction('publish')
      setHasExpiry(false)
      setExpiryDate('')
      setExpiryTime('')
    }
  }, [editingAnnouncement, isOpen])

  const validateImage = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        resolve("Image size must be less than 10MB")
        return
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        resolve("Only JPEG, PNG, and WebP images are allowed")
        return
      }

      // Check image dimensions (optional validation)
      const img = new Image()
      img.onload = () => {
        // Optional: Check for reasonable dimensions
        if (img.width < 100 || img.height < 100) {
          resolve('Image dimensions too small (minimum 100x100 pixels)')
          return
        }
        
        if (img.width > 4000 || img.height > 4000) {
          resolve('Image dimensions too large (maximum 4000x4000 pixels)')
          return
        }
        
        resolve(null)
      }
      img.onerror = () => resolve("Invalid image file")
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const newImages: File[] = []
    const newPreviews: string[] = []
    const newErrors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = await validateImage(file)
      
      if (error) {
        newErrors[i] = error
      } else {
        newImages.push(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string)
          if (newPreviews.length === newImages.length) {
            // If editing, replace the existing image previews
            // If creating new, append to existing previews
            if (editingAnnouncement) {
              setImagePreviews(newPreviews)
            } else {
              setImagePreviews([...imagePreviews, ...newPreviews])
            }
          }
        }
        reader.readAsDataURL(file)
      }
    }

    // If editing, replace the selected images
    // If creating new, append to existing images
    if (editingAnnouncement) {
      setSelectedImages(newImages)
    } else {
      setSelectedImages([...selectedImages, ...newImages])
    }
    setImageErrors([...imageErrors, ...newErrors])
  }

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newErrors = imageErrors.filter((_, i) => i !== index)
    
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
    setImageErrors(newErrors)
  }

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const newImages: File[] = []
    const newPreviews: string[] = []
    const newErrors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const error = await validateImage(file)
      
      if (error) {
        newErrors[i] = error
      } else {
        newImages.push(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string)
          if (newPreviews.length === newImages.length) {
            setImagePreviews(newPreviews)
          }
        }
        reader.readAsDataURL(file)
      }
    }

    setSelectedImages(newImages)
    setImageErrors(newErrors)
  }

  const handleSubmit = async (publishNow = false) => {
    console.log('🎯 SimpleImageAnnouncementDialog: handleSubmit called', { 
      publishNow, 
      selectedImages: selectedImages.length, 
      imagePreviews: imagePreviews.length,
      isBulkMode,
      isScheduled 
    })
    
    // For new announcements, require at least one image
    // For editing, allow updates without new images
    if (!editingAnnouncement && selectedImages.length === 0 && imagePreviews.length === 0) {
      alert("Please select at least one image for the announcement.")
      return
    }

    if (imageErrors.some(error => error)) {
      alert("Please fix the image errors before proceeding.")
      return
    }

    if (isScheduled && (!scheduleDate || !scheduleTime)) {
      alert("Please set both date and time for scheduling.")
      return
    }

    setLoading(true)
    try {
      if (isBulkMode && selectedImages.length > 1) {
        // Bulk upload
        const bulkData = {
          images: selectedImages,
          scheduled_at: isScheduled ? `${scheduleDate}T${scheduleTime}` : undefined,
          expires_at: hasExpiry ? `${expiryDate}T${expiryTime}` : undefined,
        }
        console.log('🎯 SimpleImageAnnouncementDialog: Bulk upload data:', bulkData)
        await onCreate(bulkData)
      } else {
        // Single image upload - ensure we have all required fields
        const announcementData = {
          // Required fields for backend validation
          category: 'Student Services', // Default category
          title: internalTitle.trim() || `Image Announcement ${new Date().toLocaleDateString()}`,
          
          // Optional fields
          image: selectedImages.length > 0 ? selectedImages[0] : undefined,
          internal_title: internalTitle.trim() || undefined,
          status: publishNow ? 'published' : 'draft',
          scheduled_at: isScheduled ? `${scheduleDate}T${scheduleTime}` : undefined,
          expires_at: hasExpiry ? `${expiryDate}T${expiryTime}` : undefined,
        }
        
        console.log('🎯 SimpleImageAnnouncementDialog: Single upload data:', {
          ...announcementData,
          image: announcementData.image ? `File(${announcementData.image.name}, ${announcementData.image.size} bytes)` : null
        })
        console.log('🎯 SimpleImageAnnouncementDialog: Selected images count:', selectedImages.length)
        console.log('🎯 SimpleImageAnnouncementDialog: Editing announcement:', editingAnnouncement?.id)
        
        await onCreate(announcementData)
      }
      onClose()
    } catch (error) {
      console.error('❌ Failed to create announcement:', error)
      
      let errorMessage = 'Failed to create announcement. Please try again.'
      if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = () => handleSubmit(false)
  const handlePublishNow = () => handleSubmit(true)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-[#1E2A78]" />
            {editingAnnouncement ? "Edit Image Announcement" : "Create New Image Announcement"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Internal Title Field */}
          <div className="space-y-2">
            <Label htmlFor="internal-title">Internal Title (Optional)</Label>
            <Input
              id="internal-title"
              type="text"
              placeholder="Enter a title for internal reference..."
              value={internalTitle}
              onChange={(e) => setInternalTitle(e.target.value)}
              className="border-gray-300 focus:border-[#1E2A78] focus:ring-[#1E2A78]"
            />
            <p className="text-xs text-gray-500">
              This title is only visible to admins and departments for management purposes. It will not appear in the mobile app.
            </p>
          </div>

          {/* Upload Mode Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="bulk-mode" 
                checked={isBulkMode}
                onCheckedChange={(checked) => setIsBulkMode(checked as boolean)}
              />
              <Label htmlFor="bulk-mode">Bulk Upload Mode</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="schedule-mode" 
                checked={isScheduled}
                onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
              />
              <Label htmlFor="schedule-mode">Schedule for Later</Label>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">
                {isBulkMode ? "Upload Images *" : "Upload Image *"}
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1E2A78] transition-colors">
                {imagePreviews.length > 0 ? (
                  <div className="space-y-4">
                    {/* Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-32 object-cover rounded-lg shadow-md"
                          />
                          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveImage(index)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          {imageErrors[index] && (
                            <div className="absolute bottom-2 left-2 right-2 bg-red-100 text-red-600 text-xs p-1 rounded">
                              {imageErrors[index]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-input')?.click()}
                        className="border-[#1E2A78] text-[#1E2A78] hover:bg-[#1E2A78] hover:text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {isBulkMode ? "Add More Images" : "Change Image"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-input')?.click()}
                        className="border-[#1E2A78] text-[#1E2A78] hover:bg-[#1E2A78] hover:text-white"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isBulkMode ? "Select Multiple Images" : "Select Image"}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, WebP up to 10MB each
                      <br />
                      <span className="text-[#1E2A78] font-medium">Any aspect ratio supported (100x100 to 4000x4000 pixels)</span>
                    </p>
                  </div>
                )}
                <input
                  id="image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple={isBulkMode}
                  onChange={isBulkMode ? handleBulkUpload : handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Scheduling Options */}
          {isScheduled && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-time">Time</Label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-action">Action</Label>
                  <Select value={scheduleAction} onValueChange={(value: any) => setScheduleAction(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publish">Publish</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Expiry Date Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                id="has-expiry"
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="rounded border-gray-300 text-[#1E2A78] focus:ring-[#1E2A78]"
              />
              <Label htmlFor="has-expiry" className="text-sm font-medium text-gray-700">
                Set Expiry Date
              </Label>
            </div>
            <p className="text-xs text-gray-500">
              When enabled, the announcement will automatically be removed from the mobile app at the specified time.
            </p>
            
            {hasExpiry && (
              <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-red-600" />
                  Expiry Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input
                      id="expiry-date"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiry-time">Expiry Time</Label>
                    <Input
                      id="expiry-time"
                      type="time"
                      value={expiryTime}
                      onChange={(e) => setExpiryTime(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-red-600">
                  ⚠️ The announcement will be automatically removed from the mobile app at this time.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading} className="border-gray-300">
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSaveDraft} 
              disabled={loading}
              className="border-[#1E2A78] text-[#1E2A78] hover:bg-[#1E2A78] hover:text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
          <Button 
            onClick={handlePublishNow} 
            disabled={loading}
            className="bg-[#1E2A78] hover:bg-[#2480EA]"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Publishing..." : isScheduled ? "Schedule" : "Publish Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

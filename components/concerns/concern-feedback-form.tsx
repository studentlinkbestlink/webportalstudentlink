"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Clock, Users, MessageCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface ConcernFeedbackFormProps {
  concern: {
    id: number
    subject: string
    status: string
    resolved_at?: string
  }
  onFeedbackSubmitted?: () => void
}

export function ConcernFeedbackForm({ concern, onFeedbackSubmitted }: ConcernFeedbackFormProps) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState({
    rating: 0,
    response_time_rating: 0,
    resolution_quality_rating: 0,
    staff_courtesy_rating: 0,
    communication_rating: 0,
    feedback_text: "",
    suggestions: "",
    would_recommend: null as boolean | null,
    is_anonymous: false,
  })

  const [hoveredRating, setHoveredRating] = useState(0)

  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }))
  }

  const handleCategoryRatingChange = (category: string, rating: number) => {
    setFeedback(prev => ({ ...prev, [category]: rating }))
  }

  const handleSubmit = async () => {
    if (feedback.rating === 0) {
      alert("Please provide an overall rating")
      return
    }

    setLoading(true)
    try {
      await apiClient.submitConcernFeedback(concern.id, feedback)
      alert("Feedback submitted successfully!")
      onFeedbackSubmitted?.()
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      alert("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    hoveredRating, 
    onHoverChange, 
    size = "default" 
  }: {
    rating: number
    onRatingChange: (rating: number) => void
    hoveredRating: number
    onHoverChange: (rating: number) => void
    size?: "default" | "sm"
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onHoverChange(star)}
          onMouseLeave={() => onHoverChange(0)}
          className={`transition-colors ${
            size === "sm" ? "h-4 w-4" : "h-6 w-6"
          }`}
        >
          <Star
            className={`${
              star <= (hoveredRating || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  )

  const CategoryRating = ({ 
    label, 
    icon: Icon, 
    value, 
    onChange 
  }: {
    label: string
    icon: any
    value: number
    onChange: (rating: number) => void
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-600" />
        <Label className="text-sm font-medium">{label}</Label>
      </div>
      <StarRating
        rating={value}
        onRatingChange={onChange}
        hoveredRating={0}
        onHoverChange={() => {}}
        size="sm"
      />
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#1E2A78]" />
          Rate Your Experience
        </CardTitle>
        <div className="text-sm text-gray-600">
          Help us improve by rating your experience with concern: <strong>{concern.subject}</strong>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Overall Rating *</Label>
          <div className="flex items-center gap-4">
            <StarRating
              rating={feedback.rating}
              onRatingChange={handleRatingChange}
              hoveredRating={hoveredRating}
              onHoverChange={setHoveredRating}
            />
            {feedback.rating > 0 && (
              <Badge variant={feedback.rating >= 4 ? "default" : feedback.rating >= 3 ? "secondary" : "destructive"}>
                {feedback.rating >= 4 ? "Excellent" : feedback.rating >= 3 ? "Good" : feedback.rating >= 2 ? "Average" : "Poor"}
              </Badge>
            )}
          </div>
        </div>

        {/* Category Ratings */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Rate Specific Aspects (Optional)</Label>
          <div className="grid gap-4 md:grid-cols-2">
            <CategoryRating
              label="Response Time"
              icon={Clock}
              value={feedback.response_time_rating}
              onChange={(rating) => handleCategoryRatingChange('response_time_rating', rating)}
            />
            <CategoryRating
              label="Resolution Quality"
              icon={ThumbsUp}
              value={feedback.resolution_quality_rating}
              onChange={(rating) => handleCategoryRatingChange('resolution_quality_rating', rating)}
            />
            <CategoryRating
              label="Staff Courtesy"
              icon={Users}
              value={feedback.staff_courtesy_rating}
              onChange={(rating) => handleCategoryRatingChange('staff_courtesy_rating', rating)}
            />
            <CategoryRating
              label="Communication"
              icon={MessageCircle}
              value={feedback.communication_rating}
              onChange={(rating) => handleCategoryRatingChange('communication_rating', rating)}
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Would you recommend our service?</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant={feedback.would_recommend === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFeedback(prev => ({ ...prev, would_recommend: true }))}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              Yes
            </Button>
            <Button
              type="button"
              variant={feedback.would_recommend === false ? "destructive" : "outline"}
              size="sm"
              onClick={() => setFeedback(prev => ({ ...prev, would_recommend: false }))}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              No
            </Button>
          </div>
        </div>

        {/* Feedback Text */}
        <div className="space-y-2">
          <Label htmlFor="feedback_text">Additional Comments (Optional)</Label>
          <Textarea
            id="feedback_text"
            placeholder="Tell us more about your experience..."
            value={feedback.feedback_text}
            onChange={(e) => setFeedback(prev => ({ ...prev, feedback_text: e.target.value }))}
            rows={3}
          />
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <Label htmlFor="suggestions">Suggestions for Improvement (Optional)</Label>
          <Textarea
            id="suggestions"
            placeholder="How can we improve our service?"
            value={feedback.suggestions}
            onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Switch
            id="is_anonymous"
            checked={feedback.is_anonymous}
            onCheckedChange={(checked) => setFeedback(prev => ({ ...prev, is_anonymous: checked }))}
          />
          <Label htmlFor="is_anonymous" className="text-sm">
            Submit feedback anonymously
          </Label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={loading || feedback.rating === 0}
            className="bg-[#1E2A78] hover:bg-[#2480EA]"
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

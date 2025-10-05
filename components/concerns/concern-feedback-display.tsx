"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare, Clock, Users, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface ConcernFeedbackDisplayProps {
  concernId: number
  canViewFeedback?: boolean
}

export function ConcernFeedbackDisplay({ concernId, canViewFeedback = false }: ConcernFeedbackDisplayProps) {
  const [feedback, setFeedback] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (canViewFeedback) {
      fetchFeedback()
    }
  }, [concernId, canViewFeedback])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getConcernFeedback(concernId)
      setFeedback(response.data || [])
      setSummary(response.summary || null)
    } catch (error) {
      console.error("Failed to fetch feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating}/5</span>
    </div>
  )

  const CategoryRating = ({ label, icon: Icon, rating }: { label: string; icon: any; rating?: number }) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <Icon className="h-3 w-3 text-gray-500" />
        <span className="text-gray-600">{label}:</span>
        <StarDisplay rating={rating} />
      </div>
    )
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    if (rating >= 2) return "text-orange-600"
    return "text-red-600"
  }

  if (!canViewFeedback) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading feedback...</div>
        </CardContent>
      </Card>
    )
  }

  if (feedback.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#1E2A78]" />
            Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No feedback has been submitted for this concern yet.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1E2A78]" />
              Feedback Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1E2A78]">
                  {summary.total_feedback}
                </div>
                <div className="text-sm text-gray-600">Total Feedback</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getRatingColor(summary.average_rating)}`}>
                  {summary.average_rating?.toFixed(1) || "N/A"}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1E2A78]">
                  {summary.rating_distribution?.[5] || 0}
                </div>
                <div className="text-sm text-gray-600">5-Star Reviews</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feedback.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                {/* User Info and Overall Rating */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={item.user?.avatar} />
                      <AvatarFallback>
                        {item.is_anonymous ? "A" : item.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {item.is_anonymous ? "Anonymous User" : item.user?.name || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <StarDisplay rating={item.rating} />
                  </div>
                </div>

                {/* Category Ratings */}
                <div className="grid gap-2 md:grid-cols-2">
                  <CategoryRating
                    label="Response Time"
                    icon={Clock}
                    rating={item.response_time_rating}
                  />
                  <CategoryRating
                    label="Resolution Quality"
                    icon={ThumbsUp}
                    rating={item.resolution_quality_rating}
                  />
                  <CategoryRating
                    label="Staff Courtesy"
                    icon={Users}
                    rating={item.staff_courtesy_rating}
                  />
                  <CategoryRating
                    label="Communication"
                    icon={MessageCircle}
                    rating={item.communication_rating}
                  />
                </div>

                {/* Recommendation */}
                {item.would_recommend !== null && (
                  <div className="flex items-center gap-2">
                    {item.would_recommend ? (
                      <>
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">Would recommend</span>
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">Would not recommend</span>
                      </>
                    )}
                  </div>
                )}

                {/* Feedback Text */}
                {item.feedback_text && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm text-gray-700">{item.feedback_text}</div>
                  </div>
                )}

                {/* Suggestions */}
                {item.suggestions && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-800 mb-1">Suggestions:</div>
                    <div className="text-sm text-blue-700">{item.suggestions}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

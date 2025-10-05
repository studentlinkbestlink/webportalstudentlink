"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  MessageCircle,
  BarChart3,
  Download
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function FeedbackAnalytics() {
  const [stats, setStats] = useState<any>(null)
  const [recentFeedback, setRecentFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30")

  useEffect(() => {
    fetchFeedbackData()
  }, [timeRange])

  const fetchFeedbackData = async () => {
    try {
      setLoading(true)
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(timeRange))
      
      const [statsResponse, recentResponse] = await Promise.all([
        apiClient.getFeedbackStats({
          date_from: startDate.toISOString().split('T')[0],
          date_to: endDate.toISOString().split('T')[0]
        }),
        apiClient.getRecentFeedback(10)
      ])
      
      setStats(statsResponse)
      setRecentFeedback(recentResponse)
    } catch (error) {
      console.error("Failed to fetch feedback data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600"
    if (rating >= 3) return "text-yellow-600"
    if (rating >= 2) return "text-orange-600"
    return "text-red-600"
  }

  const getRatingBadgeVariant = (rating: number) => {
    if (rating >= 4) return "default"
    if (rating >= 3) return "secondary"
    return "destructive"
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
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1E2A78]">Feedback Analytics</h2>
          <p className="text-gray-600">Monitor user satisfaction and service quality</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-[#1E2A78]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold text-[#1E2A78]">
                  {stats?.total_feedback || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className={`text-2xl font-bold ${getRatingColor(stats?.average_rating || 0)}`}>
                  {stats?.average_rating?.toFixed(1) || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <ThumbsUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recommendation Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.recommendation_rate?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Comments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.feedback_with_text || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      {stats?.rating_distribution && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#1E2A78]" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[rating] || 0
                const percentage = stats.total_feedback > 0 ? (count / stats.total_feedback) * 100 : 0
                
                return (
                  <div key={rating} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#1E2A78] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </div>
                    <div className="text-sm text-gray-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Ratings */}
      {stats?.category_ratings && (
        <Card>
          <CardHeader>
            <CardTitle>Category Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Response Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={Math.round(stats.category_ratings.response_time || 0)} />
                  <Badge variant={getRatingBadgeVariant(stats.category_ratings.response_time || 0)}>
                    {(stats.category_ratings.response_time || 0).toFixed(1)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Resolution Quality</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={Math.round(stats.category_ratings.resolution_quality || 0)} />
                  <Badge variant={getRatingBadgeVariant(stats.category_ratings.resolution_quality || 0)}>
                    {(stats.category_ratings.resolution_quality || 0).toFixed(1)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Staff Courtesy</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={Math.round(stats.category_ratings.staff_courtesy || 0)} />
                  <Badge variant={getRatingBadgeVariant(stats.category_ratings.staff_courtesy || 0)}>
                    {(stats.category_ratings.staff_courtesy || 0).toFixed(1)}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-gray-600" />
                  <span className="font-medium">Communication</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarDisplay rating={Math.round(stats.category_ratings.communication || 0)} />
                  <Badge variant={getRatingBadgeVariant(stats.category_ratings.communication || 0)}>
                    {(stats.category_ratings.communication || 0).toFixed(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {recentFeedback.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No recent feedback available
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeedback.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">
                        {item.is_anonymous ? "Anonymous" : item.user?.name || "Unknown User"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={item.rating} />
                      <Badge variant={getRatingBadgeVariant(item.rating)}>
                        {item.rating}/5
                      </Badge>
                    </div>
                  </div>
                  
                  {item.feedback_text && (
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 mt-2">
                      {item.feedback_text}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Concern: {item.concern?.subject}</span>
                    {item.would_recommend !== null && (
                      <span className="flex items-center gap-1">
                        {item.would_recommend ? (
                          <>
                            <ThumbsUp className="h-3 w-3 text-green-600" />
                            Would recommend
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="h-3 w-3 text-red-600" />
                            Would not recommend
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

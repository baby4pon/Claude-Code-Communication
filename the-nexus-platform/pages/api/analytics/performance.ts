import { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { userId, pageUrl, metrics } = req.body

      // Store performance metrics
      const timestamp = Date.now()
      const key = `performance:${userId}:${timestamp}`
      
      await redis.setex(key, 3600, JSON.stringify({
        pageUrl,
        metrics: {
          loadTime: metrics.loadTime,
          fcp: metrics.fcp,
          lcp: metrics.lcp,
          cls: metrics.cls,
          fid: metrics.fid
        },
        timestamp
      }))

      // Update real-time analytics
      await redis.lpush('analytics:realtime', JSON.stringify({
        userId,
        pageUrl,
        timestamp,
        metrics
      }))

      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Analytics error:', error)
      res.status(500).json({ error: 'Failed to store analytics' })
    }
  } else if (req.method === 'GET') {
    try {
      const { timeRange = '1h' } = req.query
      
      // Get performance data
      const realtimeData = await redis.lrange('analytics:realtime', 0, 99)
      const analytics = realtimeData.map(data => JSON.parse(data))

      // Calculate aggregated metrics
      const aggregated = {
        totalPageViews: analytics.length,
        averageLoadTime: analytics.reduce((sum, item) => sum + item.metrics.loadTime, 0) / analytics.length,
        topPages: getTopPages(analytics),
        performanceScore: calculatePerformanceScore(analytics)
      }

      res.status(200).json({
        success: true,
        data: aggregated,
        realtime: analytics.slice(0, 20)
      })
    } catch (error) {
      console.error('Analytics fetch error:', error)
      res.status(500).json({ error: 'Failed to fetch analytics' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}

function getTopPages(analytics: any[]) {
  const pageViews = analytics.reduce((acc, item) => {
    acc[item.pageUrl] = (acc[item.pageUrl] || 0) + 1
    return acc
  }, {})

  return Object.entries(pageViews)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([url, views]) => ({ url, views }))
}

function calculatePerformanceScore(analytics: any[]) {
  if (analytics.length === 0) return 0
  
  const avgMetrics = analytics.reduce((sum, item) => ({
    loadTime: sum.loadTime + item.metrics.loadTime,
    fcp: sum.fcp + item.metrics.fcp,
    lcp: sum.lcp + item.metrics.lcp,
    cls: sum.cls + item.metrics.cls
  }), { loadTime: 0, fcp: 0, lcp: 0, cls: 0 })

  Object.keys(avgMetrics).forEach(key => {
    avgMetrics[key] = avgMetrics[key] / analytics.length
  })

  // Calculate score based on Core Web Vitals
  let score = 100
  if (avgMetrics.lcp > 2500) score -= 20
  if (avgMetrics.fcp > 1800) score -= 20
  if (avgMetrics.cls > 0.1) score -= 20
  if (avgMetrics.loadTime > 3000) score -= 20

  return Math.max(0, score)
}
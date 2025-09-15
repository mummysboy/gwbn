import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/aws-services';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';
    
    if (type === 'dashboard') {
      // Get today's stats and recent activities
      const [todayStats, recentActivities] = await Promise.all([
        AnalyticsService.getTodayStats(),
        AnalyticsService.getRecentActivities()
      ]);
      
      // Update daily stats if not available
      const stats = todayStats || await AnalyticsService.updateDailyStats();
      
      return NextResponse.json({
        success: true,
        stats: {
          totalArticles: stats.articlesPublished,
          publishedToday: stats.articlesPublished,
          totalViews: stats.totalViews,
          systemHealth: stats.systemHealth,
        },
        recentActivities
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Analytics endpoint ready'
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// POST /api/analytics - Update analytics data
export async function POST() {
  try {
    const updatedStats = await AnalyticsService.updateDailyStats();
    
    return NextResponse.json({
      success: true,
      stats: updatedStats
    });
    
  } catch (error) {
    console.error('Error updating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    );
  }
}

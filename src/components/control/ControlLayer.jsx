import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import QuarterlyPlannerView from './QuarterlyPlannerView'
import WeeklyPlannerView from './WeeklyPlannerView'
import DailyPlannerView from './DailyPlannerView'

export default function ControlLayer() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'quarterly'
  const [activeTab, setActiveTab] = useState(initialTab) // 'quarterly', 'weekly', 'daily'
  const [loading, setLoading] = useState(true)
  const [weeklyPlans, setWeeklyPlans] = useState([])
  const [dailyPlans, setDailyPlans] = useState([])

  useEffect(() => {
    loadControlData()
  }, [])

  const loadControlData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Load all weekly and daily plans in parallel
      const [weeklyResult, dailyResult] = await Promise.all([
        supabase
          .from('weekly_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('week_start', { ascending: false }),
        supabase
          .from('daily_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
      ])

      setWeeklyPlans(weeklyResult.data || [])
      setDailyPlans(dailyResult.data || [])
    } catch (error) {
      console.error('Error loading control data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-control-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-ink mb-2">Control Layer</h1>
          <p className="text-lg text-ink-light">Master multi-scale planning and organization</p>
        </div>
        <div className="w-24 h-24 rounded-full border-8 border-cream-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-ink">
              {weeklyPlans.length}
            </div>
            <div className="text-xs text-ink-light">weeks</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Multi-Scale Planning: Quarterly → Weekly → Daily */}
      <div className="flex gap-2 mb-8 border-b border-cream-300">
        <button
          onClick={() => setActiveTab('quarterly')}
          className={`px-6 py-3 font-medium transition-colors relative cursor-pointer ${
            activeTab === 'quarterly'
              ? 'text-control-primary'
              : 'text-ink-light hover:text-ink'
          }`}
        >
          Quarterly
          {activeTab === 'quarterly' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-control"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-6 py-3 font-medium transition-colors relative cursor-pointer ${
            activeTab === 'weekly'
              ? 'text-control-primary'
              : 'text-ink-light hover:text-ink'
          }`}
        >
          Weekly
          {activeTab === 'weekly' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-control"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('daily')}
          className={`px-6 py-3 font-medium transition-colors relative cursor-pointer ${
            activeTab === 'daily'
              ? 'text-control-primary'
              : 'text-ink-light hover:text-ink'
          }`}
        >
          Daily
          {activeTab === 'daily' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 gradient-control"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'quarterly' && (
          <QuarterlyPlannerView onUpdate={loadControlData} />
        )}
        {activeTab === 'weekly' && (
          <WeeklyPlannerView
            weeklyPlans={weeklyPlans}
            onUpdate={loadControlData}
          />
        )}
        {activeTab === 'daily' && (
          <DailyPlannerView
            dailyPlans={dailyPlans}
            onUpdate={loadControlData}
          />
        )}
      </div>
    </div>
  )
}

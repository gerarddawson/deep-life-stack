import { useState } from 'react'

export default function LandingPage({ onGetStarted }) {
  const [showAuth, setShowAuth] = useState(false)

  const layers = [
    {
      name: 'Discipline',
      duration: '15 Days',
      icon: '📚',
      color: 'discipline',
      description: 'Build foundational habits through keystone routines. Track daily progress and establish unwavering discipline.',
      features: ['3 Keystone Habits', 'Daily Tracking', 'Streak Counter', 'Progress Analytics']
    },
    {
      name: 'Values',
      duration: '30 Days',
      icon: '⚖️',
      color: 'values',
      description: 'Define your core values and create meaningful rituals. Craft your personal code to guide decisions.',
      features: ['Core Values', 'Value-Aligned Rituals', 'Personal Code', 'Reflection Tools']
    },
    {
      name: 'Control',
      duration: '30 Days',
      icon: '📋',
      color: 'control',
      description: 'Master multi-scale planning from daily time-blocking to weekly priorities. Organize your life systems.',
      features: ['Weekly Planning', 'Daily Time Blocks', 'Household Systems', 'Automation Tracking']
    },
    {
      name: 'Vision',
      duration: '45 Days',
      icon: '🎯',
      color: 'vision',
      description: 'Design your remarkable life. Break down transformative goals into achievable milestones.',
      features: ['Life Aspects', 'Milestone Tracking', 'Small & Large Overhauls', 'Progress Visualization']
    }
  ]

  const benefits = [
    {
      title: 'Structured Transformation',
      description: 'Follow Cal Newport\'s proven 4-month framework for meaningful life change.',
      icon: '🏛️'
    },
    {
      title: 'Daily Guidance',
      description: 'Clear daily actions and prompts keep you on track without overwhelming complexity.',
      icon: '📖'
    },
    {
      title: 'Progress Tracking',
      description: 'Visual dashboards show your journey progress and celebrate milestones achieved.',
      icon: '📊'
    },
    {
      title: 'Holistic Approach',
      description: 'Address all aspects of life: habits, values, planning, and long-term vision.',
      icon: '🌟'
    }
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-discipline-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-vision-primary rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-display font-bold text-ink mb-6">
              The Deep Life Stack
            </h1>
            <p className="text-2xl text-ink-light mb-4">
              Cal Newport's 4-Month Framework for Life Transformation
            </p>
            <p className="text-lg text-ink-light/80 max-w-2xl mx-auto mb-8">
              A systematic approach to building discipline, clarifying values, mastering control,
              and designing a remarkable life. Transform yourself in 120 days.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-discipline-primary to-vision-primary text-white rounded-xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg"
            >
              Start Your Journey
            </button>
          </div>

          {/* Journey Timeline */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="text-4xl font-bold text-ink">120</div>
              <div className="text-sm text-ink-light">Days</div>
            </div>
            <div className="text-ink-light">→</div>
            <div className="text-center">
              <div className="text-4xl font-bold text-ink">4</div>
              <div className="text-sm text-ink-light">Layers</div>
            </div>
            <div className="text-ink-light">→</div>
            <div className="text-center">
              <div className="text-4xl font-bold text-ink">∞</div>
              <div className="text-sm text-ink-light">Transformation</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Four Layers */}
      <section className="py-20 bg-gradient-to-b from-cream-50 to-parchment-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-ink mb-4">
              The Four Layers
            </h2>
            <p className="text-lg text-ink-light max-w-2xl mx-auto">
              Each layer builds upon the previous, creating a solid foundation for lasting change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {layers.map((layer, index) => (
              <div
                key={layer.name}
                className="card p-8 hover:shadow-xl transition-all relative overflow-hidden group"
              >
                {/* Layer number badge */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-cream-200 flex items-center justify-center text-ink font-bold text-lg">
                  {index + 1}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-xl gradient-${layer.color} flex items-center justify-center text-3xl`}>
                    {layer.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-ink mb-1">{layer.name}</h3>
                    <p className="text-sm font-medium text-ink-light">{layer.duration}</p>
                  </div>
                </div>

                <p className="text-ink-light mb-4 leading-relaxed">
                  {layer.description}
                </p>

                <div className="space-y-2">
                  {layer.features.map(feature => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${layer.color}-primary`}></div>
                      <span className="text-ink-light">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-parchment-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-ink mb-4">
              Why the Deep Life Stack?
            </h2>
            <p className="text-lg text-ink-light max-w-2xl mx-auto">
              More than just a productivity tool—it's a complete system for intentional living.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(benefit => (
              <div key={benefit.title} className="card p-6 text-center hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-ink mb-3">{benefit.title}</h3>
                <p className="text-sm text-ink-light leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-cream-50">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-ink mb-4">
              How It Works
            </h2>
          </div>

          <div className="space-y-12">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-discipline-primary text-white flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink mb-2">Start with Discipline</h3>
                <p className="text-ink-light leading-relaxed">
                  Begin by establishing 3 keystone habits. Track them daily for 15 days to build
                  the foundation of discipline needed for the rest of your journey.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-values-primary text-white flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink mb-2">Clarify Your Values</h3>
                <p className="text-ink-light leading-relaxed">
                  Define what matters most. Create rituals aligned with your values and write
                  your personal code—principles that guide your decisions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-control-primary text-white flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink mb-2">Take Control</h3>
                <p className="text-ink-light leading-relaxed">
                  Master multi-scale planning. Weekly themes and big rocks. Daily time-blocking
                  and priorities. Household systems and automations.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-vision-primary text-white flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-ink mb-2">Design Your Vision</h3>
                <p className="text-ink-light leading-relaxed">
                  Define the remarkable aspects of your life. Break down transformations into
                  milestones. Track progress toward your most ambitious goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-discipline-primary via-values-primary to-vision-primary">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-white mb-6">
            Ready to Build Your Deep Life?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join others on the path to intentional, meaningful living.
            Your 120-day transformation starts today.
          </p>
          <button
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-ink rounded-xl font-semibold text-xl hover:scale-105 transition-transform shadow-2xl"
          >
            Begin Your Journey
          </button>
          <p className="text-white/80 text-sm mt-6">
            Free to start • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-ink text-cream-50">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-sm">
            Based on Cal Newport's Deep Life framework • Built for intentional living
          </p>
        </div>
      </footer>
    </div>
  )
}

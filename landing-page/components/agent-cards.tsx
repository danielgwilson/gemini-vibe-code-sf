import { Card } from "@/components/ui/card"
import { Lightbulb, Search, Calendar } from "lucide-react"

const agents = [
  {
    name: "Ida",
    role: "The Idea Agent",
    icon: Lightbulb,
    description: "Your podcast idea generator and content strategist",
    features: [
      "Generates podcast ideas from themes for different timelines",
      "Recommends ideas based on follower growth and ROI",
      "Creates actionable episode plans focused on your niche",
      "Helps you decide which ideas to pursue",
      "Transforms themes into concrete episode concepts",
    ],
    gradient: "from-chart-1 to-chart-2",
    iconBg: "bg-chart-1/15",
    iconColor: "text-chart-1",
  },
  {
    name: "Astra",
    role: "The Research Agent",
    icon: Search,
    description: "Your research and validation specialist using Firecrawl",
    features: [
      "Researches competitors using Firecrawl web search",
      "Validates if your podcast topics are unique and relevant",
      "Identifies market trends and content gaps",
      "Compares your ideas against competitor content",
      "Provides data-driven validation for podcast ideas",
    ],
    gradient: "from-chart-4 to-chart-5",
    iconBg: "bg-chart-4/15",
    iconColor: "text-chart-4",
  },
  {
    name: "Ember",
    role: "The Calendar Agent",
    icon: Calendar,
    description: "Your Google Calendar organizer and production coordinator",
    features: [
      "Organizes podcast episodes in Google Calendar",
      "Creates production schedules with tasks for each episode",
      "Plans episode calendar based on your availability",
      "Sets up episode tasks and deadlines",
      "Coordinates workflow between planning, recording, and publishing",
    ],
    gradient: "from-chart-3 to-chart-2",
    iconBg: "bg-chart-3/15",
    iconColor: "text-chart-3",
  },
]

export function AgentCards() {
  return (
    <section id="agents" className="py-20 px-4 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-balance tracking-tight">
            Meet your <span className="text-gradient-gemini">AI podcast team</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance font-medium">
            Three specialized agents working together to bring your podcast vision to life
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon
            return (
              <Card
                key={agent.name}
                className="p-8 glass-strong hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] border-border/50"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div
                      className={`inline-flex p-3 rounded-2xl ${agent.iconBg} ${agent.iconColor} shadow-lg border border-current/10`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{agent.name}</h3>
                      <p
                        className={`text-sm font-semibold bg-gradient-to-r ${agent.gradient} bg-clip-text text-transparent`}
                      >
                        {agent.role}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed font-medium">{agent.description}</p>

                  <ul className="space-y-3">
                    {agent.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${agent.gradient} mt-2 flex-shrink-0 shadow-sm`}
                        />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

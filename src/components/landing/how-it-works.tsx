export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Generate Podcast Ideas',
      description:
        'Get podcast ideas from themes based on different timelines and frequencies. Receive recommendations based on follower growth, retention, niche focus, and ROI.',
      gradient: 'from-chart-2 to-chart-5',
    },
    {
      number: '02',
      title: 'Research & Validate',
      description:
        "Use Firecrawl to research competitors and validate your podcast topics. Identify what's relevant, unique, and needs more specificity in the market.",
      gradient: 'from-chart-4 to-primary',
    },
    {
      number: '03',
      title: 'Organize in Google Calendar',
      description:
        'Organize your podcast episodes and tasks in Google Calendar. Execute plans for each episode with specific tasks, scheduled based on your availability.',
      gradient: 'from-accent to-chart-1',
    },
    {
      number: '04',
      title: 'Launch & Grow',
      description:
        'Publish consistently with your AI team supporting you every step. Come back anytime you need help with ideas, research, or scheduling.',
      gradient: 'from-primary to-chart-3',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-balance">
            From idea to{' '}
            <span className="bg-gradient-to-r from-primary via-chart-4 to-accent bg-clip-text text-transparent">
              published
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Your AI team guides you through every stage of podcast creation
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex gap-6 glass-strong p-6 rounded-2xl hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                >
                  <span className="text-2xl font-bold text-white">
                    {step.number}
                  </span>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

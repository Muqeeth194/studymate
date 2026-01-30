const steps = [
  {
    step: 1,
    title: "Set Your Preferences",
    description:
      "Tell us what you want to learn, your skill level, and your goals.",
  },
  {
    step: 2,
    title: "Get Your Custom Roadmap",
    description:
      "Our AI generates a unique week-by-week learning plan just for you.",
  },
  {
    step: 3,
    title: "Learn & Interact",
    description:
      "Follow your plan, take adaptive quizzes, and chat with your AI tutor.",
  },
  {
    step: 4,
    title: "Track Your Progress",
    description:
      "Watch your knowledge grow with detailed analytics and achievements.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your study habits with a simple, intuitive process.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-10 bottom-10 w-px bg-border -translate-x-1/2 hidden md:block"></div>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`flex items-start gap-6 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-shrink-0 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center font-bold text-xl font-headline">
                  {step.step}
                </div>
                <div
                  className={`space-y-2 ${index % 2 === 1 ? "md:text-right" : ""}`}
                >
                  <h3 className="font-bold text-xl font-headline">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

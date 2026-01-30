import { Card } from "@/components/ui/card";
import { Sparkles, MessageSquareText, TrendingUp, Target } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "Personalized Roadmaps",
    description:
      "AI-generated learning paths tailored to your specific goals, adjusting to your pace and skill level.",
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Adaptive Quizzes",
    description:
      "Test your knowledge with dynamic quizzes that validate your understanding before moving forward.",
  },
  {
    icon: <MessageSquareText className="h-8 w-8 text-primary" />,
    title: "Interactive AI Tutor",
    description:
      "Chat with a smart study buddy to get instant clarifications, examples, and deep explanations on any topic.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Performance Analytics",
    description:
      "Visualize your growth with detailed insights into your study time, quiz scores, and topic mastery.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
            Everything You Need to Master Any Subject
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive suite of tools designed to make your learning
            journey structured, engaging, and measurable.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 text-left bg-secondary rounded-xl border hover:shadow-md transition-shadow duration-200"
            >
              <div className="mb-4 bg-background w-fit p-3 rounded-lg shadow-sm">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg font-headline mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

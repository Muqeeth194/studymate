import { Card } from "@/components/ui/card";
import { Sparkles, Mic, FileText, Target } from "lucide-react";

const features = [
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "Personalized Roadmaps",
    description: "AI-generated learning paths tailored to your skill level, goals, and available time.",
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: "Voice-First Learning",
    description: "Engage in natural, conversational Q&A and receive spoken explanations from your AI tutor.",
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Document-Aware Study",
    description: "Upload your textbooks and notes to create study plans and quizzes based on your material.",
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Adaptive Quizzes",
    description: "Test your knowledge with quizzes that adapt in difficulty based on your performance.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">Get Started in Minutes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your study habits with a simple, intuitive process.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 text-left bg-secondary rounded-xl border">
               <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg font-headline mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-image");

  return (
    <section className="py-8 md:py-12 relative overflow-hidden">
      {/* Responsive background blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[600px] md:w-[800px] h-[300px] md:h-[500px] bg-primary/5 blur-[60px] md:blur-[100px] rounded-full -z-10" />

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center px-4 sm:px-6 lg:px-8">
        {/* Left Column: Text Content */}
        <div className="space-y-6 md:space-y-8 text-center md:text-left order-2 md:order-1">
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight leading-tight">
            Master Any Topic with <br className="hidden lg:block" />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Live Research Agents
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg md:mx-0 mx-auto leading-relaxed">
            Stop learning from outdated data. StudyMate AI builds personalized
            curriculums using <strong>live web search</strong>, official docs,
            and adaptive quizzes to help you master skills faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full sm:w-auto">
            <Button
              size="lg"
              className="h-14 px-8 text-md shadow-xl shadow-primary/20 w-full sm:w-auto"
              asChild
            >
              <Link href="/sign-up">
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-md w-full sm:w-auto"
              asChild
            >
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          {/* Feature Pills - Added flex-wrap for mobile */}
          <div className="pt-4 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Live Web Access</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Custom Roadmaps</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Adaptive Quizzes</span>
            </div>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="relative group order-1 md:order-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-card">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt="AI Agent researching a topic on a modern dashboard"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                data-ai-hint={heroImage.imageHint}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

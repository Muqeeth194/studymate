import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export const Hero = () => {
  const heroImage = PlaceHolderImages.find((img) => img.id === "hero-image");

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tighter">
            Master Any Topic with Your Personal AI Companion
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg md:mx-0 mx-auto">
            StudyVerse AI creates personalized learning roadmaps, adaptive quizzes, and voice-based lessons to help you achieve your goals faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" asChild>
              <Link href="/sign-up">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
          {heroImage && (
             <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
        </div>
      </div>
    </section>
  );
};

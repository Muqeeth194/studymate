"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Code, Layers, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const totalSteps = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Centralized State for Form Data
  const [formData, setFormData] = useState({
    topic: "",
    level: "beginner",
    totalDurationWeeks: 4, // Default to 4 weeks
    projectScope: "small", // Default preference
    goals: "",
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 2. Submit Data to Backend
  const handleFinish = async () => {
    if (!formData.topic) {
      toast({
        title: "Missing Information",
        description: "Please enter a topic to learn.",
        variant: "destructive",
      });
      return;
    }

    // console.log("form data:", formData);

    setIsGenerating(true);

    try {
      const response = await fetch("/api/courses/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to generate course");

      const data = await response.json();

      toast({
        title: "Roadmap Generated!",
        description: "Redirecting you to your new learning path...",
      });

      // Redirect to the specific course page
      router.push(`/dashboard/course/${data.courseId}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong while generating your roadmap.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex items-center justify-center min-h-full p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="font-headline text-2xl">
            {
              [
                "What do you want to learn?",
                "What's your current skill level?",
                "How long do you want this course to last?",
                "How do you want to build projects?",
                "What are your learning goals?",
              ][currentStep - 1]
            }
          </CardTitle>
          <CardDescription>
            Step {currentStep} of {totalSteps}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[250px]">
          {/* STEP 1: TOPIC */}
          {currentStep === 1 && (
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., React, Python, Machine Learning"
                value={formData.topic}
                onChange={(e) => updateField("topic", e.target.value)}
              />
            </div>
          )}

          {/* STEP 2: LEVEL */}
          {currentStep === 2 && (
            <RadioGroup
              value={formData.level}
              onValueChange={(val) => updateField("level", val)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner">Beginner</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate">Intermediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced">Advanced</Label>
              </div>
            </RadioGroup>
          )}

          {/* STEP 3: TOTAL DURATION (WEEKS) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Label>Total Duration</Label>
                <span className="text-xl font-bold text-primary">
                  {formData.totalDurationWeeks} Weeks
                </span>
              </div>

              <Slider
                value={[formData.totalDurationWeeks]}
                onValueChange={(vals) =>
                  updateField("totalDurationWeeks", vals[0])
                }
                max={24}
                min={1}
                step={1}
                className="py-4"
              />
              <p className="text-sm text-muted-foreground text-center">
                We will structure the roadmap to fit exactly{" "}
                {formData.totalDurationWeeks} weeks.
              </p>
            </div>
          )}

          {/* STEP 4: PROJECT SCOPE */}
          {currentStep === 4 && (
            <RadioGroup
              value={formData.projectScope}
              onValueChange={(val) => updateField("projectScope", val)}
              className="grid gap-4"
            >
              {/* Option 1: Small */}
              <Label
                htmlFor="small"
                className={cn(
                  "flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer",
                  formData.projectScope === "small" && "border-primary",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RadioGroupItem
                    value="small"
                    id="small"
                    className="sr-only"
                  />
                  <Code className="h-5 w-5 text-primary" />
                  <div className="font-semibold">Small & Focused</div>
                </div>
                <div className="text-sm text-muted-foreground pl-7">
                  Build tiny, isolated mini-apps each week (e.g., Todo List,
                  Calculator). Best for learning syntax.
                </div>
              </Label>

              {/* Option 2: Capstone */}
              <Label
                htmlFor="capstone"
                className={cn(
                  "flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer",
                  formData.projectScope === "capstone" && "border-primary",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RadioGroupItem
                    value="capstone"
                    id="capstone"
                    className="sr-only"
                  />
                  <Layers className="h-5 w-5 text-primary" />
                  <div className="font-semibold">One Big Capstone</div>
                </div>
                <div className="text-sm text-muted-foreground pl-7">
                  Build one large, complex application that grows every week
                  (e.g., E-commerce site). Best for portfolios.
                </div>
              </Label>

              {/* Option 3: Real World */}
              <Label
                htmlFor="real-world"
                className={cn(
                  "flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer",
                  formData.projectScope === "real-world" && "border-primary",
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RadioGroupItem
                    value="real-world"
                    id="real-world"
                    className="sr-only"
                  />
                  <Briefcase className="h-5 w-5 text-primary" />
                  <div className="font-semibold">Real-world Clones</div>
                </div>
                <div className="text-sm text-muted-foreground pl-7">
                  Recreate specific features from popular apps (e.g., Netflix
                  slider, Trello board).
                </div>
              </Label>
            </RadioGroup>
          )}

          {/* STEP 5: GOALS */}
          {currentStep === 5 && (
            <div className="space-y-2">
              <Label htmlFor="goals">Goals</Label>
              <Input
                id="goals"
                placeholder="e.g., Pass an exam, build a project"
                value={formData.goals}
                onChange={(e) => updateField("goals", e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isGenerating}
          >
            Back
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleFinish} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                "Generate My Roadmap"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

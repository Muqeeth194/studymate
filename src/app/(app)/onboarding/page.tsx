"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const totalSteps = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [date, setDate] = useState<Date>();

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

  const handleFinish = () => {
    // Here you would typically submit the form data
    router.push("/dashboard");
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex items-center justify-center min-h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="font-headline text-2xl">
            {
              [
                "What do you want to learn?",
                "What's your current skill level?",
                "Your weekly time commitment?",
                "What's your target date?",
                "What's your learning style?",
                "What are your learning goals?",
                "Upload study materials (Optional)",
              ][currentStep - 1]
            }
          </CardTitle>
          <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[250px]">
          {currentStep === 1 && (
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" placeholder="e.g., React, Python, Machine Learning" />
            </div>
          )}
          {currentStep === 2 && (
             <RadioGroup defaultValue="beginner" className="space-y-2">
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
          {currentStep === 3 && (
            <div className="space-y-4">
                <Label>Hours per week: 20</Label>
                <Slider defaultValue={[20]} max={40} min={1} step={1} />
            </div>
          )}
           {currentStep === 4 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          {currentStep === 5 && (
            <RadioGroup defaultValue="mixed" className="space-y-2">
                <div className="flex items-center space-x-2"><RadioGroupItem value="visual" id="visual" /><Label htmlFor="visual">Visual</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="reading" id="reading" /><Label htmlFor="reading">Reading</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="hands-on" id="hands-on" /><Label htmlFor="hands-on">Hands-on</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="mixed" id="mixed" /><Label htmlFor="mixed">Mixed</Label></div>
            </RadioGroup>
          )}
          {currentStep === 6 && (
            <div className="space-y-2">
                <Label htmlFor="goals">Goals</Label>
                <Input id="goals" placeholder="e.g., Pass an exam, build a project" />
            </div>
          )}
          {currentStep === 7 && (
            <div className="flex items-center justify-center w-full">
                <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-border border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF, DOCX (MAX. 800MB)</p>
                    </div>
                    <Input id="dropzone-file" type="file" className="hidden" />
                </Label>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleFinish}>Generate My Roadmap</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

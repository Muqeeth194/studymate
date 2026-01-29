"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- Interfaces ---
interface Question {
  question: string;
  options: string[];
}

interface QuizResultDetail {
  questionIndex: number;
  isCorrect: boolean;
  userSelected: string;
  correctAnswer: string;
  explanation: string;
}

interface QuizResult {
  passed: boolean;
  score: number;
  results: QuizResultDetail[];
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { courseId, topicId } = params as { courseId: string; topicId: string };

  // State
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // 1. Fetch Quiz Data on Mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(
          `/api/courses/${courseId}/topics/${topicId}/quiz/generate`,
          { method: "POST" }, // Using POST to trigger gen or fetch existing
        );

        if (!res.ok) throw new Error("Failed to load quiz");

        const data = await res.json();

        console.log("quiz data response:", data);

        if (data.quiz && Array.isArray(data.quiz)) {
          setQuestions(data.quiz);
        } else {
          throw new Error("Invalid quiz format");
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not load the quiz. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [courseId, topicId]);

  // 2. Handle Option Selection
  const handleOptionSelect = (option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: option,
    }));
  };

  // 3. Handle Next / Submit
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    try {
      // Format answers as array matching question index
      const formattedAnswers = questions.map(
        (_, index) => answers[index] || "",
      );

      const res = await fetch(
        `/api/courses/${courseId}/topics/${topicId}/quiz/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userAnswers: formattedAnswers }),
        },
      );

      if (!res.ok) throw new Error("Failed to submit quiz");

      const resultData = await res.json();
      setQuizResult(resultData);

      if (resultData.passed) {
        toast({
          title: "Congratulations! 🎉",
          description: "You passed the quiz and unlocked the next topic.",
          className: "bg-green-600 text-white border-none",
        });
      } else {
        toast({
          title: "Keep Trying!",
          description:
            "You didn't reach the passing score. Review the material and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong submitting your answers.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Loading Quiz...</h2>
        <p className="text-gray-500">Preparing your questions</p>
      </div>
    );
  }

  // --- Results View ---
  if (quizResult) {
    return (
      <div className="h-[calc(100vh-2rem)] bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Result Header Card */}
          <Card
            className={cn(
              "border-t-4 shadow-md",
              quizResult.passed ? "border-t-green-500" : "border-t-red-500",
            )}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                {quizResult.passed ? (
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold">
                {quizResult.passed ? "Quiz Passed!" : "Quiz Failed"}
              </CardTitle>
              <p className="text-muted-foreground">
                You scored{" "}
                <span className="font-bold text-foreground">
                  {quizResult.score}%
                </span>
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {quizResult.passed
                  ? "Great job! You've demonstrated a solid understanding of this topic. You can now move on to the next lesson."
                  : "You need a score of 70% to pass. Review the explanations below to understand where you went wrong, then try again."}
              </p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 pt-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/course/${courseId}`)}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Back to Roadmap
              </Button>
              {!quizResult.passed && (
                <Button onClick={() => window.location.reload()}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry Quiz
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Detailed Review */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 ml-1">
              Answer Review
            </h3>
            {quizResult.results.map((result, idx) => (
              <Card
                key={idx}
                className={cn(
                  "border-l-4",
                  result.isCorrect ? "border-l-green-500" : "border-l-red-500",
                )}
              >
                <CardHeader className="py-4">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="font-medium text-gray-900 leading-snug">
                      {questions[idx]?.question}
                    </h4>
                  </div>
                </CardHeader>
                <CardContent className="pb-4 pt-0 pl-12 space-y-3">
                  {/* User Selection */}
                  <div className="text-sm">
                    <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
                      Your Answer:
                    </span>
                    <div
                      className={cn(
                        "mt-1 p-2 rounded-md font-medium flex items-center gap-2",
                        result.isCorrect
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200",
                      )}
                    >
                      {result.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {result.userSelected}
                    </div>
                  </div>

                  {/* Correct Answer (if wrong) */}
                  {!result.isCorrect && (
                    <div className="text-sm">
                      <span className="font-semibold text-gray-500 text-xs uppercase tracking-wide">
                        Correct Answer:
                      </span>
                      <div className="mt-1 p-2 rounded-md bg-gray-100 text-gray-800 font-medium border border-gray-200">
                        {result.correctAnswer}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  <div className="bg-blue-50/50 p-3 rounded-md text-sm text-blue-800">
                    <span className="font-semibold block mb-1 text-blue-900">
                      Explanation:
                    </span>
                    {result.explanation}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Quiz Taking View ---
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center py-6 px-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="font-medium text-blue-600">
              {Math.round(progress)}% Completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-t-4 border-t-blue-600 shadow-lg">
          <CardHeader className="pb-2">
            <Badge
              variant="outline"
              className="w-fit mb-4 bg-blue-50 text-blue-700 border-blue-200"
            >
              Multiple Choice
            </Badge>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {currentQuestion?.question}
            </h2>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {currentQuestion?.options.map((option, idx) => {
              const isSelected = answers[currentQuestionIndex] === option;
              return (
                <div
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={cn(
                    "p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 group hover:shadow-sm",
                    isSelected
                      ? "border-blue-600 bg-blue-50/50"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50",
                  )}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "border-blue-600"
                        : "border-gray-300 group-hover:border-blue-400",
                    )}
                  >
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-blue-900" : "text-gray-700",
                    )}
                  >
                    {option}
                  </span>
                </div>
              );
            })}
          </CardContent>

          <CardFooter className="pt-4 pb-6 flex justify-between items-center border-t bg-gray-50/50">
            <Button
              variant="ghost"
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestionIndex] || isSubmitting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {currentQuestionIndex === questions.length - 1
                ? "Submit Quiz"
                : "Next Question"}
              {!isSubmitting && <ChevronRight className="h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

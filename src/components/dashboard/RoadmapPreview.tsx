import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const roadmapData = [
    { week: 1, title: "Foundations of React", status: "completed", topics: ["JSX & Components", "Props & State"] },
    { week: 2, title: "React Hooks", status: "active", topics: ["useState & useEffect", "useContext", "Custom Hooks"] },
    { week: 3, title: "Advanced React Patterns", status: "upcoming", topics: ["Higher-Order Components", "Render Props"] },
    { week: 4, title: "State Management", status: "upcoming", topics: ["Redux Toolkit", "Zustand"] },
]

export const RoadmapPreview = () => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="font-headline">Your Learning Roadmap: React</CardTitle>
                    <CardDescription>A week-by-week plan to achieve your goals.</CardDescription>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/roadmap">View Full Roadmap</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {roadmapData.map(week => (
                        <div key={week.week} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                {week.status === 'completed' && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                                {week.status === 'active' && <Radio className="h-6 w-6 text-primary animate-pulse" />}
                                {week.status === 'upcoming' && <Circle className="h-6 w-6 text-muted-foreground" />}
                                {week.week < roadmapData.length && <div className="w-px h-full bg-border my-2"></div>}
                            </div>
                            <div>
                                <h4 className="font-semibold">Week {week.week}: {week.title}</h4>
                                <p className="text-sm text-muted-foreground">{week.topics.join(", ")}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

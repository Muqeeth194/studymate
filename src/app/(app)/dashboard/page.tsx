import { StatCard } from "@/components/dashboard/StatCard";
import { RoadmapPreview } from "@/components/dashboard/RoadmapPreview";
import { BarChart, Book, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold font-headline">Welcome Back, Alex!</h2>
                <p className="text-muted-foreground">Let's continue your journey to master React.</p>
            </div>
            <Button size="lg">Continue Learning</Button>
        </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall Progress" value="25%" icon={<BarChart />} />
        <StatCard title="Current Topic" value="useState Hook" icon={<Book />} />
        <StatCard title="Avg. Quiz Score" value="88%" icon={<Target />} />
        <StatCard title="Achievements" value="3" icon={<Trophy />} />
      </div>

      <RoadmapPreview />
    </div>
  );
}

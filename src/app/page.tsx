import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-xl mx-auto bg-card text-card-foreground rounded-2xl shadow-xl overflow-hidden">
        <Header />
        <main>
          <Hero />
          <Features />
        </main>
        <Footer />
      </div>
    </div>
  );
}

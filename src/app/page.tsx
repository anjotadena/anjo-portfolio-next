import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div>
      <Header />
      <main className="container mx-auto py-12">
        <h1 className="text-4xl font-bold mb-6">Welcome Anya Xyra Tadena</h1>
        <Button variant="primary">Click Me</Button>
      </main>
    </div>
  );
}

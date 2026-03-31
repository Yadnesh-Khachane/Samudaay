import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-black text-primary/20 mb-4">404</div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <Button variant="hero" asChild><Link to="/"><Home className="w-4 h-4 mr-2"/>Go Home</Link></Button>
        <Button variant="outline" onClick={()=>window.history.back()}><ArrowLeft className="w-4 h-4 mr-2"/>Go Back</Button>
      </div>
    </div>
  );
}

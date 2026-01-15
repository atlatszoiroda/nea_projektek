import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Projektek from "./pages/Projektek";
import Nyertes from "./pages/Nyertes";
import Kizart from "./pages/Kizart";
import Terkep from "./pages/Terkep";
import Statisztikak from "./pages/Statisztikak";
import TopCharts from "./pages/TopCharts";
import Letoltes from "./pages/Letoltes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/projektek" element={<Projektek />} />
          <Route path="/nyertes" element={<Nyertes />} />
          <Route path="/kizart" element={<Kizart />} />
          <Route path="/terkep" element={<Terkep />} />
          <Route path="/statisztikak" element={<Statisztikak />} />
          <Route path="/statisztikak/top-50" element={<TopCharts />} />
          <Route path="/letoltes" element={<Letoltes />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

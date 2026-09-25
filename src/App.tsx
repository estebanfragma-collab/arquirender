import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppPage from "./pages/AppPage";
import Landing from "./pages/Landing";
import Terminos from "./pages/Terminos";
import Privacidad from "./pages/Privacidad";
import Reembolsos from "./pages/Reembolsos";
import ResetPassword from "./pages/ResetPassword";
import Presentaciones from "./pages/Presentaciones";
import NotFound from "./pages/NotFound";

import StudioLayout, {StudioProjects} from "./components/StudioLayout";

const VideoStudio = lazy(() => import("./video-studio/Studio"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<StudioLayout/>}>
          <Route path="/app" element={<AppPage />} />
          <Route path="/app/videos" element={<Suspense fallback={<p>Abriendo estudio de video…</p>}><VideoStudio /></Suspense>} />
          <Route path="/app/presentaciones" element={<Presentaciones />} />
          <Route path="/app/proyectos" element={<StudioProjects/>}/>
          </Route>
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/reembolsos" element={<Reembolsos />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

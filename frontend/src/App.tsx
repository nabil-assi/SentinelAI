import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// استيراد الصفحات
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ScanPage from "./pages/ScanPage";
import HistoryPage from "./pages/HistoryPage"; 
import ResultsPage from "./pages/ResultsPage"; 
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* المسارات العامة */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* المسارات المحمية داخل الـ Dashboard Layout */}
          <Route element={<DashboardLayout />}>
            {/* الإدارة العامة */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-project" element={<NewProject />} />
            
            {/* مسارات مرتبطة بمشروع معين (تحتاج projectId) */}
            <Route path="/scan/:projectId" element={<ScanPage />} />
            <Route path="/history/:projectId" element={<HistoryPage />} />
            
            {/* مسار النتائج: يعتمد على معرف الفحص الفريد لضمان عرض نتائج فحص محدد */}
            <Route path="/results/:scanId" element={<ResultsPage />} />
          </Route>

          {/* مسار الخطأ 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
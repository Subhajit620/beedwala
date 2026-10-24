import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import WatchlistDrawer from "./components/WatchlistDrawer";
import CompareModal from "./components/CompareModal";

// Public Marketplace Pages
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Search from "./pages/Search";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Admin Portal Components & Pages
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminPropertyForm from "./pages/admin/AdminPropertyForm";
import AdminBanks from "./pages/admin/AdminBanks";
import AdminDuplicates from "./pages/admin/AdminDuplicates";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminCrawlerSync from "./pages/admin/AdminCrawlerSync";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

// Public Marketplace Layout Wrapper
function PublicLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-slate-950">
            <Navbar />
            <div className="flex-1">
                <Outlet />
            </div>
            <Footer />

            {/* Global Interactive Components */}
            <Toast />
            <WatchlistDrawer />
            <CompareModal />
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <AdminAuthProvider>
                <Router>
                    <Routes>
                        {/* 1. Public Marketplace Routes */}
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/properties" element={<Properties />} />
                            <Route path="/properties/:id" element={<PropertyDetails />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                        </Route>

                        {/* 2. Admin Authentication Route */}
                        <Route
                            path="/admin/login"
                            element={
                                <>
                                    <AdminLogin />
                                    <Toast />
                                </>
                            }
                        />

                        {/* 3. Protected Enterprise Admin Console Routes */}
                        <Route
                            path="/admin"
                            element={
                                <AdminProtectedRoute>
                                    <AdminLayout />
                                    <Toast />
                                </AdminProtectedRoute>
                            }
                        >
                            <Route index element={<AdminDashboard />} />
                            <Route path="properties" element={<AdminProperties />} />
                            <Route path="properties/new" element={<AdminPropertyForm />} />
                            <Route path="properties/edit/:id" element={<AdminPropertyForm />} />
                            <Route path="banks" element={<AdminBanks />} />
                            <Route path="duplicates" element={<AdminDuplicates />} />
                            <Route path="audit-logs" element={<AdminAuditLogs />} />
                            <Route path="inquiries" element={<AdminInquiries />} />
                            <Route path="sync" element={<AdminCrawlerSync />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="settings" element={<AdminSettings />} />
                        </Route>
                    </Routes>
                </Router>
            </AdminAuthProvider>
        </AppProvider>
    );
}
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import WatchlistDrawer from "./components/WatchlistDrawer";
import CompareModal from "./components/CompareModal";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Search from "./pages/Search";
import About from "./pages/About";
import Contact from "./pages/Contact";

export default function App() {
    return (
        <AppProvider>
            <Router>
                <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-slate-950">
                    <Navbar />
                    <div className="flex-1">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/properties" element={<Properties />} />
                            <Route path="/properties/:id" element={<PropertyDetails />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                        </Routes>
                    </div>
                    <Footer />

                    {/* Global Interactive Elements */}
                    <Toast />
                    <WatchlistDrawer />
                    <CompareModal />
                </div>
            </Router>
        </AppProvider>
    );
}
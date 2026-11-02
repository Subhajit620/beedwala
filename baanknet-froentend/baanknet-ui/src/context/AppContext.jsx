import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
    // 1. Saved Watchlist State (persisted in localStorage)
    const [savedProperties, setSavedProperties] = useState(() => {
        try {
            const local = localStorage.getItem("bidwallah_saved_properties") || localStorage.getItem("baanknet_saved_properties");
            return local ? JSON.parse(local) : [];
        } catch (e) {
            console.error("Error reading saved properties from localStorage:", e);
            return [];
        }
    });

    const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);

    useEffect(() => {
        try {
            localStorage.setItem("bidwallah_saved_properties", JSON.stringify(savedProperties));
        } catch (e) {
            console.error("Error saving properties to localStorage:", e);
        }
    }, [savedProperties]);

    // 2. Visitor Lead Sign-In State (persisted in localStorage)
    const [visitorUser, setVisitorUser] = useState(() => {
        try {
            const raw = localStorage.getItem("bidwallah_visitor_user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [isVisitorLoginOpen, setIsVisitorLoginOpen] = useState(false);
    const [visitorLoginMandatory, setVisitorLoginMandatory] = useState(false);
    const [visitorCountdown, setVisitorCountdown] = useState(15);

    // 15-second website timer: when visitor is not signed in, count down 15s and then pop up the mandatory login gate
    useEffect(() => {
        if (visitorUser) return;

        const interval = setInterval(() => {
            setVisitorCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setIsVisitorLoginOpen(true);
                    setVisitorLoginMandatory(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [visitorUser]);

    // 3. Global Toast Notifications
    const [toasts, setToasts] = useState([]);
    const toastSeqRef = useRef(0);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message, type = "info") => {
        toastSeqRef.current += 1;
        const id = `toast_${toastSeqRef.current}`;
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);

    const loginVisitor = useCallback((userData) => {
        try {
            localStorage.setItem("bidwallah_visitor_user", JSON.stringify(userData));
        } catch (e) {
            console.error("Error saving visitor user:", e);
        }
        setVisitorUser(userData);
        setIsVisitorLoginOpen(false);
        setVisitorLoginMandatory(false);
        addToast(`Welcome, ${userData.name}! All properties are now unlocked.`, "success");
    }, [addToast]);

    const logoutVisitor = useCallback(() => {
        try {
            localStorage.removeItem("bidwallah_visitor_user");
        } catch (e) {
            console.error("Error removing visitor user:", e);
        }
        setVisitorUser(null);
        setVisitorCountdown(15);
        setIsVisitorLoginOpen(false);
        setVisitorLoginMandatory(false);
        addToast("Signed out. Sign in again to view properties.", "info");
    }, [addToast]);

    const openVisitorLogin = useCallback((mandatory = false) => {
        if (mandatory) setVisitorLoginMandatory(true);
        setIsVisitorLoginOpen(true);
    }, []);

    const isSaved = (propertyId) => {
        return savedProperties.some((p) => (p.sourcePropertyId || p._id) === propertyId);
    };

    const toggleSaveProperty = (property) => {
        const id = property.sourcePropertyId || property._id;
        if (isSaved(id)) {
            setSavedProperties((prev) => prev.filter((p) => (p.sourcePropertyId || p._id) !== id));
            addToast(`Removed from saved properties`, "info");
        } else {
            setSavedProperties((prev) => [property, ...prev]);
            addToast(`Added to saved properties`, "success");
        }
    };

    const clearWatchlist = () => {
        setSavedProperties([]);
        addToast("Watchlist cleared", "info");
    };

    // 4. Comparison System (up to 4 properties)
    const [comparedProperties, setComparedProperties] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const isCompared = (propertyId) => {
        return comparedProperties.some((p) => (p.sourcePropertyId || p._id) === propertyId);
    };

    const toggleCompareProperty = (property) => {
        const id = property.sourcePropertyId || property._id;
        if (isCompared(id)) {
            setComparedProperties((prev) => prev.filter((p) => (p.sourcePropertyId || p._id) !== id));
            addToast(`Removed from comparison`, "info");
        } else {
            if (comparedProperties.length >= 4) {
                addToast("You can compare up to 4 properties at a time", "warning");
                return;
            }
            setComparedProperties((prev) => [...prev, property]);
            addToast(`Added to comparison tray (${comparedProperties.length + 1}/4)`, "success");
        }
    };

    const clearCompare = () => {
        setComparedProperties([]);
        addToast("Comparison cleared", "info");
    };

    return (
        <AppContext.Provider
            value={{
                // Visitor Auth & Lead Gate
                visitorUser,
                isVisitorLoginOpen,
                setIsVisitorLoginOpen,
                visitorLoginMandatory,
                setVisitorLoginMandatory,
                visitorCountdown,
                loginVisitor,
                logoutVisitor,
                openVisitorLogin,

                // Watchlist
                savedProperties,
                isSaved,
                toggleSaveProperty,
                clearWatchlist,
                isWatchlistOpen,
                setIsWatchlistOpen,

                // Compare
                comparedProperties,
                isCompared,
                toggleCompareProperty,
                clearCompare,
                isCompareModalOpen,
                setIsCompareModalOpen,

                // Toast
                toasts,
                addToast,
                removeToast
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}

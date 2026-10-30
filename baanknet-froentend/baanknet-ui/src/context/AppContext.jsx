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

    // 2. Comparison System (up to 4 properties)
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

    // 3. Global Toast Notifications
    const [toasts, setToasts] = useState([]);
    const toastSeqRef = useRef(0); // stable incrementing ids (no randomness)

    // Memoized so their identity never changes: pages use addToast inside useCallback/useEffect
    // dependencies, and a new function on every render would re-trigger those effects endlessly.
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

    return (
        <AppContext.Provider
            value={{
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

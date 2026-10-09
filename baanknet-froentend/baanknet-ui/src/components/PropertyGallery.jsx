import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Building2, Camera } from "lucide-react";

export default function PropertyGallery({ photos = [], title = "Property" }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState({});

    const validPhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];
    const hasPhotos = validPhotos.length > 0;

    const handleImageError = (index) => {
        setImageErrors((prev) => ({ ...prev, [index]: true }));
    };

    const handleNext = () => {
        if (!hasPhotos) return;
        setSelectedIndex((prev) => (prev + 1) % validPhotos.length);
    };

    const handlePrev = () => {
        if (!hasPhotos) return;
        setSelectedIndex((prev) => (prev - 1 + validPhotos.length) % validPhotos.length);
    };

    if (!hasPhotos) {
        return (
            <div className="flex h-80 sm:h-96 w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-slate-400 p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xs text-amber-600 mb-3 border border-amber-100">
                    <Building2 size={32} />
                </div>
                <h4 className="text-base font-bold text-slate-700">No Image Available</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    No authorized photos have been uploaded for this property notice yet.
                </p>
            </div>
        );
    }

    const currentPhoto = validPhotos[selectedIndex];
    const isCurrentError = imageErrors[selectedIndex];

    return (
        <div className="space-y-3">
            {/* Main Image Stage */}
            <div className="relative h-80 sm:h-[420px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-md group">
                {!isCurrentError ? (
                    <img
                        src={currentPhoto}
                        alt={`${title} - Photo ${selectedIndex + 1}`}
                        onError={() => handleImageError(selectedIndex)}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-800 text-slate-400">
                        <Building2 size={36} className="mb-2 text-amber-500" />
                        <span className="text-xs">Photo unavailable</span>
                    </div>
                )}

                {/* Controls */}
                {validPhotos.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Previous photo"
                            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white transition cursor-pointer"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next photo"
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white transition cursor-pointer"
                        >
                            <ChevronRight size={20} />
                        </button>

                        {/* Photo Count Pill */}
                        <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-xs font-semibold text-amber-300 shadow-sm flex items-center gap-1.5 border border-amber-500/20">
                            <Camera size={13} />
                            <span>
                                {selectedIndex + 1} / {validPhotos.length}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails Reel */}
            {validPhotos.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                    {validPhotos.map((photo, index) => {
                        const isSelected = selectedIndex === index;
                        const isThumbError = imageErrors[index];

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedIndex(index)}
                                className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                                    isSelected
                                        ? "border-amber-500 shadow-sm ring-2 ring-amber-500/20"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                }`}
                            >
                                {!isThumbError ? (
                                    <img
                                        src={photo}
                                        alt={`Thumbnail ${index + 1}`}
                                        onError={() => handleImageError(index)}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">
                                        <Building2 size={16} />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

import React, { useState, useMemo } from "react";
import { Calculator, Percent, Clock, IndianRupee } from "lucide-react";
import { formatINR } from "../utils/formatters";

export default function EmiCalculator({ defaultPrice = 2500000 }) {
    const basePrice = Number(defaultPrice) || 2500000;

    // 80% loan amount by default
    const [loanAmount, setLoanAmount] = useState(Math.round(basePrice * 0.8));
    const [interestRate, setInterestRate] = useState(8.5);
    const [tenureYears, setTenureYears] = useState(20);

    // Calculate EMI: E = P * r * (1+r)^n / ((1+r)^n - 1)
    const calculation = useMemo(() => {
        const P = Number(loanAmount) || 0;
        const r = (Number(interestRate) || 0) / 12 / 100;
        const n = (Number(tenureYears) || 1) * 12;

        if (P <= 0 || r <= 0 || n <= 0) {
            return {
                monthlyEmi: 0,
                totalInterest: 0,
                totalPayment: 0,
                principalPercentage: 100,
                interestPercentage: 0
            };
        }

        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;

        const principalPercentage = Math.round((P / totalPayment) * 100);
        const interestPercentage = 100 - principalPercentage;

        return {
            monthlyEmi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalPayment: Math.round(totalPayment),
            principalPercentage,
            interestPercentage
        };
    }, [loanAmount, interestRate, tenureYears]);

    const setLoanPreset = (percentage) => {
        setLoanAmount(Math.round((basePrice * percentage) / 100));
    };

    return (
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-8 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                            Bank Loan & EMI Calculator
                        </h3>
                        <p className="text-xs text-slate-500">
                            Estimate your monthly loan instalments for Bidwallah auction properties
                        </p>
                    </div>
                </div>

                <span className="hidden sm:inline-block rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    Repo-Linked Rates
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Sliders Form (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Loan Amount */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <IndianRupee size={14} className="text-amber-600" />
                                <span>Loan Amount</span>
                            </label>
                            <span className="text-sm font-black text-amber-700">
                                {formatINR(loanAmount)}
                            </span>
                        </div>

                        <input
                            type="range"
                            min={100000}
                            max={Math.max(basePrice * 1.5, 50000000)}
                            step={50000}
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />

                        {/* Quick Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Presets:</span>
                            {[70, 80, 90].map((pct) => (
                                <button
                                    key={pct}
                                    type="button"
                                    onClick={() => setLoanPreset(pct)}
                                    className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition cursor-pointer ${
                                        Math.round((loanAmount / basePrice) * 100) === pct
                                            ? "bg-slate-950 text-amber-400 font-bold border border-amber-500/40"
                                            : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800"
                                    }`}
                                >
                                    {pct}% ({formatINR(Math.round((basePrice * pct) / 100))})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Percent size={14} className="text-amber-600" />
                                <span>Interest Rate (% p.a.)</span>
                            </label>
                            <span className="text-sm font-black text-slate-900">{interestRate}%</span>
                        </div>

                        <input
                            type="range"
                            min={6.5}
                            max={16.0}
                            step={0.1}
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                            <span>6.5% (Govt Banks)</span>
                            <span>8.5% (Standard)</span>
                            <span>16.0%</span>
                        </div>
                    </div>

                    {/* Tenure */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <Clock size={14} className="text-amber-600" />
                                <span>Loan Tenure (Years)</span>
                            </label>
                            <span className="text-sm font-black text-slate-900">
                                {tenureYears} Years ({tenureYears * 12} Months)
                            </span>
                        </div>

                        <input
                            type="range"
                            min={1}
                            max={30}
                            step={1}
                            value={tenureYears}
                            onChange={(e) => setTenureYears(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                            <span>5 Yrs</span>
                            <span>15 Yrs</span>
                            <span>30 Yrs</span>
                        </div>
                    </div>
                </div>

                {/* Calculation Summary Card (5 cols) */}
                <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 text-white shadow-xl flex flex-col justify-between border border-slate-800">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            Estimated Monthly Instalment
                        </span>
                        <div className="mt-1 text-2xl xs:text-3xl sm:text-4xl font-black text-white">
                            {formatINR(calculation.monthlyEmi)}
                            <span className="text-xs font-semibold text-slate-400"> / month</span>
                        </div>

                        {/* Ratio visual bar */}
                        <div className="mt-5 space-y-1.5">
                            <div className="flex justify-between text-[11px] text-slate-300 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-amber-500 inline-block"></span>
                                    Principal: {calculation.principalPercentage}%
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-yellow-600 inline-block"></span>
                                    Interest: {calculation.interestPercentage}%
                                </span>
                            </div>

                            <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden flex">
                                <div
                                    className="bg-amber-500 h-full transition-all duration-300"
                                    style={{ width: `${calculation.principalPercentage}%` }}
                                ></div>
                                <div
                                    className="bg-yellow-600 h-full transition-all duration-300"
                                    style={{ width: `${calculation.interestPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Detailed Table Breakdown */}
                        <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-800 text-xs">
                            <div className="flex justify-between text-slate-300">
                                <span>Principal Amount</span>
                                <span className="font-bold text-white">{formatINR(loanAmount)}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>Total Interest Payable</span>
                                <span className="font-bold text-amber-300">{formatINR(calculation.totalInterest)}</span>
                            </div>
                            <div className="flex justify-between text-slate-100 font-bold pt-2 border-t border-slate-800">
                                <span>Total Payable</span>
                                <span className="text-emerald-400">{formatINR(calculation.totalPayment)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Pre-approved auction financing</span>
                        <span className="text-amber-400 font-semibold">T&C Apply</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

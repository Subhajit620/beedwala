import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FaqSection() {
    const [openIdx, setOpenIdx] = useState(0);

    const faqs = [
        {
            q: "Is it legally safe to buy property through Bidwallah bank auctions?",
            a: "Yes, 100%. Bank auctions on Bidwallah are conducted under the Securitisation and Reconstruction of Financial Assets and Enforcement of Security Interest (SARFAESI) Act, 2002. Upon full payment, the authorized officer issues an official Sale Certificate that confers clear, marketable title to the winning bidder free from all prior encumbrances."
        },
        {
            q: "What is the difference between Symbolic and Physical Possession?",
            a: "Physical possession means the bank has physically taken over the premises and can hand over vacant keys directly to you upon sale certificate registration. Symbolic possession means the bank holds legal title rights, but the formal physical eviction or DM court order handover is in progress."
        },
        {
            q: "Can I get a home loan or commercial mortgage on a bank auction property?",
            a: "Yes. Major public and private banks offer auction home loans up to 75-80% of the property value. Many participating banks offer in-principle pre-approved loans for their own auction properties listed on Bidwallah to expedite the 15-day payment settlement."
        },
        {
            q: "What happens to my 10% EMD deposit if I lose the bid?",
            a: "Your Earnest Money Deposit (EMD) is 100% safe and fully refunded by the bank. Unsuccessful bidders receive their full deposit credited back to their originating bank account within 24 to 48 working hours after the e-auction closes."
        },
        {
            q: "How are reserve prices set by banks on Bidwallah?",
            a: "Banks appoint government-registered approved valuers who assess the fair market value and realizable distressed asset value. Consequently, reserve prices on Bidwallah are often 15% to 35% below surrounding open-market rates."
        }
    ];

    return (
        <section className="py-16 sm:py-20 bg-white">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1 text-xs font-bold text-amber-900 mb-2">
                        <HelpCircle size={14} className="text-amber-600" />
                        <span>Buyer Knowledge Base</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Everything you need to know about bank auctions, legal safety, and bidding on Bidwallah.
                    </p>
                </div>

                <div className="space-y-3.5">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIdx === idx;
                        return (
                            <div
                                key={idx}
                                className={`rounded-2xl border transition duration-200 overflow-hidden ${
                                    isOpen
                                        ? "border-amber-300 bg-amber-50/40 shadow-xs"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                                >
                                    <span className="text-sm sm:text-base font-bold text-slate-900">
                                        {faq.q}
                                    </span>
                                    <ChevronDown
                                        size={18}
                                        className={`text-slate-400 shrink-0 transition-transform duration-300 ${
                                            isOpen ? "rotate-180 text-amber-600" : ""
                                        }`}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 border-t border-amber-200/60 animate-fade-in">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

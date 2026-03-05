"use client";

import React, { useEffect, useState } from "react";
import {
    FaWhatsapp,
    FaHouse,
    FaUtensils,
    FaShirt,
    FaUserGraduate,
    FaShieldHeart,
    FaRupeeSign,
} from "react-icons/fa6";
import styles from "./recruits.module.css";

const BENEFITS = [
    { icon: FaHouse, text: "Free Stay" },
    { icon: FaUtensils, text: "Free Food" },
    { icon: FaShirt, text: "Free Dress & Makeup" },
    { icon: FaUserGraduate, text: "Training Provided" },
    { icon: FaShieldHeart, text: "Friendly Studio" },
    { icon: FaRupeeSign, text: "Good Monthly Payout" },
];

const BENGALI_SLIDES = [
    [
        "📢 ফিমেল হোস্ট চাই",
        "💼 আপনি যদি ঘরে বসে বা আমাদের সাথে থেকে কাজ করতে চান, তাহলে আজই যোগাযোগ করুন।",
        "🎥 Solo বা Couple (CP) Show যেকোনো ধরনের শো করতে পারলে Apply করতে পারবেন।",
        "👩 Single বা Divorcee হলেও আবেদন করতে পারবেন।",
        "✨ Freshers Welcome",
        "📩 আগ্রহী হলে এখনই মেসেজ বা কল করুন।ন",
    ],
    [
        "📢 Female Host Needed",
        "💼 If you want to work from home or stay and work with us, please contact us today.",
        "🎥 If you can perform Solo or Couple Shows, you are welcome to apply.",
        "👩 Single or Divorced women can also apply.",
        "✨ Freshers Welcome",
        "📩 Interested candidates can message or call now.",
    ],
    [
        "📢 फीमेल होस्ट चाहिए",
        "💼 अगर आप घर से काम करना चाहती हैं या हमारे साथ रहकर काम करना चाहती हैं, तो आज ही संपर्क करें।",
        "🎥 अगर आप सोलो या कपल शो कर सकती हैं तो अप्लाई करें।",
        "👩 सिंगल या डिवोर्सी महिलाएँ भी अप्लाई कर सकती हैं।",
        "✨ फ्रेशर्स भी अप्लाई कर सकते हैं।",
        "📩 इच्छुक उम्मीदवार अभी मैसेज या कॉल करें।",
    ],
];

export default function Recruits() {
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [age, setAge] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [fullNameTouched, setFullNameTouched] = useState(false);
    const [ageTouched, setAgeTouched] = useState(false);
    const [whatsappTouched, setWhatsappTouched] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    const whatsappLink = "https://wa.me/message/WLM2MJELD3BVC1";

    const goToNextStep = () => {
        if (step === 1 && fullName.trim()) {
            setStep(2);
        } else if (step === 1) {
            setFullNameTouched(true);
        }

        if (step === 2 && age.trim()) {
            setStep(3);
        } else if (step === 2) {
            setAgeTouched(true);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (!whatsappNumber.trim()) {
            event.preventDefault();
            setWhatsappTouched(true);
        }
    };

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % BENGALI_SLIDES.length);
        }, 4800);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <main className={styles.page}>
            <section className={styles.hero}>
                <p className={styles.badge}>Recruits</p>
                <h1 className={styles.title}>Female Live Host Job</h1>
                <h2 className={styles.subtitle}>Perform Pv Shows and act as a Streamer | 21 above</h2>
                <p className={styles.meta}>Freshers Welcome | Free Stay + Food | West Bengal</p>

                <div className={styles.bengaliBlock}>
                    <div
                        className={styles.bengaliSliderTrack}
                        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                    >
                        {BENGALI_SLIDES.map((slideLines, slideIndex) => (
                            <div className={styles.bengaliSlide} key={slideIndex}>
                                {slideLines.map((line) => (
                                    <p key={line}>{line}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className={styles.slideDots}>
                        {BENGALI_SLIDES.map((_, dotIndex) => (
                            <span
                                key={dotIndex}
                                className={`${styles.dot} ${dotIndex === activeSlide ? styles.dotActive : ""}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className={`${styles.section} ${styles.tightTop}`}>
                <h2 className={styles.sectionTitle}>Why Join Us</h2>
                <ul className={styles.benefits}>
                    {BENEFITS.map((benefit) => {
                        const Icon = benefit.icon;
                        return (
                            <li key={benefit.text} className={styles.benefitItem}>
                                <Icon aria-hidden="true" />
                                <span>{benefit.text}</span>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section className={`${styles.section} ${styles.applySection}`}>
                <h2 className={styles.sectionTitle}>Apply Now</h2>
                <form action="/api/apply" method="POST" className={styles.form} onSubmit={handleSubmit}>
                    <input type="hidden" name="fullName" value={fullName} />
                    <input type="hidden" name="age" value={age} />

                    {step === 1 ? (
                        <>
                            <div className={styles.labelRow}>
                                <label htmlFor="fullName" className={styles.label}>
                                    Full Name
                                </label>
                                {fullNameTouched && !fullName.trim() ? <span className={styles.mandatoryText}>Mandatory</span> : null}
                            </div>
                            <input
                                id="fullName"
                                type="text"
                                name="fullNameField"
                                placeholder="Full Name"
                                required
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                onBlur={() => setFullNameTouched(true)}
                                className={`${styles.input} ${fullNameTouched && !fullName.trim() ? styles.inputError : ""}`}
                            />
                        </>
                    ) : null}

                    {step === 2 ? (
                        <>
                            <div className={styles.labelRow}>
                                <label htmlFor="age" className={styles.label}>
                                    Age
                                </label>
                                {ageTouched && !age.trim() ? <span className={styles.mandatoryText}>Mandatory</span> : null}
                            </div>
                            <input
                                id="age"
                                type="number"
                                name="ageField"
                                placeholder="Age"
                                min={18}
                                max={40}
                                required
                                value={age}
                                onChange={(event) => setAge(event.target.value)}
                                onBlur={() => setAgeTouched(true)}
                                className={`${styles.input} ${ageTouched && !age.trim() ? styles.inputError : ""}`}
                            />
                        </>
                    ) : null}

                    {step === 3 ? (
                        <>
                            <div className={styles.labelRow}>
                                <label htmlFor="whatsappNumber" className={styles.label}>
                                    Whats App Number (optional)
                                </label>
                                {whatsappTouched && !whatsappNumber.trim() ? <span className={styles.mandatoryText}>Mandatory</span> : null}
                            </div>
                            <input
                                id="whatsappNumber"
                                type="tel"
                                name="whatsappNumber"
                                placeholder="Whats App Number (optional)"
                                required
                                value={whatsappNumber}
                                onChange={(event) => setWhatsappNumber(event.target.value)}
                                onBlur={() => setWhatsappTouched(true)}
                                className={`${styles.input} ${whatsappTouched && !whatsappNumber.trim() ? styles.inputError : ""}`}
                            />
                        </>
                    ) : null}

                    {step < 3 ? (
                        <button
                            type="button"
                            className={styles.submitBtn}
                            onClick={goToNextStep}
                            disabled={(step === 1 && !fullName.trim()) || (step === 2 && !age.trim())}
                        >
                            Continue
                        </button>
                    ) : (
                        <button type="submit" className={styles.submitBtn}>
                            Submit Application
                        </button>
                    )}
                </form>
            </section>

            <footer className={styles.footer}>
                <p className={styles.footerText}>Recruits</p>
                <a href="/recruits/privacy" className={styles.footerLink}>
                    Privacy Policy
                </a>
            </footer>

            <a href={whatsappLink} className={styles.overlayWhatsapp} target="_blank" rel="noreferrer">
                <FaWhatsapp aria-hidden="true" />
                Apply on WhatsApp
            </a>
        </main>
    );
}

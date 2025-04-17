import Image from "next/image";
import styles from "../page.module.css";
import { Button } from "@/components/ui/button"; // You might not need Button here
import Link from 'next/link';
import React from 'react';

export default function AboutUsPage() {
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>R Studio</Link>
            </header>

            <main className={styles.main}>
                <div className={styles.content}>
                    <h2 className={styles.title}>About R Studio</h2>
                    <p className={styles.paragraph}>
                        Inspired by the success of platforms like Stripchat, R Studio is designed to be a leading platform connecting talented models with a global audience. We understand the importance of flexibility, privacy, and fair earnings for our models.
                    </p>
                    <p className={styles.paragraph}>
                        Our mission is to create a supportive and empowering environment where models can thrive, control their content, and connect with their audience safely and securely. We prioritize the privacy and safety of our models above all else.
                    </p>
                    <p className={styles.paragraph}>
                        We are building a platform that offers:
                    </p>
                    <ul className={styles.list}>
                        <li>Flexible scheduling and working hours.</li>
                        <li>Strong emphasis on model privacy and data protection.</li>
                        <li>Competitive earning potential.</li>
                        <li>Tools and resources to help models grow their audience.</li>
                        <li>A supportive community.</li>
                    </ul>
                    <p className={styles.paragraph}>
                        Based in West Bengal, India, R Studio is committed to bringing a professional and ethical approach to the adult cam modeling industry.
                    </p>
                </div>
            </main>

            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} R Studio. All rights reserved.</p>
                <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
                <Link href="/terms" className={styles.footerLink}>Terms & Conditions</Link>
            </footer>
        </div>
    );
}
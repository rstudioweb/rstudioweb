import Image from "next/image";
import styles from "../page.module.css";
import { Button } from "@/components/ui/button"; // You might not need Button here
import Link from 'next/link';
import React from 'react';
export default function AboutUsPage() {
    return (
        <div className="container py-5">

            <h1 className="text-center fw-bold">Privacy Policy</h1>
            <p>
                <strong>Effective Date:</strong> 01-01-2022
            </p>

            <h3>1. Introduction</h3>
            <p>
                Welcome to <strong>R Studio</strong> ("we," "our," "us"). We are
                committed to protecting your privacy and ensuring that your personal
                information is handled securely. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit
                our website and use our services.
            </p>

            <h3>2. Information We Collect</h3>
            <p>We collect the following types of information:</p>
            <ul>
                <li>
                    <strong>Personal Information:</strong> Full name, date of birth,
                    location, contact details, selfie photo, Aadhaar card status, and
                    marital status (if provided).
                </li>
                <li>
                    <strong>Technical Information:</strong> IP address, browser type,
                    device information, and website usage data.
                </li>
                <li>
                    <strong>Financial Information:</strong> Payment details for processing
                    earnings and payouts.
                </li>
                <li>
                    <strong>Communication Data:</strong> Messages, inquiries, and customer
                    support interactions.
                </li>
            </ul>

            <h3>3. How We Use Your Information</h3>
            <p>We use your information to:</p>
            <ul>
                <li>Process model applications and manage profiles.</li>
                <li>Facilitate secure payouts and transactions.</li>
                <li>Improve website functionality and user experience.</li>
                <li>Ensure compliance with security and verification procedures.</li>
                <li>Communicate updates, promotions, and support responses.</li>
                <li>Enforce our terms and prevent fraudulent activities.</li>
            </ul>

            <h3>4. Data Sharing & Disclosure</h3>
            <p>
                We do not sell or trade your personal information. However, we may share
                data with:
            </p>
            <ul>
                <li>
                    <strong>Service Providers:</strong> Payment processors, hosting
                    providers, and analytics services.
                </li>
                <li>
                    <strong>Legal Authorities:</strong> When required by law, to comply
                    with legal obligations or protect rights.
                </li>
            </ul>

            <h3>5. Data Security</h3>
            <p>
                We implement advanced security measures, including encryption and access
                controls, to protect your personal data from unauthorized access,
                alteration, or misuse.
            </p>

            <h3>6. Your Privacy Rights</h3>
            <p>You have the right to:</p>
            <ul>
                <li>Access, update, or delete your personal data.</li>
                <li>Opt out of marketing communications.</li>
                <li>Request restrictions on how your data is processed.</li>
                <li>Withdraw consent where applicable.</li>
            </ul>

            <h3>7. Cookies & Tracking Technologies</h3>
            <p>
                We use cookies to enhance user experience, track website performance,
                and analyze traffic. You can manage cookie preferences through your
                browser settings.
            </p>

            <h3>8. Third-Party Links</h3>
            <p>
                Our website may contain links to third-party sites. We are not
                responsible for their privacy practices, and we encourage you to review
                their policies.
            </p>

            <h3>9. Age Restriction</h3>
            <p>
                R Studio is intended for individuals 18 years or older. We do not
                knowingly collect data from minors.
            </p>

            <h3>10. Updates to This Policy</h3>
            <p>
                We may update this Privacy Policy from time to time. Any changes will be
                posted on this page with a revised "Effective Date."
            </p>

            <h3>11. Contact Us</h3>
            <p>
                If you have any questions or requests regarding this Privacy Policy,
                please contact us at:
            </p>
            <ul>
                <li>
                    📧 <strong>[Insert Contact Email]</strong>
                </li>
                <li>
                    📞 <strong>[Insert Contact Number]</strong>
                </li>
                <li>
                    🌐 <strong>[Website URL]</strong>
                </li>
            </ul>
        </div>
    );
}
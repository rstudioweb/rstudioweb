import styles from "./privacy.module.css";

export default function RecruitsPrivacyPage() {
    return (
        <main className={styles.page}>
            <article className={styles.card}>
                <h1>Privacy Policy</h1>
                <p className={styles.meta}>Last Updated: March 6, 2026</p>

                <p>
                    Welcome to our website. Your privacy is important to us. This Privacy Policy explains how we collect,
                    use, and protect the information you provide when applying for jobs or contacting us through this website.
                </p>

                <h2>1. Information We Collect</h2>
                <p>When you apply for a position or contact us, we may collect the following information:</p>
                <ul>
                    <li>Personal Information: Full name, Whatsapp (if provided).</li>
                    <li>Technical Information: website usage data.</li>
                    <li>Communication Data: Customer support interactions.</li>
                </ul>
                <p>This information is collected only for recruitment and communication purposes.</p>

                <h2>2. How We Use Your Information</h2>
                <p>The information you provide may be used for:</p>
                <ul>
                    <li>Processing job applications</li>
                    <li>Contacting applicants through WhatsApp</li>
                    <li>Verifying applicant details</li>
                    <li>Communicating job-related updates</li>
                    <li>Improving our recruitment process</li>
                </ul>
                <p>We will not sell or rent your personal information to third parties.</p>

                <h2>3. Data Protection</h2>
                <p>We take reasonable steps to protect your personal information from:</p>
                <ul>
                    <li>Unauthorized access</li>
                    <li>Misuse</li>
                    <li>Loss or disclosure</li>
                </ul>
                <p>However, no method of data transmission over the internet is completely secure.</p>

                <h2>4. Third-Party Services</h2>
                <p>Our website may use third-party services such as:</p>
                <ul>
                    <li>Google Analytics for website traffic analysis</li>
                    <li>WhatsApp Business for communication with applicants</li>
                </ul>
                <p>These services may collect limited data according to their own privacy policies.</p>

                <h2>5. Cookies</h2>
                <p>
                    Our website may use cookies to improve user experience and analyze website performance. Cookies do not
                    collect personal identification information.
                </p>
                <p>You can disable cookies through your browser settings if you prefer.</p>

                <h2>6. Applicant Responsibility</h2>
                <p>By submitting your information through this website, you confirm that:</p>
                <ul>
                    <li>The information provided is accurate</li>
                    <li>You are at least 18 years of age</li>
                    <li>You voluntarily submit your information for job application purposes</li>
                </ul>

                <h2>7. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page.</p>

                <h2>8. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, you may contact us:</p>
                <p>Email: oulibaba009@gmail.com</p>
                <p>Website: camstudio.fun</p>
            </article>
        </main>
    );
}

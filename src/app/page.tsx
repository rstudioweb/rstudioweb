import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import { NavigationMenuDemo } from "../components/Navbar";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  return (
    <div className="bg-red-800">
      <div className={styles.page}>
        <NavigationMenuDemo />
        <main className={styles.main}>
          <section className={styles.hero}>
            <h2 className={styles.heroTitle}>Connect. Create. Shine.</h2>
            <p className={styles.heroSubtitle}>
              Empowering models with flexibility, privacy, and rewarding earnings in the global camming industry.
            </p>
            <Link href="/models/signup">
              <Button className={styles.heroButton}>Become a Model</Button>
            </Link>
          </section>
        </main>
        <ThemeToggle />
      </div>
      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} R Studio. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <Link href="/terms" className={styles.footerLink}>Terms & Conditions</Link>
        </div>
      </footer>
    </div>
  );
}

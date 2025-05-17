import styles from "../page.module.css";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NavigationMenuDemo } from "../../components/Navbar";
import ThemeToggle from "../../components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Footer } from "../../components/Footer";

export default function HomeMobile() {
  return (
    <div className={styles.wrapper}>
      <NavigationMenuDemo />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>Connect. Create. Shine.</h1>
          <p className={styles.heroSubtitle}>
            Empowering models with flexibility, privacy, and rewarding earnings
            in the global camming industry.
          </p>
          <Link href="/signup">
            <Button className={styles.heroButton}>Become a Model</Button>
          </Link>
        </section>
        <section className="flex flex-wrap justify-center gap-10 py-4 px-4">
          <div className="bg-muted text-muted-foreground rounded-2xl shadow-lg p-8 max-w-md w-full hover:shadow-2xl transition">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              About Us
            </h2>
            <p>
              <strong>R Studio</strong> is India’s premier platform dedicated to
              the art of live cam modeling, where creativity, connection, and
              self-expression converge. We are passionate about redefining
              entertainment by providing a dynamic space for individuals to
              engage with a global audience through live webcam performances.
            </p>

            <p>
              Cam modeling at R Studio is about embracing your unique
              talents—whether through dance, storytelling, or captivating
              conversation. It’s a vibrant form of digital entertainment that
              fosters authentic interactions between performers and viewers,
              creating memorable experiences in a secure, professional
              environment.
            </p>
          </div>
          <div className="bg-muted text-muted-foreground rounded-2xl shadow-lg p-8 max-w-md w-full hover:shadow-2xl transition">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Our Mission
            </h2>
            <p className="text-base leading-relaxed">
              At R Studio, we envision a world where creativity knows no bounds.
              Our mission is to empower performers to shine, offering a platform
              that celebrates individuality and fosters meaningful connections.
              We strive to lead the cam modeling industry in India by blending
              cutting-edge technology with a commitment to privacy and
              inclusivity.
            </p>

            <h3>Who We Are</h3>
            <p>
              Founded with a passion for innovation, R Studio is more than a
              platform—it’s a community. We provide the tools and support needed
              for performers to thrive, backed by a dedicated team that values
              respect, safety, and artistic freedom. Our state-of-the-art
              platform ensures seamless streaming and secure interactions,
              setting the standard for live entertainment in India.
            </p>
          </div>
        </section>
        <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 py-4 px-6 md:px-20">
          {/* Left Side Text Content */}
          <div className="flex flex-col gap-6 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
              BECOME <br />
              <span className="bg-primary text-primary-foreground px-4 py-2 rounded-lg inline-block my-2">
                A CAM
              </span>{" "}
              <br />
              MODEL
            </h2>

            {/* Small description */}
            <p className="text-muted-foreground text-base leading-relaxed">
              With a quarter-century of experience, R Studio was built for your
              success, offering unmatched traffic, top-tier earnings, and a
              unique commitment to safety and growth. Countless models have
              become millionaires on the platform, be the next one!
            </p>

            {/* Buttons and Avatars */}
            <div className="flex items-center gap-4 mt-4">
              <button className="bg-foreground text-background font-semibold px-6 py-2 rounded-lg hover:bg-muted transition">
                What is my Benefits
              </button>
              <button className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition">
                ▶ How to Apply?
              </button>
            </div>

            {/* Avatars */}
            <div className="flex items-center mt-6">
              <img
                src="/slide1.png"
                alt="Avatar 1"
                className="w-10 h-10 rounded-full border-2 border-white -ml-2 first:ml-0"
              />
              <img
                src="/slide2.png"
                alt="Avatar 2"
                className="w-10 h-10 rounded-full border-2 border-white -ml-2"
              />
            </div>
          </div>

          {/* Right Side Image + Stats */}
          <div className="relative">
            {/* Background Image (Person) */}
            <img
              src="/hero-bg.png"
              alt="Hero Person"
              className="rounded-xl shadow-xl"
            />

            {/* Speed Meter */}
            <div className="absolute top-4 left-4 bg-background p-3 rounded-lg shadow-md">
              <p className="text-xs text-muted-foreground">95%</p>
              <p className="text-sm font-semibold">Max Speed</p>
            </div>

            {/* Bar Chart */}
            <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-md">
              <div className="flex gap-1">
                <div className="w-2 h-6 bg-primary-foreground"></div>
                <div className="w-2 h-8 bg-primary-foreground"></div>
                <div className="w-2 h-5 bg-primary-foreground"></div>
                <div className="w-2 h-9 bg-primary-foreground"></div>
                <div className="w-2 h-4 bg-primary-foreground"></div>
              </div>
              <div className="text-xs text-center mt-1">M S T W T F S</div>
            </div>
          </div>
        </section>
        <section className="bg-red-800 text-white items-center justify-between gap-4 py-20 px-6 md:px-20">
          <h2 className="text-center text-2xl md:text-3xl font-semibold mb-2 max-w-4xl mx-auto">
            Your Money Your rules. Turn your dreams into reality!
          </h2>
          <h6 className="text-center  font-semibold mb-10 max-w-4xl mx-auto">
            Join the no. 1 premium cam platform in the world and start earning
            anytime, anywhere!
          </h6>
          <div className="flex flex-wrap justify-center gap-6 max-w-8xl mx-auto">
            {[
              { label: "Daily Visitors", value: "245+" },
              { label: "Growing Rate", value: "30.5%" },
              { label: "Reached Clients", value: "9K+" },
              { label: "Reviewed Clients", value: "2K+" },
            ].map((stat, index) => (
              <Card
                key={index}
                className="bg-red-900 text-white w-60 shadow-lg hover:shadow-xl transition rounded-2xl"
              >
                <CardContent className="p-6 text-center">
                  <p className="text-4xl font-bold mb-2">{stat.value}</p>
                  <p className="text-sm">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-[#f4f6fa] py-16 px-4 md:px-20">
          <h2 className="text-4xl font-extrabold text-center text-[#0b0d17] mb-12">
            FAQ QUESTIONS
          </h2>

          <Accordion
            type="single"
            collapsible
            className="max-w-4xl mx-auto space-y-4"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="flex justify-between items-center w-full bg-white px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition text-lg font-semibold text-[#0b0d17]">
                <span>How to choose a perfect digital marketing plan?</span>
              </AccordionTrigger>
              <AccordionContent className="bg-white px-6 py-4 text-[#4b4f56] rounded-b-xl text-base leading-relaxed">
                There are many ways to approach your strategy. Focus on your
                goals, target audience, and analytics to ensure the best fit.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="flex justify-between items-center w-full bg-white px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition text-lg font-semibold text-[#0b0d17]">
                <span>
                  How to choose hosting capabilities beyond imagination?
                </span>
              </AccordionTrigger>
              <AccordionContent className="bg-white px-6 py-4 text-[#4b4f56] rounded-b-xl text-base leading-relaxed">
                Web hosting is a stressful job, and we're here to make it easy.
                Superior site performance with a fast load factor. One place for
                all your web hosting needs—no hidden costs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="flex justify-between items-center w-full bg-white px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition text-lg font-semibold text-[#0b0d17]">
                <span>How to faster and cheaper than the rest?</span>
              </AccordionTrigger>
              <AccordionContent className="bg-white px-6 py-4 text-[#4b4f56] rounded-b-xl text-base leading-relaxed">
                Use optimized services, cloud scaling, and performance boosters
                to outpace competition without overspending.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="flex justify-between items-center w-full bg-white px-6 py-5 rounded-xl shadow-md hover:shadow-lg transition text-lg font-semibold text-[#0b0d17]">
                <span>When need to expertise and security you need?</span>
              </AccordionTrigger>
              <AccordionContent className="bg-white px-6 py-4 text-[#4b4f56] rounded-b-xl text-base leading-relaxed">
                Our expert team and advanced encryption protocols ensure both
                security and support, 24/7.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
      <ThemeToggle />
      <Footer />
    </div>
  );
}

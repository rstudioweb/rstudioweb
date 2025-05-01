// components/Footer.tsx  <Footer />  <Footer />

export function Footer() {
  return (
    <footer className="bg-red-900 text-white py-10 px-4 md:px-40">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
        {/* Left Text Section */}
        <div>
          <h4 className="text-md md:text-2md font-semibold leading-snug mb-6">
            You bring the talent, we bring the traffic.
            <br />
            All you need is a device and your best smile. Explore our features &
            start earning now!
          </h4>
          <button className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-black transition">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21.05 2.88c-.28-.23-.66-.3-1.02-.2L2.9 8.27c-.38.1-.68.4-.77.79-.08.38.05.78.34 1.03l5.4 4.49 1.04 6.35c.07.41.37.76.77.89.12.04.24.06.36.06.27 0 .54-.1.74-.29l3.05-2.84 3.77 3.05c.17.14.39.22.61.22.14 0 .29-.03.42-.09.33-.15.56-.46.62-.82l3.01-17.35c.06-.38-.09-.76-.37-1zM9.3 14.88l-.63 3.82-.25-1.56-.92-5.59 9.2-5.45-7.4 8.78z" />
            </svg>
            Subscribe To Newsletter
          </button>
        </div>

        {/* Middle Empty Spacer for Layout */}
        <div className="hidden md:block"></div>

        {/* Right Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Useful Links</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-white/90">
            <a href="#">Homepage</a>
            <a href="#">Terms Of Services</a>
            <a href="#">Model Login</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Dedicated Agency</a>
            <a href="#">FAQ</a>
            <a href="#">Billing & Support</a>
            <a href="#">Help & Support</a>
          </div>
        </div>
      </div>

      {/* Bottom Large Text */}
      <div className="mt-2 text-[60px] md:text-[60px] font-bold tracking-tight text-white leading-none">
        R Studio
      </div>
      {/* <div className="max-w-6xl mx-auto space-y-2">
        <p>
          The site contains sexually explicit material. Enter ONLY if you are at
          least 18 years old and agree to our cookie rules.
        </p>

        <p className="font-semibold">
          <a href="#" className="underline hover:text-red-100">
            18 U.S.C. 2257 Record-Keeping Requirements Compliance Statement
          </a>
        </p>

        <p>
          This site is operated by JWS Americas S.à r.l. and JWS International
          S.à r.l.
        </p>

        <div className="flex justify-center items-center space-x-3 pt-2">
          <img src="/rta.png" alt="RTA" className="h-4" />
          <img src="/asacp.png" alt="ASACP" className="h-4" />
          <img src="/icra.png" alt="ICRA" className="h-4" />
        </div>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 pt-4 text-[11px]">
          {[
            "English",
            "Español",
            "Deutsch",
            "Français",
            "Italiano",
            "Português",
            "Nederlands",
            "Svenska",
            "Norsk",
            "Dansk",
            "Suomi",
            "日本語",
            "Русский",
            "Magyar",
            "Česky",
            "Slovenský",
            "Română",
            "Polski",
            "简体中文",
          ].map((lang) => (
            <a key={lang} href="#" className="hover:text-red-100">
              {lang}
            </a>
          ))}
        </div>
      </div> */}
    </footer>
  );
}

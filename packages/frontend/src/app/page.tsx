import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-900 text-amber-50 py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cool Beans</h1>
          <nav className="space-x-6">
            <a href="#menu" className="hover:text-amber-200 transition">Menu</a>
            <a href="#about" className="hover:text-amber-200 transition">About</a>
            <a href="#location" className="hover:text-amber-200 transition">Location</a>
          </nav>
        </div>
      </header>

      {/* Hero Section - Coffee Shop Photography */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="/hero-coffee-shop.avif"
          alt="Cool Beans Coffee Shop"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h2 className="text-6xl font-bold mb-4 drop-shadow-lg">Where Every Cup Tells a Story</h2>
            <p className="text-2xl mb-8 drop-shadow-md">Handcrafted coffee, locally roasted, served with love</p>
            <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition shadow-lg">
              Order Now
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-amber-900 text-center mb-12">
          Our Specialties
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 - Space for Coffee Photo */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="h-64 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              {/* Placeholder for coffee image */}
              <div className="text-white text-center">
                <p className="text-sm opacity-75">Photo space</p>
                <p className="text-lg font-semibold">Artisan Espresso</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Artisan Espresso</h3>
              <p className="text-gray-700">
                Rich, bold, and perfectly balanced. Our signature espresso blend from single-origin beans.
              </p>
            </div>
          </div>

          {/* Card 2 - Space for Coffee Photo */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="h-64 bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center">
              {/* Placeholder for latte art image */}
              <div className="text-white text-center">
                <p className="text-sm opacity-75">Photo space</p>
                <p className="text-lg font-semibold">Latte Art</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Handcrafted Lattes</h3>
              <p className="text-gray-700">
                Creamy, smooth, and beautifully presented. Each cup is a work of art.
              </p>
            </div>
          </div>

          {/* Card 3 - Space for Coffee Photo */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <div className="h-64 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              {/* Placeholder for cold brew image */}
              <div className="text-white text-center">
                <p className="text-sm opacity-75">Photo space</p>
                <p className="text-lg font-semibold">Cold Brew</p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Cold Brew</h3>
              <p className="text-gray-700">
                Smooth and refreshing. Steeped for 16 hours for maximum flavor with minimal acidity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-amber-900 mb-6">About Cool Beans</h2>
            <p className="text-gray-700 text-lg mb-4">
              We're more than just a coffee shop – we're a community hub where friends meet,
              ideas brew, and moments are savored one cup at a time.
            </p>
            <p className="text-gray-700 text-lg mb-4">
              Our beans are ethically sourced, locally roasted, and expertly prepared by our
              passionate baristas who take pride in every pour.
            </p>
            <p className="text-gray-700 text-lg">
              Whether you're here for a quick morning pick-me-up or settling in for an
              afternoon of work, Cool Beans is your home away from home.
            </p>
          </div>
          <div className="h-96 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg flex items-center justify-center">
            {/* Placeholder for shop interior photo */}
            <div className="text-amber-900 text-center">
              <p className="text-sm opacity-75">Photo space</p>
              <p className="text-lg font-semibold">Shop Interior</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location/CTA Section */}
      <section id="location" className="py-16 px-6 bg-amber-900 text-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Visit Us Today</h2>
          <p className="text-xl mb-8">
            123 Coffee Street, Bean Town, CA 94000
          </p>
          <p className="text-lg mb-8">
            Open Daily: 7:00 AM - 8:00 PM
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition shadow-lg">
            Get Directions
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-950 text-amber-100 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">© 2025 Cool Beans Coffee Shop. All rights reserved.</p>
          <p className="text-sm opacity-75">Follow us on Instagram @coolbeanscoffee</p>
        </div>
      </footer>
    </div>
  );
}

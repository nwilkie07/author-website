import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function Speaking() {
  return (
    <div>
      <Navbar activePath="/speaking" authorName="Karen MacLeod-Wilkie" />

      <section className="relative h-[420px] bg-center bg-cover" style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1519681390361-3b2e7616e105?q=80&w=1400&auto=format&fit=crop)'
      }}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 container mx-auto h-full flex items-center">
          <div className="w-full grid md:grid-cols-2 gap-8 items-center px-6 md:px-0">
            <div>
              <h1 className="text-4xl md:text-5xl text-white mb-6">Speaking engagements</h1>
              <p className="text-white/90 leading-relaxed max-w-2xl">
                For many years I have delighted audiences with conversations that blend storytelling, humor, and practical insights. I speak on faith, resilience, and personal growth, weaving in experiences from my writing journey.
              </p>
              <button className="mt-6 bg-white text-[#0e2a48] px-6 py-3 rounded-full">book me</button>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-white/10 border border-white/20" aria-label="decorative">
                <img src="https://images.unsplash.com/photo-1523206489230-7a8fa5a2eae6?q=80&w=400&auto=format&fit=crop" alt="Speaker" className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f1d9cf] py-16 text-center">
        <div className="container mx-auto px-6">
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Want me to speak at your event? I bring energy, storytelling, and practical insights to audiences of all ages.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

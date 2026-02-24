import { Link } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function Contact() {
  return (
    <div>
      <Navbar activePath="/contact" authorName="Karen MacLeod-Wilkie" />

      <section className="bg-[#f4e6df] pt-12 pb-12">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-4xl md:text-5xl mb-4">Reach out</h1>
            <p className="leading-relaxed text-gray-800 mb-6">
              Life is all about the connections we make with each other - I look forward to connecting with you!
            </p>
            <p className="leading-relaxed text-gray-800 mb-6">
              Email: <span className="font-semibold">kmacleodwilkie@gmail.com</span>
            </p>
          </div>
          <div className="space-y-6">
            <p className="text-gray-800 leading-relaxed">
              To order print copies of my books directly, to book me as a speaker, or to share questions or comments, please contact me.
            </p>
            <div className="flex items-center space-x-3">
              <span className="inline-block w-9 h-9 rounded-full bg-gray-800" aria-label="instagram" />
              <span className="inline-block w-9 h-9 rounded-full bg-gray-800" aria-label="facebook" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0e2a48] text-white py-12">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div>
            <label className="block mb-2 uppercase text-xs opacity-90">Name</label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input className="w-full p-3 rounded border" placeholder="First Name" />
              <input className="w-full p-3 rounded border" placeholder="Last Name" />
            </div>
            <label className="block mb-2 uppercase text-xs opacity-90">Email</label>
            <input className="w-full p-3 rounded border mb-4" placeholder="Email" />
            <label className="block mb-2 uppercase text-xs opacity-90">Message</label>
            <textarea className="w-full p-3 rounded border h-40" placeholder="Your message" />
          </div>
          <div className="flex items-end">
            <button className="bg-[#e2c7b8] text-[#0e2a48] px-6 py-3 rounded-full">Send</button>
          </div>
        </div>
      </section>

      <Footer showNewsletter={false} />
    </div>
  );
}

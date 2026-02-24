import { Link } from "react-router";
import { r2Image } from "../utils/images";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export default function About() {
  return (
    <div>
      <Navbar activePath="/about" />
      <section className="bg-[#2a5b82] py-20 relative">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl text-white mb-6">About me</h1>
            <p className="text-white/90 leading-relaxed mb-6 max-w-3xl">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <p className="text-white/90 leading-relaxed max-w-3xl">
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-[420px] h-[420px] rounded-full bg-white/10 relative overflow-hidden shadow-xl" aria-label="decorative image frame">
              <img src={r2Image("about/author-photo.jpg")} alt="Author" className="w-full h-full object-cover mix-blend-multiply"/>
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-[#0e2a48] rounded-full opacity-90" />
            </div>
          </div>
        </div>
      </section>
      <Footer logoText="KMW Logo • Design-web-io.png" />
    </div>
  );
}

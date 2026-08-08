import Image from "next/image";
import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import { MasonryGallery } from "@/components/MasonryGallery";
import { Reveal } from "@/components/Reveal";
import { ParallaxImage } from "@/components/ParallaxImage";
import { FilmGrid } from "@/components/FilmGrid";
import { brand, services, testimonials, whyUs } from "@/lib/data";
import { getFilms, getGallery, getHeroes } from "@/lib/media";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const heroes = getHeroes();
  const gallery = getGallery();
  const films = getFilms();
  const storiesImage = "/media/sections/stories.webp";
  const featureImageB = gallery[8]?.src || gallery[3]?.src || storiesImage;

  return (
    <>
      <HeroCarousel images={heroes} />

      <section className="relative overflow-hidden bg-white px-5 py-16 sm:py-24 md:px-8 md:py-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 0%, rgba(176,141,87,0.12), transparent 35%), linear-gradient(180deg, #fff, #FBF9F6)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
              Why JK Photography
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-zinc-950 sm:text-4xl md:text-5xl">
              Lasting memories through breathtaking, soulful imagery
            </h2>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.1}>
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
              We combine creativity, professionalism, and technical precision to
              create timeless memories. From candid photography to cinematic
              wedding films, we capture your unique love story with unmatched
              quality — across Chennai, Kerala, and destinations worldwide.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {whyUs.map((item) => (
                <div key={item.title} className="border-t border-zinc-200 pt-5">
                  <h3 className="font-display text-2xl text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#F7F5F2] px-5 py-16 sm:py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal>
            <ParallaxImage
              src={storiesImage}
              alt="Stories from JK Photography"
              className="aspect-[4/5] w-full"
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
              Our Craft
            </p>
            <h2 className="mt-4 font-display text-3xl text-zinc-950 sm:text-4xl md:text-5xl">
              Stories from JK
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600 sm:mt-5 sm:text-lg">
              Premium wedding photography & filmmaking shaped by {brand.years}{" "}
              years and {brand.weddings} celebrations. Every frame is composed
              to feel immersive, intimate, and endlessly rewatchable.
            </p>
            <ul className="mt-8 space-y-4">
              {services.slice(0, 4).map((service) => (
                <li
                  key={service.title}
                  className="border-b border-zinc-200/80 pb-4"
                >
                  <p className="text-sm font-medium tracking-[0.08em] text-zinc-900 uppercase">
                    {service.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {service.description}
                  </p>
                </li>
              ))}
            </ul>
            <Link
              href="/about"
              className="mt-8 inline-flex rounded-full border border-zinc-300 bg-white px-6 py-3 text-[12px] tracking-[0.18em] text-zinc-900 uppercase transition hover:border-zinc-500"
            >
              About the Crew
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
                Selected Works
              </p>
              <h2 className="mt-3 font-display text-3xl text-zinc-950 sm:text-4xl md:text-5xl">
                Portfolio highlights
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="text-[12px] tracking-[0.2em] text-zinc-700 uppercase underline-offset-4 transition hover:text-zinc-950 hover:underline"
            >
              View full portfolio
            </Link>
          </Reveal>
          <MasonryGallery items={gallery} limit={12} />
        </div>
      </section>

      <section className="overflow-hidden bg-[#FAFAF8] px-5 py-16 sm:py-24 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-10 max-w-2xl sm:mb-12">
            <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
              Wedding Films
            </p>
            <h2 className="mt-3 font-display text-3xl text-zinc-950 sm:text-4xl md:text-5xl">
              Cinematic highlights
            </h2>
          </Reveal>
          <FilmGrid films={films} />
          <div className="mt-10">
            <Link
              href="/films"
              className="inline-flex rounded-full bg-zinc-950 px-6 py-3 text-[12px] tracking-[0.18em] text-white uppercase transition hover:bg-zinc-800"
            >
              Explore Films
            </Link>
          </div>
        </div>
      </section>

      <section className="relative bg-white px-5 py-16 sm:py-24 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
              Testimonials
            </p>
            <h2 className="mt-3 font-display text-3xl text-zinc-950 sm:text-4xl md:text-5xl">
              From our beloved clients
            </h2>
            <div className="mt-8 hidden aspect-[3/4] overflow-hidden lg:block">
              <ParallaxImage
                src={featureImageB}
                alt="Client celebration"
                className="h-full w-full"
              />
            </div>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
            {testimonials.map((item, i) => (
              <Reveal key={item.name} delay={i * 0.05}>
                <blockquote className="h-full border border-zinc-200 bg-[#FCFBF9] p-6 sm:p-7 md:p-8">
                  <p className="font-display text-xl leading-snug text-zinc-900 sm:text-2xl">
                    “{item.quote}”
                  </p>
                  <footer className="mt-6 text-sm text-zinc-500">
                    <span className="font-medium tracking-[0.08em] text-zinc-800 uppercase">
                      {item.name}
                    </span>
                    <span className="mt-1 block">{item.detail}</span>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile: image above text on solid background. Desktop: parallax backdrop */}
      <section className="bg-[#FAFAF8] px-5 py-16 sm:py-24 md:relative md:overflow-hidden md:px-8 md:py-36">
        <div className="mx-auto max-w-4xl md:hidden">
          <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-2xl">
            <Image
              src={gallery[12]?.src || featureImageB}
              alt="Let's connect"
              fill
              sizes="100vw"
              quality={90}
              className="object-cover"
            />
          </div>
          <div className="text-center">
            <p className="text-[11px] tracking-[0.3em] text-zinc-600 uppercase">
              Let&apos;s Connect
            </p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-zinc-950 sm:text-4xl">
              Let&apos;s craft memories that last a lifetime
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 sm:mt-5 sm:text-base">
              Share your date, venue, and vision — we&apos;ll curate the right
              photo & film crew for your celebration.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 sm:mt-8">
              <Link
                href="/contact"
                className="rounded-full bg-zinc-950 px-6 py-3 text-[12px] tracking-[0.18em] text-white uppercase transition hover:bg-zinc-800"
              >
                Contact Us
              </Link>
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-[12px] tracking-[0.18em] text-zinc-900 uppercase transition hover:border-zinc-500"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 hidden md:block">
          <ParallaxImage
            src={gallery[12]?.src || featureImageB}
            alt="Let's connect"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-white/82" />
        </div>
        <div className="relative mx-auto hidden max-w-4xl text-center md:block">
          <Reveal>
            <p className="text-[11px] tracking-[0.3em] text-zinc-600 uppercase">
              Let&apos;s Connect
            </p>
            <h2 className="mt-4 font-display text-5xl text-zinc-950 md:text-6xl">
              Let&apos;s craft memories that last a lifetime
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-zinc-600">
              Share your date, venue, and vision — we&apos;ll curate the right
              photo & film crew for your celebration.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact"
                className="rounded-full bg-zinc-950 px-7 py-3.5 text-[12px] tracking-[0.18em] text-white uppercase transition hover:bg-zinc-800"
              >
                Contact Us
              </Link>
              <a
                href={`https://wa.me/${brand.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-zinc-300 bg-white/80 px-7 py-3.5 text-[12px] tracking-[0.18em] text-zinc-900 uppercase backdrop-blur transition hover:border-zinc-500"
              >
                WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

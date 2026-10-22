import Image from "next/image";
import Link from "next/link";

/**
 * Photos are from Pexels (free to use, no credit needed). Each one is chosen to show the person it names,
 * in a real setting, so a visitor can think "that is me".
 */
const WHO = [
  { src: "/images/affiliates/who-cafe.jpg", alt: "A young man working at a photocopier", title: "Cyber cafés & print shops", line: "Turn every walk-in into income", position: "50% 30%" },
  { src: "/images/affiliates/who-campus.jpg", alt: "Two smiling students with backpacks outside a campus building", title: "Campus helpers & course reps", line: "Help friends, get paid for it", position: "50% 35%" },
  { src: "/images/affiliates/who-teachers.jpg", alt: "A teacher at a whiteboard with a student raising a hand", title: "Teachers & youth leaders", line: "Guide students to their first job", position: "50% 40%" },
  { src: "/images/affiliates/who-clubs.jpg", alt: "A team of women gathered around a laptop", title: "NSS coordinators & career clubs", line: "Get every member CV-ready", position: "50% 40%" },
  { src: "/images/affiliates/who-events.jpg", alt: "A man presenting to an audience", title: "Bootcamp & event organisers", line: "Give every participant a CV and a certificate", position: "50% 30%" },
];

/**
 * "Who can become an affiliate?": a grid of three columns, as on a software affiliate page. The first cell
 * holds the big heading and the button; each of the other five is a photo with the person's name and one
 * line about what they gain.
 */
export function WhoCanJoin() {
  return (
    <section id="who" className="scroll-mt-24 bg-white pb-20 text-zinc-950 sm:pb-28">
      <div className="mx-auto max-w-[1110px] px-5 sm:px-8">
        <div className="grid gap-x-[30px] gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* The heading and the button take the first cell */}
          <div className="flex flex-col items-start justify-center sm:col-span-2 lg:col-span-1">
            <h2 className="text-[2rem] font-semibold uppercase leading-[1.02] tracking-[-0.04em] sm:text-[46px] sm:leading-[46px]">Who can become an affiliate?</h2>
            <Link
              href="/affiliates/join"
              className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-[#5b5fe0] px-8 text-base font-semibold text-white transition-colors hover:bg-[#4a4ed0]"
            >
              Become an affiliate
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {WHO.map((w) => (
            <article key={w.title}>
              <div className="relative aspect-[350/162] w-full overflow-hidden rounded-2xl bg-[#e9ecff]">
                <Image src={w.src} alt={w.alt} fill sizes="(min-width: 1024px) 350px, (min-width: 640px) 45vw, 90vw" className="object-cover" style={{ objectPosition: w.position }} />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{w.title}</h3>
              <p className="mt-1 text-lg leading-[27px] tracking-[-0.02em] text-zinc-600">{w.line}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import { readLatest } from "@/content/tone";

export function Hero({ latestHref }: { latestHref: string }) {
  return (
    <section className="hero-v2" id="top">
      <div className="hero-v2-inner">
        <div className="hero-v2-left">
          <span className="hero-v2-eyebrow">PORTFOLIO · 2026</span>
          <h1 className="hero-v2-name">Nathalie Lustig</h1>
          <p className="hero-v2-lead">
            Notes on rates, credit, and FX from London. LSE Economics, CFA Level I.
            I write these for fun, and to keep me sharp on the market I find most
            interesting.
          </p>
          <div className="hero-v2-cta">
            <Link href={latestHref} className="l-btn l-btn-primary">
              {readLatest}
            </Link>
          </div>
        </div>

        <figure className="hero-v2-portrait">
          <Image
            src="/rail-portrait.jpg"
            alt="Portrait of Nathalie Lustig"
            width={720}
            height={720}
            priority
            className="hero-v2-portrait-img"
          />
          <span className="hpb hpb-tl" aria-hidden="true" />
          <span className="hpb hpb-tr" aria-hidden="true" />
          <span className="hpb hpb-bl" aria-hidden="true" />
          <span className="hpb hpb-br" aria-hidden="true" />
        </figure>
      </div>
    </section>
  );
}

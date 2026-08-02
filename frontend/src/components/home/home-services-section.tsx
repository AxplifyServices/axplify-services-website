import {
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  CodeXml,
  DatabaseZap,
  Megaphone,
  Radar,
  SearchCheck,
  Target,
  Workflow,
} from 'lucide-react';

import {
  Link,
} from '@/i18n/navigation';

type HomeService = {
  title: string;
  description: string;
};

type HomeServicesSectionProps = {
  eyebrow: string;
  title: string;
  introduction: string;
  services: HomeService[];
  cta: string;
};

const serviceIcons = [
  CodeXml,
  Workflow,
  ChartNoAxesCombined,
  Bot,
  Megaphone,
  DatabaseZap,
  Radar,
  Target,
  SearchCheck,
] as const;

export function HomeServicesSection({
  eyebrow,
  title,
  introduction,
  services,
  cta,
}: HomeServicesSectionProps) {
  return (
    <section
      className="home-services"
      aria-labelledby="home-services-title"
    >
      <div className="site-container">
        <header
          className="home-services__heading"
          data-reveal="up"
        >
          <div className="home-services__heading-main">
            <p className="eyebrow">
              {eyebrow}
            </p>

            <h2 id="home-services-title">
              {title}
            </h2>
          </div>

          <p className="home-services__introduction">
            {introduction}
          </p>
        </header>

        <div className="home-services__grid">
          {services.map(
            (
              service,
              index,
            ) => {
              const Icon =
                serviceIcons[
                  index %
                    serviceIcons.length
                ];

              return (
                <article
                  key={service.title}
                  className="home-services__card"
                  data-reveal="up"
                  data-reveal-delay={
                    String(
                      (index % 3) + 1,
                    )
                  }
                >
                  <div
                    className="home-services__icon"
                    aria-hidden="true"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="home-services__card-content">
                    <h3>
                      {service.title}
                    </h3>

                    <p>
                      {service.description}
                    </p>
                  </div>
                </article>
              );
            },
          )}
        </div>

        <div
          className="home-services__footer"
          data-reveal="up"
        >
          <Link
            href="/services"
            className="home-services__link"
          >
            <span>
              {cta}
            </span>

            <ArrowRight
              size={18}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
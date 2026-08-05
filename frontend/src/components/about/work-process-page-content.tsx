import type {
  LucideIcon,
} from 'lucide-react';

import {
  ArrowDown,
  ArrowRight,
  Blocks,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FlaskConical,
  GitBranch,
  Layers3,
  Lightbulb,
  RefreshCcw,
  Rocket,
  Search,
  Settings2,
  TestTube2,
  Users,
} from 'lucide-react';

import {
  Link,
} from '@/i18n/navigation';

type WorkProcessStep = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};

type WorkProcessOrientation = {
  label: string;
  title: string;
  description: string;
  points: string[];
};

type WorkProcessPrototype = {
  title: string;
  description: string;
};

type WorkProcessPageContentProps = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    reassurance: string;
  };

  steps: {
    understand: WorkProcessStep;
    observe: WorkProcessStep;
    reframe: WorkProcessStep;
    validate: WorkProcessStep;
  };

  validationLoop: {
    label: string;
    title: string;
    description: string;
    returnLabel: string;
  };

  decision: {
    eyebrow: string;
    title: string;
    description: string;

    product: WorkProcessOrientation;
    custom: WorkProcessOrientation;

    convergence: string;
  };

  prototype: {
    number: string;
    eyebrow: string;
    title: string;
    description: string;
    demo: WorkProcessPrototype;
    poc: WorkProcessPrototype;
    mvp: WorkProcessPrototype;
    conclusion: string;
  };

  delivery: WorkProcessStep;
  testing: {
    eyebrow: string;
    title: string;
    description: string;

    items: Array<{
      title: string;
      description: string;
    }>;
  };

  launch: WorkProcessStep;

  finalCta: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
  };
};

const stepIcons: LucideIcon[] = [
  Search,
  Eye,
  ClipboardCheck,
  CheckCircle2,
];

const testingIcons: LucideIcon[] = [
  TestTube2,
  Users,
  RefreshCcw,
];

function ProcessConnector() {
  return (
    <div
      className="work-process-connector"
      aria-hidden="true"
    >
      <span />

      <ArrowDown
        size={16}
        strokeWidth={2.2}
      />
    </div>
  );
}

function ProcessStep({
  step,
  icon: Icon,
  accent,
}: {
  step: WorkProcessStep;
  icon: LucideIcon;
  accent:
    | 'cyan'
    | 'violet'
    | 'navy';
}) {
  return (
    <article
      className={`work-process-step work-process-step--${accent}`}
    >
      <div className="work-process-step__marker">
        <span>
          {step.number}
        </span>
      </div>

      <div className="work-process-step__card">
        <div className="work-process-step__heading">
          <div
            className="work-process-step__icon"
            aria-hidden="true"
          >
            <Icon
              size={20}
              strokeWidth={1.9}
            />
          </div>

          <div>
            <p className="work-process-step__eyebrow">
              {step.eyebrow}
            </p>

            <h2>
              {step.title}
            </h2>
          </div>
        </div>

        <p className="work-process-step__description">
          {step.description}
        </p>

        <ul className="work-process-step__points">
          {step.points.map(
            (
              point,
            ) => (
              <li key={point}>
                <CheckCircle2
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                />

                <span>
                  {point}
                </span>
              </li>
            ),
          )}
        </ul>
      </div>
    </article>
  );
}

export function WorkProcessPageContent({
  hero,
  steps,
  validationLoop,
  decision,
  prototype,
  delivery,
  testing,
  launch,
  finalCta,
}: WorkProcessPageContentProps) {
  const introductorySteps = [
    steps.understand,
    steps.observe,
    steps.reframe,
    steps.validate,
  ];

  return (
    <div className="work-process-page">
      <section
        className="work-process-hero"
        aria-labelledby="work-process-page-title"
      >
        <div
          className="work-process-hero__background"
          aria-hidden="true"
        >
          <span className="work-process-hero__orb work-process-hero__orb--cyan" />
          <span className="work-process-hero__orb work-process-hero__orb--violet" />
          <span className="work-process-hero__grid" />
        </div>

        <div className="site-container work-process-hero__container">
          <div className="work-process-hero__content">
            <p className="eyebrow">
              {hero.eyebrow}
            </p>

            <h1 id="work-process-page-title">
              {hero.title}
            </h1>

            <p className="work-process-hero__description">
              {hero.description}
            </p>

            <div className="work-process-hero__reassurance">
              <CheckCircle2
                size={17}
                strokeWidth={2}
                aria-hidden="true"
              />

              <span>
                {hero.reassurance}
              </span>
            </div>
          </div>

          <div
            className="work-process-hero__visual"
            aria-hidden="true"
          >
            <div className="work-process-hero__visual-card">
              <Search
                size={20}
                strokeWidth={1.8}
              />

              <span />

              <ClipboardCheck
                size={20}
                strokeWidth={1.8}
              />

              <span />

              <GitBranch
                size={20}
                strokeWidth={1.8}
              />

              <span />

              <Rocket
                size={20}
                strokeWidth={1.8}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="work-process-map"
        aria-label={hero.title}
      >
        <div className="site-container work-process-map__container">
          <div className="work-process-map__line">
            {introductorySteps.map(
              (
                step,
                index,
              ) => {
                const Icon =
                  stepIcons[
                    index
                  ];

                const accents = [
                  'cyan',
                  'navy',
                  'violet',
                  'cyan',
                ] as const;

                return (
                  <div key={step.number}>
                    <ProcessStep
                      step={step}
                      icon={Icon}
                      accent={accents[index]}
                    />

                    {index <
                      introductorySteps.length -
                        1 && (
                      <ProcessConnector />
                    )}
                  </div>
                );
              },
            )}

            <div className="work-process-validation-loop">
              <div
                className="work-process-validation-loop__icon"
                aria-hidden="true"
              >
                <RefreshCcw
                  size={20}
                  strokeWidth={1.9}
                />
              </div>

              <div className="work-process-validation-loop__content">
                <p className="work-process-validation-loop__label">
                  {validationLoop.label}
                </p>

                <h3>
                  {validationLoop.title}
                </h3>

                <p>
                  {validationLoop.description}
                </p>

                <div className="work-process-validation-loop__return">
                  <ArrowRight
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                  <span>
                    {validationLoop.returnLabel}
                  </span>
                </div>
              </div>
            </div>

            <ProcessConnector />

            <section
              className="work-process-decision"
              aria-labelledby="work-process-decision-title"
            >
              <div className="work-process-decision__marker">
                <GitBranch
                  size={21}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
              </div>

              <div className="work-process-decision__heading">
                <p className="work-process-step__eyebrow">
                  {decision.eyebrow}
                </p>

                <h2 id="work-process-decision-title">
                  {decision.title}
                </h2>

                <p>
                  {decision.description}
                </p>
              </div>

              <div className="work-process-decision__branches">
                <article className="work-process-branch work-process-branch--product">
                  <div
                    className="work-process-branch__icon"
                    aria-hidden="true"
                  >
                    <Blocks
                      size={21}
                      strokeWidth={1.8}
                    />
                  </div>

                  <p className="work-process-branch__label">
                    {decision.product.label}
                  </p>

                  <h3>
                    {decision.product.title}
                  </h3>

                  <p>
                    {decision.product.description}
                  </p>

                  <ul>
                    {decision.product.points.map(
                      (
                        point,
                      ) => (
                        <li key={point}>
                          <CheckCircle2
                            size={14}
                            strokeWidth={2}
                            aria-hidden="true"
                          />

                          <span>
                            {point}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </article>

                <article className="work-process-branch work-process-branch--custom">
                  <div
                    className="work-process-branch__icon"
                    aria-hidden="true"
                  >
                    <Lightbulb
                      size={21}
                      strokeWidth={1.8}
                    />
                  </div>

                  <p className="work-process-branch__label">
                    {decision.custom.label}
                  </p>

                  <h3>
                    {decision.custom.title}
                  </h3>

                  <p>
                    {decision.custom.description}
                  </p>

                  <ul>
                    {decision.custom.points.map(
                      (
                        point,
                      ) => (
                        <li key={point}>
                          <CheckCircle2
                            size={14}
                            strokeWidth={2}
                            aria-hidden="true"
                          />

                          <span>
                            {point}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </article>
              </div>

              <div className="work-process-decision__convergence">
                <ArrowDown
                  size={16}
                  strokeWidth={2.2}
                  aria-hidden="true"
                />

                <span>
                  {decision.convergence}
                </span>
              </div>
            </section>

            <ProcessConnector />

            <section
              className="work-process-prototype"
              aria-labelledby="work-process-prototype-title"
            >
              <div className="work-process-step__marker">
                <span>
                  {prototype.number}
                </span>
              </div>

              <div className="work-process-prototype__card">
                <div className="work-process-step__heading">
                  <div
                    className="work-process-step__icon"
                    aria-hidden="true"
                  >
                    <FlaskConical
                      size={20}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div>
                    <p className="work-process-step__eyebrow">
                      {prototype.eyebrow}
                    </p>

                    <h2 id="work-process-prototype-title">
                      {prototype.title}
                    </h2>
                  </div>
                </div>

                <p className="work-process-step__description">
                  {prototype.description}
                </p>

                <div className="work-process-prototype__options">
                  <article>
                    <span>
                      01
                    </span>

                    <h3>
                      {prototype.demo.title}
                    </h3>

                    <p>
                      {prototype.demo.description}
                    </p>
                  </article>

                  <article>
                    <span>
                      02
                    </span>

                    <h3>
                      {prototype.poc.title}
                    </h3>

                    <p>
                      {prototype.poc.description}
                    </p>
                  </article>

                  <article>
                    <span>
                      03
                    </span>

                    <h3>
                      {prototype.mvp.title}
                    </h3>

                    <p>
                      {prototype.mvp.description}
                    </p>
                  </article>
                </div>

                <p className="work-process-prototype__conclusion">
                  {prototype.conclusion}
                </p>
              </div>
            </section>

            <ProcessConnector />

            <ProcessStep
              step={delivery}
              icon={Layers3}
              accent="navy"
            />

            <ProcessConnector />

            <section
              className="work-process-testing"
              aria-labelledby="work-process-testing-title"
            >
              <div
                className="work-process-testing__icon"
                aria-hidden="true"
              >
                <Settings2
                  size={22}
                  strokeWidth={1.8}
                />
              </div>

              <div className="work-process-testing__heading">
                <p className="work-process-step__eyebrow">
                  {testing.eyebrow}
                </p>

                <h2 id="work-process-testing-title">
                  {testing.title}
                </h2>

                <p>
                  {testing.description}
                </p>
              </div>

              <div className="work-process-testing__grid">
                {testing.items.map(
                  (
                    item,
                    index,
                  ) => {
                    const Icon =
                      testingIcons[
                        index
                      ];

                    return (
                      <article key={item.title}>
                        <Icon
                          size={19}
                          strokeWidth={1.9}
                          aria-hidden="true"
                        />

                        <h3>
                          {item.title}
                        </h3>

                        <p>
                          {item.description}
                        </p>
                      </article>
                    );
                  },
                )}
              </div>
            </section>

            <ProcessConnector />

            <ProcessStep
              step={launch}
              icon={Rocket}
              accent="violet"
            />
          </div>
        </div>
      </section>

      <section className="work-process-final-cta">
        <div className="site-container">
          <div className="work-process-final-cta__card">
            <div>
              <p className="work-process-final-cta__eyebrow">
                {finalCta.eyebrow}
              </p>

              <h2>
                {finalCta.title}
              </h2>

              <p>
                {finalCta.description}
              </p>
            </div>

            <Link
              href="/contact"
              className="button button--primary"
            >
              <span>
                {finalCta.button}
              </span>

              <ArrowRight
                size={17}
                strokeWidth={2.2}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
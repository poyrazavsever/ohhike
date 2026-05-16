import { CtaBand, InfoGrid, MarketingHero, TextBand } from "./page-sections";
import type { FeaturePage } from "../../lib/feature-pages";

function FeatureDetailPage({ feature }: { feature: FeaturePage }) {
  return (
    <main>
      <MarketingHero
        badge={feature.badge}
        title={feature.title}
        description={feature.description}
        image={feature.image}
        mascot={feature.mascot}
        primaryCta={{ href: "/pricing", label: "See Pricing" }}
        secondaryCta={{ href: "/features", label: "All Features" }}
      />
      <InfoGrid title="What this unlocks" cards={feature.cards} />
      <TextBand title="How it should work">
        {feature.narrative.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </TextBand>
      <CtaBand />
    </main>
  );
}

export { FeatureDetailPage };

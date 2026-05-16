import { FeatureDetailPage } from "../../../components/marketing/feature-detail-page";
import { featurePages } from "../../../lib/feature-pages";

export default function TeamMemoryFeaturePage() {
  return <FeatureDetailPage feature={featurePages["team-memory"]} />;
}

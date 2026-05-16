import { FeatureDetailPage } from "../../../components/marketing/feature-detail-page";
import { featurePages } from "../../../lib/feature-pages";

export default function CheckInsFeaturePage() {
  return <FeatureDetailPage feature={featurePages["check-ins"]} />;
}

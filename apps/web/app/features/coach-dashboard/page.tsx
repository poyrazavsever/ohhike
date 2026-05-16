import { FeatureDetailPage } from "../../../components/marketing/feature-detail-page";
import { featurePages } from "../../../lib/feature-pages";

export default function CoachDashboardFeaturePage() {
  return <FeatureDetailPage feature={featurePages["coach-dashboard"]} />;
}

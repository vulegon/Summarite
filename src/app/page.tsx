import { Box } from "@mui/material";
import { HeroSection } from "./(landing)/components/HeroSection";
import { FeaturesSection } from "./(landing)/components/FeaturesSection";
import { TargetUsersSection } from "./(landing)/components/TargetUsersSection";
import { HowItWorksSection } from "./(landing)/components/HowItWorksSection";
import { CTASection } from "./(landing)/components/CTASection";
import { Footer } from "./(landing)/components/Footer";

export default function Home() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <HeroSection />
      <FeaturesSection />
      <TargetUsersSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </Box>
  );
}

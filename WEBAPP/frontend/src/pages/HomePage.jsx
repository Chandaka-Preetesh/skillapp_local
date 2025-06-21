import React from "react";
import FeatureCard from "../homepageComponent/FeatureCard";
import Stats from "../homepageComponent/Stats";
import StartComponent from "../homepageComponent/StartCompoent";
import Works from "../homepageComponent/Works";
import PageEnding from "../homepageComponent/PageEnding";

export default function HomePage() {
  
  return (
    <>
      {/*Starting components */}
      <StartComponent/>
      {/* Core Features */}
      <FeatureCard/>
      {/* Stats */}
      <Stats/>
      {/* How It Works Component */}
      <Works/>

      {/*PageEnding COmponent*/}
      <PageEnding/>
  </>
  );
}

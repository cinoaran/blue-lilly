"use client";

import React from "react";
import CreateCampaignForm from "./CreateCampaignForm";
import CampaignsGrid from "./CampaignsGrid";

const NewsletterPage = () => {
  const [reloadKey, setReloadKey] = React.useState(0);

  return (
    <div className="p-4 bg-background/60 my-12">
      <h2>Newsletter Admin</h2>
      <p>Verwalte deine Newsletter-Kampagnen hier.</p>

      <div className="grid grid-cols-1 gap-6 mt-6">
        <CreateCampaignForm onCreated={() => setReloadKey((k) => k + 1)} />

        <CampaignsGrid reloadKey={reloadKey} />
      </div>
    </div>
  );
};

export default NewsletterPage;

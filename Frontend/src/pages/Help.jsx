import React from "react";
import Card from "../components/ui/Card";

export default function Help(){
  return (
    <div>
      <h2 className="text-4xl font-extrabold mb-6">Help & Documentation</h2>

      <Card>
        <div className="prose max-w-none text-gray-700">
          <h3>Frequently Asked Questions (FAQ)</h3>
          <p><strong>What is NDVI?</strong><br/>NDVI stands for Normalized Difference Vegetation Index. It's a simple graphical indicator that can be used to analyze remote sensing measurements and assess whether the target contains live green vegetation or not.</p>

          <h4>How do I upload an image for analysis?</h4>
          <p>Navigate to the "Farm Setup" page (Register Farm). You can either register a new farm or edit an existing one. You will find an "Upload NDVI Image" section where you can drag and drop or select a file from your device.</p>

          <h4>Where does the weather data come from?</h4>
          <p>Our platform integrates with the OpenWeatherMap API to provide real-time weather data, including temperature, humidity, and rainfall for your farm's coordinates.</p>

          <h4>Contact Us</h4>
          <p>If you need help, contact support@agrisense360.example</p>
        </div>
      </Card>
    </div>
  );
}

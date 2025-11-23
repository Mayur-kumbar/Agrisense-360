import { Droplet, CloudRain, Leaf, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import MapView from '../components/MapView';

// // Placeholder MapView component
// function MapView() {
//   return (
//     <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg flex items-center justify-center border border-green-200">
//       <div className="text-center">
//         <MapPin className="w-12 h-12 text-green-600 mx-auto mb-2" />
//         <p className="text-green-700 font-medium">Map View Component</p>
//         <p className="text-green-600 text-sm mt-1">NDVI & Field Boundaries</p>
//       </div>
//     </div>
//   );
// }

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">AgriSense 360</h1>
          </div>
          <p className="text-gray-600 ml-11">Real-time crop intelligence & precision farming insights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Field Map & NDVI Analysis
                </h2>
              </div>
              <div className="h-96 lg:h-[500px]">
                <MapView />
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            {/* NDVI Health Card */}
            <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Vegetation Health</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">NDVI Index</span>
                  <span className="text-lg font-bold text-green-600">0.72</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{width: '72%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Healthy crop growth detected</p>
              </div>
            </div>

            {/* Stress Zones Card */}
            <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-800">Stress Zones</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Affected Area</span>
                  <span className="text-lg font-bold text-amber-600">8.4%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style={{width: '8.4%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Low stress detected in north sector</p>
              </div>
            </div>

            {/* Weather Insights Card */}
            <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CloudRain className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Weather Insights</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Droplet className="w-4 h-4" />
                    Humidity
                  </span>
                  <span className="font-semibold text-gray-800">68%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Temperature</span>
                  <span className="font-semibold text-gray-800">28°C</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rainfall (24h)</span>
                  <span className="font-semibold text-gray-800">12mm</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Favorable conditions for growth</p>
              </div>
            </div>

            {/* Active Alerts Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg border border-red-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-gray-800">Active Alerts</h3>
              </div>
              <div className="space-y-2">
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="text-sm font-medium text-gray-800">Water Stress Detected</p>
                  <p className="text-xs text-gray-600 mt-1">Zone A3 requires irrigation</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-100">
                  <p className="text-sm font-medium text-gray-800">Pest Risk Advisory</p>
                  <p className="text-xs text-gray-600 mt-1">Monitor north boundary closely</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
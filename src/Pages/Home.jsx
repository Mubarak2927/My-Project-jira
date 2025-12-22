import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import DigitalyLogo from "../assets/Digi.png";

const apps = [
  {
    name: "Project Management Tool",
    subtitle: "Digitaly",
    logo: "https://logodix.com/logo/851220.png",
  },
  {
    name: "Employee Management",
    subtitle: "Digitaly",
    logo: "https://icons.veryicon.com/png/o/miscellaneous/outgoing-system/employee-management-1.png",
  },
  {
    name: "Service Manager",
    subtitle: "Digitaly",
    logo: "https://tse3.mm.bing.net/th/id/OIP.dQgEp1HosKCFVVszhaPzMgHaHa?pid=Api&P=0&h=180",
  },
];

const Home = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [comingSoonApp, setComingSoonApp] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = dateTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = dateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const handleAppClick = (appName) => {
    setComingSoonApp(appName);
    setTimeout(() => setComingSoonApp(null), 1000);
  };

  return (
    <div className="h-[90vh] mt-5 rounded-lg p-3 bg-gray-50">
      <Toaster position="top-right" />

      {/* Header Banner */}
      <div className="bg-green-300 px-8 py-6 rounded-2xl flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <img src={DigitalyLogo} alt="" className="w-20 h-20" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Hello, DIGITALY
            </h1>
          </div>

          <p>{formattedDate}</p>
          <div>
            <p>{formattedTime}</p>
          </div>
        </div>
      </div>

      {/* Apps Section */}
      <div className="px-8 mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Your apps</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {apps.map((app, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow hover:shadow-md cursor-pointer relative"
              onClick={() => handleAppClick(app.name)}
            >
              <div className="flex items-center gap-3">
                <img src={app.logo} alt={app.name} className="w-10 h-10" />
                <div>
                  <p className="font-medium">{app.name}</p>
                  <p className="text-sm text-gray-500">{app.subtitle}</p>
                </div>
              </div>

              {/* Coming Soon Overlay */}
              {comingSoonApp === app.name && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex justify-center items-center  text-lg rounded-lg">
                  Coming Soon.....
                </div>
              )}
            </div>
          ))}
         
        </div>
      </div>
    </div>
  );
};

export default Home;

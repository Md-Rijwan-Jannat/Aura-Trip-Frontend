"use client";

import React, { useState } from "react";
import DocumentCard from "./documentCard";
import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "lucide-react";
import { motion } from "framer-motion";

const Documents: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 8;

  // Sample document data
  const documentItems = [
    {
      title: "Travel Features",
      link: "https://www.lonelyplanet.com/",
      items: ["Trip Planning", "Destination Guides", "Flight Booking"],
    },
    {
      title: "Social Media Integration",
      link: "https://buffer.com/resources/",
      items: ["Instagram Marketing", "Facebook Ads", "Content Scheduling"],
    },
    {
      title: "User-Friendly Features",
      link: "https://uxplanet.org/",
      items: ["Accessibility Options", "Responsive Design", "Fast Load Times"],
    },
    {
      title: "Travel Insurance",
      link: "https://www.travelinsurance.com/",
      items: [
        "Medical Coverage",
        "Flight Cancellations",
        "Lost Baggage Claims",
      ],
    },
    {
      title: "Adventure Travel",
      link: "https://www.explorersconnect.com/",
      items: ["Hiking Trails", "Water Sports", "Camping Essentials"],
    },
    {
      title: "Local Guides",
      link: "https://www.toursbylocals.com/",
      items: ["City Tours", "Cultural Experiences", "Local Cuisine"],
    },
    {
      title: "Budget Travel",
      link: "https://www.nomadicmatt.com/",
      items: ["Cheap Flights", "Hostel Reviews", "Money-Saving Tips"],
    },
    {
      title: "Luxury Travel",
      link: "https://www.luxurytravelmagazine.com/",
      items: ["5-Star Resorts", "Private Jets", "Gourmet Dining"],
    },
    {
      title: "Photography Tips",
      link: "https://www.nationalgeographic.com/photography/",
      items: [
        "Camera Gear Guides",
        "Landscape Photography",
        "Editing Tutorials",
      ],
    },
    {
      title: "Eco-Friendly Travel",
      link: "https://sustainabletravel.org/",
      items: ["Carbon Offsetting", "Sustainable Hotels", "Green Packing Tips"],
    },
    {
      title: "Travel Safety",
      link: "https://travel.state.gov/",
      items: ["Travel Advisories", "Emergency Contacts", "Health Precautions"],
    },
  ];

  const filteredDocuments = documentItems.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const displayedDocuments = filteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className="py-10">
      {/* Header Section */}
      <motion.div
        className="text-center mb-10 h-[60vh] mx-auto w-full flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-custom-header mb-4 text-default-700">
          Features
        </h1>
        <p className="text-default-700 flex items-center justify-center my-2 text-sm font-light">
          <Link href={"/"}>Home</Link> &gt; Features
        </p>
        <Image
          className="md:w-[350px]"
          src={"http://thetheme.io/thedocs/assets/img/vector/1.png"}
          width={500}
          height={500}
          alt="doc image"
        />
      </motion.div>

      {/* Search Bar */}
      <div className="flex justify-center mb-6 w-full">
        <input
          type="text"
          placeholder="Search documents..."
          className="border rounded-full px-4 py-2 w-[300px] md:w-[400px] focus:outline-none border-default-300 text-default-700 font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon className="-ml-9 mt-2 text-default-500" />
      </div>

      {/* Document Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedDocuments.map((doc, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <DocumentCard title={doc.title} items={doc.items} link={doc.link} />
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNum) => (
              <motion.button
                key={pageNum}
                className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                  currentPage === pageNum
                    ? "bg-sage-700 text-white"
                    : "hover:bg-sage-100 dark:hover:bg-sage-800 text-default-700"
                }`}
                onClick={() => handlePageChange(pageNum)}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                {pageNum}
              </motion.button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;

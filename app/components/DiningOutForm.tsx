"use client";

import { useState } from "react";
import axios from "axios";

interface Props {
  onResults: (data: any[]) => void;
}

export default function DiningOutForm({ onResults }: Props) {
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/suggest", {
        type: "dining",
        location,
        budget,
        cuisine: cuisine || null,
      });
      onResults(response.data.results);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      alert("Có lỗi xảy ra, thử lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto"
    >
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Địa điểm
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="VD: Hà Nội"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Ngân sách (VND)
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="VD: 200000"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Ẩm thực (tùy chọn)
        </label>
        <input
          type="text"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="VD: Việt Nam, Ý, Nhật"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Đang tìm..." : "Tìm quán"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import axios from "axios";

interface Props {
  onResults: (data: any[]) => void;
}

export default function CookingForm({ onResults }: Props) {
  const [cuisine, setCuisine] = useState("");
  const [complexity, setComplexity] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/suggest", {
        type: "cooking",
        cuisine,
        complexity,
      });
      onResults(response.data.results);
    } catch (error) {
      console.error("Error fetching recipes:", error);
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
          Ẩm thực
        </label>
        <input
          type="text"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="VD: Việt Nam, Ý, Nhật"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Độ phức tạp
        </label>
        <div className="flex gap-4">
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setComplexity(level as "easy" | "medium" | "hard")}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                complexity === level
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {loading ? "Đang tìm..." : "Tìm công thức"}
      </button>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import DiningOutForm from "./components/DiningOutForm";
import CookingForm from "./components/CookingForm";
import Card from "./components/Card";

interface DetailedRecipe {
  name: string;
  cuisine: string;
  prepTime: string;
  servings: number;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  tips: string[];
}

export default function Home() {
  const [mode, setMode] = useState<"dining" | "cooking" | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [detailedRecipe, setDetailedRecipe] = useState<DetailedRecipe | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Chặn scroll khi modal mở
  useEffect(() => {
    if (showDetailedModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showDetailedModal]);

  const handleResults = (data: any[]) => {
    setResults(data);
  };

  const handleFetchDetailedRecipe = async (
    name: string,
    cuisine: string,
    complexity: string,
    setLoading: (value: boolean) => void
  ) => {
    setError(null);
    try {
      const response = await axios.post("/api/detailed-recipe", {
        name,
        cuisine,
        complexity,
      });
      const recipe = response.data.recipe;
      setDetailedRecipe(recipe);
      setShowDetailedModal(true);
    } catch (err) {
      setError("Không thể lấy công thức chi tiết. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Hôm nay ăn gì?
        </h1>

        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setMode("dining")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              mode === "dining"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Ăn ngoài
          </button>
          <button
            onClick={() => setMode("cooking")}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              mode === "cooking"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Tự nấu
          </button>
        </div>

        {mode === "dining" && <DiningOutForm onResults={handleResults} />}
        {mode === "cooking" && <CookingForm onResults={handleResults} />}

        {results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {results.map((item, index) => (
              <Card
                key={index}
                item={item}
                mode={mode}
                onShowDetailedRecipe={handleFetchDetailedRecipe}
              />
            ))}
          </div>
        )}

        {showDetailedModal && detailedRecipe && (
          <div
            key="detailed-modal"
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {detailedRecipe.name}
              </h3>
              <p className="text-gray-600">Ẩm thực: {detailedRecipe.cuisine}</p>
              <p className="text-gray-600">
                Thời gian chuẩn bị: {detailedRecipe.prepTime}
              </p>
              <p className="text-gray-600">
                Số khẩu phần: {detailedRecipe.servings}
              </p>
              <h4 className="text-lg font-semibold text-gray-800 mt-4">
                Nguyên liệu:
              </h4>
              <ul className="list-disc pl-5 text-gray-600">
                {detailedRecipe.ingredients.map((ing, idx) => (
                  <li key={idx}>{`${ing.name}: ${ing.quantity}`}</li>
                ))}
              </ul>
              <h4 className="text-lg font-semibold text-gray-800 mt-4">
                Hướng dẫn:
              </h4>
              <ol className="list-decimal pl-5 text-gray-600">
                {detailedRecipe.instructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
              <h4 className="text-lg font-semibold text-gray-800 mt-4">Mẹo:</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {detailedRecipe.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setShowDetailedModal(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ClipLoader } from "react-spinners";

interface Props {
  item: any;
  mode: "dining" | "cooking" | null;
  onShowDetailedRecipe: (
    name: string,
    cuisine: string,
    complexity: string,
    setLoading: (value: boolean) => void
  ) => void;
}

export default function Card({ item, mode, onShowDetailedRecipe }: Props) {
  const [showRecipe, setShowRecipe] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      item.imageUrls && prev < item.imageUrls.length - 1 ? prev + 1 : 0
    );
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      item.imageUrls && prev > 0 ? prev - 1 : item.imageUrls?.length - 1 || 0
    );
  };

  const handleShowDetailedRecipe = () => {
    setLoading(true);
    onShowDetailedRecipe(item.name, item.cuisine, item.complexity, setLoading);
  };

  const renderImageCarousel = () =>
    item.imageUrls?.length > 0 && (
      <div className="mt-4 relative">
        <h4 className="text-lg font-semibold text-gray-800">Hình ảnh:</h4>
        <div className="relative w-full h-64 overflow-hidden rounded-lg">
          <img
            src={
              item.imageUrls[currentImageIndex] ||
              "https://via.placeholder.com/300"
            }
            alt={`Ảnh ${mode === "dining" ? "quán" : "món"} ${item.name}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/300";
            }}
          />
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-75 hover:opacity-100"
          >
            ←
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full opacity-75 hover:opacity-100"
          >
            →
          </button>
        </div>
        <div className="flex justify-center mt-2">
          {item.imageUrls.map((_: string, idx: number) => (
            <span
              key={idx}
              className={`h-2 w-2 mx-1 rounded-full ${
                idx === currentImageIndex ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );

  if (mode === "dining") {
    const googleMapsLink =
      item.latitude && item.longitude
        ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}`
        : "";

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {item.name || "Unknown Restaurant"}
        </h3>
        <p className="text-gray-600">Ẩm thực: {item.cuisine || "N/A"}</p>
        <p className="text-gray-600">
          Ngân sách: {item.budget ? `${item.budget} VND` : "N/A"}
        </p>
        <p className="text-gray-600">
          Đánh giá: {item.rating ? `${item.rating}/5` : "N/A"}
        </p>
        <p className="text-gray-600">Địa chỉ: {item.address || "N/A"}</p>
        <p className="text-gray-600">
          Tọa độ:{" "}
          {item.latitude && item.longitude
            ? `${item.latitude}, ${item.longitude}`
            : "N/A"}
        </p>
        <p className="text-gray-600 mt-2">
          Nhận xét: {item.review || "Không có nhận xét"}
        </p>

        {renderImageCarousel()}

        {googleMapsLink ? (
          <a
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Xem trên Google Maps
          </a>
        ) : (
          <p className="mt-4 text-gray-500">
            Không có tọa độ để xem trên Google Maps
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        {item.name || "Unknown Recipe"}
      </h3>
      <p className="text-gray-600">
        Ẩm thực: {item.cuisine || "N/A"}Ẩm thực: {item.cuisine || "N/A"}
      </p>
      <p className="text-gray-600">Độ phức tạp: {item.complexity || "N/A"}</p>

      {renderImageCarousel()}

      <div className="mt-4 flex space-x-4">
        <button
          onClick={() => setShowRecipe(!showRecipe)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showRecipe ? "Ẩn công thức" : "Xem công thức"}
        </button>
        <button
          onClick={handleShowDetailedRecipe}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <ClipLoader color="#ffffff" size={20} /> : "Xem chi tiết"}
        </button>
      </div>

      {showRecipe && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">Nguyên liệu:</h4>
          <ul className="list-disc pl-5 text-gray-600">
            {item.ingredients?.length > 0 ? (
              item.ingredients.map((ing: string, idx: number) => (
                <li key={idx}>{ing}</li>
              ))
            ) : (
              <li>Không có thông tin nguyên liệu</li>
            )}
          </ul>
          <h4 className="text-lg font-semibold text-gray-800 mt-4">
            Hướng dẫn:
          </h4>
          <p className="text-gray-600">
            {item.instructions || "Không có hướng dẫn"}
          </p>
        </div>
      )}
    </div>
  );
}

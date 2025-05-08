interface Prompts {
    diningPrompt: (
        location: string,
        budget: string,
        cuisine: string | null
    ) => string;
    cookingPrompt: (cuisine: string, complexity: string) => string;
    detailedRecipePrompt: (name: string, cuisine: string, complexity: string) => string;
}

const viPrompts: Prompts = {
    diningPrompt: (location: string, budget: string, cuisine: string | null) => `
      Bạn là một chuyên gia ẩm thực tại ${location}.
      
      Nhiệm vụ:
      - Gợi ý đúng 10 quán ăn tại "${location}" với ngân sách khoảng "${budget}" VND${cuisine ? `, phục vụ ẩm thực "${cuisine}"` : ''}.
      - Mỗi quán cần có thông tin: tên quán, loại ẩm thực, ngân sách ước tính (VND), đánh giá (từ 0-5), vĩ độ (latitude), kinh độ (longitude), địa chỉ cụ thể, nhận xét tổng hợp về quán (mô tả ngắn gọn về chất lượng, không khí, hoặc đặc điểm nổi bật), và danh sách 3-5 từ khóa tìm kiếm hình ảnh (imageKeywords) bằng tiếng Anh, phù hợp để tìm ảnh minh họa món ăn hoặc không gian quán trên các nguồn như Unsplash (ví dụ: ["pho", "beef", "Hanoi"] hoặc ["pizza", "Italian", "restaurant"]).
      - Đảm bảo từ khóa bằng tiếng Anh, cụ thể, liên quan trực tiếp đến món ăn đặc trưng hoặc không gian quán, tránh từ khóa chung chung như "food" hoặc "restaurant" trừ khi cần thiết.
      - Tất cả thông tin khác (tên, địa chỉ, nhận xét, v.v.) phải bằng tiếng Việt chuẩn mực.
      - Đảm bảo thông tin rõ ràng, chính xác, phù hợp với ngân sách và địa điểm.
      - Chỉ trả về JSON hợp lệ, không thêm bất kỳ văn bản giải thích, comment, hoặc ký tự thừa nào ngoài JSON.
      
      Yêu cầu ngôn ngữ:
      - Trừ imageKeywords (bằng tiếng Anh), viết toàn bộ bằng tiếng Việt chuẩn mực.
      - Tránh lỗi chính tả, ngữ pháp.
      
      Định dạng đầu ra:
      - Chỉ trả về mảng JSON dưới đây, không thêm nội dung thừa:
      [
        {
          "name": "string",
          "cuisine": "string",
          "budget": number,
          "rating": number,
          "latitude": number,
          "longitude": number,
          "address": "string",
          "review": "string",
          "imageKeywords": ["string"]
        },
        ...
      ]
    `,

    cookingPrompt: (cuisine: string, complexity: string) => `
      Bạn là một đầu bếp chuyên nghiệp chuyên về ẩm thực ${cuisine}.
      
      Nhiệm vụ:
      - Gợi ý đúng 10 công thức nấu ăn thuộc ẩm thực "${cuisine}" với độ phức tạp "${complexity}".
      - Mỗi công thức cần có: tên món, loại ẩm thực, độ phức tạp, danh sách nguyên liệu, hướng dẫn nấu, và danh sách 3-5 từ khóa tìm kiếm hình ảnh (imageKeywords) bằng tiếng Anh, phù hợp để tìm ảnh minh họa món ăn trên các nguồn như Unsplash (ví dụ: ["pizza", "margherita", "cheese"] hoặc ["bun bo", "Hue", "spicy"]).
      - Đảm bảo từ khóa bằng tiếng Anh, cụ thể, liên quan trực tiếp đến món ăn, tránh từ khóa chung chung như "food" hoặc "dish" trừ khi cần thiết.
      - Tất cả thông tin khác (tên, nguyên liệu, hướng dẫn, v.v.) phải bằng tiếng Việt chuẩn mực.
      - Đảm bảo công thức rõ ràng, phù hợp với độ phức tạp được yêu cầu.
      - Chỉ trả về JSON hợp lệ, không thêm bất kỳ văn bản giải thích, comment, hoặc ký tự thừa nào ngoài JSON.
      
      Yêu cầu ngôn ngữ:
      - Trừ imageKeywords (bằng tiếng Anh), viết toàn bộ bằng tiếng Việt chuẩn mực.
      - Tránh lỗi chính tả, ngữ pháp.
      
      Định dạng đầu ra:
      - Chỉ trả về mảng JSON dưới đây, không thêm nội dung thừa:
      [
        {
          "name": "string",
          "cuisine": "string",
          "complexity": "string",
          "ingredients": ["string"],
          "instructions": "string",
          "imageKeywords": ["string"]
        },
        ...
      ]
    `,

    detailedRecipePrompt: (name: string, cuisine: string, complexity: string) => `
      Bạn là một đầu bếp chuyên nghiệp. Nhiệm vụ:
      - Cung cấp công thức siêu chi tiết cho món "${name}" thuộc ẩm thực "${cuisine}" với độ phức tạp "${complexity}".
      - Công thức phải bao gồm:
        - Tên món (bằng tiếng Việt).
        - Loại ẩm thực (bằng tiếng Việt).
        - Thời gian chuẩn bị (prepTime, ví dụ: "30 phút").
        - Số khẩu phần (servings, số nguyên, ví dụ: 2).
        - Danh sách nguyên liệu (ingredients) với định lượng cụ thể (ví dụ: "200g thịt bò", "1 muỗng canh nước mắm").
        - Hướng dẫn nấu (instructions) chi tiết từng bước, mỗi bước là một chuỗi (bằng tiếng Việt).
        - Mẹo nấu ăn (tips) gồm 2-5 mẹo hữu ích (bằng tiếng Việt).
      - Tất cả thông tin phải bằng tiếng Việt chuẩn mực, rõ ràng, dễ hiểu.
      - Chỉ trả về JSON hợp lệ, không thêm bất kỳ văn bản giải thích, comment, hoặc ký tự thừa nào ngoài JSON.
      
      Yêu cầu ngôn ngữ:
      - Viết toàn bộ bằng tiếng Việt chuẩn mực.
      - Tránh lỗi chính tả, ngữ pháp.
      
      Định dạng đầu ra:
      {
        "name": "string",
        "cuisine": "string",
        "prepTime": "string",
        "servings": number,
        "ingredients": [{"name": "string", "quantity": "string"}],
        "instructions": ["string"],
        "tips": ["string"]
      }
    `,
};

export const prompts: Record<string, Prompts> = {
    vi: viPrompts,
};
import { NextResponse } from 'next/server';
import axios from 'axios';
import { prompts } from '@/app/utils/prompts';

export async function POST(request: Request) {
    const { type, location, budget, cuisine, complexity } = await request.json();

    // Chọn prompt dựa trên type (dining hoặc cooking)
    let prompt: string;
    if (type === 'dining') {
        prompt = prompts.vi.diningPrompt(location, budget, cuisine);
    } else if (type === 'cooking') {
        prompt = prompts.vi.cookingPrompt(cuisine, complexity);
    } else {
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    try {
        // Gọi Hugging Face API
        const response = await axios.post(
            'https://router.huggingface.co/novita/v3/openai/chat/completions',
            {
                model: 'meta-llama/llama-4-maverick-17b-128e-instruct-fp8',
                stream: false,
                max_tokens: 4096,
                temperature: 1.0,
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Lấy nội dung thô từ response
        const raw = response.data.choices?.[0]?.message?.content ?? '';
        console.log('Raw response:', raw); // Log dữ liệu thô để debug

        // Làm sạch dữ liệu
        let cleaned = raw
            .replace(/```json/gi, '') // Loại bỏ ```json
            .replace(/```/gi, '') // Loại bỏ ```
            .replace(/\a/g, '*') // Thay ký tự lạ
            .replace(/[-\u001F\u007F-\u009F]/g, '') // Loại bỏ control characters
            .trim();

        // Thử sửa JSON bị cắt
        if (!cleaned.endsWith(']')) {
            cleaned = cleaned + ']';
        }
        if (!cleaned.startsWith('[')) {
            cleaned = '[' + cleaned;
        }

        console.log('Cleaned response:', cleaned); // Log dữ liệu sau khi làm sạch

        // Parse JSON
        let results;
        try {
            results = JSON.parse(cleaned);
            // Kiểm tra results là mảng và có đúng 10 phần tử
            if (!Array.isArray(results) || results.length !== 10) {
                throw new Error('Response is not an array or does not contain exactly 10 items');
            }
        } catch (error) {
            console.error('Error parsing suggestion JSON:', error);
            return NextResponse.json({ error: 'Invalid response format', raw }, { status: 500 });
        }

        // Gọi Unsplash API để lấy ảnh thật
        const unsplashAccessKey = process.env.UNSPLASH_API_KEY;
        if (!unsplashAccessKey) {
            console.error('UNSPLASH_API_KEY is not defined in .env.local');
            // Trả về results với placeholder nếu không có key
            results = results.map((item: any) => ({
                ...item,
                imageUrls: [
                    'https://via.placeholder.com/300',
                    'https://via.placeholder.com/300',
                    'https://via.placeholder.com/300',
                ],
            }));
            return NextResponse.json({ results });
        }

        // Thêm imageUrls từ Unsplash cho từng món/quán
        const updatedResults = await Promise.all(
            results.map(async (item: any) => {
                try {
                    // Query chính: dùng imageKeywords (nếu có)
                    let query = item.imageKeywords?.length >= 3
                        ? item.imageKeywords.join(' ') // Join keywords thành chuỗi
                        : item.name; // Fallback về item.name nếu không có keywords

                    console.log(`Unsplash query for ${item.name}:`, query); // Log query để debug

                    let unsplashResponse = await axios.get(
                        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                            query
                        )}&per_page=3&orientation=landscape`,
                        {
                            headers: {
                                Authorization: `Client-ID ${unsplashAccessKey}`,
                            },
                        }
                    );

                    let imageUrls = unsplashResponse.data.results.map((photo: any) => photo.urls.regular);

                    // Fallback 1: Nếu không tìm thấy ảnh cho query chính, thử item.name (nếu chưa thử)
                    if (imageUrls.length < 2 && query !== item.name) {
                        query = item.name;
                        console.log(`Fallback query for ${item.name}:`, query);
                        unsplashResponse = await axios.get(
                            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                                query
                            )}&per_page=3&orientation=landscape`,
                            {
                                headers: {
                                    Authorization: `Client-ID ${unsplashAccessKey}`,
                                },
                            }
                        );
                        imageUrls = unsplashResponse.data.results.map((photo: any) => photo.urls.regular);
                    }

                    // Fallback 2: Nếu vẫn không đủ ảnh, thử item.cuisine
                    if (imageUrls.length < 2) {
                        query = type === 'dining' ? `${item.cuisine} restaurant` : `${item.cuisine} food`;
                        console.log(`Fallback query for ${item.name}:`, query);
                        unsplashResponse = await axios.get(
                            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
                                query
                            )}&per_page=3&orientation=landscape`,
                            {
                                headers: {
                                    Authorization: `Client-ID ${unsplashAccessKey}`,
                                },
                            }
                        );
                        imageUrls = unsplashResponse.data.results.map((photo: any) => photo.urls.regular);
                    }

                    // Fallback 3: Nếu vẫn không đủ, dùng placeholder
                    return {
                        ...item,
                        imageUrls: imageUrls.length >= 2 ? imageUrls : [
                            'https://via.placeholder.com/300',
                            'https://via.placeholder.com/300',
                            'https://via.placeholder.com/300',
                        ],
                    };
                } catch (unsplashError) {
                    console.error(`Unsplash API error for ${item.name}:`, unsplashError);
                    return {
                        ...item,
                        imageUrls: [
                            'https://via.placeholder.com/300',
                            'https://via.placeholder.com/300',
                            'https://via.placeholder.com/300',
                        ],
                    };
                }
            })
        );

        return NextResponse.json({ results: updatedResults });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
    }
}
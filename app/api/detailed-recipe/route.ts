import { NextResponse } from 'next/server';
import axios from 'axios';
import { prompts } from '@/app/utils/prompts';

export async function POST(request: Request) {
    const { name, cuisine, complexity } = await request.json();

    // Kiểm tra input
    if (!name || !cuisine || !complexity) {
        return NextResponse.json({ error: 'Missing required fields: name, cuisine, complexity' }, { status: 400 });
    }

    // Lấy prompt
    const prompt = prompts.vi.detailedRecipePrompt(name, cuisine, complexity);

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
        if (!cleaned.endsWith('}')) {
            cleaned = cleaned + '}';
        }
        if (!cleaned.startsWith('{')) {
            cleaned = '{' + cleaned;
        }

        console.log('Cleaned response:', cleaned); // Log dữ liệu sau khi làm sạch

        // Parse JSON
        let recipe;
        try {
            recipe = JSON.parse(cleaned);
            // Kiểm tra format công thức
            if (
                !recipe.name ||
                !recipe.cuisine ||
                !recipe.prepTime ||
                !recipe.servings ||
                !Array.isArray(recipe.ingredients) ||
                !Array.isArray(recipe.instructions) ||
                !Array.isArray(recipe.tips)
            ) {
                throw new Error('Response does not match expected recipe format');
            }
        } catch (error) {
            console.error('Error parsing recipe JSON:', error);
            return NextResponse.json({ error: 'Invalid response format', raw }, { status: 500 });
        }

        return NextResponse.json({ recipe });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch detailed recipe' }, { status: 500 });
    }
}
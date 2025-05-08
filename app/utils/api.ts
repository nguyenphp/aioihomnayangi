import axios from "axios";
import { prompts } from '@/app/utils/prompts';

interface DetailedRecipe {
    name: string;
    cuisine: string;
    prepTime: string;
    servings: number;
    ingredients: { name: string; quantity: string }[];
    instructions: string[];
    tips: string[];
}

export const fetchDetailedRecipe = async (
    name: string,
    cuisine: string,
    complexity: string
): Promise<DetailedRecipe> => {
    try {
        const prompt = prompts.vi.detailedRecipePrompt(name, cuisine, complexity);
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

        const data = response.data[0]?.generated_text || "{}";
        const parsed = JSON.parse(data);
        return parsed;
    } catch (error) {
        console.error(`Error fetching detailed recipe for ${name}:`, error);
        throw new Error("Không thể lấy công thức chi tiết");
    }
};
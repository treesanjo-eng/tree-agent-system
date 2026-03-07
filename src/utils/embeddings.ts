import { pipeline } from '@xenova/transformers';

let extractor: any = null;

/**
 * Initializes and returns the Xenova embedding pipeline.
 * We use multilingual-e5-small which runs entirely locally/freely.
 */
const getExtractor = async () => {
    if (!extractor) {
        console.log('[EMBEDDING] Loading multilingual-e5-small model...');
        extractor = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small', {
            quantized: true,
        });
        console.log('[EMBEDDING] Model loaded successfully!');
    }
    return extractor;
};

/**
 * Converts text into a 384-dimensional vector embedding.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
    const fn = await getExtractor();

    // e5 model standard: prefix passages with "passage: " and queries with "query: "
    // For simplicity, we just use the raw text, but adding 'passage: ' improves accuracy.
    const output = await fn(`passage: ${text}`, { pooling: 'mean', normalize: true });

    // Extract the raw float array and convert to JS array
    return Array.from(output.data);
};

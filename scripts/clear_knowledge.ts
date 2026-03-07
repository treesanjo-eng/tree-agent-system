import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearKnowledge() {
    console.log('Clearing old company_knowledge data...');
    const { error } = await supabase
        .from('company_knowledge')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error('Failed to clear knowledge:', error);
    } else {
        console.log('Successfully cleared all rows from company_knowledge.');
    }
}

clearKnowledge();

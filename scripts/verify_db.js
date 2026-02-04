
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic manual parser for .env.local without external deps
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envConfig = {};

envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0) {
        envConfig[key.trim()] = values.join('=').trim();
    }
});

const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'] || envConfig['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
    console.log(`Connecting to URL: ${supabaseUrl}`);

    // Check Leads Count
    const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log(`Current Total Leads: ${count}`);
    }

    // List sample rows
    const { data: leads } = await supabase
        .from('leads')
        .select('business_name, website')
        .limit(5);

    if (leads && leads.length > 0) {
        console.log('Sample Data:', leads);
    } else {
        console.log('Table appears empty to select query.');
    }
}

checkDb();

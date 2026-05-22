/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://auqyahcowjkjkbbwrmug.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1cXlhaGNvd2pramtiYndybXVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI5MTk1NywiZXhwIjoyMDk0ODY3OTU3fQ.DftgOaH4WgB8prKgPSUMqdQVWl70jIzLD8ZS8WUKBXc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, product_variants(*)');
  
  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Products in DB:', JSON.stringify(products, null, 2));
  }
}

test();

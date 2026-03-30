const { createClient } = require('@supabase/supabase-js')

const url = 'https://zmtowqkcfcanzumodvsu.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptdG93cWtjZmNhbnp1bW9kdnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTQyMTUsImV4cCI6MjA4OTM5MDIxNX0.RCZaQdhVAyClFAglnCRzlFhpuN-1ZzlAjoBFuxh03dE'

console.log('Testing Supabase connection to:', url)

const supabase = createClient(url, key)

async function test() {
  console.time('fetch-products')
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1)
    if (error) {
      console.error('Error fetching products:', error)
    } else {
      console.log('Successfully fetched 1 product:', data[0]?.title)
    }
  } catch (err) {
    console.error('Fetch caught error:', err)
  }
  console.timeEnd('fetch-products')

  console.time('rpc-call')
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_category_stats')
    if (rpcError) {
      console.error('Error in RPC call:', rpcError)
    } else {
      console.log('Successfully called get_category_stats RPC')
    }
  } catch (err) {
    console.error('RPC caught error:', err)
  }
  console.timeEnd('rpc-call')
}

test()

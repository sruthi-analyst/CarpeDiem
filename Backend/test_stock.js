import yahooFinance from 'yahoo-finance2';

async function test() {
  try {
    const quote = await yahooFinance.quote('AAPL');
    console.log('✅ AAPL Quote:', quote.shortName);
  } catch (err) {
    console.error('❌ AAPL Search Failed:', err);
  }
}

test();



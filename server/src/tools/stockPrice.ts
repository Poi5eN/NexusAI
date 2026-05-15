import axios from 'axios';

interface YahooFinanceResponse {
  chart: {
    result: Array<{
      meta: {
        currency: string;
        symbol: string;
        exchangeName: string;
        regularMarketPrice: number;
        previousClose: number;
      };
    }>;
    error: any;
  };
}

export async function getStockPrice(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
    
    const response = await axios.get<YahooFinanceResponse>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const result = response.data.chart.result?.[0];
    if (!result) {
      throw new Error('No stock data found in response');
    }

    const meta = result.meta;

    if (!meta || typeof meta.regularMarketPrice !== 'number') {
      throw new Error('Incomplete stock data received');
    }

    const price = meta.regularMarketPrice;
    const previousClose = meta.previousClose || price; // Fallback to current price if missing
    const change = price - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    return `
${symbol.toUpperCase()} Real-Time Data

Price: $${price.toFixed(2)}
Change: $${change.toFixed(2)} (${changePercent.toFixed(2)}%)
Previous Close: $${previousClose.toFixed(2)}
Currency: ${meta.currency || 'USD'}
Exchange: ${meta.exchangeName || 'Unknown'}
`;
  } catch (error) {
    return `Failed to fetch stock price for ${symbol}. Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}

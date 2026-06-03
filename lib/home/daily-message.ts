type ZenQuote = {
  a?: string;
  q?: string;
};

export async function getDailyMessage() {
  try {
    const response = await fetch("https://zenquotes.io/api/today", {
      next: { revalidate: 60 * 60 }
    });

    if (!response.ok) {
      return null;
    }

    const quotes = (await response.json()) as ZenQuote[];
    const quote = quotes[0];

    if (!quote?.q) {
      return null;
    }

    return {
      author: quote.a?.trim() || "Unknown",
      text: quote.q.trim()
    };
  } catch {
    return null;
  }
}

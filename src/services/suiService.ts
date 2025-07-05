const NEXA_API_KEY = import.meta.env.VITE_NEXA_API_KEY;
const NEXA_BASE_URL = "https://api-ex.insidex.trade";

export interface TokenHolder {
  address: string;
  balance: string;
  percentage: number;
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
}

// Fetch token total supply and metadata
export const getTokenInfo = async (coinType: string): Promise<TokenInfo> => {
  try {
    const res = await fetch(`${NEXA_BASE_URL}/coins/${coinType}/supply`, {
      headers: {
        "x-api-key": NEXA_API_KEY,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch token supply");

    const json = await res.json();
    console.log("Nexa supply response:", json);

    

    if (!json?.coin || typeof json.supply !== "number") {
      console.warn("No supply data found, returning default placeholder info");
      const fallbackName = coinType.split("::")[2] || "Unknown Token";
      return {
        symbol: fallbackName.toUpperCase(),
        name: fallbackName,
        decimals: json.decimals ?? 0,
        totalSupply: (json.supply ?? 0).toString(),
      };
      
    }

    const fallbackName = coinType.split("::")[2] || "Unknown Token";

    return {
      symbol: fallbackName.toUpperCase(),
      name: fallbackName,
      decimals: 9,
      totalSupply: (json.supply ?? 0).toString()
    };
  } catch (error) {
    console.error("Error in getTokenInfo:", error);
    throw new Error("Failed to fetch token info");
  }
};



// Fetch top token holders
export const getTokenHolders = async (
  coinType: string,
  limit: number = 20
): Promise<TokenHolder[]> => {
  try {
    const res = await fetch(
      `${NEXA_BASE_URL}/coin-holders/${coinType}/holders?limit=${limit}&skip=0`,
      {
        headers: {
          "x-api-key": NEXA_API_KEY,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch token holders");

    const json = await res.json();
    console.log("holders response", json);

    if (!Array.isArray(json)) {
      throw new Error("Unexpected holders response format");
    }

    return json.map((holder: any) => ({
      address: holder.user,
      balance: holder.balanceScaled.toString(),
      percentage: parseFloat(holder.percentage),
    }));
  } catch (error) {
    console.error("Error in getTokenHolders:", error);
    throw new Error("Failed to fetch token holders");
  }
};

// Format a stringified balance
export const formatBalance = (balance: string, decimals: number): string => {
  const [whole, frac = ""] = balance.split(".");
  const fractionalPart = frac.slice(0, decimals).padEnd(decimals, "0").replace(/0+$/, "");
  return fractionalPart ? `${whole}.${fractionalPart}` : whole;
};

// Validators
export const isValidCoinType = (coinType: string): boolean => {
  return /^0x[a-fA-F0-9]+::[a-zA-Z_][a-zA-Z0-9_]*::[a-zA-Z_][a-zA-Z0-9_]*$/.test(coinType);
};

export const isValidSuiAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
};

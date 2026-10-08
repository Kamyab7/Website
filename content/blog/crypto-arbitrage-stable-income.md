---
title: "Crypto Arbitrage: Can Arbitrage Be a Stable Source of Income?"
description: "What I learned from building a C# monitor for Bitvavo and Kraken: observed spreads, trading fees, and the challenges of earning a stable income from crypto arbitrage."
date: "2026-10-08"
tags: ["Crypto", "Arbitrage", "C#"]
draft: false
---

I had this question in mind: can crypto arbitrage earn a stable, sufficient income?

## What I did

I spent two days building a tool to monitor exchanges. I considered Bitvavo and Kraken, as these two had WebSocket APIs and API SDKs to perform operations using third-party apps.

I used C# because I am more proficient in C#, but I also thought that maybe I could use Rust later if I noticed that the bottleneck was the tech stack.

## Results

I monitored these exchanges across 15 EUR symbols, and here is the result from the approximately 14 minutes of logs I reviewed:

| Measurement | Result |
| --- | ---: |
| Symbols receiving prices from both exchanges | 15 |
| Price updates | 363,815 |
| Buy/sell comparisons | 614,186 |
| Freshness rejections | 56,520 |
| Signals above the 0.1% threshold | 14, all SOL/EUR |
| Best observed spread | 0.1389% |

The planned run was one hour; these are interim results. The monitor used zero estimated fees and slippage and rejected quotes older than one second. It did not place trades.

The best spread was buying SOL on Bitvavo at €100.041 and selling on Kraken at €100.18. At the logged quantity of about 1.124 SOL, that meant approximately **€0.16 profit before costs**.

Considering the fees, there does not seem to be any profitable opportunity in this sample under the rates examined.

| Hypothetical execution of all 14 signals | Result |
| --- | ---: |
| Before fees | €2.53 profit |
| With illustrative fees of 0.1% on each exchange | €1.45 loss |
| With published starting-tier assumptions: Bitvavo 0.25%, Kraken 0.80% | €18.37 loss |

Several signals repeated the same quoted liquidity in two short bursts, so these totals assume every signal could be executed independently. They are hypothetical, and no profit was realised. The published rates were checked on October 8, 2026; my actual account rates are unknown. Sources: [Bitvavo fees](https://bitvavo.com/en/fees) and [Kraken fees](https://www.kraken.com/features/fee-schedule).

## Challenges

Here are the challenges I can see that narrow down the arbitrage opportunities:

- **Fees:** Arbitrage usually depends on a small amount of profit, and if you could do it over a huge number of trades, it could be a profitable source of income. So even small fees can make a loss rather than a profit.
- **Price gaps closing:** Arbitrage usually works against itself. This strategy is like how temperature moves toward balance: trading between two exchanges moves prices until they become balanced.
- **Slippage:** The moment you want to place an order, the price may have changed from the moment you identified the opportunity.
- **Latency:** Latency matters, so better infrastructure and choosing locations for better network latency cost money.

## Other findings

- Increasing the amount traded does not fix a percentage-based loss: both spread profit and fees grow with the amount. Larger orders can also exceed the quantity available at the best price.
- The best observed spread leaves room for only about **0.139% combined fees** before breaking even, without slippage or other costs.
- Maker orders can reduce fees, but they may not fill. One trade leg may fill while the other fails, leaving an exposed position.
- Lower-fee markets are worth investigating. Bitvavo lists starting fees of **0.05% for crypto/USDC pairs**, but those markets need their own price and liquidity measurements. [Bitvavo fee schedule](https://bitvavo.com/en/fees).
- Paying Binance fees with BNB reduces the standard **0.1% fee to 0.075%**, rather than eliminating it. Binance's Dutch withdrawal-only notice also makes availability a blocker for me; no official reopening announcement was found in the journal review. [BNB discount](https://www.binance.com/en/support/faq/detail/e85d6e703b874674840122196b89780a), [Netherlands notice](https://www.binance.com/en/support/announcement/detail/b5a647be31cf469b87fc3337fd461ced).

## My assumption

So my assumption is: yes, you can maybe earn a really small amount of money from arbitrage, but it does not seem worth the effort to me, and I do not see it as a stable source of income under the conditions I tested.

This is my initial conclusion from a short sample. Lower fees, different markets, and successful execution still need to be tested.

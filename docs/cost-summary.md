# Cost summary: Project 2 Cloud-Hosted Website

**Pricing model:** consumption-based (OpEx). No hardware purchased, no upfront capital expense. I pay only for what the resources use, and the main service runs on a free tier.

> List prices below are approximate USD figures for planning. Confirm them in the Azure Pricing Calculator (https://azure.microsoft.com/pricing/calculator/) for your region before presenting. Replace the "Actual" column with the figures from **Cost Management → Cost analysis** before you delete the resource group.

## Resources and expected cost

| Resource | Tier / SKU | What's included free | Expected monthly cost | Actual (fill in) |
|---|---|---|---|---|
| Azure Static Web Apps | **Free** | Hosting, global edge, free SSL, 100 GB bandwidth/month, managed Functions API | **$0.00** | $ |
| Azure Functions (managed by SWA) | Included with SWA | Runs only when the form is submitted | **$0.00** | $ |
| Azure Storage account (Table) | Standard LRS | — | **< $0.05** (a few KB of data, a few hundred transactions) | $ |
| Application Insights / Log Analytics | Pay-as-you-go | First 5 GB of data ingestion per month free | **$0.00** (well under 5 GB) | $ |
| Service Health alerts | — | Free | **$0.00** | $ |
| Cost Management budget | — | Free | **$0.00** | $ |
| GitHub repository + Actions | Free | Public repos: free Actions minutes | **$0.00** | $ |
| **Total** | | | **≈ $0.00 – $0.05** | **$** |

## Cost controls in place

1. **Free / lowest tiers only:** SWA Free plan, LRS storage, default Application Insights sampling.
2. **Budget alert:** `budget-project2` set to **$5/month**, with email alerts at **50%, 80% and 100%** of actual spend.
3. **Single resource group:** everything lives in `rg-project2-website`, so cost analysis is filtered in one place.
4. **Clean-up:** the entire resource group is **deleted after the demo**, so spending stops at that point.

## CapEx vs OpEx comparison (for the presentation)

| | Traditional on-premises server (CapEx) | This project on Azure (OpEx) |
|---|---|---|
| Upfront cost | Server hardware, UPS, networking (hundreds of dollars or more) | **$0** |
| Ongoing cost | Electricity, internet, maintenance, my time patching the OS | Pay-per-use, ≈ **$0** at this traffic level |
| SSL certificate | Buy or manage renewal myself | **Free and auto-renewing** |
| Handling a traffic spike | Limited by one machine | Scales automatically on the edge network |
| When the project ends | Hardware still owned and depreciating | Delete the resource group: cost stops |

## Final spend (complete before the presentation)

- Period: `____` to `____`
- Total from Cost Management: **$____**
- Credits remaining (Azure for Students): **$____**
- Budget alerts triggered: **Yes / No**
- Screenshot: `docs/cost-analysis.png` *(add before demo)*

# Project 2: Cloud-Hosted Website

A responsive, four-page static website (Home, About, Services, Contact) deployed on **Azure Static Web Apps**, with a serverless **Azure Functions** contact form, **GitHub Actions** CI/CD, **Application Insights** monitoring and **Cost Management** budget alerts.

| | |
|---|---|
| **Cloud** | Microsoft Azure (PaaS + serverless) |
| **Email** | sgujjar0438@dbu.edu |

## Architecture


1. I push changes to a `feature/*` branch and open a pull request. GitHub Actions deploys a temporary **preview environment**.
2. Merging into `main` triggers the production deployment to **Azure Static Web Apps**.
3. Visitors load the pages over **HTTPS** from Azure's global edge network (free SSL certificate).
4. The contact form sends JSON to `/api/contact`, which runs the **Azure Function** in `api/`.
5. The function validates the input and stores the message in **Azure Table Storage**.
6. **Application Insights** records requests and errors. **Service Health** and **Cost Management** send alerts.

## Project structure

```
cloud-hosted-website/
├── .github/workflows/azure-static-web-apps.yml   # CI/CD pipeline
├── src/                                          # static site (app_location)
│   ├── index.html  about.html  services.html  contact.html  404.html
│   ├── css/styles.css                            # mobile-first responsive styles
│   ├── js/main.js                                # nav menu + contact form logic
│   ├── images/favicon.svg
│   └── staticwebapp.config.json                  # security headers, 404, caching
├── api/                                          # Azure Functions (api_location)
│   ├── src/functions/contact.js                  # POST /api/contact
│   ├── host.json  package.json
│   └── local.settings.example.json
└── docs/
    ├── architecture.svg / architecture.png
    ├── deployment-guide.md                       # step-by-step Azure + GitHub setup
    └── cost-summary.md                           # cost plan + final spend template
```

## Run locally

Open `src/index.html` in a browser to view the pages. To test the contact API locally as well:

```bash
npm install -g @azure/static-web-apps-cli azure-functions-core-tools@4 azurite
cd api && npm install && cp local.settings.example.json local.settings.json && cd ..
azurite --silent &                 # local storage emulator
swa start src --api-location api   # site + API on http://localhost:4280
```

## Deploy

Follow **[docs/deployment-guide.md](docs/deployment-guide.md)**. In short: create a resource group, create the Static Web App linked to this repo (Free plan, app location `src`, API location `api`, output location blank), add the `STORAGE_CONNECTION_STRING` app setting, and push to `main`.

## Course concepts demonstrated

| Concept | How it's shown |
|---|---|
| **Consumption-based pricing (OpEx)** | No upfront hardware. Free SWA tier and pay-per-use storage and functions. See `docs/cost-summary.md`. |
| **Shared responsibility (PaaS)** | Microsoft runs the datacenter, network, hosts, OS patching and TLS. I own the code, content, data, secrets, accounts and identities. |
| **Scalability** | Static content is served from a global edge network, and the function scales out automatically on demand. |
| **Monitoring** | Application Insights (requests, failures, latency), Azure Monitor, Service Health alerts. |
| **Security** | HTTPS only, HSTS, strict CSP, secrets in app settings, honeypot + server-side validation, least-privilege access with MFA. |
| **Cost control** | $5 budget with 50/80/100% alerts. All resources deleted after the demo. |

## Completion checklist

- [ ] Create a GitHub account / repository
- [x] Create the website homepage (`index.html`)
- [x] Create the About page
- [x] Create the Services page
- [x] Create the Contact page
- [x] Add CSS styling and JavaScript
- [x] Make the website responsive for phones and computers
- [ ] Deploy the website using Azure Static Web Apps
- [ ] Connect GitHub to Azure for automatic deployment
- [ ] Test the live website using its public HTTPS URL
- [x] Prepare an architecture diagram
- [ ] Prepare the presentation and cost summary (fill in final spend in `docs/cost-summary.md`)

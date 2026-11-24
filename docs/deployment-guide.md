# Deployment guide: Azure Static Web Apps + GitHub

Follow these steps in order. Expect about 45–60 minutes the first time. Everything stays on free or near-free tiers.

---

## 0. Prerequisites

- An Azure account. **Azure for Students** gives free credit with no card required. Sign in at https://portal.azure.com.
- A GitHub account, with **two-factor authentication turned on** (Settings → Password and authentication).
- Git installed locally (and optionally VS Code).

---

## 1. Put the code on GitHub

```bash
cd cloud-hosted-website
git init
git add .
git commit -m "Initial site, API and pipeline"
git branch -M main
git remote add origin https://github.com/<your-username>/cloud-hosted-website.git
git push -u origin main
```

Then create the feature branch you will work on:

```bash
git checkout -b feature/content-updates
git push -u origin feature/content-updates
```

**Protect `main` (optional but recommended):** Repo → Settings → Branches → Add rule for `main` → require a pull request before merging.

> The first push to `main` will run the workflow and **fail** because the deploy token doesn't exist yet. That's expected. It will pass after step 3.

---

## 2. Create the resource group

Azure portal → **Resource groups** → **Create**

| Field | Value |
|---|---|
| Subscription | Azure for Students (or yours) |
| Name | `rg-project2-website` |
| Region | e.g. **West Europe** or **South Africa North** |

---

## 3. Create the Static Web App

Portal → **Create a resource** → search **Static Web App** → **Create**

| Field | Value |
|---|---|
| Resource group | `rg-project2-website` |
| Name | `swa-project2-website` (any unique name) |
| Plan type | **Free** |
| Deployment source | **Other** *(recommended, so this repo's workflow is used as-is)* |

Click **Review + create** → **Create**.

Then:
1. Open the new Static Web App → **Overview** → **Manage deployment token** → copy the token.
2. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: *(paste the token)*
3. GitHub → **Actions** tab → open the failed run → **Re-run all jobs**. It should now go green.
4. Back in Azure → **Overview** → open the **URL** (`https://<random-name>.azurestaticapps.net`). The site is live over HTTPS.

> **Alternative:** if you pick **GitHub** as the deployment source instead, Azure commits its own workflow file to the repo. In that case delete `.github/workflows/azure-static-web-apps.yml` (keep Azure's), and in Azure's file set `app_location: "src"`, `api_location: "api"`, `output_location: ""`.

---

## 4. Create storage for contact messages

Portal → **Create a resource** → **Storage account**

| Field | Value |
|---|---|
| Resource group | `rg-project2-website` |
| Name | `stproject2web<random digits>` (lowercase, globally unique) |
| Performance | Standard |
| Redundancy | **LRS** (cheapest) |
| Advanced → Allow anonymous blob access | **Disabled** |
| Advanced → Minimum TLS | 1.2 |

After it's created: Storage account → **Security + networking → Access keys** → **Show** → copy **Connection string** (key1).

---

## 5. Add the secret to the app (not to the code)

Static Web App → **Settings → Environment variables** → **Production** → **Add**

| Name | Value |
|---|---|
| `STORAGE_CONNECTION_STRING` | *(paste the connection string)* |
| `CONTACT_TABLE_NAME` | `ContactMessages` *(optional)* |

Click **Apply**. Now submit the contact form on the live site. You should see a green "Thanks!" message.

**Verify:** Storage account → **Storage browser → Tables → ContactMessages**. Your message appears as a row.

---

## 6. Monitoring

**Application Insights**
1. Portal → **Create a resource** → **Application Insights** → resource group `rg-project2-website`, name `appi-project2`, workspace-based (default) → Create.
2. Copy its **Connection String** from the Overview page.
3. Static Web App → **Environment variables** → add `APPLICATIONINSIGHTS_CONNECTION_STRING` = *(that value)* → Apply.
4. Submit the form a few times, then open Application Insights → **Live metrics**, **Failures** and **Performance**. Take screenshots for the presentation.

**Service Health alert**
Portal → **Service Health** → **Health alerts** → **Create service health alert**
- Services: *Static Web Apps, Functions, Storage*. Regions: *your region + Global*.
- Action group: create one that **emails you**.

**(Optional) Failure alert**
Application Insights → **Alerts → Create → Alert rule** → signal **Failed requests** > 5 in 5 minutes → same action group.

---

## 7. Budget and cost alert

Portal → **Cost Management + Billing** → **Budgets** → **Add**

| Field | Value |
|---|---|
| Scope | Your subscription (or the resource group) |
| Name | `budget-project2` |
| Reset period | Monthly |
| Amount | **$5** |
| Alerts | Actual 50%, 80%, 100% → your email |

> On Azure for Students, the credit balance is also shown under **Cost Management** → **Credits**.

---

## 8. Day-to-day workflow (feature branch → main)

```bash
git checkout feature/content-updates
# ...edit files...
git add . && git commit -m "Update services page"
git push
```

On GitHub open a **Pull request** from `feature/content-updates` into `main`. The workflow posts a **preview URL** on the PR. Check it, then **Merge**. Production redeploys automatically.

---

## 9. (Optional) Custom domain

Static Web App → **Custom domains** → **Add** → follow the CNAME/TXT instructions for your domain registrar. Azure issues the SSL certificate for free.

---

## 10. Testing checklist (before the demo)

- [ ] All four pages open from the public **https://** URL; `http://` redirects to HTTPS
- [ ] Phone (real device or DevTools ≈ 375 px), tablet (≈ 768 px), desktop (≥ 1280 px)
- [ ] Hamburger menu opens and closes on mobile; Escape closes it
- [ ] Chrome, Edge, Firefox (and Safari if available)
- [ ] Contact form: empty fields show errors; valid submit shows success and a row appears in the table
- [ ] A made-up URL (e.g. `/nothing`) shows the custom 404 page
- [ ] Security headers: check https://securityheaders.com with your URL (aim for **A**)
- [ ] Application Insights shows the requests from your tests

---

## 11. Clean up after the demo (avoids any charges)

Portal → **Resource groups** → `rg-project2-website` → **Delete resource group** → type the name → Delete.
This removes the Static Web App, storage, Application Insights and all data in one step. Before you do it, screenshot **Cost analysis** for the final cost summary.

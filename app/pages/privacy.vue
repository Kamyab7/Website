<script setup lang="ts">
import { SITE_URL } from "#shared/site";
const origin = SITE_URL;
const analyticsConfigured = /^G-[A-Z0-9]+$/.test(useRuntimeConfig().public.gaMeasurementId);
const title = 'Privacy & cookies — Kamyab Valipour';
const description = 'How this website handles personal information, optional Google Analytics, and your cookie choices.';
useSeoMeta({ title, description, robots: 'index, follow', themeColor: '#0f172a', ogTitle: title, ogDescription: description, ogType: 'website', ogUrl: `${origin}/privacy` });
useHead({ link: [{ rel: 'canonical', href: `${origin}/privacy` }] });
function openSettings() {
  const button = document.getElementById('cookie-settings');
  if (button?.getAttribute('aria-expanded') !== 'true') button?.click();
  nextTick(() => document.querySelector<HTMLButtonElement>('.cookie-actions button')?.focus());
}
</script>

<template>
  <BlogShell>
    <article>
      <header class="blog-heading">
        <p class="eyebrow">YOUR PRIVACY</p>
        <h1>Privacy & cookies<span class="accent">.</span></h1>
        <p>Last updated: <time datetime="2026-10-04">4 October 2026</time></p>
      </header>
      <div class="prose">
        <p>This notice covers Kamyab Valipour’s portfolio and blog on this website.</p>
        <h2>Who is responsible</h2>
        <p>Kamyab Valipour, based in the Netherlands, is responsible for the personal information processed through this site. For privacy questions or requests, email <a href="mailto:valipourkamyab.official@gmail.com">valipourkamyab.official@gmail.com</a>.</p>
        <h2>Visiting the website</h2>
        <p>You can read the portfolio and blog without creating an account or accepting analytics. The hosting service processes technical information, such as your IP address and requested URLs, to deliver and protect the website. This processing supports the legitimate interest of operating a reliable, secure website.</p>
        <p>The site loads fonts from Google Fonts and some recommendation images from LinkedIn’s image service. Your browser contacts these providers to display those resources, which can disclose your IP address and browser information even when analytics is rejected. Their handling of these requests is covered by their own privacy notices.</p>
        <h2>Optional Google Analytics</h2>
        <p v-if="!analyticsConfigured">Google Analytics is currently not configured on this site, so its analytics tag is not loaded, even if you accept analytics.</p>
        <p>When configured, Google Analytics 4 is loaded only after you accept analytics. It helps understand how visitors use the site and which pages are useful. Processing is based on your consent.</p>
        <p>Analytics may process cookie identifiers, page visits, interaction information, browser and device details, and approximate location. Google receives technical information when your browser connects to its service. The site’s manual page-view events omit query strings, URL fragments, and referrers. Advertising consent remains denied, and Google Signals and advertising personalization are disabled in the site’s configuration.</p>
        <p>Google may process information outside the European Economic Area. Details about Google’s processing and transfer safeguards are available in <a href="https://policies.google.com/privacy">Google’s Privacy Policy</a> and <a href="https://business.safety.google/adsprocessorterms/">Google’s data processing terms</a>.</p>
        <h2>Cookies and local storage</h2>
        <ul>
          <li><strong>Consent preference:</strong> <code>kv-cookie-consent-v1</code> is stored in your browser’s local storage to remember acceptance or rejection for 180 days. This preference is necessary to respect your choice and is not an analytics cookie.</li>
          <li><strong>Theme preference:</strong> <code>kv-theme</code> remembers your System, Light, or Dark selection in local storage until you change it or clear browser storage. It is not used for analytics.</li>
          <li><strong>Analytics cookies:</strong> when analytics is configured and accepted, Google may set <code>_ga</code> and <code>_ga_*</code> cookies to distinguish visits and sessions. The site configures a 180-day cookie lifetime without automatic renewal on each page load.</li>
        </ul>
        <p>You can reject analytics without losing access to the site. You can also change your choice at any time. Rejecting after acceptance disables further collection through the site’s integration and removes accessible Google Analytics cookies; it does not automatically delete information already sent to Google. Withdrawing consent does not affect the lawfulness of processing before withdrawal.</p>
        <p><button class="privacy-settings-button" type="button" @click="openSettings">Manage cookie preferences</button></p>
        <h2>Contacting me</h2>
        <p>If you email me, I receive your email address and any information you choose to include. I use it to respond and manage our correspondence, based on the legitimate interest of answering enquiries, or to take steps at your request before entering a contract where applicable. Email providers process the message as part of delivering and storing email.</p>
        <h2>How long information is kept</h2>
        <p>Your consent choice and the configured analytics cookie lifetime are 180 days. Analytics data stored by Google has a separate retention setting in the GA4 property; the cookie lifetime is not a promise that Google deletes stored analytics data after 180 days. Contact me for the retention setting applicable to your visit.</p>
        <p>Correspondence is kept for as long as needed to address your enquiry and any related obligations or disputes. Technical log retention depends on the hosting provider’s configuration and security needs. You can contact me for details about a particular request.</p>
        <h2>Your rights</h2>
        <p>Depending on the circumstances, you can request access to, correction or deletion of your personal information, restriction of processing, or data portability, and object to processing based on legitimate interests. You can withdraw analytics consent using Cookie settings. To exercise other rights, use the email address above.</p>
        <p>You can lodge a complaint with the Dutch data protection authority, the <a href="https://autoriteitpersoonsgegevens.nl/en">Autoriteit Persoonsgegevens</a>, or your local supervisory authority. Read more about <a href="https://europa.eu/youreurope/citizens/consumers/internet-telecoms/data-protection-online-privacy/index_en.htm">your data protection rights in the EU</a>.</p>
        <h2>External links and changes</h2>
        <p>Links to other websites take you to services with their own privacy practices. This notice may be updated when the site or its services change; the date above shows the latest revision.</p>
      </div>
    </article>
  </BlogShell>
</template>

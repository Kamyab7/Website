<script setup lang="ts">
const siteUrl = new URL(useRuntimeConfig().public.siteUrl).origin;
const title = "Kamyab Valipour — Software Engineer";
const description =
  "Kamyab Valipour is a software engineer based in the Netherlands, focused on .NET, AI-driven solutions, full-stack development, and DevOps. Get in touch.";
const email = "valipourkamyab.official@gmail.com";
const copied = ref(false);
const copyFailed = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email);
    copied.value = true;
    copyFailed.value = false;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 2500);
  } catch {
    copyFailed.value = true;
  }
}
onBeforeUnmount(() => clearTimeout(resetTimer));
useSeoMeta({
  title,
  description,
  author: "Kamyab Valipour",
  robots: "index, follow",
  themeColor: "#101310",
  ogTitle: title,
  ogDescription: description,
  ogType: "website",
  ogUrl: `${siteUrl}/`,
  ogSiteName: "Kamyab Valipour",
  ogLocale: "en_US",
  ogImage: `${siteUrl}/social-card.png`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: "Kamyab Valipour — Software Engineer, Netherlands",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: `${siteUrl}/social-card.png`,
  twitterImageAlt: "Kamyab Valipour — Software Engineer",
});
useHead({
  link: [{ rel: "canonical", href: `${siteUrl}/` }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profile`,
        url: `${siteUrl}/`,
        name: title,
        description,
        mainEntity: {
          "@type": "Person",
          "@id": `${siteUrl}/#person`,
          name: "Kamyab Valipour",
          url: `${siteUrl}/`,
          image: `${siteUrl}/portrait.jpg`,
          jobTitle: "Software Engineer",
          email: `mailto:${email}`,
          homeLocation: { "@type": "Country", name: "Netherlands" },
          knowsAbout: [
            "Software Engineering",
            ".NET",
            "Artificial Intelligence",
            "Full-stack Development",
            "DevOps",
          ],
          sameAs: [
            "https://github.com/Kamyab7",
            "https://www.linkedin.com/in/kamyab7/",
          ],
        },
      }).replace(/</g, "\\u003c"),
    },
  ],
});
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="header">
      <a class="wordmark" href="/" aria-label="Kamyab Valipour home"
        >kv<span>.</span></a
      >
      <p class="location">
        <span class="status-dot" /> BASED IN THE NETHERLANDS
      </p>
    </header>
    <main id="main" class="profile">
      <div class="intro">
        <p class="eyebrow">SOFTWARE ENGINEER</p>
        <h1>Kamyab<br />Valipour<span class="accent">.</span></h1>
        <p class="tagline">
          Engineering ideas.<br /><span>Building what’s next.</span>
        </p>
      </div>
      <figure class="portrait">
        <img
          src="/portrait.jpg"
          alt="Kamyab Valipour"
          width="460"
          height="460"
          fetchpriority="high"
        />
        <figcaption>
          <span>HUMAN BEHIND THE CODE</span
          ><span class="accent">&lt; / &gt;</span>
        </figcaption>
      </figure>
      <div class="details">
        <p class="bio">
          I’m a software engineer turning complex problems into thoughtful,
          reliable software. Curious about emerging technology and passionate
          about open source, I build across the stack — from the first idea to
          production.
        </p>
        <ul class="tags" aria-label="Specialties">
          <li>.NET</li>
          <li>AI solutions</li>
          <li>Full-stack</li>
          <li>DevOps</li>
          <li>Open source</li>
        </ul>
        <div class="contact">
          <div class="contact-links">
            <a class="button" :href="`mailto:${email}`"
              >Let’s talk <span aria-hidden="true">↗</span></a
            >
            <a
              href="https://github.com/Kamyab7"
              target="_blank"
              rel="noopener noreferrer"
              >GitHub <span aria-hidden="true">↗</span></a
            >
            <a
              href="https://www.linkedin.com/in/kamyab7/"
              target="_blank"
              rel="noopener noreferrer"
              >LinkedIn <span aria-hidden="true">↗</span></a
            >
          </div>
          <div class="email-row">
            <a :href="`mailto:${email}`">{{ email }}</a>
            <button
              type="button"
              aria-label="Copy email address"
              @click="copyEmail"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <rect x="8" y="8" width="12" height="12" rx="2" />
                <path
                  d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"
                />
              </svg>
            </button>
          </div>
          <p class="copy-status" role="status">
            {{
              copied
                ? "Email copied to clipboard."
                : copyFailed
                  ? "Please select the email address to copy it."
                  : ""
            }}
          </p>
        </div>
      </div>
    </main>
    <footer>
      <p>© {{ new Date().getFullYear() }} Kamyab Valipour</p>
      <p>Always curious. Always building.</p>
    </footer>
  </div>
</template>

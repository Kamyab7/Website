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
const specialties = [
  {
    number: "01",
    title: "Software engineering",
    text: "Robust foundations. Thoughtful architecture. Software built to last.",
    icon: "⌘",
  },
  {
    number: "02",
    title: "AI & emerging tech",
    text: "Exploring new possibilities and turning complex problems into useful solutions.",
    icon: "✳",
  },
  {
    number: "03",
    title: "Full-stack & DevOps",
    text: "Connecting the dots, from the first interface to the production environment.",
    icon: "↗",
  },
];
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="header">
      <a class="wordmark" href="#" aria-label="Kamyab Valipour home"
        >kv<span>.</span></a
      >
      <nav aria-label="Main navigation">
        <a href="#about">About</a><a href="#focus">Focus</a
        ><a class="nav-contact" href="#contact"
          >Let's talk <span aria-hidden="true">↗</span></a
        >
      </nav>
    </header>
    <main id="main">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow">
            <span class="status-dot" /> SOFTWARE ENGINEER · NETHERLANDS
          </p>
          <h1 id="hero-title">
            Kamyab<br />Valipour<span class="accent">.</span>
          </h1>
          <p class="hero-tagline">
            Engineering ideas.<br /><span>Building what’s next.</span>
          </p>
          <p class="hero-description">
            I turn complex problems into thoughtful software.<br
              class="desktop-break"
            />
            Driven by curiosity. Grounded in code.
          </p>
          <div class="hero-actions">
            <a class="button" :href="`mailto:${email}`"
              >Get in touch <span aria-hidden="true">↗</span></a
            ><a
              class="text-link"
              href="https://github.com/Kamyab7"
              target="_blank"
              rel="noopener noreferrer"
              >Explore my GitHub <span aria-hidden="true">↗</span></a
            >
          </div>
        </div>
        <div class="portrait-composition">
          <div class="orbit orbit-one" />
          <div class="orbit orbit-two" />
          <span class="coordinate" aria-hidden="true">PROFILE / 001</span>
          <div class="portrait-frame">
            <img
              src="/portrait.jpg"
              alt="Kamyab Valipour"
              width="460"
              height="460"
              fetchpriority="high"
            />
            <div class="portrait-shade" />
            <span class="frame-cross top-cross" aria-hidden="true">+</span
            ><span class="frame-cross bottom-cross" aria-hidden="true">+</span>
            <div class="portrait-caption">
              <span>KAMYAB VALIPOUR</span
              ><span class="accent">&lt; / &gt;</span>
            </div>
          </div>
          <div class="floating-label">
            <span class="status-dot" /> Always curious. Always building.
          </div>
          <span class="vertical-note" aria-hidden="true"
            >HUMAN BEHIND THE CODE</span
          >
        </div>
        <a class="scroll-cue" href="#about"
          ><span aria-hidden="true">↓</span> A LITTLE ABOUT ME</a
        >
        <span class="hero-index" aria-hidden="true">01 — INTRODUCTION</span>
      </section>
      <section
        id="about"
        class="about section-grid"
        aria-labelledby="about-title"
      >
        <div class="section-label">
          <span class="accent">01 /</span> THE PERSON
        </div>
        <div>
          <h2 id="about-title">
            Curiosity is the starting point.<br /><span class="muted"
              >Building is how I explore.</span
            >
          </h2>
          <div class="about-copy">
            <p>
              I’m Kamyab, a software engineer based in the Netherlands. I work
              across .NET, AI-driven solutions, full-stack development, and
              DevOps to bring ideas to life.
            </p>
            <p>
              I care about software that solves real problems: reliable systems,
              better performance, and a thoughtful experience. Open source is
              part of that journey — a place to learn, share, and build
              together.
            </p>
          </div>
          <div class="tags">
            <span>.NET</span><span>Artificial intelligence</span
            ><span>Full-stack</span><span>DevOps</span><span>Open source</span>
          </div>
        </div>
      </section>
      <section id="focus" class="focus" aria-labelledby="focus-title">
        <div class="section-heading">
          <div class="section-label">
            <span class="accent">02 /</span> MY FOCUS
          </div>
          <h2 id="focus-title">
            Where ideas meet execution<span class="accent">.</span>
          </h2>
        </div>
        <div class="focus-grid">
          <article
            v-for="item in specialties"
            :key="item.number"
            class="focus-card"
          >
            <div class="card-top">
              <span class="card-icon" aria-hidden="true">{{ item.icon }}</span
              ><span class="card-number">/ {{ item.number }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>
      <section
        id="contact"
        class="contact section-grid"
        aria-labelledby="contact-title"
      >
        <div class="section-label">
          <span class="accent">03 /</span> SAY HELLO
        </div>
        <div>
          <p class="eyebrow">GOOD THINGS START WITH A CONVERSATION</p>
          <h2 id="contact-title">
            Let’s build<br />something <span class="accent">meaningful.</span>
          </h2>
          <p class="contact-description">
            Have an idea, a question, or just want to connect? My inbox is open.
          </p>
          <div class="email-row">
            <a :href="`mailto:${email}`"
              >{{ email }} <span aria-hidden="true">↗</span></a
            ><button
              class="copy-button"
              type="button"
              aria-label="Copy email address"
              @click="copyEmail"
            >
              <svg
                width="18"
                height="18"
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
          <p class="copy-status" aria-live="polite">
            {{
              copied
                ? "Email copied to clipboard."
                : copyFailed
                  ? "Please select the email address to copy it."
                  : ""
            }}
          </p>
          <div class="social-links">
            <a
              href="https://github.com/Kamyab7"
              target="_blank"
              rel="noopener noreferrer"
              >GitHub <span aria-hidden="true">↗</span></a
            ><a
              href="https://www.linkedin.com/in/kamyab7/"
              target="_blank"
              rel="noopener noreferrer"
              >LinkedIn <span aria-hidden="true">↗</span></a
            >
          </div>
        </div>
      </section>
    </main>
    <footer>
      <a class="wordmark" href="#" aria-label="Back to top">kv<span>.</span></a>
      <p>© {{ new Date().getFullYear() }} Kamyab Valipour</p>
      <a class="back-top" href="#"
        >Back to top <span aria-hidden="true">↑</span></a
      >
    </footer>
  </div>
</template>

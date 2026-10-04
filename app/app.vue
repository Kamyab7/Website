<script setup lang="ts">
const siteUrl = new URL(useRuntimeConfig().public.siteUrl).origin;
const title = "Kamyab Valipour — Software Engineer";
const description =
  "Kamyab Valipour is a software engineer based in the Netherlands, focused on .NET, AI-driven solutions, full-stack development, and DevOps. Get in touch.";
const email = "valipourkamyab.official@gmail.com";
const recommendations = [
  {
    name: "Ekaterina Menkovich",
    role: "Software Development Engineer in Test",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4E03AQG0smJlbECi8A/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1699267706683?e=1791417600&v=beta&t=8CnIYRteKBeAi2iiwwEs4e2bNiLiXgq4vNSoLmb_03Y",
    quote:
      "Kamyab is a highly skilled and versatile developer with extensive expertise in C# and PostgreSQL. He consistently demonstrates professionalism and a strong work ethic, delivering exceptional results within tight deadlines.",
  },
  {
    name: "Erfan Kamali",
    role: "Software Engineer",
    avatar: "",
    initial: "E",
    quote:
      "Working with Kamyab has been a great experience. He’s not just a highly skilled .NET developer with strong DevOps expertise, but also someone who’s always eager to learn and improve.",
  },
  {
    name: "Shahab Bahojb",
    role: ".NET Developer",
    avatar: "",
    initial: "S",
    quote:
      "I had the pleasure of working with Kamyab at WeCodeRight, and I can confidently say he is a skilled backend developer with a deep expertise in .NET. His dedication, dependability, and commitment to excellence stand out.",
  },
  {
    name: "Mahsa Akay",
    role: "Cloud Engineer | CKA | CKAD | AWS | Openstack | Telco Cloud",
    avatar:
      "https://media.licdn.com/dms/image/v2/D4D03AQHFnQxZ7BUNMg/profile-displayphoto-shrink_100_100/B4DZSadYi8H0AU-/0/1737758182010?e=1791417600&v=beta&t=v4KsxNrU9S9N2Ag_P9GbnmZ8x6enuC1JzOlkqYnor8Y",
    quote:
      "I’ve had the pleasure of working with Kamyab, and he’s a fantastic .NET developer. His deep knowledge of C#, ASP.NET, and backend systems makes him a go-to person for complex challenges. Beyond his technical skills, he is a great team player—always helpful, communicative, and easy to work with.",
  },
];
const activeRecommendation = ref(0);
const copied = ref(false);
const copyFailed = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;
let sliderTimer: ReturnType<typeof setInterval> | undefined;

function goToRecommendation(index: number) {
  activeRecommendation.value = (index + recommendations.length) % recommendations.length;
}

function nextRecommendation() {
  goToRecommendation(activeRecommendation.value + 1);
}

function previousRecommendation() {
  goToRecommendation(activeRecommendation.value - 1);
}

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
onMounted(() => {
  sliderTimer = setInterval(() => {
    nextRecommendation();
  }, 5000);
});

onBeforeUnmount(() => {
  clearTimeout(resetTimer);
  if (sliderTimer) {
    clearInterval(sliderTimer);
  }
});
useSeoMeta({
  title,
  description,
  author: "Kamyab Valipour",
  robots: "index, follow",
  themeColor: "#0f172a",
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
      <nav class="header-links" aria-label="Main navigation">
        <a
          class="blog-link"
          href="https://blog.kamyabvalipour.com/"
          target="_blank"
          rel="noopener noreferrer"
        >Blog <span aria-hidden="true">↗</span></a>
        <a class="button" :href="`mailto:${email}`">Let’s talk <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
    <main id="main" class="profile">
      <div class="intro">
        <p class="eyebrow">SOFTWARE ENGINEER</p>
        <h1>Kamyab<br /> Valipour<span class="accent">.</span></h1>
        <p class="tagline">
          Curious by nature.<br /><span>Engineer by craft.</span>
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
            <a
              class="social-link"
              href="https://github.com/Kamyab7"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 2C6.48 2 2 6.59 2 12.25c0 4.53 2.87 8.38 6.84 9.74.5.09.68-.22.68-.48v-1.72c-2.78.61-3.37-1.36-3.37-1.36-.46-1.18-1.12-1.5-1.12-1.5-.92-.63.07-.62.07-.62 1.01.07 1.54 1.04 1.54 1.04.9 1.56 2.37 1.11 2.95.85.09-.66.35-1.11.64-1.37-2.22-.25-4.56-1.12-4.56-4.98 0-1.1.39-2 1.03-2.7-.1-.25-.45-1.3.1-2.67 0 0 .84-.27 2.75 1.04A9.35 9.35 0 0 1 12 6.8c.85 0 1.7.12 2.49.35 1.9-1.31 2.74-1.04 2.74-1.04.55 1.37.2 2.42.1 2.67.64.7 1.03 1.6 1.03 2.7 0 3.87-2.35 4.72-4.58 4.97.36.31.68.93.68 1.88v2.79c0 .26.18.58.69.48A10.26 10.26 0 0 0 22 12.25C22 6.59 17.52 2 12 2Z"
                />
              </svg>
            </a>
            <a
              class="social-link"
              href="https://www.linkedin.com/in/kamyab7/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6.94 8.5A1.56 1.56 0 1 1 6.94 5.39a1.56 1.56 0 0 1 0 3.11ZM5.5 9.75h2.88v8.25H5.5V9.75Zm5.04 0h2.76v1.12h.04c.38-.72 1.32-1.48 2.71-1.48 2.9 0 3.44 1.9 3.44 4.39V18h-2.87v-4.3c0-1.3-.03-2.97-1.81-2.97s-2.1 1.42-2.1 2.89V18h-2.87V9.75Z"
                />
              </svg>
            </a>
            <a
              class="social-link"
              href="https://x.com/kamyabcodes"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M18.9 2h3.35l-7.32 8.37L22.7 22h-6.62l-5.18-7.17L5.09 22H1.73l7.84-8.96L1.3 2h6.79l4.68 6.52L18.9 2Zm-1.17 18.1h1.85L7.14 3.8H5.19L17.73 20.1Z"
                />
              </svg>
            </a>
            <a
              class="social-link"
              :href="`mailto:${email}`"
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.15-.25 6.84 5.4a.75.75 0 0 0 .9 0l6.84-5.4H5.15Zm13.6 11.5a1.25 1.25 0 0 0 1.25-1.25V7.9l-6.44 5.08a2.25 2.25 0 0 1-2.82 0L4 7.9v8.85c0 .69.56 1.25 1.25 1.25h13.5Z"
                />
              </svg>
            </a>
          </div>
        </div>
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
        <section class="bio" aria-labelledby="about-heading">
          <h2 id="about-heading" class="section-label">A little about me</h2>
          <p>As far back as I can remember, I’ve always loved building things.</p>
          <p>
            When I was a child, I used to tell my parents that I would become a
            scientist when I grew up. I was fascinated by the idea of
            discovering something new and creating things that didn’t exist
            before.
          </p>
          <p>Then I discovered programming—and everything clicked.</p>
          <p>
            The idea that I could build something with nothing more than a
            computer fascinated me. I could turn an idea in my head into
            something real, something that could think, move, and solve problems.
            I was hooked.
          </p>
          <p>
            Since then, I’ve never stopped building. Technology became more than
            a career for me; it became a way to explore ideas, learn, create,
            and bring possibilities to life.
          </p>
          <p>And I’m still building.</p>
        </section>

        <section class="recommendations" aria-label="Recommendations">
          <h2 class="section-label">Kind words</h2>
          <div class="recommendation-slider">
            <div
              class="recommendation-track"
              :style="{
                transform: `translateX(-${activeRecommendation * 100}%)`,
              }"
            >
              <article
                v-for="(item, index) in recommendations"
                :key="item.name"
                class="recommendation-card"
                :aria-hidden="activeRecommendation !== index"
                :aria-label="`Recommendation ${index + 1} of ${recommendations.length}`"
              >
                <div class="recommendation-header">
                  <template v-if="item.avatar">
                    <img
                      class="recommendation-avatar"
                      :src="item.avatar"
                      :alt="item.name"
                    />
                  </template>
                  <div v-else class="recommendation-avatar fallback" aria-hidden="true">
                    {{ item.initial }}
                  </div>
                  <div class="recommendation-meta">
                    <strong>{{ item.name }}</strong>
                    <span>{{ item.role }}</span>
                  </div>
                </div>
                <p>“{{ item.quote }}”</p>
              </article>
            </div>
          </div>
          <div class="recommendation-controls" aria-label="Recommendation controls">
            <button type="button" class="slider-button" @click="previousRecommendation" aria-label="Previous recommendation">
              ←
            </button>
            <div class="slider-dots" aria-label="Recommendation pagination">
              <button
                v-for="(item, index) in recommendations"
                :key="item.name"
                type="button"
                class="dot"
                :class="{ active: activeRecommendation === index }"
                :aria-current="activeRecommendation === index ? 'true' : undefined"
                :aria-label="`Go to recommendation ${index + 1}`"
                @click="goToRecommendation(index)"
              />
            </div>
            <button type="button" class="slider-button" @click="nextRecommendation" aria-label="Next recommendation">
              →
            </button>
          </div>
        </section>


      </div>
    </main>
    <footer>
      <p>© {{ new Date().getFullYear() }} Kamyab Valipour</p>
      <p>Always curious. Always building.</p>
    </footer>
  </div>
</template>

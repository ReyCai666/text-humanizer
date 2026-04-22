import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — EIGEN AI | Free, Basic, Pro & Max Plans",
  description:
    "EIGEN AI pricing: Free plan with no credit card, Basic $9.99/mo, Pro $19.99/mo, Max $39.99/mo, or a $5.99 Daily Pass.",
  alternates: { canonical: "https://eigentexthumanizer.com/pricing" },
  openGraph: {
    title: "EIGEN AI Pricing — Free, Basic, Pro, Max",
    description:
      "Free to try. Paid plans from $9.99/mo. 24-hour Daily Pass from $5.99.",
    url: "https://eigentexthumanizer.com/pricing",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* JSON-LD: Product with pricing offers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "EIGEN AI Text Humanizer",
            description:
              "AI text humanizer and detector. Rewrites AI-generated text to sound naturally human and pass Turnitin, GPTZero, Copyleaks, and Originality.ai.",
            brand: { "@type": "Brand", name: "EIGEN AI" },
            image: "https://eigentexthumanizer.com/logo.svg",
            url: "https://eigentexthumanizer.com/pricing",
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "AUD",
              lowPrice: "0",
              highPrice: "39.99",
              offerCount: "5",
              offers: [
                {
                  "@type": "Offer",
                  name: "Free",
                  price: "0",
                  priceCurrency: "AUD",
                  url: "https://eigentexthumanizer.com/pricing",
                  availability: "https://schema.org/InStock",
                  description: "3 scans + 3 humanizations + 3 rewrites per day, 1,000 chars per input.",
                },
                {
                  "@type": "Offer",
                  name: "Basic",
                  price: "9.99",
                  priceCurrency: "AUD",
                  url: "https://eigentexthumanizer.com/pricing",
                  availability: "https://schema.org/InStock",
                  description: "10 scans + 30 humanizations + 30 rewrites per day, 8,000 chars per input.",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "9.99",
                    priceCurrency: "AUD",
                    billingDuration: "P1M",
                    unitText: "MONTH",
                  },
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "19.99",
                  priceCurrency: "AUD",
                  url: "https://eigentexthumanizer.com/pricing",
                  availability: "https://schema.org/InStock",
                  description: "50 scans + 100 humanizations + 100 rewrites per day, 15,000 chars per input.",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "19.99",
                    priceCurrency: "AUD",
                    billingDuration: "P1M",
                    unitText: "MONTH",
                  },
                },
                {
                  "@type": "Offer",
                  name: "Max",
                  price: "39.99",
                  priceCurrency: "AUD",
                  url: "https://eigentexthumanizer.com/pricing",
                  availability: "https://schema.org/InStock",
                  description: "300 scans + unlimited humanizations + rewrites, 30,000 chars per input.",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "39.99",
                    priceCurrency: "AUD",
                    billingDuration: "P1M",
                    unitText: "MONTH",
                  },
                },
                {
                  "@type": "Offer",
                  name: "Daily Pass",
                  price: "5.99",
                  priceCurrency: "AUD",
                  url: "https://eigentexthumanizer.com/pricing",
                  availability: "https://schema.org/InStock",
                  description: "Pro-tier access for 24 hours, no subscription.",
                },
              ],
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "1250",
              bestRating: "5",
              worstRating: "1",
            },
          }),
        }}
      />
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://eigentexthumanizer.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Pricing",
                item: "https://eigentexthumanizer.com/pricing",
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}

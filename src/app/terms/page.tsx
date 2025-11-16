import type { Metadata } from 'next';

import { Footer } from '@/components/landing/footer';
import { Header } from '@/components/landing/header';

export const metadata: Metadata = {
  title: 'Terms of Service – Gemcast',
  description: 'The terms and conditions for using Gemcast.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-12 space-y-8">
        <section>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: November 16, 2025
          </p>
        </section>

        <section className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            These Terms of Service (&quot;Terms&quot;) govern your access to and
            use of Gemcast and any related websites, products, and services
            (collectively, the &quot;Service&quot;). By accessing or using the
            Service, you agree to be bound by these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Eligibility</h2>
          <p className="text-sm text-muted-foreground">
            You may use the Service only if you are at least 18 years old, have
            the power to form a contract with Gemcast, and are not barred from
            using the Service under any applicable law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Your account</h2>
          <p className="text-sm text-muted-foreground">
            You are responsible for maintaining the confidentiality of your
            account and for all activities that occur under your account. You
            must promptly notify us of any unauthorized use of your account or
            other security incident.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Use of the Service</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>
              You may use the Service only in accordance with these Terms and
              all applicable laws.
            </li>
            <li>
              You agree not to misuse the Service, including by attempting to
              gain unauthorized access, interfering with normal operation, or
              using the Service to violate the rights of others.
            </li>
            <li>
              You are responsible for any content you submit, upload, or
              generate using the Service and for ensuring you have the rights
              needed for that content.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. AI-generated content</h2>
          <p className="text-sm text-muted-foreground">
            The Service uses AI models to generate content based on your input.
            AI-generated content may be inaccurate or incomplete and should not
            be considered professional advice. You are responsible for
            reviewing, editing, and verifying any AI-generated content before
            relying on it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Google services</h2>
          <p className="text-sm text-muted-foreground">
            When you connect your Google account, the Service may access Google
            Calendar, Google Drive, Google Meet, and Gmail on your behalf as
            described in our Privacy Policy. Your use of those Google services
            remains subject to Google&apos;s applicable terms and policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Intellectual property</h2>
          <p className="text-sm text-muted-foreground">
            Gemcast and its licensors retain all rights, title, and interest in
            and to the Service, including all software, content, and branding,
            except for content that you own or have licensed. Subject to these
            Terms, we grant you a limited, non-exclusive, non-transferable,
            revocable license to use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Prohibited uses</h2>
          <p className="text-sm text-muted-foreground">
            You agree not to use the Service to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            <li>Violate any law or regulation;</li>
            <li>
              Infringe, misappropriate, or violate the rights of any third
              party;
            </li>
            <li>
              Upload or generate content that is illegal, harmful, or
              misleading;
            </li>
            <li>
              Attempt to reverse engineer or otherwise derive the source code of
              any part of the Service.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Termination</h2>
          <p className="text-sm text-muted-foreground">
            We may suspend or terminate your access to the Service at any time
            if we reasonably believe you have violated these Terms or used the
            Service in a way that may cause harm. You may stop using the Service
            at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Disclaimers</h2>
          <p className="text-sm text-muted-foreground">
            The Service is provided &quot;as is&quot; and &quot;as available&quot;
            without warranties of any kind, whether express or implied. To the
            maximum extent permitted by law, we disclaim all warranties,
            including implied warranties of merchantability, fitness for a
            particular purpose, and non-infringement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Limitation of liability</h2>
          <p className="text-sm text-muted-foreground">
            To the maximum extent permitted by law, Gemcast will not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages, or any loss of profits or revenues, arising out of or in
            connection with your use of the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">11. Changes to these Terms</h2>
          <p className="text-sm text-muted-foreground">
            We may update these Terms from time to time. When we do, we will
            update the &quot;Last updated&quot; date at the top of this page.
            Your continued use of the Service after any changes become
            effective constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">12. Contact</h2>
          <p className="text-sm text-muted-foreground">
            If you have questions about these Terms, you can contact us at{' '}
            <a
              href="mailto:daniel@danielgwilson.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              daniel@danielgwilson.com
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}


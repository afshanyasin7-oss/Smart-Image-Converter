import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Field, Input } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { submitIntegrationRequest, type IntegrationFormData } from '@/services/integrationService';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const INTEGRATION_TYPES = [
  { value: 'API Access', label: 'API Access' },
  { value: 'Embed Widget', label: 'Embed Widget' },
  { value: 'Custom Integration', label: 'Custom Integration' },
  { value: 'Other', label: 'Other' },
] as const;

const VOLUME_OPTIONS = [
  { value: 'Less than 1,000', label: 'Less than 1,000' },
  { value: '1,000–10,000', label: '1,000 – 10,000' },
  { value: '10,000–50,000', label: '10,000 – 50,000' },
  { value: '50,000+', label: '50,000+' },
] as const;

interface FormErrors {
  fullName?: string;
  email?: string;
  integrationType?: string;
  description?: string;
  expectedVolume?: string;
}

function validateForm(data: IntegrationFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  }

  if (!data.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.integrationType) {
    errors.integrationType = 'Please select an integration type';
  }

  if (!data.description.trim()) {
    errors.description = 'Description is required';
  } else if (data.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters';
  }

  if (!data.expectedVolume) {
    errors.expectedVolume = 'Please select expected monthly volume';
  }

  return errors;
}

export default function IntegrationPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<IntegrationFormData>({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    integrationType: '',
    websiteUrl: '',
    description: '',
    expectedVolume: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormErrors];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast('Please fix the form errors before submitting', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await submitIntegrationRequest(formData);
      setSubmitSuccess(true);
      toast('Integration request submitted successfully', 'success');
      setFormData({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        integrationType: '',
        websiteUrl: '',
        description: '',
        expectedVolume: '',
      });
      setErrors({});
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to submit integration request. Please try again.';
      setSubmitError(message);
      toast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-background"
      data-icod-id="src_pages_integrationpage_tsx_8849">
      {/* Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none"
        data-icod-id="src_pages_integrationpage_tsx_db61">
        Skip to content
      </a>
      <Navigation data-icod-id="src_pages_integrationpage_tsx_2a05" />
      {/* Main Content */}
      <main
        id="main-content"
        className="px-6 py-16 md:py-24 lg:px-8"
        data-icod-id="src_pages_integrationpage_tsx_6081">
        <div
          className="mx-auto max-w-2xl"
          data-icod-id="src_pages_integrationpage_tsx_3186">
          {/* Page Header — editorial typography */}
          <div
            className="mb-12 text-center"
            data-icod-id="src_pages_integrationpage_tsx_7e60">
            <h1
              className="font-serif text-4xl font-light tracking-tight text-foreground md:text-5xl"
              data-icod-id="src_pages_integrationpage_tsx_5c60">
              Integration Request
            </h1>
            <p
              className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
              data-icod-id="src_pages_integrationpage_tsx_2af9">
              Interested in integrating our converter into your application or workflow?
              Submit your inquiry and our team will get back to you.
            </p>
          </div>

          {/* Success Alert */}
          {submitSuccess && (
            <div className="mb-8" data-icod-id="src_pages_integrationpage_tsx_84f3">
              <Alert variant="success" data-icod-id="src_pages_integrationpage_tsx_a50a">
                Your integration request has been submitted successfully. We will review your
                requirements and get back to you at the email address provided.
              </Alert>
            </div>
          )}

          {/* Error Alert */}
          {submitError && (
            <div className="mb-8" data-icod-id="src_pages_integrationpage_tsx_441b">
              <Alert variant="error" data-icod-id="src_pages_integrationpage_tsx_8be9">{submitError}</Alert>
            </div>
          )}

          {/* Form Card */}
          <Card className="p-8 md:p-10" data-icod-id="src_pages_integrationpage_tsx_41f8">
            <form
              onSubmit={handleSubmit}
              className="space-y-7"
              noValidate
              data-icod-id="src_pages_integrationpage_tsx_e959">
              {/* Full Name */}
              <Field
                label="Full Name"
                htmlFor="fullName"
                required
                error={errors.fullName}
                data-icod-id="src_pages_integrationpage_tsx_24a8">
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  data-icod-id="src_pages_integrationpage_tsx_9195" />
              </Field>

              {/* Company / Organization Name */}
              <Field
                label="Company / Organization Name"
                htmlFor="companyName"
                data-icod-id="src_pages_integrationpage_tsx_0686">
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  placeholder="Acme Corp (optional)"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={submitting}
                  data-icod-id="src_pages_integrationpage_tsx_fbbc" />
              </Field>

              {/* Email Address */}
              <Field
                label="Email Address"
                htmlFor="email"
                required
                error={errors.email}
                data-icod-id="src_pages_integrationpage_tsx_288e">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  data-icod-id="src_pages_integrationpage_tsx_3436" />
              </Field>

              {/* Phone Number */}
              <Field
                label="Phone Number"
                htmlFor="phone"
                data-icod-id="src_pages_integrationpage_tsx_5b8a">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567 (optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={submitting}
                  data-icod-id="src_pages_integrationpage_tsx_83fe" />
              </Field>

              {/* Integration Type */}
              <Field
                label="Integration Type"
                htmlFor="integrationType"
                required
                error={errors.integrationType}
                data-icod-id="src_pages_integrationpage_tsx_73cd">
                <select
                  id="integrationType"
                  name="integrationType"
                  className={inputClass()}
                  value={formData.integrationType}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={!!errors.integrationType}
                  aria-describedby={errors.integrationType ? 'integrationType-error' : undefined}
                  data-icod-id="src_pages_integrationpage_tsx_0b9f">
                  <option value="" data-icod-id="src_pages_integrationpage_tsx_cfbc">Select an integration type</option>
                  {INTEGRATION_TYPES.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      data-icod-id={`src_pages_integrationpage_tsx_8b58_${opt.value}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Website URL */}
              <Field
                label="Website URL"
                htmlFor="websiteUrl"
                data-icod-id="src_pages_integrationpage_tsx_31ba">
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  placeholder="https://example.com (optional)"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  disabled={submitting}
                  data-icod-id="src_pages_integrationpage_tsx_78b4" />
              </Field>

              {/* Description / Requirements */}
              <Field
                label="Description / Requirements"
                htmlFor="description"
                required
                error={errors.description}
                hint="Describe what you need — minimum 20 characters"
                data-icod-id="src_pages_integrationpage_tsx_b363">
                <textarea
                  id="description"
                  name="description"
                  className={inputClass('min-h-32 resize-none')}
                  placeholder="Describe your integration needs, use case, timeline, and any specific requirements..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                  data-icod-id="src_pages_integrationpage_tsx_818d" />
              </Field>

              {/* Expected Monthly Volume */}
              <Field
                label="Expected Monthly Volume"
                htmlFor="expectedVolume"
                required
                error={errors.expectedVolume}
                data-icod-id="src_pages_integrationpage_tsx_419d">
                <select
                  id="expectedVolume"
                  name="expectedVolume"
                  className={inputClass()}
                  value={formData.expectedVolume}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={!!errors.expectedVolume}
                  aria-describedby={errors.expectedVolume ? 'expectedVolume-error' : undefined}
                  data-icod-id="src_pages_integrationpage_tsx_7bd4">
                  <option value="" data-icod-id="src_pages_integrationpage_tsx_355b">Select expected volume</option>
                  {VOLUME_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      data-icod-id={`src_pages_integrationpage_tsx_744e_${opt.value}`}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Submit Button */}
              <div
                className="border-t border-black/[0.04] pt-8"
                data-icod-id="src_pages_integrationpage_tsx_8aff">
                <Button
                  type="submit"
                  size="lg"
                  loading={submitting}
                  disabled={submitting}
                  className="w-full"
                  data-icod-id="src_pages_integrationpage_tsx_0151">
                  Submit Integration Request
                </Button>
              </div>
            </form>
          </Card>

          {/* Back link below form */}
          <div
            className="mt-8 text-center"
            data-icod-id="src_pages_integrationpage_tsx_67f0">
            <Link
              to="/convert"
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
              data-icod-id="src_pages_integrationpage_tsx_2f78">
              Or go directly to the converter
            </Link>
          </div>
        </div>
      </main>
      <Footer data-icod-id="src_pages_integrationpage_tsx_4268" />
    </div>
  );
}

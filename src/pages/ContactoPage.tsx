import { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { Phone, Mail, MapPin } from 'lucide-react';

// This component displays the contact form and information.
const ContactoPage = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [companySettings, setCompanySettings] = useState<any>({});

  // Translations
  const [language] = useState(localStorage.getItem('printingworld-language') || 'es');
  const translations = {
    en: { title: "Contact Us", subtitle: "Ready to transform your space? Get in touch!" },
    es: { title: "Contáctanos", subtitle: "¿Listo para transformar tu espacio? ¡Ponte en contacto!" }
  };
  const t = (key: string) => translations[language as keyof typeof translations][key as keyof typeof translations.en] || key;

  const fetchCompanySettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/settings');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('Raw data received from API:', data); // New debug log
      setCompanySettings(data);
      console.log('Company settings state after fetch:', data); // Debug log
    } catch (error) {
      console.error('Error fetching company settings:', error);
    }
  };

  useEffect(() => {
    fetchCompanySettings();
    window.addEventListener('companySettingsChanged', fetchCompanySettings);

    return () => {
      window.removeEventListener('companySettingsChanged', fetchCompanySettings);
    };
  }, []);

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.current) {
      setIsSubmitting(true);
      setSubmitStatus(null);
      emailjs.sendForm('service_gxtig95', 'template_dixfwh3', form.current, 'uhjwaTkYQUFhLv6L1')
        .then(() => {
          setSubmitStatus('success');
          setIsSubmitting(false);
          form.current?.reset();
        }, () => {
          setSubmitStatus('error');
          setIsSubmitting(false);
        });
    }
  };

  return (
    <div>
      <section id="contacto" className="py-20 pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">{t('subtitle')}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Envíanos un mensaje</h3>
              <form ref={form} onSubmit={sendEmail} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Nombre" name="from_name" className="w-full p-4 rounded-lg bg-white/10 border border-white/30 focus:border-yellow-400 outline-none" />
                  <input type="email" placeholder="Email" name="from_email" className="w-full p-4 rounded-lg bg-white/10 border border-white/30 focus:border-yellow-400 outline-none" />
                </div>
                <input type="tel" placeholder="Teléfono" name="from_phone" className="w-full p-4 rounded-lg bg-white/10 border border-white/30 focus:border-yellow-400 outline-none" />
                <textarea placeholder="Cuéntanos sobre tu proyecto..." rows={5} name="message" className="w-full p-4 rounded-lg bg-white/10 border border-white/30 focus:border-yellow-400 outline-none resize-none" />
                <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
                {submitStatus === 'success' && <p className="text-green-500 text-center mt-4">¡Mensaje enviado con éxito! Te responderemos pronto.</p>}
                {submitStatus === 'error' && <p className="text-red-500 text-center mt-4">Error al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.</p>}
              </form>
            </div>

            <div className="space-y-8" key={JSON.stringify(companySettings)}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Información de Contacto</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Phone className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="font-semibold">Teléfono</p>
                      <p className="text-gray-300">{companySettings.phone || '+34 123 456 789'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Mail className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="font-semibold">Email</p>
                      <p className="text-gray-300">{companySettings.email || 'info@printingworld.es'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="font-semibold">Dirección</p>
                      <p className="text-gray-300">
                        {companySettings.address || 'Calle del Arte, 123'}<br />
                        {companySettings.postalCode || '28001'} Madrid, España
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
                <h4 className="text-xl font-bold mb-4">Horarios de Atención</h4>
                <div className="space-y-2 text-gray-300">
                  <p>{companySettings.schedule || 'Lunes - Viernes: 9:00 - 18:00'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactoPage;

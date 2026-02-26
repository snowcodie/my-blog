import type { Metadata } from "next";
import '../styles/globals.css';
import { ThemeProvider } from './context/ThemeContext';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'My Blog',
  description: 'A personal blog built with Next.js',
  icons: {
    icon: '/api/favicon',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <Script id="favicon" strategy="afterInteractive">
          {`(function(){const u=()=>{const t=document.documentElement.classList.contains('dark')?'dark':'light';fetch('/api/settings').then(r=>r.json()).then(d=>{const f=t==='dark'?d.site_favicon_dark||d.site_favicon:d.site_favicon;if(f){let link=document.querySelector('link[rel="icon"]');if(link){link.href=f;}else{link=document.createElement('link');link.rel='icon';link.href=f;document.head.appendChild(link);}}}).catch(e=>console.error('Favicon load error:',e));};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',u);}else{u();}const o=new MutationObserver(u);o.observe(document.documentElement,{attributes:!0,attributeFilter:['class']});})();`}
        </Script>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
